import * as vscode from "vscode";
import * as crypto from "crypto";
import { Clipboard } from "./clipboard"; // Import from the same directory
import { showGitHubWebhookSetupWebview } from "./webviews/githubWebhookSetupWebview";

interface GitHubWebhookConfig {
  name: string;
  url: string;
  secret: string;
  events: string[];
  created: string; // ISO date
}

export class GitHubWebhookManager {
  private static readonly STORAGE_KEY = "github-webhook-configs";

  private context: vscode.ExtensionContext;
  private clipboard: Clipboard;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.clipboard = new Clipboard();
    
    // Migrate global webhooks to workspace on initialization
    this.migrateGlobalWebhooksToWorkspace();
  }

  /**
   * Sets up a new GitHub webhook with webview configuration
   */
  public async setupWebhook(): Promise<void> {
    const repoUrl = await this.getRepositoryUrl();
    if (!repoUrl) {
      return;
    }

    // Show the webview for webhook setup
    showGitHubWebhookSetupWebview((data, panel) => {
      this.handleWebhookSubmission(data, panel, repoUrl);
    }, repoUrl);
  }

  /**
   * Handles webhook form submission from webview
   */
  private async handleWebhookSubmission(
    data: { url: string; secret: string },
    panel: vscode.WebviewPanel,
    repoUrl: string
  ): Promise<void> {
    try {
      // Validate the webhook URL
      if (!data.url || !this.isValidUrl(data.url)) {
        panel.webview.postMessage({
          command: "webhookResult",
          message: "Please enter a valid webhook URL.",
          ok: false,
        });
        return;
      }

      // Generate secret if not provided
      const secret = data.secret || this.generateSecureSecret();

      // Get webhook name
      const name = await vscode.window.showInputBox({
        prompt: "Enter a name for this webhook configuration",
        placeHolder: "e.g., 'production-webhook'",
        value: `webhook-${Date.now()}`,
      });

      if (!name) {
        panel.webview.postMessage({
          command: "webhookResult",
          message: "Webhook setup cancelled - no name provided.",
          ok: false,
        });
        return;
      }

      // Get events to listen for
      const events = await this.selectWebhookEvents();
      if (!events || events.length === 0) {
        panel.webview.postMessage({
          command: "webhookResult",
          message: "Webhook setup cancelled - no events selected.",
          ok: false,
        });
        return;
      }

      // Create and save webhook config
      const config: GitHubWebhookConfig = {
        name,
        url: data.url,
        secret,
        events,
        created: new Date().toISOString(),
      };

      await this.saveWebhookConfig(config);

      // Send success message to webview
      panel.webview.postMessage({
        command: "webhookResult",
        message: `Webhook "${name}" configured successfully!`,
        ok: true,
      });

      // Show setup instructions
      await this.showSetupInstructions(repoUrl, config);

      // Close the panel after a delay
      setTimeout(() => {
        panel.dispose();
      }, 3000);
    } catch (error: any) {
      panel.webview.postMessage({
        command: "webhookResult",
        message: `Error setting up webhook: ${error.message}`,
        ok: false,
      });
    }
  }

  /**
   * Helper method to validate URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Helper method to select webhook events
   */
  private async selectWebhookEvents(): Promise<string[] | undefined> {
    const eventOptions: vscode.QuickPickItem[] = [
      {
        label: "push",
        description: "Any Git push to the repository",
        picked: true,
      },
      {
        label: "release",
        description: "When a release is published",
        picked: true,
      },
      {
        label: "pull_request",
        description: "When pull requests are opened, closed, etc.",
      },
      { label: "issues", description: "When issues are opened, closed, etc." },
      {
        label: "discussion",
        description: "When discussions are created or edited",
      },
      { label: "star", description: "When someone stars the repository" },
      {
        label: "workflow_run",
        description: "When a workflow run is completed",
      },
    ];

    const selectedEvents = await vscode.window.showQuickPick(eventOptions, {
      canPickMany: true,
      placeHolder: "Select which events should trigger the webhook",
      title: "GitHub Webhook Events",
    });

    if (!selectedEvents || selectedEvents.length === 0) {
      return undefined;
    }

    return selectedEvents.map((item) => item.label);
  }

  /**
   * Manages existing webhook configurations
   */
  public async manageWebhooks(): Promise<void> {
    const configs = this.getWebhookConfigs();

    if (configs.length === 0) {
      const result = await vscode.window.showInformationMessage(
        "No GitHub webhook configurations found. Would you like to create one?",
        "Create New",
        "Cancel"
      );
      if (result === "Create New") {
        await this.setupWebhook();
      }
      return;
    }

    const options: vscode.QuickPickItem[] = configs.map((config) => ({
      label: config.name,
      description: `${config.events.join(", ")} | ${new Date(
        config.created
      ).toLocaleDateString()}`,
    }));

    options.push({
      label: "$(add) Create New Configuration",
      description: "Set up a new GitHub webhook configuration",
    });

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: "Select a webhook configuration to manage",
    });

    if (!selected) {
      return;
    }

    if (selected.label === "$(add) Create New Configuration") {
      await this.setupWebhook();
      return;
    }

    const config = configs.find((c) => c.name === selected.label);
    if (!config) {
      return;
    }

    const action = await vscode.window.showQuickPick(
      [
        {
          label: "$(clippy) Copy Secret",
          description: "Copy the webhook secret to clipboard",
        },
        {
          label: "$(book) Show Setup Instructions",
          description: "Display the setup instructions",
        },
        {
          label: "$(trash) Delete Configuration",
          description: "Remove this webhook configuration",
        },
      ],
      {
        placeHolder: "Choose an action",
      }
    );

    if (!action) {
      return;
    }

    switch (action.label) {
      case "$(clippy) Copy Secret":
        await this.clipboard.copy(config.secret);
        vscode.window.showInformationMessage(
          `Secret for ${config.name} copied to clipboard!`
        );
        break;
      case "$(book) Show Setup Instructions":
        const repoUrl = await this.getRepositoryUrl();
        if (repoUrl) {
          await this.showSetupInstructions(repoUrl, config);
        }
        break;
      case "$(trash) Delete Configuration":
        const confirm = await vscode.window.showWarningMessage(
          `Are you sure you want to delete the webhook configuration "${config.name}"?`,
          { modal: true },
          "Delete",
          "Cancel"
        );
        if (confirm === "Delete") {
          await this.deleteWebhookConfig(config.name);
          vscode.window.showInformationMessage(
            `Configuration "${config.name}" has been deleted.`
          );
        }
        break;
    }
  }

  /**
   * Shows setup instructions for GitHub webhooks
   */
  private async showSetupInstructions(
    repoUrl: string,
    config: GitHubWebhookConfig
  ): Promise<void> {
    try {
      // Extract owner and repo from the GitHub URL
      const matches = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!matches || matches.length < 3) {
        throw new Error("Invalid GitHub repository URL");
      }

      const [, owner, repo] = matches;
      const repoPath = `${owner}/${repo.replace(/\.git$/, "")}`;

      const webhooksUrl = `https://github.com/${repoPath}/settings/hooks/new`;

      // Create markdown content for setup instructions
      const instructions = `# GitHub Webhook Setup Instructions
## ${config.name}

Follow these steps to set up your webhook:

1. **Go to the webhooks settings page:**
   - Direct link: [${repoPath} Webhooks](${webhooksUrl})
   - Or navigate to your repository → Settings → Webhooks → Add webhook

2. **Enter the webhook details:**
   - **Payload URL:** \`${config.url}\`
   - **Content type:** \`application/json\`
   - **Secret:** \`${config.secret}\` (copied to clipboard)
   - **Events:** ${config.events.map((e) => `\`${e}\``).join(", ")}
   
3. **Select event triggers:**
   - Choose "${
     config.events.length > 3
       ? "Let me select individual events"
       : "Just the push event"
   }"
   - ${
     config.events.length > 3
       ? "Then select the specific events you chose in PrismFlow"
       : "The push event is selected by default"
   }

4. **Enable the webhook:**
   - Ensure "Active" is checked
   - Click "Add webhook" to save

Your webhook secret has been copied to your clipboard for convenience.

> **Note:** Keep your webhook secret secure. If you need to access it again, use the "Manage GitHub Webhooks" command in PrismFlow.
`;

      // Create and show the markdown content
      const doc = await vscode.workspace.openTextDocument({
        language: "markdown",
        content: instructions,
      });

      await vscode.window.showTextDocument(doc);
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error generating setup instructions: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Attempts to get the GitHub repository URL from the package.json or prompts the user
   */
  private async getRepositoryUrl(): Promise<string | undefined> {
    try {
      // Try to get the repository URL from package.json
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        const packageJsonUri = vscode.Uri.joinPath(
          workspaceFolders[0].uri,
          "package.json"
        );

        try {
          const packageJsonDoc = await vscode.workspace.openTextDocument(
            packageJsonUri
          );
          const packageJson = JSON.parse(packageJsonDoc.getText());

          if (packageJson.repository?.url) {
            return packageJson.repository.url;
          }
        } catch {
          // Ignore errors reading package.json
        }
      }
    } catch {
      // Ignore errors and prompt user instead
    }

    // Prompt the user for the repository URL
    return vscode.window.showInputBox({
      prompt: "Enter your GitHub repository URL",
      placeHolder: "https://github.com/username/repository",
      validateInput: (value) => {
        if (!value.includes("github.com")) {
          return "Please enter a valid GitHub repository URL";
        }
        return null;
      },
    });
  }

  /**
   * Generates a secure random string for use as a webhook secret
   */
  private generateSecureSecret(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Migrate global GitHub webhooks to workspace state (for backwards compatibility)
   */
  private async migrateGlobalWebhooksToWorkspace(): Promise<void> {
    // Check if workspace already has webhooks
    const workspaceWebhooks = this.context.workspaceState.get<GitHubWebhookConfig[]>(
      GitHubWebhookManager.STORAGE_KEY,
      []
    );
    if (workspaceWebhooks.length > 0) {
      return; // Already migrated or workspace has its own webhooks
    }

    // Check if there are global webhooks to migrate
    const globalWebhooks = this.context.globalState.get<GitHubWebhookConfig[]>(
      GitHubWebhookManager.STORAGE_KEY,
      []
    );
    if (globalWebhooks.length === 0) {
      return; // No global webhooks to migrate
    }

    // Ask user if they want to migrate
    const choice = await vscode.window.showInformationMessage(
      `Found ${globalWebhooks.length} GitHub webhook configuration(s) from previous versions. Would you like to use them for this workspace?`,
      "Yes, use them",
      "No, start fresh"
    );

    if (choice === "Yes, use them") {
      // Migrate global webhooks to workspace
      await this.context.workspaceState.update(
        GitHubWebhookManager.STORAGE_KEY,
        globalWebhooks
      );

      vscode.window.showInformationMessage(
        `Migrated ${globalWebhooks.length} GitHub webhook configuration(s) to this workspace. GitHub webhooks are now workspace-specific.`
      );
    }

    // Clear global webhooks after migration attempt (to avoid repeated prompts)
    await this.context.globalState.update(GitHubWebhookManager.STORAGE_KEY, []);
  }

  /**
   * Gets all saved webhook configurations
   */
  private getWebhookConfigs(): GitHubWebhookConfig[] {
    return this.context.workspaceState.get<GitHubWebhookConfig[]>(
      GitHubWebhookManager.STORAGE_KEY,
      []
    );
  }

  /**
   * Saves a new webhook configuration
   */
  private async saveWebhookConfig(config: GitHubWebhookConfig): Promise<void> {
    const configs = this.getWebhookConfigs();
    const existingIndex = configs.findIndex((c) => c.name === config.name);

    if (existingIndex >= 0) {
      configs[existingIndex] = config;
    } else {
      configs.push(config);
    }

    await this.context.workspaceState.update(
      GitHubWebhookManager.STORAGE_KEY,
      configs
    );
  }

  /**
   * Deletes a webhook configuration
   */
  private async deleteWebhookConfig(name: string): Promise<void> {
    const configs = this.getWebhookConfigs();
    const updatedConfigs = configs.filter((c) => c.name !== name);
    await this.context.workspaceState.update(
      GitHubWebhookManager.STORAGE_KEY,
      updatedConfigs
    );
  }
}
