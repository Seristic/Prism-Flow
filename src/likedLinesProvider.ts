// src/likedLinesProvider.ts
import * as vscode from 'vscode';
import { LikedLineData, LikedLineItem } from './likedLine';
import { getLikedLines, addLikedLine, removeLikedLine } from './likedLinesStorage';

export class LikedLinesProvider implements vscode.TreeDataProvider<LikedLineItem> {
    // EventEmitter to signal VS Code when the tree data needs to be refreshed
    private _onDidChangeTreeData: vscode.EventEmitter<LikedLineItem | undefined | void> = new vscode.EventEmitter<LikedLineItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<LikedLineItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {
        // Initial load of liked lines when the provider is created
        this.refresh();
    }

    /**
     * Called by VS Code to get the TreeItem representation of an element.
     */
    getTreeItem(element: LikedLineItem): vscode.TreeItem {
        return element;
    }

    /**
     * Called by VS Code to get the children of an element.
     * If `element` is undefined, it means we need to return the root elements.
     */
    getChildren(element?: LikedLineItem): Thenable<LikedLineItem[]> {
        if (element) {
            // No children for individual liked lines (flat list)
            return Promise.resolve([]);
        } else {
            // Get all liked lines from storage
            const likedLines = getLikedLines(this.context);

            // Create TreeItem instances from the data
            const likedLineItems = likedLines.map(
                data => new LikedLineItem(data, vscode.TreeItemCollapsibleState.None)
            );
            return Promise.resolve(likedLineItems);
        }
    }

    /**
     * Refreshes the Tree View. This should be called whenever the underlying data changes.
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Adds the current active line to liked lines.
     * @param editor The active text editor.
     */
    async addCurrentLine(editor: vscode.TextEditor): Promise<void> {
        const filePath = editor.document.uri.fsPath;
        const lineNumber = editor.selection.active.line;
        const lineContent = editor.document.lineAt(lineNumber).text;

        // Optionally, ask the user for a custom label
        const defaultLabel = `${vscode.Uri.file(filePath).with({ scheme: 'untitled' }).fsPath.split('/').pop()}:${lineNumber + 1}`;
        const label = await vscode.window.showInputBox({
            prompt: `Enter a label for this liked line (optional, defaults to '${defaultLabel}')`,
            value: defaultLabel
        });

        const newLikedLine: LikedLineData = {
            id: `liked-${filePath}-${lineNumber}-${Date.now()}`, // Simple unique ID
            filePath: filePath,
            lineNumber: lineNumber,
            lineContent: lineContent,
            timestamp: Date.now(),
            label: label || undefined // Use provided label or undefined
        };

        addLikedLine(this.context, newLikedLine);
        this.refresh(); // Refresh the UI
        vscode.window.setStatusBarMessage(`PrismFlow: Added line ${lineNumber + 1} to Liked Lines!`, 3000);
    }

    /**
     * Removes a liked line from storage and refreshes the view.
     * @param item The LikedLineItem to remove.
     */
    async removeLikedLine(item: LikedLineItem): Promise<void> {
        removeLikedLine(this.context, item.data.id);
        this.refresh(); // Refresh the UI
        vscode.window.setStatusBarMessage(`PrismFlow: Removed liked line from ${item.label || item.description}.`, 3000);
    }

    /**
     * Opens the file and navigates to the specified line for a liked line.
     * @param data The LikedLineData to navigate to.
     */
    async navigateToLikedLine(data: LikedLineData): Promise<void> {
        const uri = vscode.Uri.file(data.filePath);
        try {
            const document = await vscode.workspace.openTextDocument(uri);
            const editor = await vscode.window.showTextDocument(document);
            const position = new vscode.Position(data.lineNumber, 0); // 0-indexed line, column 0
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
        } catch (error) {
            vscode.window.showErrorMessage(`PrismFlow: Could not open file for liked line: ${data.filePath}. It might have been moved or deleted.`);
            // Optionally, offer to remove the broken link
            const choice = await vscode.window.showWarningMessage(
                `The file for '${data.label || data.filePath}' could not be opened. Would you like to remove it from your liked lines?`,
                'Yes', 'No'
            );
            if (choice === 'Yes') {
                this.removeLikedLine(new LikedLineItem(data)); // Re-create item to use remove method
            }
        }
    }
}