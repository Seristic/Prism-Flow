// src/githubReleaseManager.ts

import * as vscode from "vscode";
import * as cp from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  showGitHubReleaseWebview,
  GitHubReleaseData,
} from "./webviews/githubReleaseWebview";
import { notifyRelease } from "./discordManager";

export class GitHubReleaseManager {
  private context: vscode.ExtensionContext;
  private panel: vscode.WebviewPanel | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public async showReleaseManager(): Promise<void> {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    // Check if we're in a git repository
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage(
        "No workspace folder found. Please open a folder first."
      );
      return;
    }

    const gitDir = path.join(workspaceFolder.uri.fsPath, ".git");
    if (!fs.existsSync(gitDir)) {
      vscode.window.showErrorMessage(
        "This is not a Git repository. Please initialize Git first."
      );
      return;
    }

    // Check if GitHub CLI is available
    const hasGitHubCli = await this.checkGitHubCli();
    if (!hasGitHubCli) {
      const choice = await vscode.window.showWarningMessage(
        "GitHub CLI (gh) is not installed or not authenticated. Would you like to install it?",
        "Install GitHub CLI",
        "Continue without CLI",
        "Cancel"
      );

      if (choice === "Install GitHub CLI") {
        vscode.env.openExternal(vscode.Uri.parse("https://cli.github.com/"));
        return;
      } else if (choice === "Cancel") {
        return;
      }
    }

    this.panel = showGitHubReleaseWebview(this.context, (data, panel) => {
      this.handleReleaseSubmission(data, panel);
    });

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  private async checkGitHubCli(): Promise<boolean> {
    try {
      await this.execCommand("gh --version");
      // Check if authenticated
      await this.execCommand("gh auth status");
      return true;
    } catch {
      return false;
    }
  }

  private async handleReleaseSubmission(
    data: GitHubReleaseData,
    panel: vscode.WebviewPanel
  ): Promise<void> {
    try {
      // Validate the data
      if (!data.tagName || !data.releaseName) {
        this.sendMessageToPanel(
          panel,
          "Please fill in all required fields.",
          false
        );
        return;
      }

      // Check if tag already exists
      const tagExists = await this.checkTagExists(data.tagName);
      if (tagExists) {
        const choice = await vscode.window.showWarningMessage(
          `Tag "${data.tagName}" already exists. Do you want to continue?`,
          "Continue",
          "Cancel"
        );
        if (choice !== "Continue") {
          return;
        }
      }

      // Create the release
      const releaseUrl = await this.createGitHubRelease(data);

      this.sendMessageToPanel(
        panel,
        "Release created successfully!",
        true,
        releaseUrl
      );

      // Send Discord notification for the release
      try {
        await notifyRelease(
          this.context,
          data.releaseName,
          releaseUrl,
          data.description || "A new version has been released!",
          true // Use single webhook to prevent spam
        );
        console.log("Discord notification sent for release:", data.releaseName);
      } catch (discordError) {
        console.error("Failed to send Discord notification:", discordError);
        // Don't fail the release creation if Discord notification fails
      }

      // Show success notification
      vscode.window
        .showInformationMessage(
          `GitHub release "${data.releaseName}" created successfully!`,
          "View Release"
        )
        .then((choice) => {
          if (choice === "View Release" && releaseUrl) {
            vscode.env.openExternal(vscode.Uri.parse(releaseUrl));
          }
        });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.sendMessageToPanel(
        panel,
        `Failed to create release: ${errorMessage}`,
        false
      );
      vscode.window.showErrorMessage(
        `Failed to create GitHub release: ${errorMessage}`
      );
    }
  }

  private async createGitHubRelease(data: GitHubReleaseData): Promise<string> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error("No workspace folder found");
    }

    // Try to use GitHub CLI first
    try {
      const releaseUrl = await this.createReleaseWithCli(data);
      return releaseUrl;
    } catch (cliError) {
      // Fallback to git tag + manual instructions
      return await this.createReleaseWithGit(data);
    }
  }

  private async createReleaseWithCli(data: GitHubReleaseData): Promise<string> {
    let command = `gh release create "${data.tagName}"`;

    if (data.releaseName) {
      command += ` --title "${data.releaseName}"`;
    }

    if (data.description) {
      // Write description to a temporary file to handle multiline content
      const tempFile = path.join(os.tmpdir(), `release-notes-${Date.now()}.md`);
      fs.writeFileSync(tempFile, data.description);
      command += ` --notes-file "${tempFile}"`;
    }

    if (data.draft) {
      command += " --draft";
    }

    if (data.prerelease) {
      command += " --prerelease";
    }

    if (data.generateNotes) {
      command += " --generate-notes";
    }

    if (
      data.targetCommitish &&
      data.targetCommitish !== "main" &&
      data.targetCommitish !== "master"
    ) {
      command += ` --target "${data.targetCommitish}"`;
    }

    const output = await this.execCommand(command);

    // Clean up temp file
    if (data.description) {
      const tempFile = path.join(os.tmpdir(), `release-notes-${Date.now()}.md`);
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }

    // Extract URL from output
    const urlMatch = output.match(/https:\/\/github\.com\/[^\s]+/);
    return urlMatch ? urlMatch[0] : "";
  }

  private async createReleaseWithGit(data: GitHubReleaseData): Promise<string> {
    // Create a git tag
    let tagCommand = `git tag -a "${data.tagName}" -m "${data.releaseName}"`;

    if (data.targetCommitish && data.targetCommitish !== "HEAD") {
      tagCommand += ` "${data.targetCommitish}"`;
    }

    await this.execCommand(tagCommand);

    // Push the tag
    await this.execCommand(`git push origin "${data.tagName}"`);

    // Get repository URL
    const remoteUrl = await this.execCommand("git remote get-url origin");
    const repoMatch = remoteUrl.match(
      /github\.com[\/:](.+?)\/(.+?)(?:\.git)?$/
    );

    if (repoMatch) {
      const [, owner, repo] = repoMatch;
      const releaseUrl = `https://github.com/${owner}/${repo}/releases/tag/${data.tagName}`;

      // Show instructions for manual release creation
      vscode.window
        .showInformationMessage(
          `Tag "${data.tagName}" created and pushed. Please visit GitHub to complete the release creation.`,
          "Open GitHub"
        )
        .then((choice) => {
          if (choice === "Open GitHub") {
            vscode.env.openExternal(vscode.Uri.parse(releaseUrl));
          }
        });

      return releaseUrl;
    }

    throw new Error("Could not determine repository URL");
  }

  private async checkTagExists(tagName: string): Promise<boolean> {
    try {
      await this.execCommand(`git tag -l "${tagName}"`);
      return true;
    } catch {
      return false;
    }
  }

  private execCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        reject(new Error("No workspace folder"));
        return;
      }

      cp.exec(
        command,
        { cwd: workspaceFolder.uri.fsPath },
        (error, stdout, stderr) => {
          if (error) {
            reject(
              new Error(`Command failed: ${error.message}\nStderr: ${stderr}`)
            );
          } else {
            resolve(stdout.trim());
          }
        }
      );
    });
  }

  private sendMessageToPanel(
    panel: vscode.WebviewPanel,
    message: string,
    success: boolean,
    url?: string
  ): void {
    panel.webview.postMessage({
      command: "releaseResult",
      message: message,
      success: success,
      url: url,
    });
  }
}
