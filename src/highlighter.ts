// src/highlighter.ts
import * as vscode from "vscode";
import {
  BRACKET_PATTERN,
  OBJECT_OR_ARRAY_START_PATTERN,
  DEFAULT_LABEL_BG_COLOR,
  DEFAULT_LABEL_FORMAT,
  DEFAULT_SUPPORTED_LANGUAGES,
  DEFAULT_SHOW_DEPTH_IN_STATUS_BAR,
  DEFAULT_STATUS_BAR_PRIORITY,
  DEFAULT_ROOT_PATH_NAME,
} from "./constants";
import { logger } from "./extension";

// Module-level variables to manage highlight state across calls
interface HighlightedBlock {
  range: vscode.Range;
  depth: number;
  fullPath: string;
  lineCount: number; // NEW: Store line count
  charCount: number; // NEW: Store char count
}
let allHighlightedBlocks: HighlightedBlock[] = [];
let currentActiveBlockDecorationRange: vscode.Range | undefined;
let currentActiveBlockEditor: vscode.TextEditor | undefined;
let currentErrorDecorations: vscode.DecorationOptions[] = [];

let statusBarItem: vscode.StatusBarItem | undefined;
let currentStatusBarPriority: number | undefined;

// Helper regex patterns to find names for blocks
// Property name pattern for object properties
const PROPERTY_NAME_PATTERN =
  /["']?([a-zA-Z_$][a-zA-Z0-9_$]*)["']?\s*:\s*[{[]$/;

// Function/method declaration pattern (standard function declarations, including async)
const FUNCTION_NAME_PATTERN =
  /\b(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{$/;

// Export function pattern (matches export function name(...) {)
const EXPORT_FUNCTION_PATTERN =
  /\bexport\s+(?:default\s+)?(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{?$/;

// Export const/let/var arrow function (export const name = () => {)
const EXPORT_ARROW_FUNCTION_PATTERN =
  /\bexport\s+(?:default\s+)?(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\(?[^{]*\)?\s*=>\s*\{?$/;

// Arrow function pattern (matches const/let/var name = (...) => {)
const ARROW_FUNCTION_PATTERN =
  /\b(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\(?[^{]*\)?\s*=>\s*\{?$/;

// Method pattern (matches name(...) { or async name(...) {)
const METHOD_PATTERN =
  /\b(?:async\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{$/;

// Class method pattern for methods with modifiers (public, private, protected)
const CLASS_METHOD_PATTERN =
  /\b(?:public|private|protected|static|async|readonly|override)*\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{?$/;

// Class/interface declaration pattern - includes possible generic parameters and extends/implements
const CLASS_INTERFACE_PATTERN =
  /\b(?:class|interface|enum|type)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)(?:<[^>]*>)?\s*(?:extends|implements|=)?\s*/;

// Function expression pattern (const/let/var name = function(...) {)
const FUNCTION_EXPRESSION_PATTERN =
  /\b(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s+)?function\s*\([^)]*\)\s*\{?$/;

/**
 * Applies PrismFlow decorations (regular, active, and error) to the active text editor.
 * This function parses the document, identifies highlightable blocks, and applies
 * depth-based regular highlights. It also stores block data for active highlighting
 * and detects/highlights unmatched braces.
 * @param regularDecorationTypes An array of TextEditorDecorationType for regular (depth-based) highlights.
 * @param errorDecorationType The TextEditorDecorationType for error highlighting.
 */
export function applyPrismFlowDecorations(
  regularDecorationTypes: vscode.TextEditorDecorationType[],
  errorDecorationType: vscode.TextEditorDecorationType
): void {
  logger.log("applyPrismFlowDecorations called");

  const config = vscode.workspace.getConfiguration("prismflow");
  const isEnabled: boolean = config.get("enable", true);
  const labelBgColor: string = config.get(
    "labelBackgroundColor",
    DEFAULT_LABEL_BG_COLOR
  );
  const showBlockLabels: boolean = config.get("showBlockLabels", true);
  const labelFormat: string = config.get("labelFormat", DEFAULT_LABEL_FORMAT);
  const supportedLanguages: string[] = config.get(
    "supportedLanguages",
    DEFAULT_SUPPORTED_LANGUAGES
  );
  const showDepthInStatusBar: boolean = config.get(
    "showDepthInStatusBar",
    DEFAULT_SHOW_DEPTH_IN_STATUS_BAR
  );
  const statusBarPriority: number = config.get(
    "statusBarPriority",
    DEFAULT_STATUS_BAR_PRIORITY
  );
  const rootPathName: string = config.get(
    "rootPathName",
    DEFAULT_ROOT_PATH_NAME
  );

  const editor = vscode.window.activeTextEditor;
  currentActiveBlockEditor = editor;

  logger.log(
    `Active editor: ${
      editor ? `exists (${editor.document.languageId})` : "none"
    }`
  );

  // Clear any existing regular and error decorations from the editor
  if (editor) {
    logger.log("Clearing existing decorations");
    regularDecorationTypes.forEach((type) => editor.setDecorations(type, []));
    editor.setDecorations(errorDecorationType, []);
  }

  // Recreate status bar item if priority changes or if it doesn't exist
  if (!statusBarItem || currentStatusBarPriority !== statusBarPriority) {
    if (statusBarItem) {
      statusBarItem.dispose(); // Dispose old item
    }
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      statusBarPriority
    );
    statusBarItem.name = "PrismFlow Depth";
    currentStatusBarPriority = statusBarPriority; // Store current priority
  }

  // Handle status bar item visibility based on settings and editor state
  if (
    isEnabled &&
    editor &&
    supportedLanguages.includes(editor.document.languageId) &&
    showDepthInStatusBar
  ) {
    statusBarItem.show();
  } else {
    statusBarItem.hide();
  }

  // If extension is not enabled, no active editor, or unsupported language, clear blocks and return.
  if (
    !isEnabled ||
    !editor ||
    !supportedLanguages.includes(editor.document.languageId)
  ) {
    let statusMessage: string;
    if (!editor) {
      statusMessage = "PrismFlow: No active editor.";
      logger.log("Highlighting stopped: No active editor");
    } else if (!isEnabled) {
      statusMessage = "PrismFlow: Disabled by settings.";
      logger.log("Highlighting stopped: Extension disabled");
    } else {
      statusMessage = `PrismFlow: Not applicable for '${editor.document.languageId}' language.`;
      logger.log(
        `Highlighting stopped: Unsupported language '${editor.document.languageId}'`
      );
    }
    vscode.window.setStatusBarMessage(statusMessage, 3000);
    allHighlightedBlocks = []; // Clear stored blocks if not enabled
    currentErrorDecorations = []; // Clear stored error decorations
    return;
  }

  logger.log(`Processing document: ${editor.document.fileName}`);
  logger.log(`Document language: ${editor.document.languageId}`);

  const document = editor.document;
  const text = document.getText();

  const decorationsByType = new Map<
    vscode.TextEditorDecorationType,
    vscode.DecorationOptions[]
  >();
  regularDecorationTypes.forEach((type) => decorationsByType.set(type, []));

  allHighlightedBlocks = []; // Reset for this run
  currentErrorDecorations = []; // Reset error decorations for this run
  let totalBlocksHighlighted = 0;
  const stack: {
    type: string;
    index: number;
    depth: number;
    name?: string;
    isHighlightable: boolean;
    pathSegment: string;
    currentFullPath: string;
  }[] = [];

  let bracketMatch: RegExpExecArray | null;
  while ((bracketMatch = BRACKET_PATTERN.exec(text))) {
    const char = bracketMatch[0];
    const charIndex = bracketMatch.index;
    const charPosition = document.positionAt(charIndex);

    if (char === "{" || char === "[") {
      let isHighlightableStart = false;
      let currentBlockName: string | undefined;
      let pathSegment = "";
      let currentFullPath = rootPathName;

      const lookbackStart = Math.max(0, charIndex - 200); // Increased lookback to find property names
      const contextText = text.substring(lookbackStart, charIndex + 1);

      OBJECT_OR_ARRAY_START_PATTERN.lastIndex = 0;
      let startMatch: RegExpExecArray | null;
      while ((startMatch = OBJECT_OR_ARRAY_START_PATTERN.exec(contextText))) {
        if (
          lookbackStart + startMatch.index + startMatch[0].length - 1 ===
          charIndex
        ) {
          isHighlightableStart = true;
          currentBlockName =
            startMatch[1] || (char === "{" ? "Object" : "Array");

          if (char === "{") {
            // Check for current line and previous line for better context
            const currentLine = document.lineAt(charPosition.line).text;
            const lineBeforeBrace = currentLine.substring(
              0,
              charPosition.character
            );

            // Look for several lines before the opening brace for class/interface/method definitions
            let nameFound = false;
            let foundName = "";

            // Check for property names (e.g., "prop": {)
            const propMatch = lineBeforeBrace.match(PROPERTY_NAME_PATTERN);
            if (propMatch && propMatch[1]) {
              foundName = propMatch[1];
              nameFound = true;
            }

            // If not found, check for class/interface declarations (up to 3 lines before)
            if (!nameFound) {
              // Check current line first
              const classMatch = currentLine.match(CLASS_INTERFACE_PATTERN);
              if (classMatch && classMatch[1]) {
                foundName = classMatch[1];
                nameFound = true;
                // Update the block name with the appropriate type prefix
                if (currentLine.includes("class ")) {
                  currentBlockName = `Class: ${foundName}`;
                } else if (currentLine.includes("interface ")) {
                  currentBlockName = `Interface: ${foundName}`;
                } else if (currentLine.includes("enum ")) {
                  currentBlockName = `Enum: ${foundName}`;
                } else if (currentLine.includes("type ")) {
                  currentBlockName = `Type: ${foundName}`;
                } else {
                  currentBlockName = foundName;
                }
              } else {
                // Check up to 3 previous lines for declarations
                for (
                  let i = 1;
                  i <= 3 && charPosition.line - i >= 0 && !nameFound;
                  i++
                ) {
                  const prevLine = document.lineAt(charPosition.line - i).text;
                  const classMatch = prevLine.match(CLASS_INTERFACE_PATTERN);
                  if (classMatch && classMatch[1]) {
                    foundName = classMatch[1];
                    nameFound = true;
                    // Update the block name with the appropriate type prefix
                    if (prevLine.includes("class ")) {
                      currentBlockName = `Class: ${foundName}`;
                    } else if (prevLine.includes("interface ")) {
                      currentBlockName = `Interface: ${foundName}`;
                    } else if (prevLine.includes("enum ")) {
                      currentBlockName = `Enum: ${foundName}`;
                    } else if (prevLine.includes("type ")) {
                      currentBlockName = `Type: ${foundName}`;
                    } else {
                      currentBlockName = foundName;
                    }
                    break;
                  }
                }
              }
            }

            // If not found, check for all function/method declarations in specific order
            if (!nameFound) {
              // Check for standard function declaration
              const funcMatch = lineBeforeBrace.match(FUNCTION_NAME_PATTERN);
              if (funcMatch && funcMatch[1]) {
                foundName = funcMatch[1];
                nameFound = true;
                currentBlockName = `Function: ${foundName}`;
              }
            }

            // Check for export function declaration
            if (!nameFound) {
              const exportFuncMatch = lineBeforeBrace.match(
                EXPORT_FUNCTION_PATTERN
              );
              if (exportFuncMatch && exportFuncMatch[1]) {
                foundName = exportFuncMatch[1];
                nameFound = true;
                currentBlockName = `Export Function: ${foundName}`;
              }
            }

            // Check for methods
            if (!nameFound) {
              const methodMatch = lineBeforeBrace.match(METHOD_PATTERN);
              if (methodMatch && methodMatch[1]) {
                foundName = methodMatch[1];
                nameFound = true;
                currentBlockName = `Method: ${foundName}`;
              }
            }

            // Check for class methods with modifiers
            if (!nameFound) {
              const classMethodMatch =
                lineBeforeBrace.match(CLASS_METHOD_PATTERN);
              if (classMethodMatch && classMethodMatch[1]) {
                foundName = classMethodMatch[1];
                nameFound = true;
                currentBlockName = `Method: ${foundName}`;
              }
            }

            // Check for arrow functions
            if (!nameFound) {
              const arrowMatch = lineBeforeBrace.match(ARROW_FUNCTION_PATTERN);
              if (arrowMatch && arrowMatch[1]) {
                foundName = arrowMatch[1];
                nameFound = true;
                currentBlockName = `Arrow Function: ${foundName}`;
              }
            }

            // Check for exported arrow functions
            if (!nameFound) {
              const exportArrowMatch = lineBeforeBrace.match(
                EXPORT_ARROW_FUNCTION_PATTERN
              );
              if (exportArrowMatch && exportArrowMatch[1]) {
                foundName = exportArrowMatch[1];
                nameFound = true;
                currentBlockName = `Export Arrow Function: ${foundName}`;
              }
            }

            // Check for function expressions
            if (!nameFound) {
              const funcExprMatch = lineBeforeBrace.match(
                FUNCTION_EXPRESSION_PATTERN
              );
              if (funcExprMatch && funcExprMatch[1]) {
                foundName = funcExprMatch[1];
                nameFound = true;
                currentBlockName = `Function Expression: ${foundName}`;
              }
            }

            // Check previous lines for functions/arrow functions if not found yet
            if (!nameFound) {
              // Look up to 3 lines back for functions and arrow functions
              for (
                let i = 1;
                i <= 3 && charPosition.line - i >= 0 && !nameFound;
                i++
              ) {
                const prevLine = document.lineAt(charPosition.line - i).text;

                // Check for standard function
                const funcMatch = prevLine.match(FUNCTION_NAME_PATTERN);
                if (funcMatch && funcMatch[1]) {
                  foundName = funcMatch[1];
                  nameFound = true;
                  currentBlockName = `Function: ${foundName}`;
                  break;
                }

                // Check for arrow function
                const arrowMatch = prevLine.match(ARROW_FUNCTION_PATTERN);
                if (arrowMatch && arrowMatch[1]) {
                  foundName = arrowMatch[1];
                  nameFound = true;
                  currentBlockName = `Arrow Function: ${foundName}`;
                  break;
                }

                // Check for export function
                const exportFuncMatch = prevLine.match(EXPORT_FUNCTION_PATTERN);
                if (exportFuncMatch && exportFuncMatch[1]) {
                  foundName = exportFuncMatch[1];
                  nameFound = true;
                  currentBlockName = `Export Function: ${foundName}`;
                  break;
                }

                // Check for export arrow function
                const exportArrowMatch = prevLine.match(
                  EXPORT_ARROW_FUNCTION_PATTERN
                );
                if (exportArrowMatch && exportArrowMatch[1]) {
                  foundName = exportArrowMatch[1];
                  nameFound = true;
                  currentBlockName = `Export Arrow Function: ${foundName}`;
                  break;
                }

                // Check for function expression
                const funcExprMatch = prevLine.match(
                  FUNCTION_EXPRESSION_PATTERN
                );
                if (funcExprMatch && funcExprMatch[1]) {
                  foundName = funcExprMatch[1];
                  nameFound = true;
                  currentBlockName = `Function Expression: ${foundName}`;
                  break;
                }
              }
            }

            if (nameFound) {
              pathSegment = `.${foundName}`;
            } else {
              // Update defaulted block names to be more descriptive based on the opening character
              if (char === "{") {
                currentBlockName = "Object";
              } else if (char === "[") {
                currentBlockName = "Array";
              }
              pathSegment = `.${currentBlockName.toLowerCase()}`; // Fallback for unnamed objects
            }
          } else if (char === "[") {
            pathSegment = `[array]`; // Simplified array path segment for now
          }
          break;
        }
      }

      const currentDepth = stack.filter((e) => e.isHighlightable).length;

      if (stack.length > 0) {
        const parentBlock = stack[stack.length - 1];
        currentFullPath = `${parentBlock.currentFullPath}${pathSegment}`;
      } else {
        if (pathSegment.startsWith(".")) {
          currentFullPath = `${rootPathName}${pathSegment}`;
        } else if (pathSegment.startsWith("[")) {
          currentFullPath = `${rootPathName}${pathSegment}`;
        } else {
          currentFullPath = rootPathName;
        }
      }

      stack.push({
        type: char,
        index: charIndex,
        depth: currentDepth,
        name: currentBlockName,
        isHighlightable: isHighlightableStart,
        pathSegment: pathSegment,
        currentFullPath: currentFullPath,
      });
    } else if (char === "}" || char === "]") {
      let openEntry:
        | {
            type: string;
            index: number;
            depth: number;
            name?: string;
            isHighlightable: boolean;
            pathSegment: string;
            currentFullPath: string;
          }
        | undefined;
      let foundMatch = false;

      while (stack.length > 0) {
        openEntry = stack.pop();
        if (
          openEntry &&
          ((char === "}" && openEntry.type === "{") ||
            (char === "]" && openEntry.type === "["))
        ) {
          foundMatch = true;
          break; // Found the matching opener
        }
      }

      if (foundMatch && openEntry) {
        // Matched a highlightable block
        if (openEntry.isHighlightable) {
          // Only highlight if it was a target block type
          const blockStartIndex = openEntry.index;
          const blockEndIndex = charIndex;

          const highlightStartPos = document.positionAt(blockStartIndex);
          const highlightEndPos = document.positionAt(blockEndIndex);
          const highlightRange = new vscode.Range(
            highlightStartPos,
            highlightEndPos.translate(0, 1)
          );

          // NEW: Calculate line and char count for the block
          const lineCount =
            highlightRange.end.line - highlightRange.start.line + 1;
          const blockText = document.getText(highlightRange);
          const charCount = blockText.length;

          const currentDecorationType =
            regularDecorationTypes[
              openEntry.depth % regularDecorationTypes.length
            ];
          totalBlocksHighlighted++; // Process label format based on enum value or custom format string
          const blockName =
            openEntry.name || (openEntry.type === "{" ? "Object" : "Array");
          let formattedLabelContent = "";

          // Handle predefined format options from package.json enum
          switch (labelFormat) {
            case "none":
              formattedLabelContent = "";
              break;
            case "depth":
              formattedLabelContent = `D:${openEntry.depth}`;
              break;
            case "name":
              formattedLabelContent = blockName;
              break;
            case "lines":
              formattedLabelContent = `${lineCount} lines`;
              break;
            case "chars":
              formattedLabelContent = `${charCount} chars`;
              break;
            case "depth-name":
              formattedLabelContent = `${blockName}: D:${openEntry.depth}`;
              break;
            case "depth-lines":
              formattedLabelContent = `${lineCount} lines (D:${openEntry.depth})`;
              break;
            case "name-lines":
              formattedLabelContent = `${blockName}: ${lineCount} lines`;
              break;
            case "depth-name-lines":
              formattedLabelContent = `${blockName}: ${lineCount} lines (D:${openEntry.depth})`;
              break;
            case "full":
              formattedLabelContent = `${blockName}: ${lineCount} lines, ${charCount} chars (D:${openEntry.depth})`;
              break;
            default:
              // Treat as a custom format string with placeholders
              formattedLabelContent = labelFormat
                .replace(/{name}/g, blockName)
                .replace(/{depth}/g, openEntry.depth.toString())
                .replace(/{lines}/g, lineCount.toString())
                .replace(/{chars}/g, charCount.toString());
              break;
          }

          const decoration: vscode.DecorationOptions = {
            range: highlightRange,
            renderOptions: {
              ...(showBlockLabels
                ? {
                    after: {
                      contentText: formattedLabelContent,
                      backgroundColor: labelBgColor,
                      color: "white",
                      margin: "0 0 0 2em",
                      fontWeight: "bold",
                    },
                  }
                : {}),
            },
          };
          decorationsByType.get(currentDecorationType)?.push(decoration);
          // Store lineCount and charCount with the highlighted block
          allHighlightedBlocks.push({
            range: highlightRange,
            depth: openEntry.depth,
            fullPath: openEntry.currentFullPath,
            lineCount,
            charCount,
          });
        }
      } else {
        // Unmatched closing brace
        currentErrorDecorations.push({
          range: new vscode.Range(charPosition, charPosition.translate(0, 1)),
        });
      }
    }
  }

  // Unmatched opening braces (remaining on stack)
  while (stack.length > 0) {
    const remainingEntry = stack.pop()!;
    const errorStartPos = document.positionAt(remainingEntry.index);
    currentErrorDecorations.push({
      range: new vscode.Range(errorStartPos, errorStartPos.translate(0, 1)),
    });
  }

  for (const [type, decs] of decorationsByType.entries()) {
    editor.setDecorations(type, decs);
  }
  editor.setDecorations(errorDecorationType, currentErrorDecorations);

  let statusMessage = `PrismFlow: Highlighted ${totalBlocksHighlighted} blocks.`;
  if (currentErrorDecorations.length > 0) {
    statusMessage += ` Found ${currentErrorDecorations.length} brace errors.`;
  }
  vscode.window.setStatusBarMessage(statusMessage, 3000);
}

/**
 * Updates the highlight for the block currently containing the cursor.
 * Finds the innermost highlightable block and applies the active decoration type to it.
 * Also updates the status bar with the current block depth if enabled.
 * @param editor The active text editor.
 * @param activeDecorationType The TextEditorDecorationType for the active block highlight.
 */
export function updateActiveBlockHighlight(
  editor: vscode.TextEditor,
  activeDecorationType: vscode.TextEditorDecorationType
): void {
  if (!editor || !activeDecorationType) {
    // Clear status bar item if editor is invalid
    if (statusBarItem) {
      statusBarItem.hide();
      statusBarItem.text = ""; // Clear text
    }
    return;
  }

  const config = vscode.workspace.getConfiguration("prismflow");
  const showDepthInStatusBar: boolean = config.get(
    "showDepthInStatusBar",
    DEFAULT_SHOW_DEPTH_IN_STATUS_BAR
  );

  // Clear previous active block decoration if it exists and is on the same editor
  if (
    currentActiveBlockDecorationRange &&
    currentActiveBlockEditor &&
    currentActiveBlockEditor === editor
  ) {
    editor.setDecorations(activeDecorationType, []);
  }

  const cursorPosition = editor.selection.active;
  let activeBlock: HighlightedBlock | undefined;
  let innermostRangeSize = Infinity;

  for (const block of allHighlightedBlocks) {
    if (block.range.contains(cursorPosition)) {
      const currentRangeSize = block.range.end.line - block.range.start.line;
      if (currentRangeSize < innermostRangeSize) {
        innermostRangeSize = currentRangeSize;
        activeBlock = block;
      }
    }
    // If cursor is exactly on the start/end brace, consider it inside for highlighting
    // This ensures the active highlight isn't lost when cursor is on the boundary
    if (
      cursorPosition.isEqual(block.range.start) ||
      cursorPosition.isEqual(block.range.end.translate(0, -1))
    ) {
      const currentRangeSize = block.range.end.line - block.range.start.line;
      if (currentRangeSize < innermostRangeSize) {
        innermostRangeSize = currentRangeSize;
        activeBlock = block;
      }
    }
  }

  if (activeBlock) {
    editor.setDecorations(activeDecorationType, [activeBlock.range]);
    currentActiveBlockDecorationRange = activeBlock.range;
    currentActiveBlockEditor = editor;

    // Update status bar item
    if (showDepthInStatusBar && statusBarItem) {
      statusBarItem.text = `$(bracket) Depth: ${activeBlock.depth}`;
      statusBarItem.tooltip = `PrismFlow: Current Block Depth: ${activeBlock.depth}\nPath: ${activeBlock.fullPath}\nLines: ${activeBlock.lineCount}\nChars: ${activeBlock.charCount}`; // NEW: Add line/char count to tooltip
      statusBarItem.show();
    } else if (statusBarItem) {
      statusBarItem.hide();
      statusBarItem.text = "";
    }
  } else {
    currentActiveBlockDecorationRange = undefined;
    currentActiveBlockEditor = undefined;

    // Hide status bar item if no active block found
    if (statusBarItem) {
      statusBarItem.hide();
      statusBarItem.text = "";
    }
  }
}

/**
 * Copies the full path of the currently active block to the clipboard.
 * @param editor The active text editor.
 */
export async function copyPathForActiveBlock(
  editor: vscode.TextEditor
): Promise<void> {
  if (!editor || !currentActiveBlockDecorationRange) {
    vscode.window.showInformationMessage(
      "PrismFlow: No active block found to copy path."
    );
    return;
  }

  const activeBlock = allHighlightedBlocks.find((block) =>
    block.range.isEqual(currentActiveBlockDecorationRange!)
  );

  if (!activeBlock) {
    vscode.window.showInformationMessage(
      "PrismFlow: No active block to copy path from."
    );
    return;
  }

  await vscode.env.clipboard.writeText(activeBlock.fullPath);
  vscode.window.showInformationMessage(
    `PrismFlow: Copied path "${activeBlock.fullPath}" to clipboard.`
  );
}

/**
 * Returns quick pick items for navigation based on highlighted blocks.
 */
export function getQuickPickItems(): string[] {
  return allHighlightedBlocks.map((block) => block.fullPath);
}

/**
 * Navigates to a block by its path.
 */
export function navigateToBlockByPath(
  editor: vscode.TextEditor,
  path: string
): void {
  const block = allHighlightedBlocks.find((b) => b.fullPath === path);
  if (block) {
    const startPosition = block.range.start;
    editor.selection = new vscode.Selection(startPosition, startPosition);
    editor.revealRange(block.range, vscode.TextEditorRevealType.InCenter);
  }
}
