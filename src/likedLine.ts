// src/likedLine.ts
import * as vscode from "vscode";

// Interface for the data we'll store for each liked line
export interface LikedLineData {
  id: string; // Unique ID for easier removal
  filePath: string;
  lineNumber: number; // 0-indexed
  lineContent: string; // A snippet of the line's text for display
  timestamp: number; // For sorting (e.g., newest first)
  label?: string; // Optional user-defined label
}

// TreeItem class to represent each liked line in the sidebar view
export class LikedLineItem extends vscode.TreeItem {
  constructor(
    public readonly data: LikedLineData, // Store the full data
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.None
  ) {
    // Label for the TreeItem: Use user-defined label, or file:line
    super(
      data.label ||
        `${vscode.Uri.file(data.filePath)
          .with({ scheme: "untitled" })
          .fsPath.split("/")
          .pop()}:${data.lineNumber + 1}`,
      collapsibleState
    );

    // Tooltip provides more detailed info on hover
    this.tooltip = new vscode.MarkdownString(
      `**File:** ${data.filePath}\n\n` +
        `**Line:** ${data.lineNumber + 1}\n\n` +
        `**Content:** \`${data.lineContent}\``
    );

    // Description appears next to the label (e.g., "Line 123 - console.log(...)")
    this.description = `Line ${data.lineNumber + 1} - ${data.lineContent
      .trim()
      .substring(0, 70)}${data.lineContent.trim().length > 70 ? "..." : ""}`;

    // Icon for the TreeItem
    this.iconPath = new vscode.ThemeIcon("heart-filled"); // Use a filled heart icon

    // Command to run when this item is clicked
    this.command = {
      command: "prismflow.navigateToLikedLine",
      title: "Navigate to Liked Line",
      arguments: [this.data], // Pass the full LikedLineData to the command
    };

    // Context value for 'when' clauses in package.json (e.g., for right-click menus)
    this.contextValue = "prismflowLikedLine";
  }
}
