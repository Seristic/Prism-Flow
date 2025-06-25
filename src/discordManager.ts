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

    return true;
  } catch (error) {
    console.error("Error sending test message:", error);
    return false;
  }
}

// Send a notification about a new release
export async function notifyRelease(
  releaseName: string,
  releaseUrl: string,
  description: string
): Promise<void> {
  const releaseWebhooks = webhooks.filter((hook) =>
    hook.events.includes("releases")
  );

  for (const hook of releaseWebhooks) {
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

      webhook.send({
        username: "PrismFlow Bot",
        embeds: [embed],
      });
    } catch (error) {
      console.error(`Error notifying release to webhook ${hook.name}:`, error);
    }
  }
}

// Send a notification about a new commit/push
export async function notifyPush(
  commitMessage: string,
  author: string,
  repoUrl: string
): Promise<void> {
  const pushWebhooks = webhooks.filter((hook) =>
    hook.events.includes("pushes")
  );

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

      webhook.send({
        username: "PrismFlow Bot",
        embeds: [embed],
      });
    } catch (error) {
      console.error(`Error notifying push to webhook ${hook.name}:`, error);
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
