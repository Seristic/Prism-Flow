import * as vscode from "vscode";

/**
 * Helper class for clipboard operations
 */
export class Clipboard {
  /**
   * Copy text to the clipboard
   * @param text Text to copy
   */
  public async copy(text: string): Promise<boolean> {
    try {
      await vscode.env.clipboard.writeText(text);
      vscode.window.showInformationMessage("Copied to clipboard!");
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to copy to clipboard: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return false;
    }
  }
}
