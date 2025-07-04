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
import { logger } from "./extension";

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
      onSendLatestReleaseWebhook: () =>
        this.executeCommand("prismflow.sendLatestReleaseWebhook"),
      onShowGitHubReleaseManager: () =>
        this.githubReleaseManager.showReleaseManager(),
    };

    this.panel = showDashboardWebview(callbacks);

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  private async executeCommand(commandId: string): Promise<void> {
    logger.log(`Dashboard executing command: ${commandId}`);
    try {
      // Execute the command directly - highlighting commands are now Command Palette only
      logger.log(`Executing command: ${commandId}`);
      await vscode.commands.executeCommand(commandId);
      this.showMessage("Command executed successfully!", "success");
    } catch (error) {
      logger.error(`Error executing command ${commandId}:`, error);
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
