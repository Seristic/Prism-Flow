// src/decorationManager.ts
import * as vscode from 'vscode';

/**
 * Clears all decorations from all visible text editors using the provided decoration types.
 * This does NOT dispose the TextEditorDecorationType objects themselves, only removes them from the view.
 * @param regularTypes Array of regular highlight decoration types.
 * @param activeType The active highlight decoration type.
 * @param errorType The error highlight decoration type.
 */
export function clearAllDecorations(
    regularTypes: vscode.TextEditorDecorationType[],
    activeType: vscode.TextEditorDecorationType | undefined,
    errorType: vscode.TextEditorDecorationType | undefined
) {
    vscode.window.visibleTextEditors.forEach(editor => {
        regularTypes.forEach(type => editor.setDecorations(type, []));
        if (activeType) {
            editor.setDecorations(activeType, []);
        }
        if (errorType) {
            editor.setDecorations(errorType, []);
        }
    });
}

/**
 * Disposes all provided TextEditorDecorationType objects and the StatusBarItem.
 * This should be called when decoration types are being re-created or on extension deactivation.
 * @param regularTypes Array of regular highlight decoration types to dispose.
 * @param activeType The active highlight decoration type to dispose.
 * @param errorType The error highlight decoration type to dispose.
 * @param statusBarItem The status bar item to dispose.
 */
export function disposeDecorationTypes(
    regularTypes: vscode.TextEditorDecorationType[],
    activeType: vscode.TextEditorDecorationType | undefined,
    errorType: vscode.TextEditorDecorationType | undefined,
    statusBarItem: vscode.StatusBarItem | undefined
) {
    regularTypes.forEach(type => type.dispose());
    if (activeType) {
        activeType.dispose();
    }
    if (errorType) {
        errorType.dispose();
    }
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}