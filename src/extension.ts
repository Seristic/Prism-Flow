// src/extension.ts
import * as vscode from "vscode";
import * as decorationManager from "./decorationManager";
import * as highlighter from "./highlighter";
import { DEBOUNCE_DELAY } from "./constants";
import * as path from "path";
import * as fs from "fs";

// IMPORTS FOR LIKED LINES FEATURE
import { LikedLinesProvider } from "./likedLinesProvider";
import { LikedLineData, LikedLineItem } from "./likedLine";

// IMPORT FOR GITIGNORE AUTOMATION
import { runGitignoreAutomation } from "./gitignoreManager";

// IMPORTS FOR DISCORD AND VERSION MANAGEMENT
import * as discordManager from "./discordManager";
import * as versionManager from "./versionManager";
import * as githubEventSimulator from "./githubEventSimulator";
import * as githubSetupManager from "./githubSetupManager";
import { GitHubWebhookManager } from "./githubWebhookManager";
import { GitHubReleaseManager } from "./githubReleaseManager";
import { DashboardManager } from "./dashboardManager";
import { GitWatcher } from "./gitWatcher";

let selectionChangeTimeout: NodeJS.Timeout | undefined;
let gitignorePeriodicCheckInterval: NodeJS.Timeout | undefined; // For periodic check

// Declare these at the module scope so they can be accessed throughout the extension.
let regularDecorationTypes: vscode.TextEditorDecorationType[] = [];
let activeDecorationType: vscode.TextEditorDecorationType | undefined;
let errorDecorationType: vscode.TextEditorDecorationType | undefined;
let statusBarItem: vscode.StatusBarItem | undefined;

// NEW: Liked Lines Provider instance
let likedLinesProvider: LikedLinesProvider; // Will be initialized in activate

// NEW: File System Watcher for new file comments
let fileCreationWatcher: vscode.FileSystemWatcher | undefined;

// Dashboard Manager instance
let dashboardManager: DashboardManager | undefined;

// Git Watcher instance
let gitWatcher: GitWatcher | undefined;

// PrismFlow Output Channel for logging
let outputChannel: vscode.OutputChannel | undefined;

/**
 * Logger utility for PrismFlow - writes to dedicated output channel
 */
export const logger = {
  log: (message: string) => {
    if (outputChannel) {
      outputChannel.appendLine(
        `[${new Date().toLocaleTimeString()}] ${message}`
      );
    }
  },
  error: (message: string, error?: any) => {
    if (outputChannel) {
      outputChannel.appendLine(
        `[${new Date().toLocaleTimeString()}] ERROR: ${message}`
      );
      if (error) {
        outputChannel.appendLine(
          `[${new Date().toLocaleTimeString()}] ${error.toString()}`
        );
      }
    }
  },
  show: () => {
    if (outputChannel) {
      outputChannel.show();
    }
  },
};

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
 * @param context The extension context.
 */
function setupGitignorePeriodicCheck(context: vscode.ExtensionContext) {
  // Added context parameter
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
      // Only run if there are active workspace folders
      if (
        vscode.workspace.workspaceFolders &&
        vscode.workspace.workspaceFolders.length > 0
      ) {
        // Run the automation without prompting for confirmation in the background
        const patternsFound = await runGitignoreAutomation({
          autoConfirm: true,
        }); // Pass an option to auto-confirm
        if (patternsFound && patternsFound.length > 0) {
          vscode.window.showInformationMessage(
            `PrismFlow: Found and added new .gitignore patterns: ${patternsFound.join(
              ", "
            )}`
          );
        }
      } else {
        console.log(
          "PrismFlow: Skipping automated .gitignore run, no workspace folders open."
        );
      }
    }, intervalMinutes * 60 * 1000); // Convert minutes to milliseconds

    // Ensure the interval is disposed when the extension deactivates
    context.subscriptions.push({
      dispose: () => {
        if (gitignorePeriodicCheckInterval) {
          clearInterval(gitignorePeriodicCheckInterval);
          gitignorePeriodicCheckInterval = undefined;
        }
      },
    });
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

  // Initialize PrismFlow output channel for dedicated logging
  outputChannel = vscode.window.createOutputChannel("PrismFlow");
  context.subscriptions.push(outputChannel);
  logger.log("PrismFlow extension activated - logging initialized");

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

  // Initialize Discord webhooks
  discordManager.loadWebhooks(context); // Register Discord webhook commands
  discordManager.registerWebhookCommands(context);

  // Register version management commands
  versionManager.registerVersionCommands(context);

  // Register GitHub event simulator commands
  githubEventSimulator.registerGitHubEventSimulator(context);

  // Register GitHub webhook setup commands
  githubSetupManager.registerGitHubWebhookCommands(context);

  // Register GitHub webhook manager commands
  const githubWebhookManager = new GitHubWebhookManager(context);
  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.setupGitHubWebhook", () =>
      githubWebhookManager.setupWebhook()
    ),
    vscode.commands.registerCommand("prismflow.manageGitHubWebhooks", () =>
      githubWebhookManager.manageWebhooks()
    ),
    vscode.commands.registerCommand("prismflow.sendLatestReleaseWebhook", () =>
      discordManager.sendLatestReleaseWebhook(context)
    ),
    vscode.commands.registerCommand("prismflow.testDiscordWebhook", () =>
      discordManager.testWebhook(context)
    ),
    vscode.commands.registerCommand("prismflow.testDiscordConnectivity", () =>
      discordManager.testWebhookConnectivity(context)
    ),
    vscode.commands.registerCommand("prismflow.simulatePullRequestEvent", () =>
      simulatePullRequestEvent(context)
    ),
    vscode.commands.registerCommand("prismflow.simulateIssueEvent", () =>
      simulateIssueEvent(context)
    ),
    vscode.commands.registerCommand("prismflow.simulateDiscussionEvent", () =>
      simulateDiscussionEvent(context)
    ),
    vscode.commands.registerCommand("prismflow.simulateDeploymentEvent", () =>
      simulateDeploymentEvent(context)
    ),
    vscode.commands.registerCommand("prismflow.testGitWatcher", async () => {
      if (gitWatcher) {
        vscode.window.showInformationMessage(
          "🔍 Testing GitWatcher - checking for recent commits..."
        );

        // Trigger a manual check for commits
        try {
          const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
          if (!workspaceFolder) {
            vscode.window.showErrorMessage("No workspace folder found");
            return;
          }

          // Get the latest commit info using git command
          const cp = require("child_process");
          cp.exec(
            "git log -1 --pretty=format:\"%H|%s|%an\"",
            { cwd: workspaceFolder.uri.fsPath },
            async (error: any, stdout: string, stderr: string) => {
              if (error) {
                vscode.window.showErrorMessage(
                  `Git command failed: ${error.message}`
                );
                return;
              }

              const [hash, message, author] = stdout.split("|");
              vscode.window.showInformationMessage(
                `Latest commit: ${hash.substring(
                  0,
                  7
                )} by ${author}: ${message.substring(0, 50)}...`
              );

              // Trigger Discord notification for testing
              const repoUrl = "https://github.com/test/repo"; // Test URL
              await discordManager.notifyPush(
                context,
                message,
                author,
                repoUrl
              );
            }
          );
        } catch (error) {
          vscode.window.showErrorMessage(`GitWatcher test failed: ${error}`);
        }
      } else {
        vscode.window.showErrorMessage("GitWatcher is not initialized");
      }
    })
  );

  // Register GitHub Release Manager
  const githubReleaseManager = new GitHubReleaseManager(context);
  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.showGitHubReleaseManager", () =>
      githubReleaseManager.showReleaseManager()
    )
  );

  // Register Dashboard Manager
  dashboardManager = new DashboardManager(context);
  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.showDashboard", () =>
      dashboardManager?.showDashboard()
    )
  );

  // Register Show Logs command
  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.showLogs", () => {
      logger.show();
    })
  );

  // Register QA Testing Checklist command
  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.openQAChecklist", async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder found");
        return;
      }

      const checklistPath = path.join(
        workspaceFolder.uri.fsPath,
        "QA-TESTING-CHECKLIST.md"
      );

      // Check if file exists
      if (!fs.existsSync(checklistPath)) {
        vscode.window.showErrorMessage(
          "QA Testing Checklist not found at: " + checklistPath
        );
        return;
      }

      try {
        const document = await vscode.workspace.openTextDocument(checklistPath);
        await vscode.window.showTextDocument(document);
        logger.log("QA Testing Checklist opened successfully");
      } catch (error) {
        logger.error("Failed to open QA Testing Checklist: " + error);
        vscode.window.showErrorMessage("Failed to open QA Testing Checklist");
      }
    })
  );

  // Register Developer QA Guide command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prismflow.openDeveloperGuide",
      async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          vscode.window.showErrorMessage("No workspace folder found");
          return;
        }

        const guidePath = path.join(
          workspaceFolder.uri.fsPath,
          "docs",
          "DEVELOPER-QA-GUIDE.md"
        );

        // Check if file exists
        if (!fs.existsSync(guidePath)) {
          vscode.window.showErrorMessage(
            "Developer QA Guide not found at: " + guidePath
          );
          return;
        }

        try {
          const document = await vscode.workspace.openTextDocument(guidePath);
          await vscode.window.showTextDocument(document);
          logger.log("Developer QA Guide opened successfully");
        } catch (error) {
          logger.error("Failed to open Developer QA Guide: " + error);
          vscode.window.showErrorMessage("Failed to open Developer QA Guide");
        }
      }
    )
  );

  // Register Create Custom QA Checklist command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prismflow.createCustomQAChecklist",
      async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          vscode.window.showErrorMessage("No workspace folder found");
          return;
        }

        const originalPath = path.join(
          workspaceFolder.uri.fsPath,
          "QA-TESTING-CHECKLIST.md"
        );
        const customPath = path.join(
          workspaceFolder.uri.fsPath,
          "QA-TESTING-CHECKLIST-CUSTOM.md"
        );

        // Check if original file exists
        if (!fs.existsSync(originalPath)) {
          vscode.window.showErrorMessage(
            "Original QA Testing Checklist not found at: " + originalPath
          );
          return;
        }

        // Check if custom file already exists
        if (fs.existsSync(customPath)) {
          const choice = await vscode.window.showWarningMessage(
            "Custom QA Testing Checklist already exists. What would you like to do?",
            "Open Existing",
            "Overwrite",
            "Cancel"
          );

          if (choice === "Cancel") {
            return;
          } else if (choice === "Open Existing") {
            try {
              const document = await vscode.workspace.openTextDocument(
                customPath
              );
              await vscode.window.showTextDocument(document);
              logger.log("Opened existing custom QA Testing Checklist");
              return;
            } catch (error) {
              logger.error(
                "Failed to open existing custom QA Testing Checklist",
                error
              );
              vscode.window.showErrorMessage(
                "Failed to open existing custom checklist"
              );
              return;
            }
          }
          // If "Overwrite" is selected, continue with the copy operation
        }

        try {
          // Read the original file
          const originalContent = fs.readFileSync(originalPath, "utf8");

          // Create custom content with header
          const customContent = `<!-- QA-TESTING-CHECKLIST-CUSTOM.md -->
<!-- This is your customized QA Testing Checklist -->
<!-- The original checklist is preserved in QA-TESTING-CHECKLIST.md -->
<!-- Edit this file to add your project-specific testing requirements -->

# PrismFlow QA Testing Checklist (Custom)

## 🎯 **Custom Project Checklist**

**⚠️ This is your customized version of the QA Testing Checklist**

- **Original preserved**: The default checklist remains in \`QA-TESTING-CHECKLIST.md\`
- **Safe to edit**: Make any changes you need for your project
- **Version control**: Track this file in your repository
- **Team sharing**: Share your customizations with your team

---

${originalContent
  .replace("<!-- QA-TESTING-CHECKLIST.md -->", "")
  .replace(
    "# PrismFlow QA Testing Checklist",
    "# PrismFlow QA Testing Checklist (Base Template)"
  )}

---

## 📝 **Customization Notes**

### Changes Made:
- [ ] Added project-specific test cases
- [ ] Modified test descriptions
- [ ] Updated environment requirements
- [ ] Added team processes
- [ ] Other: _______________

### Last Updated: ${new Date().toISOString().split("T")[0]}

### Customized By: [Your Name]

---

**💡 Tip**: Keep this file in version control to share your testing standards with your team!
`;

          // Write the custom file
          fs.writeFileSync(customPath, customContent);

          // Open the new custom file
          const document = await vscode.workspace.openTextDocument(customPath);
          await vscode.window.showTextDocument(document);

          logger.log("Created and opened custom QA Testing Checklist");
          vscode.window.showInformationMessage(
            "Custom QA Testing Checklist created! You can now safely edit this file without affecting the original."
          );
        } catch (error) {
          logger.error("Failed to create custom QA Testing Checklist", error);
          vscode.window.showErrorMessage(
            "Failed to create custom checklist: " + error
          );
        }
      }
    )
  );

  // --- Command Registrations ---
  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.applyHighlights", () => {
      logger.log("prismflow.applyHighlights command called");
      logger.log(
        `Active editor: ${vscode.window.activeTextEditor ? "exists" : "none"}`
      );
      logger.log(`Visible editors: ${vscode.window.visibleTextEditors.length}`);

      if (errorDecorationType) {
        logger.log("Applying PrismFlow decorations...");
        highlighter.applyPrismFlowDecorations(
          regularDecorationTypes,
          errorDecorationType
        );

        // Apply active block highlighting to all visible editors instead of just active editor
        if (activeDecorationType) {
          logger.log(
            "Applying active block highlighting to visible editors..."
          );
          vscode.window.visibleTextEditors.forEach((editor) => {
            highlighter.updateActiveBlockHighlight(
              editor,
              activeDecorationType!
            );
          });
        }
      } else {
        logger.error("Error: errorDecorationType is undefined");
      }
      vscode.window.setStatusBarMessage(
        "PrismFlow: Highlights Refreshed!",
        2000
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.clearHighlights", () => {
      logger.log("prismflow.clearHighlights command called");
      logger.log(`Visible editors: ${vscode.window.visibleTextEditors.length}`);

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
        highlighter.navigateToBlockByPath(editor, selectedItem);
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

  // Gitignore Automation Command (manual trigger)
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
            setupGitignorePeriodicCheck(context); // Pass context here
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
          const activeEditor = vscode.window.activeTextEditor;
          if (activeEditor && event.document === activeEditor.document) {
            // Check if it's a supported language before applying highlights
            const config = vscode.workspace.getConfiguration("prismflow");
            const supportedLanguages: string[] = config.get(
              "supportedLanguages",
              [
                "javascript",
                "typescript",
                "json",
                "jsonc",
                "python",
                "java",
                "c",
                "cpp",
                "csharp",
                "go",
                "rust",
                "php",
              ]
            );

            if (supportedLanguages.includes(activeEditor.document.languageId)) {
              if (errorDecorationType) {
                highlighter.applyPrismFlowDecorations(
                  regularDecorationTypes,
                  errorDecorationType
                );
              }
              if (activeDecorationType) {
                highlighter.updateActiveBlockHighlight(
                  activeEditor,
                  activeDecorationType
                );
              }
            }
          }
        }, DEBOUNCE_DELAY);
      }
    )
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor?: vscode.TextEditor) => {
      if (editor) {
        // Check if the editor has a supported language before applying highlights
        const config = vscode.workspace.getConfiguration("prismflow");
        const supportedLanguages: string[] = config.get("supportedLanguages", [
          "javascript",
          "typescript",
          "json",
          "jsonc",
          "python",
          "java",
          "c",
          "cpp",
          "csharp",
          "go",
          "rust",
          "php",
        ]);

        if (supportedLanguages.includes(editor.document.languageId)) {
          logger.log(
            `Active editor changed to supported language: ${editor.document.languageId}`
          );
          if (errorDecorationType) {
            highlighter.applyPrismFlowDecorations(
              regularDecorationTypes,
              errorDecorationType
            );
          }
          if (activeDecorationType) {
            highlighter.updateActiveBlockHighlight(
              editor,
              activeDecorationType
            );
          }
        } else {
          logger.log(
            `Active editor changed to unsupported language: ${editor.document.languageId} - skipping highlights`
          );
        }
      } else {
        logger.log("No active editor - clearing decorations");
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
  setupGitignorePeriodicCheck(context); // Pass context here

  // Initialize Git Watcher for automatic Discord notifications on external Git pushes
  gitWatcher = new GitWatcher(context);
  gitWatcher
    .startWatching()
    .then(() => {
      logger.log("GitWatcher initialized and started monitoring Git changes");
    })
    .catch((error) => {
      logger.error("Failed to start GitWatcher: " + error);
    });

  // ⚠️ DISABLED: File creation watcher disabled due to malware-like behavior
  // This was causing issues during npm install and other bulk file operations
  // The file watcher was opening and modifying every file created by npm, causing
  // VS Code to treat them as unsaved changes and creating a "malware-like" experience
  // TODO: Re-implement with proper filtering for user-created files only

  // Removed the problematic diagnostic interval for untracked files
  // as the issue was incorrect API usage, not timing.
}

/**
 * Deactivates the PrismFlow extension.
 */
export function deactivate(): void {
  console.log("PrismFlow extension deactivated.");
  // Dispose all decoration types and status bar item explicitly
  decorationManager.clearAllDecorations(
    regularDecorationTypes,
    activeDecorationType,
    errorDecorationType
  );
  if (statusBarItem) {
    statusBarItem.dispose(); // Ensure status bar item is explicitly disposed
  }

  // Clear periodic check interval on deactivation
  if (gitignorePeriodicCheckInterval) {
    clearInterval(gitignorePeriodicCheckInterval);
    gitignorePeriodicCheckInterval = undefined;
  }

  // Dispose Git Watcher
  if (gitWatcher) {
    gitWatcher.dispose();
    gitWatcher = undefined;
  }

  // Dispose the file creation watcher (disabled)
  // if (fileCreationWatcher) {
  //   fileCreationWatcher.dispose();
  //   fileCreationWatcher = undefined;
  // }
  // VS Code automatically disposes items added to context.subscriptions
}

// Simulation functions for testing different GitHub events
async function simulatePullRequestEvent(
  context: vscode.ExtensionContext
): Promise<void> {
  const action = await vscode.window.showQuickPick(
    ["opened", "closed", "merged", "updated"],
    { placeHolder: "Select pull request action to simulate" }
  );

  if (!action) {
    return;
  }

  const prTitle = await vscode.window.showInputBox({
    prompt: "Enter pull request title",
    placeHolder: "Fix: Update Discord webhook handling",
  });

  if (!prTitle) {
    return;
  }

  const author = await vscode.window.showInputBox({
    prompt: "Enter author name",
    placeHolder: "JohnDoe",
  });

  if (!author) {
    return;
  }

  const prUrl = await vscode.window.showInputBox({
    prompt: "Enter pull request URL",
    placeHolder: "https://github.com/user/repo/pull/123",
  });

  if (!prUrl) {
    return;
  }

  const description = await vscode.window.showInputBox({
    prompt: "Enter description (optional)",
    placeHolder: "This PR fixes Discord webhook error handling...",
  });

  await discordManager.notifyPullRequest(
    context,
    prTitle,
    prUrl,
    author,
    action as "opened" | "closed" | "merged" | "updated",
    description
  );

  vscode.window.showInformationMessage(
    `Simulated pull request ${action} event sent to Discord!`
  );
}

async function simulateIssueEvent(
  context: vscode.ExtensionContext
): Promise<void> {
  const action = await vscode.window.showQuickPick(
    ["opened", "closed", "updated", "assigned"],
    { placeHolder: "Select issue action to simulate" }
  );

  if (!action) {
    return;
  }

  const issueTitle = await vscode.window.showInputBox({
    prompt: "Enter issue title",
    placeHolder: "Bug: Discord webhook not working",
  });

  if (!issueTitle) {
    return;
  }

  const author = await vscode.window.showInputBox({
    prompt: "Enter author name",
    placeHolder: "JaneDoe",
  });

  if (!author) {
    return;
  }

  const issueUrl = await vscode.window.showInputBox({
    prompt: "Enter issue URL",
    placeHolder: "https://github.com/user/repo/issues/45",
  });

  if (!issueUrl) {
    return;
  }

  const description = await vscode.window.showInputBox({
    prompt: "Enter description (optional)",
    placeHolder: "The Discord webhook is returning errors when...",
  });

  await discordManager.notifyIssue(
    context,
    issueTitle,
    issueUrl,
    author,
    action as "opened" | "closed" | "updated" | "assigned",
    description
  );

  vscode.window.showInformationMessage(
    `Simulated issue ${action} event sent to Discord!`
  );
}

async function simulateDiscussionEvent(
  context: vscode.ExtensionContext
): Promise<void> {
  const action = await vscode.window.showQuickPick(
    ["created", "answered", "updated"],
    { placeHolder: "Select discussion action to simulate" }
  );

  if (!action) {
    return;
  }

  const discussionTitle = await vscode.window.showInputBox({
    prompt: "Enter discussion title",
    placeHolder: "How to set up Discord webhooks?",
  });

  if (!discussionTitle) {
    return;
  }

  const author = await vscode.window.showInputBox({
    prompt: "Enter author name",
    placeHolder: "CommunityMember",
  });

  if (!author) {
    return;
  }

  const discussionUrl = await vscode.window.showInputBox({
    prompt: "Enter discussion URL",
    placeHolder: "https://github.com/user/repo/discussions/12",
  });

  if (!discussionUrl) {
    return;
  }

  const description = await vscode.window.showInputBox({
    prompt: "Enter description (optional)",
    placeHolder: "I am trying to configure Discord webhooks and...",
  });

  await discordManager.notifyDiscussion(
    context,
    discussionTitle,
    discussionUrl,
    author,
    action as "created" | "answered" | "updated",
    description
  );

  vscode.window.showInformationMessage(
    `Simulated discussion ${action} event sent to Discord!`
  );
}

async function simulateDeploymentEvent(
  context: vscode.ExtensionContext
): Promise<void> {
  const status = await vscode.window.showQuickPick(
    ["success", "failure", "pending", "in_progress"],
    { placeHolder: "Select deployment status to simulate" }
  );

  if (!status) {
    return;
  }

  const deploymentName = await vscode.window.showInputBox({
    prompt: "Enter deployment name",
    placeHolder: "PrismFlow v1.2.7",
  });

  if (!deploymentName) {
    return;
  }

  const environment = await vscode.window.showInputBox({
    prompt: "Enter environment",
    placeHolder: "production",
  });

  if (!environment) {
    return;
  }

  const deploymentUrl = await vscode.window.showInputBox({
    prompt: "Enter deployment URL (optional)",
    placeHolder: "https://myapp.example.com",
  });

  const description = await vscode.window.showInputBox({
    prompt: "Enter description (optional)",
    placeHolder:
      "Deployment includes new Discord webhook debugging features...",
  });

  await discordManager.notifyDeployment(
    context,
    deploymentName,
    environment,
    status as "success" | "failure" | "pending" | "in_progress",
    deploymentUrl,
    description
  );

  vscode.window.showInformationMessage(
    `Simulated deployment ${status} event sent to Discord!`
  );
}
