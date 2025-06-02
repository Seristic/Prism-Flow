// src/extension.ts
import * as vscode from "vscode";
import * as decorationManager from "./decorationManager";
import * as highlighter from "./highlighter";
import { DEBOUNCE_DELAY } from "./constants";
import * as path from "path"; // Keep path import for other uses

// IMPORTS FOR LIKED LINES FEATURE
import { LikedLinesProvider } from "./likedLinesProvider";
import { LikedLineData, LikedLineItem } from "./likedLine";

// IMPORT FOR GITIGNORE AUTOMATION
import { runGitignoreAutomation } from "./gitignoreManager";

let selectionChangeTimeout: NodeJS.Timeout | undefined;
let gitignorePeriodicCheckInterval: NodeJS.Timeout | undefined; // For periodic check

// Declare these at the module scope so they can be accessed throughout the extension.
let regularDecorationTypes: vscode.TextEditorDecorationType[] = [];
let activeDecorationType: vscode.TextEditorDecorationType | undefined;
let errorDecorationType: vscode.TextEditorDecorationType | undefined;
let statusBarItem: vscode.StatusBarItem | undefined;

// NEW: Liked Lines Provider instance
let likedLinesProvider: LikedLinesProvider; // Will be initialized in activate

/**
 * Initializes/reinitializes all decoration types and the status bar item,
 * adds them to context.subscriptions, and reapplies highlights.
 * This function handles the lifecycle of decoration types to prevent "unknown key" errors.
 * @param context The extension context.
 */
function initializeAndReapplyHighlights(context: vscode.ExtensionContext) {
  console.log("PrismFlow: Reinitializing decorations.");

  // 1. Dispose any existing decoration types and status bar item if they were previously created.
  // This is crucial to prevent "unknown decoration type key" errors from stale objects.
  decorationManager.disposeDecorationTypes(
    regularDecorationTypes,
    activeDecorationType,
    errorDecorationType,
    statusBarItem
  );

  regularDecorationTypes = []; // Clear array for new types
  activeDecorationType = undefined;
  errorDecorationType = undefined;
  statusBarItem = undefined;

  const config = vscode.workspace.getConfiguration("prismflow");
  const DEFAULT_HIGHLIGHT_COLORS = [
    "rgba(255, 255, 0, 0.3)",
    "rgba(0, 255, 255, 0.3)",
    "rgba(255, 0, 255, 0.3)",
    "rgba(0, 255, 0, 0.3)",
    "rgba(255, 165, 0, 0.3)",
    "rgba(100, 100, 255, 0.3)",
    "rgba(255, 100, 100, 0.3)",
  ];

  // 3. Create NEW decoration types and status bar item.
  const highlightColors: string[] = config.get(
    "prismflow.highlightColors",
    DEFAULT_HIGHLIGHT_COLORS
  );

  regularDecorationTypes = highlightColors.map((color) => {
    const type = vscode.window.createTextEditorDecorationType({
      backgroundColor: color,
      overviewRulerColor: color,
      overviewRulerLane: vscode.OverviewRulerLane.Full,
    });
    context.subscriptions.push(type); // CRUCIAL: Add to subscriptions for auto-disposal
    return type;
  });

  // Handle case where highlightColors is empty to prevent issues
  if (regularDecorationTypes.length === 0) {
    const defaultTransparentType = vscode.window.createTextEditorDecorationType(
      {}
    );
    regularDecorationTypes.push(defaultTransparentType);
    context.subscriptions.push(defaultTransparentType);
  }

  activeDecorationType = vscode.window.createTextEditorDecorationType(
    config.get("prismflow.activeHighlightStyle", {
      border: "1px solid rgba(255, 255, 255, 0.8)",
      overviewRulerColor: "rgba(255, 255, 255, 0.8)",
    })
  );
  context.subscriptions.push(activeDecorationType);

  errorDecorationType = vscode.window.createTextEditorDecorationType(
    config.get("prismflow.errorHighlightStyle", {
      backgroundColor: "rgba(255, 0, 0, 0.1)",
      textDecoration: "underline wavy red",
      overviewRulerColor: "red",
      overviewRulerLane: vscode.OverviewRulerLane.Full,
    })
  );
  context.subscriptions.push(errorDecorationType);

  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    config.get("prismflow.statusBarPriority", 100)
  );
  context.subscriptions.push(statusBarItem);

  // 4. Apply highlights to the active editor with the new types.
  if (vscode.window.activeTextEditor) {
    if (errorDecorationType) {
      highlighter.applyPrismFlowDecorations(
        regularDecorationTypes,
        errorDecorationType
      );
    } else {
      console.warn(
        "PrismFlow: Error decoration type not fully initialized after reinit. Cannot apply base highlights."
      );
    }

    if (activeDecorationType) {
      highlighter.updateActiveBlockHighlight(
        vscode.window.activeTextEditor,
        activeDecorationType
      );
    } else {
      console.warn(
        "PrismFlow: Active decoration type not fully initialized after reinit. Cannot update active highlight."
      );
    }
  }
}

/**
 * Sets up the periodic .gitignore check based on configuration.
 */
function setupGitignorePeriodicCheck() {
  // Clear any existing interval
  if (gitignorePeriodicCheckInterval) {
    clearInterval(gitignorePeriodicCheckInterval);
    gitignorePeriodicCheckInterval = undefined;
  }

  const config = vscode.workspace.getConfiguration("prismflow.gitignore");
  const enablePeriodicCheck: boolean = config.get("enablePeriodicCheck", false);
  const intervalMinutes: number = Math.max(
    5,
    config.get("periodicCheckIntervalMinutes", 60)
  ); // Min 5 mins

  if (enablePeriodicCheck) {
    console.log(
      `PrismFlow: Setting up periodic .gitignore check every ${intervalMinutes} minutes.`
    );
    gitignorePeriodicCheckInterval = setInterval(async () => {
      console.log("PrismFlow: Running periodic .gitignore check...");
      // Run the automation without prompting for confirmation in the background
      const patternsFound = await runGitignoreAutomation({ autoConfirm: true }); // Pass an option to auto-confirm
      if (patternsFound && patternsFound.length > 0) {
        vscode.window.showInformationMessage(
          `PrismFlow: Found and added new .gitignore patterns: ${patternsFound.join(
            ", "
          )}`
        );
      }
    }, intervalMinutes * 60 * 1000); // Convert minutes to milliseconds
  } else {
    console.log("PrismFlow: Periodic .gitignore check is disabled.");
  }
}

/**
 * Activates the PrismFlow extension.
 * @param context The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log("PrismFlow extension activated.");

  // Initialize all decoration types and apply initial highlights
  initializeAndReapplyHighlights(context);

  // NEW: Initialize Liked Lines Provider and register the tree view
  likedLinesProvider = new LikedLinesProvider(context);
  vscode.window.registerTreeDataProvider(
    "prismflowLikedLines",
    likedLinesProvider
  );
  // Register the Tree View itself (optional, but good practice if you want to explicitly create it)
  context.subscriptions.push(
    vscode.window.createTreeView("prismflowLikedLines", {
      treeDataProvider: likedLinesProvider,
    })
  );

  // --- Command Registrations ---
  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.applyHighlights", () => {
      if (errorDecorationType) {
        highlighter.applyPrismFlowDecorations(
          regularDecorationTypes,
          errorDecorationType
        );
        if (activeDecorationType && vscode.window.activeTextEditor) {
          highlighter.updateActiveBlockHighlight(
            vscode.window.activeTextEditor,
            activeDecorationType
          );
        }
      }
      vscode.window.setStatusBarMessage(
        "PrismFlow: Highlights Refreshed!",
        2000
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.clearHighlights", () => {
      decorationManager.clearAllDecorations(
        regularDecorationTypes,
        activeDecorationType,
        errorDecorationType
      );
      if (statusBarItem) {
        statusBarItem.hide();
      }
      vscode.window.setStatusBarMessage("PrismFlow: Highlights Cleared!", 2000);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.copyBlockPath", async () => {
      if (vscode.window.activeTextEditor) {
        await highlighter.copyPathForActiveBlock(
          vscode.window.activeTextEditor
        );
      } else {
        vscode.window.showInformationMessage(
          "PrismFlow: No active editor to copy path from."
        );
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.navigateToBlock", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage(
          "PrismFlow: No active editor to navigate blocks."
        );
        return;
      }

      if (errorDecorationType) {
        highlighter.applyPrismFlowDecorations(
          regularDecorationTypes,
          errorDecorationType
        );
      }

      const quickPickItems = highlighter.getQuickPickItems();

      if (quickPickItems.length === 0) {
        vscode.window.showInformationMessage(
          "PrismFlow: No highlightable blocks found in this document."
        );
        return;
      }

      const selectedItem = await vscode.window.showQuickPick(quickPickItems, {
        placeHolder: "Select a block to navigate to...",
        matchOnDescription: true,
        matchOnDetail: true,
      });

      if (selectedItem) {
        highlighter.navigateToBlockByPath(editor, selectedItem.label);
      }
    })
  );

  // Liked Lines Commands
  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.likeCurrentLine", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage(
          "PrismFlow: No active editor to like a line from."
        );
        return;
      }
      await likedLinesProvider.addCurrentLine(editor);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prismflow.removeLikedLine",
      async (item: LikedLineItem) => {
        if (item && item.data) {
          await likedLinesProvider.removeLikedLine(item);
        } else {
          vscode.window.showErrorMessage(
            "PrismFlow: Could not remove liked line. Please try again from the Liked Lines view."
          );
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prismflow.navigateToLikedLine",
      async (data: LikedLineData) => {
        if (data) {
          await likedLinesProvider.navigateToLikedLine(data);
        } else {
          vscode.window.showErrorMessage(
            "PrismFlow: Could not navigate to liked line. Data is missing."
          );
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.refreshLikedLines", () => {
      likedLinesProvider.refresh();
      vscode.window.setStatusBarMessage(
        "PrismFlow: Liked Lines Refreshed!",
        2000
      );
    })
  );

  // Gitignore Automation Command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prismflow.autoAddGitignorePatterns",
      async () => {
        await runGitignoreAutomation({ autoConfirm: false }); // User explicitly runs, so ask for confirmation
      }
    )
  );

  // --- Listeners ---
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(
      (e: vscode.ConfigurationChangeEvent) => {
        if (e.affectsConfiguration("prismflow")) {
          initializeAndReapplyHighlights(context);
          likedLinesProvider.refresh();
          // Re-setup periodic check if gitignore config changed
          if (e.affectsConfiguration("prismflow.gitignore")) {
            setupGitignorePeriodicCheck();
          }
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(
      (event: vscode.TextDocumentChangeEvent) => {
        if (selectionChangeTimeout) {
          clearTimeout(selectionChangeTimeout);
        }
        selectionChangeTimeout = setTimeout(() => {
          if (
            vscode.window.activeTextEditor &&
            event.document === vscode.window.activeTextEditor.document
          ) {
            if (errorDecorationType) {
              highlighter.applyPrismFlowDecorations(
                regularDecorationTypes,
                errorDecorationType
              );
            }
            if (activeDecorationType) {
              highlighter.updateActiveBlockHighlight(
                vscode.window.activeTextEditor,
                activeDecorationType
              );
            }
          }
        }, DEBOUNCE_DELAY);
      }
    )
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor?: vscode.TextEditor) => {
      if (editor) {
        if (errorDecorationType) {
          highlighter.applyPrismFlowDecorations(
            regularDecorationTypes,
            errorDecorationType
          );
        }
        if (activeDecorationType) {
          highlighter.updateActiveBlockHighlight(editor, activeDecorationType);
        }
      } else {
        decorationManager.clearAllDecorations(
          regularDecorationTypes,
          activeDecorationType,
          errorDecorationType
        );
        if (statusBarItem) {
          statusBarItem.hide();
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(
      (event: vscode.TextEditorSelectionChangeEvent) => {
        if (selectionChangeTimeout) {
          clearTimeout(selectionChangeTimeout);
        }
        selectionChangeTimeout = setTimeout(() => {
          if (
            event.textEditor &&
            event.textEditor === vscode.window.activeTextEditor &&
            activeDecorationType
          ) {
            highlighter.updateActiveBlockHighlight(
              event.textEditor,
              activeDecorationType
            );
          }
        }, DEBOUNCE_DELAY);
      }
    )
  );

  // Initial setup of periodic check when extension activates
  setupGitignorePeriodicCheck();

  // Removed the problematic diagnostic interval for untracked files
  // as the issue was incorrect API usage, not timing.
}

/**
 * Deactivates the PrismFlow extension.
 */
export function deactivate(): void {
  console.log("PrismFlow extension deactivated.");
  // Dispose all decoration types and status bar item explicitly
  decorationManager.disposeDecorationTypes(
    regularDecorationTypes,
    activeDecorationType,
    errorDecorationType,
    statusBarItem
  );
  // Clear periodic check interval on deactivation
  if (gitignorePeriodicCheckInterval) {
    clearInterval(gitignorePeriodicCheckInterval);
    gitignorePeriodicCheckInterval = undefined;
  }
  // VS Code automatically disposes items added to context.subscriptions
}
