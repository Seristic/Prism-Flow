// src/discordManager.ts
import * as vscode from "vscode";
import { WebhookClient, EmbedBuilder } from "discord.js";
import axios from "axios";

// Interface for webhook configuration
interface WebhookConfig {
  id: string;
  url: string;
  name: string;
  events: string[];
}

// Types of events that can be monitored
export const GITHUB_EVENT_TYPES = [
  "pushes",
  "releases",
  "pull_requests",
  "issues",
  "discussions",
  "deployments",
];

// Stored webhooks
let webhooks: WebhookConfig[] = [];

// Load webhooks from global state
export async function loadWebhooks(
  context: vscode.ExtensionContext
): Promise<WebhookConfig[]> {
  webhooks = context.globalState.get("discord.webhooks", []);
  return webhooks;
}

// Save webhooks to global state
export async function saveWebhooks(
  context: vscode.ExtensionContext
): Promise<void> {
  await context.globalState.update("discord.webhooks", webhooks);
}

// Add or update a webhook
export async function addWebhook(
  context: vscode.ExtensionContext,
  config: WebhookConfig
): Promise<void> {
  // Check if webhook already exists
  const index = webhooks.findIndex((hook) => hook.id === config.id);

  if (index !== -1) {
    // Update existing webhook
    webhooks[index] = config;
  } else {
    // Add new webhook
    webhooks.push(config);
  }

  await saveWebhooks(context);
}

// Remove a webhook
export async function removeWebhook(
  context: vscode.ExtensionContext,
  id: string
): Promise<void> {
  webhooks = webhooks.filter((hook) => hook.id !== id);
  await saveWebhooks(context);
}

// Verify webhook URL is valid
export async function verifyWebhook(url: string): Promise<boolean> {
  try {
    // Extract ID and token from URL
    const match = url.match(
      /discord.com\/api\/webhooks\/(\d+)\/([a-zA-Z0-9_-]+)/
    );
    if (!match) {
      return false;
    }

    // Send a test GET request to verify webhook exists
    // Note: This doesn't send any messages, just verifies the webhook exists
    const response = await axios.get(url);
    return response.status === 200;
  } catch (error) {
    console.error("Error verifying webhook:", error);
    return false;
  }
}

// Create a default embed template
function createDefaultEmbed(
  title: string,
  description: string,
  color: number
): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
}

// Send a test message to the webhook
export async function sendTestMessage(
  url: string,
  repoUrl: string | undefined
): Promise<boolean> {
  try {
    console.log(`Attempting to send test message to: ${url}`);
    const webhook = new WebhookClient({ url });

    const embed = createDefaultEmbed(
      "🔔 PrismFlow Test Notification",
      "This is a test notification from PrismFlow Discord integration.",
      0x0099ff
    );

    if (repoUrl) {
      embed.addFields({ name: "Repository", value: repoUrl });
    }

    embed.setFooter({ text: "PrismFlow Extension" });

    await webhook.send({
      username: "PrismFlow Bot",
      embeds: [embed],
    });

    console.log("Test message sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending test message:", error);
    vscode.window.showErrorMessage(
      `Failed to send test message: ${
        error instanceof Error ? error.message : error
      }`
    );
    return false;
  }
}

// Send a notification about a new release
export async function notifyRelease(
  context: vscode.ExtensionContext,
  releaseName: string,
  releaseUrl: string,
  description: string,
  singleWebhookOnly: boolean = false
): Promise<void> {
  const currentWebhooks = await loadWebhooks(context);
  const releaseWebhooks = currentWebhooks.filter((hook) =>
    hook.events.includes("releases")
  );

  if (releaseWebhooks.length === 0) {
    vscode.window.showWarningMessage(
      "No Discord webhooks configured for release events. Use 'PrismFlow: Setup Discord Webhook Integration' to configure one."
    );
    return;
  }

  // If singleWebhookOnly is true, use only the first webhook to prevent spam
  const webhooksToUse = singleWebhookOnly
    ? [releaseWebhooks[0]]
    : releaseWebhooks;

  for (const hook of webhooksToUse) {
    try {
      const webhook = new WebhookClient({ url: hook.url });

      const embed = createDefaultEmbed(
        `🚀 New Release: ${releaseName}`,
        description || "A new version has been released!",
        0x00ff00
      );

      embed.addFields(
        { name: "Release URL", value: releaseUrl },
        { name: "Release Date", value: new Date().toLocaleString() }
      );

      await webhook.send({
        username: "PrismFlow Bot",
        embeds: [embed],
      });

      console.log(`Successfully sent release notification to ${hook.name}`);
    } catch (error) {
      console.error(`Error notifying release to webhook ${hook.name}:`, error);

      // Enhanced error reporting
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;

        // Check for specific Discord API errors
        if (error.message.includes("UNKNOWN_WEBHOOK")) {
          errorMessage = `Webhook not found or invalid. Please check the webhook URL for ${hook.name}`;
        } else if (error.message.includes("MISSING_PERMISSIONS")) {
          errorMessage = `Bot lacks permissions to send messages to ${hook.name}`;
        } else if (error.message.includes("CHANNEL_NOT_FOUND")) {
          errorMessage = `Channel not found for webhook ${hook.name}`;
        } else if (error.message.includes("Received one or more errors")) {
          errorMessage = `Discord API error for ${hook.name}. Webhook URL may be invalid or expired`;
        }
      }

      vscode.window.showErrorMessage(
        `Failed to send Discord notification to ${hook.name}: ${errorMessage}`
      );
    }
  }

  if (singleWebhookOnly && releaseWebhooks.length > 1) {
    console.log(
      `Sent notification to primary webhook only (${
        releaseWebhooks[0].name
      }) to prevent spam. ${
        releaseWebhooks.length - 1
      } other webhook(s) skipped.`
    );
  }
}

// Send a notification about a new commit/push
export async function notifyPush(
  context: vscode.ExtensionContext,
  commitMessage: string,
  author: string,
  repoUrl: string
): Promise<void> {
  const currentWebhooks = await loadWebhooks(context);
  const pushWebhooks = currentWebhooks.filter((hook) =>
    hook.events.includes("pushes")
  );

  if (pushWebhooks.length === 0) {
    vscode.window.showWarningMessage(
      "No Discord webhooks configured for push events. Use 'PrismFlow: Setup Discord Webhook Integration' to configure one."
    );
    return;
  }

  for (const hook of pushWebhooks) {
    try {
      const webhook = new WebhookClient({ url: hook.url });

      const embed = createDefaultEmbed(
        "📝 New Commit Pushed",
        commitMessage,
        0x0099ff
      );

      embed.addFields(
        { name: "Author", value: author },
        { name: "Repository", value: repoUrl }
      );

      await webhook.send({
        username: "PrismFlow Bot",
        embeds: [embed],
      });

      console.log(`Successfully sent push notification to ${hook.name}`);
    } catch (error) {
      console.error(`Error notifying push to webhook ${hook.name}:`, error);
      vscode.window.showErrorMessage(
        `Failed to send Discord notification to ${hook.name}: ${error}`
      );
    }
  }
}

// Send a notification about a new pull request
export async function notifyPullRequest(
  context: vscode.ExtensionContext,
  prTitle: string,
  prUrl: string,
  author: string,
  action: "opened" | "closed" | "merged" | "updated",
  description?: string
): Promise<void> {
  const currentWebhooks = await loadWebhooks(context);
  const prWebhooks = currentWebhooks.filter((hook) =>
    hook.events.includes("pull_requests")
  );

  if (prWebhooks.length === 0) {
    vscode.window.showWarningMessage(
      "No Discord webhooks configured for pull request events. Use 'PrismFlow: Setup Discord Webhook Integration' to configure one."
    );
    return;
  }

  const actionColors = {
    opened: 0x28a745, // Green
    closed: 0xdc3545, // Red
    merged: 0x6f42c1, // Purple
    updated: 0xffc107, // Yellow
  };

  const actionEmojis = {
    opened: "🔄",
    closed: "❌",
    merged: "🎉",
    updated: "📝",
  };

  for (const hook of prWebhooks) {
    try {
      const webhook = new WebhookClient({ url: hook.url });

      const embed = createDefaultEmbed(
        `${actionEmojis[action]} Pull Request ${
          action.charAt(0).toUpperCase() + action.slice(1)
        }: ${prTitle}`,
        description || `Pull request has been ${action}`,
        actionColors[action]
      );

      embed.addFields(
        { name: "Author", value: author },
        {
          name: "Action",
          value: action.charAt(0).toUpperCase() + action.slice(1),
        },
        { name: "Pull Request URL", value: prUrl }
      );

      await webhook.send({
        username: "PrismFlow Bot",
        embeds: [embed],
      });

      console.log(
        `Successfully sent pull request notification to ${hook.name}`
      );
    } catch (error) {
      console.error(
        `Error notifying pull request to webhook ${hook.name}:`,
        error
      );

      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;

        if (error.message.includes("UNKNOWN_WEBHOOK")) {
          errorMessage = `Webhook not found or invalid. Please check the webhook URL for ${hook.name}`;
        } else if (error.message.includes("MISSING_PERMISSIONS")) {
          errorMessage = `Bot lacks permissions to send messages to ${hook.name}`;
        } else if (error.message.includes("CHANNEL_NOT_FOUND")) {
          errorMessage = `Channel not found for webhook ${hook.name}`;
        } else if (error.message.includes("Received one or more errors")) {
          errorMessage = `Discord API error for ${hook.name}. Webhook URL may be invalid or expired`;
        }
      }

      vscode.window.showErrorMessage(
        `Failed to send Discord notification to ${hook.name}: ${errorMessage}`
      );
    }
  }
}

// Send a notification about a new issue
export async function notifyIssue(
  context: vscode.ExtensionContext,
  issueTitle: string,
  issueUrl: string,
  author: string,
  action: "opened" | "closed" | "updated" | "assigned",
  description?: string
): Promise<void> {
  const currentWebhooks = await loadWebhooks(context);
  const issueWebhooks = currentWebhooks.filter((hook) =>
    hook.events.includes("issues")
  );

  if (issueWebhooks.length === 0) {
    vscode.window.showWarningMessage(
      "No Discord webhooks configured for issue events. Use 'PrismFlow: Setup Discord Webhook Integration' to configure one."
    );
    return;
  }

  const actionColors = {
    opened: 0xff6b6b, // Light Red
    closed: 0x51cf66, // Light Green
    updated: 0x74c0fc, // Light Blue
    assigned: 0xffd43b, // Yellow
  };

  const actionEmojis = {
    opened: "🐛",
    closed: "✅",
    updated: "📝",
    assigned: "👤",
  };

  for (const hook of issueWebhooks) {
    try {
      const webhook = new WebhookClient({ url: hook.url });

      const embed = createDefaultEmbed(
        `${actionEmojis[action]} Issue ${
          action.charAt(0).toUpperCase() + action.slice(1)
        }: ${issueTitle}`,
        description || `Issue has been ${action}`,
        actionColors[action]
      );

      embed.addFields(
        { name: "Author", value: author },
        {
          name: "Action",
          value: action.charAt(0).toUpperCase() + action.slice(1),
        },
        { name: "Issue URL", value: issueUrl }
      );

      await webhook.send({
        username: "PrismFlow Bot",
        embeds: [embed],
      });

      console.log(`Successfully sent issue notification to ${hook.name}`);
    } catch (error) {
      console.error(`Error notifying issue to webhook ${hook.name}:`, error);

      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;

        if (error.message.includes("UNKNOWN_WEBHOOK")) {
          errorMessage = `Webhook not found or invalid. Please check the webhook URL for ${hook.name}`;
        } else if (error.message.includes("MISSING_PERMISSIONS")) {
          errorMessage = `Bot lacks permissions to send messages to ${hook.name}`;
        } else if (error.message.includes("CHANNEL_NOT_FOUND")) {
          errorMessage = `Channel not found for webhook ${hook.name}`;
        } else if (error.message.includes("Received one or more errors")) {
          errorMessage = `Discord API error for ${hook.name}. Webhook URL may be invalid or expired`;
        }
      }

      vscode.window.showErrorMessage(
        `Failed to send Discord notification to ${hook.name}: ${errorMessage}`
      );
    }
  }
}

// Send a notification about a new discussion
export async function notifyDiscussion(
  context: vscode.ExtensionContext,
  discussionTitle: string,
  discussionUrl: string,
  author: string,
  action: "created" | "answered" | "updated",
  description?: string
): Promise<void> {
  const currentWebhooks = await loadWebhooks(context);
  const discussionWebhooks = currentWebhooks.filter((hook) =>
    hook.events.includes("discussions")
  );

  if (discussionWebhooks.length === 0) {
    vscode.window.showWarningMessage(
      "No Discord webhooks configured for discussion events. Use 'PrismFlow: Setup Discord Webhook Integration' to configure one."
    );
    return;
  }

  const actionColors = {
    created: 0x845ef7, // Purple
    answered: 0x51cf66, // Green
    updated: 0x339af0, // Blue
  };

  const actionEmojis = {
    created: "💬",
    answered: "✅",
    updated: "📝",
  };

  for (const hook of discussionWebhooks) {
    try {
      const webhook = new WebhookClient({ url: hook.url });

      const embed = createDefaultEmbed(
        `${actionEmojis[action]} Discussion ${
          action.charAt(0).toUpperCase() + action.slice(1)
        }: ${discussionTitle}`,
        description || `Discussion has been ${action}`,
        actionColors[action]
      );

      embed.addFields(
        { name: "Author", value: author },
        {
          name: "Action",
          value: action.charAt(0).toUpperCase() + action.slice(1),
        },
        { name: "Discussion URL", value: discussionUrl }
      );

      await webhook.send({
        username: "PrismFlow Bot",
        embeds: [embed],
      });

      console.log(`Successfully sent discussion notification to ${hook.name}`);
    } catch (error) {
      console.error(
        `Error notifying discussion to webhook ${hook.name}:`,
        error
      );

      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;

        if (error.message.includes("UNKNOWN_WEBHOOK")) {
          errorMessage = `Webhook not found or invalid. Please check the webhook URL for ${hook.name}`;
        } else if (error.message.includes("MISSING_PERMISSIONS")) {
          errorMessage = `Bot lacks permissions to send messages to ${hook.name}`;
        } else if (error.message.includes("CHANNEL_NOT_FOUND")) {
          errorMessage = `Channel not found for webhook ${hook.name}`;
        } else if (error.message.includes("Received one or more errors")) {
          errorMessage = `Discord API error for ${hook.name}. Webhook URL may be invalid or expired`;
        }
      }

      vscode.window.showErrorMessage(
        `Failed to send Discord notification to ${hook.name}: ${errorMessage}`
      );
    }
  }
}

// Send a notification about a deployment
export async function notifyDeployment(
  context: vscode.ExtensionContext,
  deploymentName: string,
  environment: string,
  status: "success" | "failure" | "pending" | "in_progress",
  deploymentUrl?: string,
  description?: string
): Promise<void> {
  const currentWebhooks = await loadWebhooks(context);
  const deploymentWebhooks = currentWebhooks.filter((hook) =>
    hook.events.includes("deployments")
  );

  if (deploymentWebhooks.length === 0) {
    vscode.window.showWarningMessage(
      "No Discord webhooks configured for deployment events. Use 'PrismFlow: Setup Discord Webhook Integration' to configure one."
    );
    return;
  }

  const statusColors = {
    success: 0x28a745, // Green
    failure: 0xdc3545, // Red
    pending: 0xffc107, // Yellow
    in_progress: 0x17a2b8, // Blue
  };

  const statusEmojis = {
    success: "✅",
    failure: "❌",
    pending: "⏳",
    in_progress: "🔄",
  };

  for (const hook of deploymentWebhooks) {
    try {
      const webhook = new WebhookClient({ url: hook.url });

      const embed = createDefaultEmbed(
        `${statusEmojis[status]} Deployment ${
          status.charAt(0).toUpperCase() + status.slice(1)
        }: ${deploymentName}`,
        description || `Deployment to ${environment} is ${status}`,
        statusColors[status]
      );

      embed.addFields(
        { name: "Environment", value: environment },
        {
          name: "Status",
          value: status.charAt(0).toUpperCase() + status.slice(1),
        },
        { name: "Deployment Time", value: new Date().toLocaleString() }
      );

      if (deploymentUrl) {
        embed.addFields({ name: "Deployment URL", value: deploymentUrl });
      }

      await webhook.send({
        username: "PrismFlow Bot",
        embeds: [embed],
      });

      console.log(`Successfully sent deployment notification to ${hook.name}`);
    } catch (error) {
      console.error(
        `Error notifying deployment to webhook ${hook.name}:`,
        error
      );

      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;

        if (error.message.includes("UNKNOWN_WEBHOOK")) {
          errorMessage = `Webhook not found or invalid. Please check the webhook URL for ${hook.name}`;
        } else if (error.message.includes("MISSING_PERMISSIONS")) {
          errorMessage = `Bot lacks permissions to send messages to ${hook.name}`;
        } else if (error.message.includes("CHANNEL_NOT_FOUND")) {
          errorMessage = `Channel not found for webhook ${hook.name}`;
        } else if (error.message.includes("Received one or more errors")) {
          errorMessage = `Discord API error for ${hook.name}. Webhook URL may be invalid or expired`;
        }
      }

      vscode.window.showErrorMessage(
        `Failed to send Discord notification to ${hook.name}: ${errorMessage}`
      );
    }
  }
}

// Run the webhook setup wizard
export async function runWebhookSetupWizard(
  context: vscode.ExtensionContext
): Promise<void> {
  // Get the webhook URL
  const webhookUrl = await vscode.window.showInputBox({
    prompt: "Enter your Discord webhook URL",
    ignoreFocusOut: true,
    placeHolder: "https://discord.com/api/webhooks/...",
  });

  if (!webhookUrl) {
    return; // User cancelled
  }

  // Verify the webhook is valid
  const isValid = await verifyWebhook(webhookUrl);
  if (!isValid) {
    vscode.window.showErrorMessage(
      "Invalid Discord webhook URL. Please check and try again."
    );
    return;
  }

  // Get a friendly name for the webhook
  const webhookName =
    (await vscode.window.showInputBox({
      prompt: "Enter a friendly name for this webhook",
      ignoreFocusOut: true,
      placeHolder: "e.g., Development Channel",
    })) || "Unnamed Webhook";

  // Let the user pick which events to monitor
  const eventItems = await vscode.window.showQuickPick(
    GITHUB_EVENT_TYPES.map((type) => ({ label: type })),
    {
      canPickMany: true,
      ignoreFocusOut: true,
      placeHolder: "Select which GitHub events to monitor",
    }
  );

  if (!eventItems || eventItems.length === 0) {
    vscode.window.showWarningMessage(
      "No event types selected. Webhook will not receive any notifications."
    );
    return;
  }

  // Extract the event names from the selected items
  const selectedEvents = eventItems.map((item) => item.label);

  // Create and save the webhook config
  const webhookId = `webhook_${Date.now()}`;
  await addWebhook(context, {
    id: webhookId,
    url: webhookUrl,
    name: webhookName,
    events: selectedEvents,
  });

  // Ask if user wants to send a test message
  const sendTest = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Would you like to send a test message to verify the webhook?",
  });

  if (sendTest === "Yes") {
    // Get repo URL if git is available
    const repoUrl = await getRepositoryUrl();
    const success = await sendTestMessage(webhookUrl, repoUrl);

    if (success) {
      vscode.window.showInformationMessage(
        "Test message sent successfully! Check your Discord channel."
      );
    } else {
      vscode.window.showErrorMessage(
        "Failed to send test message. Please verify the webhook URL and try again."
      );
    }
  }

  vscode.window.showInformationMessage(
    `Discord webhook "${webhookName}" has been configured successfully.`
  );
}

// Get the repository URL from git
async function getRepositoryUrl(): Promise<string | undefined> {
  try {
    // Use VS Code's git API if available in the future
    return undefined;
  } catch (error) {
    return undefined;
  }
}

// Register the webhook manager commands
export function registerWebhookCommands(
  context: vscode.ExtensionContext
): void {
  // Register the setup wizard command
  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.setupDiscordWebhook", () => {
      runWebhookSetupWizard(context);
    })
  );

  // Register manage webhooks command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prismflow.manageDiscordWebhooks",
      async () => {
        const hooks = await loadWebhooks(context);

        if (hooks.length === 0) {
          const choice = await vscode.window.showQuickPick(
            ["Set up a new webhook", "Cancel"],
            {
              placeHolder:
                "No webhooks configured. Would you like to set one up?",
            }
          );

          if (choice === "Set up a new webhook") {
            runWebhookSetupWizard(context);
          }
          return;
        }

        const options = hooks.map((hook) => ({
          label: hook.name,
          description: `${hook.events.join(", ")}`,
          hook: hook,
        }));

        options.push({
          label: "+ Add new webhook",
          description: "",
          hook: null as any,
        });

        const selected = await vscode.window.showQuickPick(options, {
          placeHolder: "Select a webhook to manage or add a new one",
        });

        if (!selected) {
          return; // User cancelled
        }

        if (selected.hook === null) {
          // Add new webhook
          runWebhookSetupWizard(context);
          return;
        }

        // Manage existing webhook
        const action = await vscode.window.showQuickPick(
          ["Edit events", "Test webhook", "Delete webhook"],
          {
            placeHolder: `Manage webhook: ${selected.hook.name}`,
          }
        );

        if (!action) {
          return; // User cancelled
        }

        switch (action) {
          case "Edit events":
            // Create QuickPickItems for each event type
            const eventItems = GITHUB_EVENT_TYPES.map((type) => ({
              label: type,
              picked: selected.hook.events.includes(type),
            }));

            const newEventItems = await vscode.window.showQuickPick(
              eventItems,
              {
                canPickMany: true,
                ignoreFocusOut: true,
                placeHolder: "Select which GitHub events to monitor",
              }
            );

            if (newEventItems && newEventItems.length > 0) {
              // Extract labels from the selected items
              const newEvents = newEventItems.map((item) => item.label);
              selected.hook.events = newEvents;
              await saveWebhooks(context);
              vscode.window.showInformationMessage(
                `Webhook "${selected.hook.name}" updated successfully.`
              );
            }
            break;

          case "Test webhook":
            // Get repo URL if git is available
            const repoUrl = await getRepositoryUrl();
            const success = await sendTestMessage(selected.hook.url, repoUrl);

            if (success) {
              vscode.window.showInformationMessage(
                "Test message sent successfully! Check your Discord channel."
              );
            } else {
              vscode.window.showErrorMessage(
                "Failed to send test message. Please verify the webhook URL and try again."
              );
            }
            break;

          case "Delete webhook":
            const confirm = await vscode.window.showQuickPick(
              ["Yes, delete it", "No, keep it"],
              {
                placeHolder: `Are you sure you want to delete webhook "${selected.hook.name}"?`,
              }
            );

            if (confirm === "Yes, delete it") {
              await removeWebhook(context, selected.hook.id);
              vscode.window.showInformationMessage(
                `Webhook "${selected.hook.name}" has been deleted.`
              );
            }
            break;
        }
      }
    )
  );
}

// Get the latest GitHub release and send Discord notification
export async function sendLatestReleaseWebhook(
  context: vscode.ExtensionContext
): Promise<void> {
  try {
    // Check if we have any release webhooks configured
    const currentWebhooks = await loadWebhooks(context);
    const releaseWebhooks = currentWebhooks.filter((hook) =>
      hook.events.includes("releases")
    );

    if (releaseWebhooks.length === 0) {
      vscode.window.showWarningMessage(
        "No Discord webhooks configured for release events. Use 'PrismFlow: Setup Discord Webhook Integration' to configure one."
      );
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

    // Try to get the latest release using GitHub CLI
    let releaseName = "";
    let releaseUrl = "";
    let releaseDescription = "";

    try {
      // Use GitHub CLI to get latest release
      const output = await execCommand("gh release view --json name,url,body");
      const releaseData = JSON.parse(output);
      releaseName = releaseData.name || "Latest Release";
      releaseUrl = releaseData.url || "";
      releaseDescription = releaseData.body || "Check out the latest release!";
    } catch (cliError) {
      // Fallback: try to get from git tags
      try {
        const latestTag = await execCommand("git describe --tags --abbrev=0");
        releaseName = latestTag || "Latest Version";

        // Try to construct GitHub URL from git remote
        const remoteUrl = await execCommand("git remote get-url origin");
        const repoMatch = remoteUrl.match(
          /github\.com[\/:](.+?)\/(.+?)(?:\.git)?$/
        );

        if (repoMatch) {
          const [, owner, repo] = repoMatch;
          releaseUrl = `https://github.com/${owner}/${repo}/releases/tag/${latestTag}`;
        } else {
          releaseUrl = "https://github.com/releases";
        }

        releaseDescription = "Latest version available - check out what's new!";
      } catch (gitError) {
        // Manual input as last resort
        releaseName =
          (await vscode.window.showInputBox({
            prompt: "Enter release name/version",
            placeHolder: "e.g., v1.2.5",
            ignoreFocusOut: true,
          })) || "Manual Release";

        releaseUrl =
          (await vscode.window.showInputBox({
            prompt: "Enter release URL",
            placeHolder: "https://github.com/user/repo/releases/tag/v1.2.5",
            ignoreFocusOut: true,
          })) || "https://github.com/releases";

        releaseDescription =
          (await vscode.window.showInputBox({
            prompt: "Enter release description",
            placeHolder: "What's new in this release?",
            ignoreFocusOut: true,
          })) || "New release available!";
      }
    }

    if (!releaseName) {
      vscode.window.showErrorMessage(
        "Could not determine release information."
      );
      return;
    }

    // Send the notification
    await notifyRelease(
      context,
      releaseName,
      releaseUrl,
      releaseDescription,
      true // Use single webhook to prevent spam
    );

    vscode.window.showInformationMessage(
      `Discord notification sent for release: ${releaseName}`
    );
  } catch (error) {
    console.error("Error sending latest release webhook:", error);
    vscode.window.showErrorMessage(
      `Failed to send Discord notification: ${
        error instanceof Error ? error.message : error
      }`
    );
  }
}

// Helper function to execute commands
async function execCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      reject(new Error("No workspace folder"));
      return;
    }

    const cp = require("child_process");
    cp.exec(
      command,
      { cwd: workspaceFolder.uri.fsPath },
      (error: any, stdout: string, stderr: string) => {
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

// Test Discord webhook connectivity
export async function testWebhook(
  context: vscode.ExtensionContext,
  webhookId?: string
): Promise<void> {
  const currentWebhooks = await loadWebhooks(context);

  if (currentWebhooks.length === 0) {
    vscode.window.showWarningMessage(
      "No Discord webhooks configured. Use 'PrismFlow: Setup Discord Webhook Integration' to configure one."
    );
    return;
  }

  // If specific webhook ID provided, test that one, otherwise test all release webhooks
  const webhooksToTest = webhookId
    ? currentWebhooks.filter((hook) => hook.id === webhookId)
    : currentWebhooks.filter((hook) => hook.events.includes("releases"));

  if (webhooksToTest.length === 0) {
    vscode.window.showWarningMessage("No release webhooks found to test.");
    return;
  }

  for (const hook of webhooksToTest) {
    try {
      const webhook = new WebhookClient({ url: hook.url });

      const embed = createDefaultEmbed(
        "🧪 Webhook Test",
        "This is a test notification from PrismFlow to verify Discord webhook connectivity.",
        0x0099ff
      );

      embed.addFields(
        { name: "Test Time", value: new Date().toLocaleString() },
        { name: "Webhook Name", value: hook.name },
        { name: "Status", value: "✅ Connection Successful" }
      );

      await webhook.send({
        username: "PrismFlow Bot",
        embeds: [embed],
      });

      vscode.window.showInformationMessage(
        `✅ Test successful for webhook: ${hook.name}`
      );
    } catch (error) {
      console.error(`Error testing webhook ${hook.name}:`, error);

      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;

        // Check for specific Discord API errors
        if (error.message.includes("UNKNOWN_WEBHOOK")) {
          errorMessage = `Webhook not found or invalid. The webhook URL may be expired or deleted.`;
        } else if (error.message.includes("MISSING_PERMISSIONS")) {
          errorMessage = `Bot lacks permissions to send messages.`;
        } else if (error.message.includes("CHANNEL_NOT_FOUND")) {
          errorMessage = `Channel not found. The channel may have been deleted.`;
        } else if (error.message.includes("Received one or more errors")) {
          errorMessage = `Discord API error. Webhook URL may be invalid, expired, or malformed.`;
        }
      }

      vscode.window.showErrorMessage(
        `❌ Test failed for webhook ${hook.name}: ${errorMessage}`
      );
    }
  }
}

// Validate Discord webhook URL format
export function validateWebhookUrl(url: string): {
  valid: boolean;
  error?: string;
} {
  try {
    // Check if URL is valid
    const urlObj = new URL(url);

    // Check if it's a Discord webhook URL
    if (
      !urlObj.hostname.includes("discord.com") &&
      !urlObj.hostname.includes("discordapp.com")
    ) {
      return { valid: false, error: "URL must be a Discord webhook URL" };
    }

    // Check URL format
    const webhookPattern = /\/api\/webhooks\/(\d+)\/([a-zA-Z0-9_-]+)/;
    if (!webhookPattern.test(urlObj.pathname)) {
      return { valid: false, error: "Invalid Discord webhook URL format" };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "Invalid URL format" };
  }
}
