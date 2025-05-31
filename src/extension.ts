// src/extension.ts
import * as vscode from 'vscode';
import * as decorationManager from './decorationManager';
import * as highlighter from './highlighter';
import { DEBOUNCE_DELAY } from './constants';

let selectionChangeTimeout: NodeJS.Timeout | undefined;

// Declare these at the module scope so they can be accessed throughout the extension.
// Initialize to empty array or undefined.
let regularDecorationTypes: vscode.TextEditorDecorationType[] = [];
let activeDecorationType: vscode.TextEditorDecorationType | undefined;
let errorDecorationType: vscode.TextEditorDecorationType | undefined;
let statusBarItem: vscode.StatusBarItem | undefined;

/**
 * Initializes/reinitializes all decoration types and the status bar item,
 * adds them to context.subscriptions, and reapplies highlights.
 * This function handles the lifecycle of decoration types to prevent "unknown key" errors.
 * @param context The extension context.
 */
function initializeAndReapplyHighlights(context: vscode.ExtensionContext) {
    console.log('PrismFlow: Reinitializing decorations.');

    // 1. Dispose any existing decoration types and status bar item if they were previously created.
    // This is crucial to prevent "unknown decoration type key" errors from stale objects.
    decorationManager.disposeDecorationTypes(regularDecorationTypes, activeDecorationType, errorDecorationType, statusBarItem);

    regularDecorationTypes = []; // Clear array for new types
    activeDecorationType = undefined;
    errorDecorationType = undefined;
    statusBarItem = undefined;

    const config = vscode.workspace.getConfiguration('prismflow');
    const DEFAULT_HIGHLIGHT_COLORS = [
        "rgba(255, 255, 0, 0.3)", "rgba(0, 255, 255, 0.3)", "rgba(255, 0, 255, 0.3)",
        "rgba(0, 255, 0, 0.3)", "rgba(255, 165, 0, 0.3)", "rgba(100, 100, 255, 0.3)",
        "rgba(255, 100, 100, 0.3)"
    ];

    // 3. Create NEW decoration types and status bar item.
    const highlightColors: string[] = config.get('prismflow.highlightColors', DEFAULT_HIGHLIGHT_COLORS);
    
    regularDecorationTypes = highlightColors.map(color => {
        const type = vscode.window.createTextEditorDecorationType({
            backgroundColor: color,
            overviewRulerColor: color,
            overviewRulerLane: vscode.OverviewRulerLane.Full
        });
        context.subscriptions.push(type); // CRUCIAL: Add to subscriptions for auto-disposal
        return type;
    });

    activeDecorationType = vscode.window.createTextEditorDecorationType(config.get('prismflow.activeHighlightStyle', {
        border: "1px solid rgba(255, 255, 255, 0.8)",
        overviewRulerColor: "rgba(255, 255, 255, 0.8)"
    }));
    context.subscriptions.push(activeDecorationType); // CRUCIAL: Add to subscriptions

    errorDecorationType = vscode.window.createTextEditorDecorationType(config.get('prismflow.errorHighlightStyle', {
        backgroundColor: "rgba(255, 0, 0, 0.1)",
        textDecoration: "underline wavy red",
        overviewRulerColor: "red",
        overviewRulerLane: vscode.OverviewRulerLane.Full
    }));
    context.subscriptions.push(errorDecorationType); // CRUCIAL: Add to subscriptions

    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        config.get('prismflow.statusBarPriority', 100)
    );
    context.subscriptions.push(statusBarItem); // CRUCIAL: Add to subscriptions

    // 4. Apply highlights to the active editor with the new types.
    if (vscode.window.activeTextEditor) {
        // Ensure types are defined before passing
        if (errorDecorationType) { // regularDecorationTypes is always an array
            highlighter.applyPrismFlowDecorations(regularDecorationTypes, errorDecorationType);
        } else {
            console.warn('PrismFlow: Error decoration type not fully initialized after reinit. Cannot apply base highlights.');
        }

        if (activeDecorationType) {
            highlighter.updateActiveBlockHighlight(vscode.window.activeTextEditor, activeDecorationType);
        } else {
            console.warn('PrismFlow: Active decoration type not fully initialized after reinit. Cannot update active highlight.');
        }
    }
}


/**
 * Activates the PrismFlow extension.
 * @param context The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext): void {
    console.log('PrismFlow extension activated.');

    // Removed redundant debug logs here, as they would show 'undefined' before initialization
    // console.log('DEBUG: In applyPrismFlowDecorations before setDecorations');
    // console.log('DEBUG: errorDecorationType is', errorDecorationType ? 'valid' : 'INVALID', '(', errorDecorationType, ')');
    // console.log('DEBUG: regularDecorationTypes[0] is', regularDecorationTypes[0] ? 'valid' : 'INVALID', '(', regularDecorationTypes[0], ')');

    // Initialize all decoration types and apply initial highlights
    initializeAndReapplyHighlights(context);

    // --- Command Registrations ---
    const applyHighlightsCommand = vscode.commands.registerCommand('prismflow.applyHighlights', () => {
        // FIXED: Changed 'errorDecorationTypes' to 'errorDecorationType'
        if (errorDecorationType) { // Ensure types are initialized
            highlighter.applyPrismFlowDecorations(regularDecorationTypes, errorDecorationType);
            if (activeDecorationType && vscode.window.activeTextEditor) {
                highlighter.updateActiveBlockHighlight(vscode.window.activeTextEditor, activeDecorationType);
            }
        }
        vscode.window.setStatusBarMessage('PrismFlow: Highlights Refreshed!', 2000);
    });
    context.subscriptions.push(applyHighlightsCommand);

    const clearHighlightsCommand = vscode.commands.registerCommand('prismflow.clearHighlights', () => {
        decorationManager.clearAllDecorations(regularDecorationTypes, activeDecorationType, errorDecorationType);
        if (statusBarItem) {
            statusBarItem.hide(); // Hide status bar if visible
        }
        vscode.window.setStatusBarMessage('PrismFlow: Highlights Cleared!', 2000);
    });
    context.subscriptions.push(clearHighlightsCommand);

    const copyPathCommand = vscode.commands.registerCommand('prismflow.copyBlockPath', async () => {
        if (vscode.window.activeTextEditor) {
            await highlighter.copyPathForActiveBlock(vscode.window.activeTextEditor);
        } else {
            vscode.window.showInformationMessage('PrismFlow: No active editor to copy path from.');
        }
    });
    context.subscriptions.push(copyPathCommand);

    const navigateToBlockCommand = vscode.commands.registerCommand('prismflow.navigateToBlock', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('PrismFlow: No active editor to navigate blocks.');
            return;
        }

        // Ensure highlights are up-to-date before getting blocks for navigation
        if (errorDecorationType) { // regularDecorationTypes is always an array
            highlighter.applyPrismFlowDecorations(regularDecorationTypes, errorDecorationType);
        }

        // FIXED: Removed 'editor' argument as getQuickPickItems expects 0 arguments
        const quickPickItems = highlighter.getQuickPickItems(); 

        if (quickPickItems.length === 0) {
            vscode.window.showInformationMessage('PrismFlow: No highlightable blocks found in this document.');
            return;
        }

        const selectedItem = await vscode.window.showQuickPick(quickPickItems, {
            placeHolder: 'Select a block to navigate to...',
            matchOnDescription: true,
            matchOnDetail: true,
        });

        if (selectedItem) {
            highlighter.navigateToBlockByPath(editor, selectedItem.label);
        }
    });
    context.subscriptions.push(navigateToBlockCommand);


    // Listen for configuration changes (e.g., user changes settings)
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
        if (e.affectsConfiguration('prismflow')) {
            initializeAndReapplyHighlights(context); // Reinitialize and reapply
        }
    }));

    // Listen for text document changes (e.g., typing, pasting)
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
        if (selectionChangeTimeout) {
            clearTimeout(selectionChangeTimeout);
        }
        selectionChangeTimeout = setTimeout(() => {
            if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
                // Only apply base highlights on text changes
                if (errorDecorationType) {
                    highlighter.applyPrismFlowDecorations(regularDecorationTypes, errorDecorationType);
                }
                // Update active highlight based on cursor position
                if (activeDecorationType) {
                    highlighter.updateActiveBlockHighlight(vscode.window.activeTextEditor, activeDecorationType);
                }
            }
        }, DEBOUNCE_DELAY);
    }));

    // Listen for changes in the active text editor (e.g., switching tabs)
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor?: vscode.TextEditor) => {
        if (editor) {
            if (errorDecorationType) { // Apply base highlights for new active editor
                highlighter.applyPrismFlowDecorations(regularDecorationTypes, errorDecorationType);
            }
            if (activeDecorationType) { // Update active highlight for new active editor
                highlighter.updateActiveBlockHighlight(editor, activeDecorationType);
            }
        } else {
            // No active editor, clear all decorations and hide status bar
            decorationManager.clearAllDecorations(regularDecorationTypes, activeDecorationType, errorDecorationType);
            if (statusBarItem) {
                statusBarItem.hide();
            }
        }
    }));

    // Listen for cursor selection changes (important for active block highlighting and status bar)
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection((event: vscode.TextEditorSelectionChangeEvent) => {
        if (selectionChangeTimeout) {
            clearTimeout(selectionChangeTimeout);
        }
        selectionChangeTimeout = setTimeout(() => {
            if (event.textEditor && event.textEditor === vscode.window.activeTextEditor && activeDecorationType) {
                highlighter.updateActiveBlockHighlight(event.textEditor, activeDecorationType);
            }
        }, DEBOUNCE_DELAY);
    }));
}

/**
 * Deactivates the PrismFlow extension.
 * This function is called when your extension is deactivated.
 */
export function deactivate(): void {
    console.log('PrismFlow extension deactivated.');
    // Dispose all decoration types and status bar item explicitly
    decorationManager.disposeDecorationTypes(regularDecorationTypes, activeDecorationType, errorDecorationType, statusBarItem);
    // Note: context.subscriptions automatically handles items pushed to it,
    // but explicit disposal here on deactivate ensures immediate cleanup and safety.
}