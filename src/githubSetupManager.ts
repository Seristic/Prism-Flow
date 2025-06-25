// src/githubSetupManager.ts
import * as vscode from "vscode";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

// Interface for GitHub webhook configuration
interface GitHubWebhookConfig {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  repositoryUrl: string;
}

// GitHub webhook configurations storage
let githubWebhooks: GitHubWebhookConfig[] = [];

// GitHub events that can be monitored via webhooks
export const GITHUB_WEBHOOK_EVENTS = [
  "push",
  "release",
  "pull_request",
  "issues",
  "discussion",
  "deployment",
  "star",
  "fork",
  "workflow_run",
];

/**
 * Generate a secure random secret for GitHub webhook
 */
export function generateWebhookSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Load GitHub webhook configurations from storage
 */
export async function loadGitHubWebhooks(
  context: vscode.ExtensionContext
): Promise<GitHubWebhookConfig[]> {
  githubWebhooks = context.globalState.get("github.webhooks", []);
  return githubWebhooks;
}

/**
 * Save GitHub webhook configurations to storage
 */
export async function saveGitHubWebhooks(
  context: vscode.ExtensionContext
): Promise<void> {
  await context.globalState.update("github.webhooks", githubWebhooks);
}

/**
 * Add or update a GitHub webhook configuration
 */
export async function addGitHubWebhook(
  context: vscode.ExtensionContext,
  config: GitHubWebhookConfig
): Promise<void> {
  const index = githubWebhooks.findIndex((hook) => hook.id === config.id);

  if (index !== -1) {
    githubWebhooks[index] = config;
  } else {
    githubWebhooks.push(config);
  }

  await saveGitHubWebhooks(context);
}

/**
 * Remove a GitHub webhook configuration
 */
export async function removeGitHubWebhook(
  context: vscode.ExtensionContext,
  id: string
): Promise<void> {
  githubWebhooks = githubWebhooks.filter((hook) => hook.id !== id);
  await saveGitHubWebhooks(context);
}

/**
 * Get repository URL from git config or user input
 */
async function getRepositoryUrl(): Promise<string | undefined> {
  // Try to get from package.json first
  try {
    if (
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
    ) {
      const packageJsonPath = path.join(
        vscode.workspace.workspaceFolders[0].uri.fsPath,
        "package.json"
      );
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8")
        );
        if (packageJson.repository && packageJson.repository.url) {
          // Clean up the URL (remove git+, .git, etc.)
          let repoUrl = packageJson.repository.url
            .replace(/^git\+/, "")
            .replace(/\.git$/, "");

          // Convert SSH URL to HTTPS URL if needed
          if (repoUrl.startsWith("git@github.com:")) {
            repoUrl = `https://github.com/${repoUrl.substring(15)}`;
          }

          return repoUrl;
        }
      }
    }
  } catch (error) {
    console.error("Error getting repository URL from package.json:", error);
  }

  // Ask the user
  return vscode.window.showInputBox({
    prompt: "Enter your GitHub repository URL",
    placeHolder: "https://github.com/username/repository",
    ignoreFocusOut: true,
  });
}

/**
 * Extract owner and repo name from GitHub URL
 */
export function extractOwnerAndRepo(
  repositoryUrl: string
): { owner: string; repo: string } | null {
  try {
    // Handle different URL formats
    const httpsMatch = repositoryUrl.match(
      /https:\/\/github\.com\/([^\/]+)\/([^\/\.]+)/
    );
    const sshMatch = repositoryUrl.match(
      /git@github\.com:([^\/]+)\/([^\/\.]+)/
    );

    if (httpsMatch && httpsMatch.length === 3) {
      return { owner: httpsMatch[1], repo: httpsMatch[2] };
    } else if (sshMatch && sshMatch.length === 3) {
      return { owner: sshMatch[1], repo: sshMatch[2] };
    }

    return null;
  } catch (error) {
    console.error("Error extracting owner and repo:", error);
    return null;
  }
}

/**
 * Create a setup guide for GitHub webhook
 */
export async function createSetupInstructions(
  webhookUrl: string,
  secret: string,
  repositoryUrl: string,
  selectedEvents: string[]
): Promise<string> {
  const repoInfo = extractOwnerAndRepo(repositoryUrl);

  if (!repoInfo) {
    return "Could not extract repository information. Please check the repository URL format.";
  }

  const { owner, repo } = repoInfo;

  return `# GitHub Webhook Setup Instructions

## 1. Navigate to Repository Settings

Go to: [https://github.com/${owner}/${repo}/settings/hooks](https://github.com/${owner}/${repo}/settings/hooks)

## 2. Add Webhook

- Click on "Add webhook"
- Enter the following information:
  - Payload URL: \`${webhookUrl}\`
  - Content type: \`application/json\`
  - Secret: \`${secret}\` (Copy this value securely)
  - SSL verification: Enabled
  - Events: ${
    selectedEvents.length === 1 && selectedEvents[0] === "push"
      ? "Just the push event"
      : selectedEvents.includes("push")
      ? "Let me select individual events"
      : "Send me everything"
  }
  ${
    selectedEvents.length > 1 ||
    (selectedEvents.length === 1 && selectedEvents[0] !== "push")
      ? `\n### Selected Events:\n${selectedEvents
          .map((event) => `- ${event}`)
          .join("\n")}`
      : ""
  }
- Click "Add webhook"

## 3. Verify

- After adding the webhook, GitHub will send a test ping
- Check the webhook's recent deliveries to confirm it's working
- If you see a green checkmark, the setup is successful!

## 4. Testing

- Make a small commit and push it to your repository
- Check your Discord channel for the notification

Remember to keep your webhook secret secure. It's used to validate that requests come from GitHub.`;
}

/**
 * Run the GitHub webhook setup wizard
 */
export async function runGitHubWebhookSetupWizard(
  context: vscode.ExtensionContext
): Promise<void> {
  // Ask for the Discord webhook URL first
  const webhookUrl = await vscode.window.showInputBox({
    prompt: "Enter your Discord webhook URL",
    placeHolder: "https://discord.com/api/webhooks/...",
    ignoreFocusOut: true,
  });

  if (!webhookUrl) {
    return; // User cancelled
  }

  // Get a name for this webhook
  const webhookName =
    (await vscode.window.showInputBox({
      prompt: "Enter a name for this webhook configuration",
      placeHolder: "e.g., My Project CI/CD",
      ignoreFocusOut: true,
      value: "GitHub to Discord",
    })) || "GitHub to Discord";

  // Generate a secret
  const secret = generateWebhookSecret();

  // Get repository URL
  const repositoryUrl = await getRepositoryUrl();
  if (!repositoryUrl) {
    vscode.window.showErrorMessage(
      "Repository URL is required to setup GitHub webhooks."
    );
    return;
  }

  // Select which events to monitor
  let eventItems = await vscode.window.showQuickPick(
    GITHUB_WEBHOOK_EVENTS.map((event) => ({ label: event })),
    {
      canPickMany: true,
      ignoreFocusOut: true,
      placeHolder: "Select which GitHub events to monitor",
    }
  );

  if (!eventItems || eventItems.length === 0) {
    vscode.window.showWarningMessage(
      "No events selected. Defaulting to push events only."
    );
    eventItems = [{ label: "push" }];
  }

  // Extract event names
  const selectedEvents = eventItems.map((item) => item.label);

  // Create and save the webhook config
  const webhookId = `github_webhook_${Date.now()}`;
  await addGitHubWebhook(context, {
    id: webhookId,
    name: webhookName,
    url: webhookUrl,
    secret,
    events: selectedEvents,
    repositoryUrl,
  });

  // Create setup instructions
  const instructions = await createSetupInstructions(
    webhookUrl,
    secret,
    repositoryUrl,
    selectedEvents
  );

  // Show the instructions in a new editor
  const doc = await vscode.workspace.openTextDocument({
    content: instructions,
    language: "markdown",
  });

  await vscode.window.showTextDocument(doc);

  // Copy secret to clipboard for convenience
  await vscode.env.clipboard.writeText(secret);

  vscode.window.showInformationMessage(
    `GitHub webhook secret has been copied to clipboard. Follow the instructions to complete the setup.`
  );
}

/**
 * Manage existing GitHub webhook configurations
 */
export async function manageGitHubWebhooks(
  context: vscode.ExtensionContext
): Promise<void> {
  const hooks = await loadGitHubWebhooks(context);

  if (hooks.length === 0) {
    const choice = await vscode.window.showQuickPick(
      ["Set up a new GitHub webhook", "Cancel"],
      {
        placeHolder:
          "No GitHub webhooks configured. Would you like to set one up?",
      }
    );

    if (choice === "Set up a new GitHub webhook") {
      await runGitHubWebhookSetupWizard(context);
    }
    return;
  }

  const options = hooks.map((hook) => ({
    label: hook.name,
    description: `${hook.repositoryUrl} (${hook.events.join(", ")})`,
    hook,
  }));

  options.push({
    label: "+ Add new GitHub webhook",
    description: "",
    hook: null as any,
  });

  const selected = await vscode.window.showQuickPick(options, {
    placeHolder: "Select a GitHub webhook to manage or add a new one",
  });

  if (!selected) {
    return; // User cancelled
  }

  if (selected.hook === null) {
    // Add new webhook
    runGitHubWebhookSetupWizard(context);
    return;
  }

  // Manage existing webhook
  const action = await vscode.window.showQuickPick(
    [
      "Show setup instructions",
      "Copy webhook secret",
      "Edit events",
      "Delete configuration",
    ],
    { placeHolder: `Manage webhook: ${selected.hook.name}` }
  );

  if (!action) {
    return; // User cancelled
  }

  switch (action) {
    case "Show setup instructions":
      const instructions = await createSetupInstructions(
        selected.hook.url,
        selected.hook.secret,
        selected.hook.repositoryUrl,
        selected.hook.events
      );

      const doc = await vscode.workspace.openTextDocument({
        content: instructions,
        language: "markdown",
      });

      await vscode.window.showTextDocument(doc);
      break;

    case "Copy webhook secret":
      await vscode.env.clipboard.writeText(selected.hook.secret);
      vscode.window.showInformationMessage(
        "Webhook secret copied to clipboard."
      );
      break;

    case "Edit events":
      // Create items with checked state based on current events
      const eventItems = await vscode.window.showQuickPick(
        GITHUB_WEBHOOK_EVENTS.map((event) => ({
          label: event,
          picked: selected.hook.events.includes(event),
        })),
        {
          canPickMany: true,
          ignoreFocusOut: true,
          placeHolder: "Select which GitHub events to monitor",
        }
      );

      if (eventItems && eventItems.length > 0) {
        // Update events list
        selected.hook.events = eventItems.map((item) => item.label);
        await saveGitHubWebhooks(context);

        // Create updated instructions
        const updatedInstructions = await createSetupInstructions(
          selected.hook.url,
          selected.hook.secret,
          selected.hook.repositoryUrl,
          selected.hook.events
        );

        const doc = await vscode.workspace.openTextDocument({
          content: updatedInstructions,
          language: "markdown",
        });

        await vscode.window.showTextDocument(doc);

        vscode.window.showInformationMessage(
          `Events updated for webhook "${selected.hook.name}". Please update your GitHub webhook configuration.`
        );
      }
      break;

    case "Delete configuration":
      const confirm = await vscode.window.showQuickPick(
        ["Yes, delete it", "No, keep it"],
        {
          placeHolder: `Are you sure you want to delete "${selected.hook.name}" configuration?`,
        }
      );

      if (confirm === "Yes, delete it") {
        await removeGitHubWebhook(context, selected.hook.id);
        vscode.window.showInformationMessage(
          `Webhook configuration "${selected.hook.name}" has been deleted.`
        );

        vscode.window
          .showInformationMessage(
            `Remember to also delete the webhook from your GitHub repository settings.`,
            "Open GitHub Settings"
          )
          .then((selection) => {
            if (selection === "Open GitHub Settings") {
              const repoInfo = extractOwnerAndRepo(selected.hook.repositoryUrl);
              if (repoInfo) {
                vscode.env.openExternal(
                  vscode.Uri.parse(
                    `https://github.com/${repoInfo.owner}/${repoInfo.repo}/settings/hooks`
                  )
                );
              }
            }
          });
      }
      break;
  }
}

/**
 * Register GitHub webhook setup commands
 */
export function registerGitHubWebhookCommands(
  context: vscode.ExtensionContext
): void {
  // Initialize
  loadGitHubWebhooks(context);

  // Register setup wizard command
  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.setupGitHubWebhook", () => {
      runGitHubWebhookSetupWizard(context);
    })
  );

  // Register manage webhooks command
  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.manageGitHubWebhooks", () => {
      manageGitHubWebhooks(context);
    })
  );
}
