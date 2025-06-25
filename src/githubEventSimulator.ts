// src/githubEventSimulator.ts
import * as vscode from "vscode";
import { notifyRelease, notifyPush } from "./discordManager";

/**
 * Simulate GitHub events for testing the Discord webhook integration
 */
export function registerGitHubEventSimulator(
  context: vscode.ExtensionContext
): void {
  // Register command to simulate a GitHub release event
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prismflow.simulateGithubRelease",
      async () => {
        // Get release details from user
        const releaseName = await vscode.window.showInputBox({
          prompt: "Enter release name",
          placeHolder: "e.g., v1.0.0",
          ignoreFocusOut: true,
        });

        if (!releaseName) {
          return; // User cancelled
        }

        const releaseUrl =
          (await vscode.window.showInputBox({
            prompt: "Enter release URL (or leave empty for simulation)",
            placeHolder:
              "e.g., https://github.com/user/repo/releases/tag/v1.0.0",
            ignoreFocusOut: true,
            value:
              "https://github.com/user/prismflow/releases/tag/" + releaseName,
          })) ||
          "https://github.com/user/prismflow/releases/tag/" + releaseName;

        const description =
          (await vscode.window.showInputBox({
            prompt: "Enter release description",
            placeHolder: "What's new in this release?",
            ignoreFocusOut: true,
          })) || "New version released!";

        // Notify via Discord
        notifyRelease(releaseName, releaseUrl, description);

        vscode.window.showInformationMessage(
          `Simulated GitHub release event for ${releaseName}`
        );
      }
    )
  );

  // Register command to simulate a GitHub push event
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prismflow.simulateGithubPush",
      async () => {
        // Get commit details from user
        const commitMessage = await vscode.window.showInputBox({
          prompt: "Enter commit message",
          placeHolder: "e.g., Fix bug in navigation feature",
          ignoreFocusOut: true,
        });

        if (!commitMessage) {
          return; // User cancelled
        }

        const author =
          (await vscode.window.showInputBox({
            prompt: "Enter commit author",
            placeHolder: "e.g., John Doe <john@example.com>",
            ignoreFocusOut: true,
            value: "User <user@example.com>",
          })) || "User <user@example.com>";

        const repoUrl =
          (await vscode.window.showInputBox({
            prompt: "Enter repository URL (or leave empty for simulation)",
            placeHolder: "e.g., https://github.com/user/repo",
            ignoreFocusOut: true,
            value: "https://github.com/user/prismflow",
          })) || "https://github.com/user/prismflow";

        // Notify via Discord
        notifyPush(commitMessage, author, repoUrl);

        vscode.window.showInformationMessage(
          `Simulated GitHub push event with message: ${commitMessage}`
        );
      }
    )
  );
}
