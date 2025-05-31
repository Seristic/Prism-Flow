// src/highlighter.ts
import * as vscode from 'vscode';
import {
    BRACKET_PATTERN,
    OBJECT_OR_ARRAY_START_PATTERN,
    DEFAULT_LABEL_BG_COLOR,
    DEFAULT_LABEL_FORMAT,
    DEFAULT_SUPPORTED_LANGUAGES,
    DEFAULT_SHOW_DEPTH_IN_STATUS_BAR,
    DEFAULT_STATUS_BAR_PRIORITY,
    DEFAULT_ROOT_PATH_NAME
} from './constants';

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

// Helper regex to find property names before an opening brace
const PROPERTY_NAME_PATTERN = /["']?([a-zA-Z_$][a-zA-Z0-9_$]*)["']?\s*:\s*[{[]$/;


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
    const config = vscode.workspace.getConfiguration('prismflow');
    const isEnabled: boolean = config.get('enable', true);
    const labelBgColor: string = config.get('labelBackgroundColor', DEFAULT_LABEL_BG_COLOR);
    const showBlockLabels: boolean = config.get('showBlockLabels', true);
    const labelFormat: string = config.get('labelFormat', DEFAULT_LABEL_FORMAT);
    const supportedLanguages: string[] = config.get('supportedLanguages', DEFAULT_SUPPORTED_LANGUAGES);
    const showDepthInStatusBar: boolean = config.get('showDepthInStatusBar', DEFAULT_SHOW_DEPTH_IN_STATUS_BAR);
    const statusBarPriority: number = config.get('statusBarPriority', DEFAULT_STATUS_BAR_PRIORITY);
    const rootPathName: string = config.get('rootPathName', DEFAULT_ROOT_PATH_NAME);

    const editor = vscode.window.activeTextEditor;
    currentActiveBlockEditor = editor;

    // Clear any existing regular and error decorations from the editor
    if (editor) {
        regularDecorationTypes.forEach(type => editor.setDecorations(type, []));
        editor.setDecorations(errorDecorationType, []);
    }

    // Recreate status bar item if priority changes or if it doesn't exist
    if (!statusBarItem || currentStatusBarPriority !== statusBarPriority) {
        if (statusBarItem) {
            statusBarItem.dispose(); // Dispose old item
        }
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, statusBarPriority);
        statusBarItem.name = 'PrismFlow Depth';
        currentStatusBarPriority = statusBarPriority; // Store current priority
    }

    // Handle status bar item visibility based on settings and editor state
    if (isEnabled && editor && supportedLanguages.includes(editor.document.languageId) && showDepthInStatusBar) {
        statusBarItem.show();
    } else {
        statusBarItem.hide();
    }

    // If extension is not enabled, no active editor, or unsupported language, clear blocks and return.
    if (!isEnabled || !editor || !supportedLanguages.includes(editor.document.languageId)) {
        let statusMessage: string;
        if (!editor) {
            statusMessage = "PrismFlow: No active editor.";
        } else if (!isEnabled) {
            statusMessage = "PrismFlow: Disabled by settings.";
        } else {
            statusMessage = `PrismFlow: Not applicable for '${editor.document.languageId}' language.`;
        }
        vscode.window.setStatusBarMessage(statusMessage, 3000);
        allHighlightedBlocks = []; // Clear stored blocks if not enabled
        currentErrorDecorations = []; // Clear stored error decorations
        return;
    }

    const document = editor.document;
    const text = document.getText();

    const decorationsByType = new Map<vscode.TextEditorDecorationType, vscode.DecorationOptions[]>();
    regularDecorationTypes.forEach(type => decorationsByType.set(type, []));

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


        if (char === '{' || char === '[') {
            let isHighlightableStart = false;
            let currentBlockName: string | undefined;
            let pathSegment = '';
            let currentFullPath = rootPathName;

            const lookbackStart = Math.max(0, charIndex - 200); // Increased lookback to find property names
            const contextText = text.substring(lookbackStart, charIndex + 1);

            OBJECT_OR_ARRAY_START_PATTERN.lastIndex = 0;
            let startMatch: RegExpExecArray | null;
            while((startMatch = OBJECT_OR_ARRAY_START_PATTERN.exec(contextText))) {
                if (lookbackStart + startMatch.index + startMatch[0].length -1 === charIndex) {
                    isHighlightableStart = true;
                    currentBlockName = startMatch[1] || (char === '{' ? 'Object' : 'Array');

                    if (char === '{') {
                        // Attempt to find a property name before the '{'
                        const lineBeforeBrace = document.lineAt(charPosition.line).text.substring(0, charPosition.character);
                        const propMatch = lineBeforeBrace.match(PROPERTY_NAME_PATTERN);
                        if (propMatch && propMatch[1]) {
                            pathSegment = `.${propMatch[1]}`;
                        } else {
                            pathSegment = `.${currentBlockName.toLowerCase()}`; // Fallback for unnamed objects
                        }
                    } else if (char === '[') {
                        pathSegment = `[array]`; // Simplified array path segment for now
                    }
                    break;
                }
            }

            const currentDepth = stack.filter(e => e.isHighlightable).length;

            if (stack.length > 0) {
                const parentBlock = stack[stack.length - 1];
                currentFullPath = `${parentBlock.currentFullPath}${pathSegment}`;
            } else {
                if (pathSegment.startsWith('.')) {
                    currentFullPath = `${rootPathName}${pathSegment}`;
                } else if (pathSegment.startsWith('[')) {
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
                currentFullPath: currentFullPath
            });

        } else if (char === '}' || char === ']') {
            let openEntry: {
                type: string;
                index: number;
                depth: number;
                name?: string;
                isHighlightable: boolean;
                pathSegment: string;
                currentFullPath: string;
            } | undefined;
            let foundMatch = false;

            while (stack.length > 0) {
                openEntry = stack.pop();
                if (openEntry && ((char === '}' && openEntry.type === '{') || (char === ']' && openEntry.type === '['))) {
                    foundMatch = true;
                    break; // Found the matching opener
                }
            }

            if (foundMatch && openEntry) { // Matched a highlightable block
                if (openEntry.isHighlightable) { // Only highlight if it was a target block type
                    const blockStartIndex = openEntry.index;
                    const blockEndIndex = charIndex;

                    const highlightStartPos = document.positionAt(blockStartIndex);
                    const highlightEndPos = document.positionAt(blockEndIndex);
                    const highlightRange = new vscode.Range(highlightStartPos, highlightEndPos.translate(0, 1));

                    // NEW: Calculate line and char count for the block
                    const lineCount = highlightRange.end.line - highlightRange.start.line + 1;
                    const blockText = document.getText(highlightRange);
                    const charCount = blockText.length;


                    const currentDecorationType = regularDecorationTypes[openEntry.depth % regularDecorationTypes.length];
                    totalBlocksHighlighted++;

                    // NEW: Replace {lines} and {chars} in the label format
                    const formattedLabelContent = labelFormat
                        .replace('{name}', openEntry.name || (openEntry.type === '{' ? 'Object' : 'Array'))
                        .replace('{depth}', openEntry.depth.toString())
                        .replace('{lines}', lineCount.toString()) // NEW
                        .replace('{chars}', charCount.toString()); // NEW


                    const decoration: vscode.DecorationOptions = {
                        range: highlightRange,
                        renderOptions: {
                            ...(showBlockLabels ? {
                                after: {
                                    contentText: formattedLabelContent,
                                    backgroundColor: labelBgColor,
                                    color: 'white',
                                    margin: '0 0 0 2em',
                                    fontWeight: 'bold',
                                }
                            } : {})
                        }
                    };
                    decorationsByType.get(currentDecorationType)?.push(decoration);
                    // Store lineCount and charCount with the highlighted block
                    allHighlightedBlocks.push({ range: highlightRange, depth: openEntry.depth, fullPath: openEntry.currentFullPath, lineCount, charCount });
                }
            } else { // Unmatched closing brace
                currentErrorDecorations.push({
                    range: new vscode.Range(charPosition, charPosition.translate(0, 1))
                });
            }
        }
    }

    // Unmatched opening braces (remaining on stack)
    while (stack.length > 0) {
        const remainingEntry = stack.pop()!;
        const errorStartPos = document.positionAt(remainingEntry.index);
        currentErrorDecorations.push({
            range: new vscode.Range(errorStartPos, errorStartPos.translate(0, 1))
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
export function updateActiveBlockHighlight(editor: vscode.TextEditor, activeDecorationType: vscode.TextEditorDecorationType): void {
    if (!editor || !activeDecorationType) {
        // Clear status bar item if editor is invalid
        if (statusBarItem) {
            statusBarItem.hide();
            statusBarItem.text = ''; // Clear text
        }
        return;
    }

    const config = vscode.workspace.getConfiguration('prismflow');
    const showDepthInStatusBar: boolean = config.get('showDepthInStatusBar', DEFAULT_SHOW_DEPTH_IN_STATUS_BAR);

    // Clear previous active block decoration if it exists and is on the same editor
    if (currentActiveBlockDecorationRange && currentActiveBlockEditor && currentActiveBlockEditor === editor) {
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
        if (cursorPosition.isEqual(block.range.start) || cursorPosition.isEqual(block.range.end.translate(0, -1))) {
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
            statusBarItem.text = '';
        }

    } else {
        currentActiveBlockDecorationRange = undefined;
        currentActiveBlockEditor = undefined;

        // Hide status bar item if no active block found
        if (statusBarItem) {
            statusBarItem.hide();
            statusBarItem.text = '';
        }
    }
}

/**
 * Copies the full path of the currently active block to the clipboard.
 * @param editor The active text editor.
 */
export async function copyPathForActiveBlock(editor: vscode.TextEditor): Promise<void> {
    if (!editor || !currentActiveBlockDecorationRange) {
        vscode.window.showInformationMessage('PrismFlow: No active block found to copy path.');
        return;
    }

    const activeBlock = allHighlightedBlocks.find(block =>
        block.range.isEqual(currentActiveBlockDecorationRange!)
    );

    if (activeBlock) {
        await vscode.env.clipboard.writeText(activeBlock.fullPath);
        vscode.window.setStatusBarMessage(`PrismFlow: Path copied: ${activeBlock.fullPath}`, 3000);
    } else {
        vscode.window.showInformationMessage('PrismFlow: No active block found to copy path.');
    }
}

/**
 * Prepares Quick Pick items for navigation based on highlighted blocks.
 * @returns An array of QuickPickItem, sorted by their position in the document.
 */
export function getQuickPickItems(): vscode.QuickPickItem[] {
    // Sort blocks by their starting line number for a logical order in the Quick Pick
    const sortedBlocks = [...allHighlightedBlocks].sort((a, b) => a.range.start.line - b.range.start.line);

    return sortedBlocks.map(block => ({
        label: block.fullPath,
        description: `(Depth: ${block.depth}, Lines: ${block.lineCount}, Chars: ${block.charCount}, Line: ${block.range.start.line + 1})` // NEW: Add line/char count to description
    }));
}

/**
 * Navigates the editor to the specified block path.
 * @param editor The active text editor.
 * @param path The fullPath of the block to navigate to.
 */
export function navigateToBlockByPath(editor: vscode.TextEditor, path: string): void {
    const blockToNavigate = allHighlightedBlocks.find(block => block.fullPath === path);

    if (blockToNavigate) {
        const targetPosition = blockToNavigate.range.start;
        const newSelection = new vscode.Selection(targetPosition, targetPosition);
        editor.selection = newSelection;

        // Reveal the range in the editor, centering it if possible
        editor.revealRange(blockToNavigate.range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    } else {
        vscode.window.showWarningMessage(`PrismFlow: Block with path '${path}' not found.`);
    }
}

/**
 * Clears only the active block highlight. Useful when switching editors or deactivating.
 * @param activeDecorationType The TextEditorDecorationType for the active block highlight.
 */
export function clearActiveBlockHighlight(activeDecorationType: vscode.TextEditorDecorationType): void {
    if (currentActiveBlockEditor && currentActiveBlockDecorationRange) {
        currentActiveBlockEditor.setDecorations(activeDecorationType, []);
    }
    currentActiveBlockDecorationRange = undefined;
    currentActiveBlockEditor = undefined;
    // Also clear status bar item when active highlight is cleared
    if (statusBarItem) {
        statusBarItem.hide();
        statusBarItem.text = '';
    }
}

/**
 * Clears error decorations specifically.
 * @param errorDecorationType The TextEditorDecorationType for error highlighting.
 */
export function clearErrorDecorations(errorDecorationType: vscode.TextEditorDecorationType): void {
    if (currentActiveBlockEditor) {
        currentActiveBlockEditor.setDecorations(errorDecorationType, []);
    }
    currentErrorDecorations = [];
}

/**
 * Disposes the status bar item when the extension deactivates.
 */
export function disposeStatusBarItem(): void {
    if (statusBarItem) {
        statusBarItem.dispose();
        statusBarItem = undefined;
        currentStatusBarPriority = undefined; // Reset priority tracking
    }
}