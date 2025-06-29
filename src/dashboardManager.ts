// src/dashboardManager.ts

import * as vscode from "vscode";
import {
  showDashboardWebview,
  DashboardCallbacks,
} from "./webviews/dashboardWebview";
import { GitHubWebhookManager } from "./githubWebhookManager";
import { GitHubReleaseManager } from "./githubReleaseManager";
import * as discordManager from "./discordManager";
import * as versionManager from "./versionManager";
import * as githubEventSimulator from "./githubEventSimulator";
import * as gitignoreManager from "./gitignoreManager";

export class DashboardManager {
  private context: vscode.ExtensionContext;
  private githubWebhookManager: GitHubWebhookManager;
  private githubReleaseManager: GitHubReleaseManager;
  private panel: vscode.WebviewPanel | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.githubWebhookManager = new GitHubWebhookManager(context);
    this.githubReleaseManager = new GitHubReleaseManager(context);
  }

  public showDashboard(): void {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    const callbacks: DashboardCallbacks = {
      onRefreshHighlights: () =>
        this.executeCommand("prismflow.applyHighlights"),
      onClearHighlights: () => this.executeCommand("prismflow.clearHighlights"),
      onCopyBlockPath: () => this.executeCommand("prismflow.copyBlockPath"),
      onNavigateToBlock: () => this.executeCommand("prismflow.navigateToBlock"),
      onLikeCurrentLine: () => this.executeCommand("prismflow.likeCurrentLine"),
      onRefreshLikedLines: () =>
        this.executeCommand("prismflow.refreshLikedLines"),
      onAutoAddGitignore: () =>
        this.executeCommand("prismflow.autoAddGitignorePatterns"),
      onSetupDiscordWebhook: () =>
        this.executeCommand("prismflow.setupDiscordWebhook"),
      onManageDiscordWebhooks: () =>
        this.executeCommand("prismflow.manageDiscordWebhooks"),
      onUpdateVersion: () => this.executeCommand("prismflow.updateVersion"),
      onShowCurrentVersion: () =>
        this.executeCommand("prismflow.showCurrentVersion"),
      onSimulateGithubRelease: () =>
        this.executeCommand("prismflow.simulateGithubRelease"),
      onSimulateGithubPush: () =>
        this.executeCommand("prismflow.simulateGithubPush"),
      onSetupGitHubWebhook: () =>
        this.executeCommand("prismflow.setupGitHubWebhook"),
      onManageGitHubWebhooks: () =>
        this.executeCommand("prismflow.manageGitHubWebhooks"),
      onShowGitHubReleaseManager: () =>
        this.githubReleaseManager.showReleaseManager(),
    };

    this.panel = showDashboardWebview(callbacks);

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  private async executeCommand(commandId: string): Promise<void> {
    try {
      await vscode.commands.executeCommand(commandId);
      this.showMessage("Command executed successfully!", "success");
    } catch (error) {
      this.showMessage(`Error executing command: ${error}`, "error");
    }
  }

  private showMessage(text: string, type: "success" | "error"): void {
    if (this.panel) {
      this.panel.webview.postMessage({
        command: "showMessage",
        text,
        type,
      });
    }
  }
}
