// src/gitWatcher.ts
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as discordManager from "./discordManager";

interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export class GitWatcher {
  private context: vscode.ExtensionContext;
  private gitWatcher: vscode.FileSystemWatcher | undefined;
  private refsWatcher: vscode.FileSystemWatcher | undefined;
  private lastKnownCommit: string | undefined;
  private workspaceFolder: vscode.WorkspaceFolder | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  }

  public async startWatching(): Promise<void> {
    if (!this.workspaceFolder) {
      console.log("GitWatcher: No workspace folder found");
      return;
    }

    const gitDir = path.join(this.workspaceFolder.uri.fsPath, ".git");

    // Check if this is a Git repository
    if (!fs.existsSync(gitDir)) {
      console.log("GitWatcher: Not a Git repository");
      return;
    }

    // Get initial commit hash
    this.lastKnownCommit = await this.getCurrentCommitHash();
    console.log(
      `GitWatcher: Started watching. Current commit: ${this.lastKnownCommit}`
    );

    // Watch for changes to Git refs (this detects pushes, pulls, etc.)
    const refsPattern = path.join(gitDir, "refs", "**");
    this.refsWatcher = vscode.workspace.createFileSystemWatcher(refsPattern);

    this.refsWatcher.onDidChange(async () => {
      await this.checkForNewCommits();
    });

    // Watch for changes to HEAD (this detects checkouts, merges, etc.)
    const headPattern = path.join(gitDir, "HEAD");
    this.gitWatcher = vscode.workspace.createFileSystemWatcher(headPattern);

    this.gitWatcher.onDidChange(async () => {
      await this.checkForNewCommits();
    });

    // Register disposables
    this.context.subscriptions.push(this.refsWatcher, this.gitWatcher);

    // Check for commits every 30 seconds as a fallback
    const interval = setInterval(async () => {
      await this.checkForNewCommits();
    }, 30000);

    this.context.subscriptions.push({
      dispose: () => clearInterval(interval),
    });
  }

  private async checkForNewCommits(): Promise<void> {
    try {
      const currentCommit = await this.getCurrentCommitHash();

      if (currentCommit && currentCommit !== this.lastKnownCommit) {
        console.log(`GitWatcher: New commit detected: ${currentCommit}`);

        // Get commit details
        const commitInfo = await this.getCommitInfo(currentCommit);
        if (commitInfo) {
          await this.handleNewCommit(commitInfo);
        }

        this.lastKnownCommit = currentCommit;
      }
    } catch (error) {
      console.error("GitWatcher: Error checking for commits:", error);
    }
  }

  private async getCurrentCommitHash(): Promise<string | undefined> {
    try {
      if (!this.workspaceFolder) {
        return undefined;
      }

      const result = await this.execGitCommand("rev-parse HEAD");
      return result.trim();
    } catch (error) {
      console.error("GitWatcher: Error getting current commit hash:", error);
      return undefined;
    }
  }

  private async getCommitInfo(
    commitHash: string
  ): Promise<GitCommit | undefined> {
    try {
      const message = await this.execGitCommand(
        `log -1 --pretty=format:"%s" ${commitHash}`
      );
      const author = await this.execGitCommand(
        `log -1 --pretty=format:"%an" ${commitHash}`
      );
      const date = await this.execGitCommand(
        `log -1 --pretty=format:"%ad" --date=iso ${commitHash}`
      );

      return {
        hash: commitHash,
        message: message.replace(/"/g, ""),
        author: author.replace(/"/g, ""),
        date: date,
      };
    } catch (error) {
      console.error("GitWatcher: Error getting commit info:", error);
      return undefined;
    }
  }

  private async handleNewCommit(commit: GitCommit): Promise<void> {
    try {
      // Get repository URL for Discord notification
      const repoUrl = await this.getRepositoryUrl();

      // Check if Discord webhooks are configured for pushes
      const webhooks = await discordManager.loadWebhooks(this.context);
      const pushWebhooks = webhooks.filter((hook) =>
        hook.events.includes("pushes")
      );

      if (pushWebhooks.length > 0) {
        console.log(
          `GitWatcher: Sending Discord notification for commit: ${commit.hash.substring(
            0,
            7
          )}`
        );

        await discordManager.notifyPush(
          this.context,
          commit.message,
          commit.author,
          repoUrl || "Unknown Repository"
        );

        // Show user notification
        vscode.window.showInformationMessage(
          `📢 Discord notification sent for commit: ${commit.message.substring(
            0,
            50
          )}...`
        );
      }

      // Check for release tags
      await this.checkForNewReleaseTag(commit);
    } catch (error) {
      console.error("GitWatcher: Error handling new commit:", error);
    }
  }

  private async checkForNewReleaseTag(commit: GitCommit): Promise<void> {
    try {
      // Check if this commit has any tags
      const tags = await this.execGitCommand(`tag --points-at ${commit.hash}`);

      if (tags.trim()) {
        const tagList = tags.trim().split("\n");

        for (const tag of tagList) {
          if (tag.match(/^v?\d+\.\d+\.\d+/)) {
            // Looks like a version tag
            console.log(`GitWatcher: Release tag detected: ${tag}`);

            // Check if Discord webhooks are configured for releases
            const webhooks = await discordManager.loadWebhooks(this.context);
            const releaseWebhooks = webhooks.filter((hook) =>
              hook.events.includes("releases")
            );

            if (releaseWebhooks.length > 0) {
              const repoUrl = await this.getRepositoryUrl();
              const releaseUrl = repoUrl
                ? `${repoUrl}/releases/tag/${tag}`
                : `https://github.com/releases/tag/${tag}`;

              await discordManager.notifyRelease(
                this.context,
                tag,
                releaseUrl,
                `New release ${tag} has been tagged!\n\n${commit.message}`,
                true // Single webhook only
              );

              vscode.window.showInformationMessage(
                `🚀 Discord notification sent for release: ${tag}`
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("GitWatcher: Error checking for release tags:", error);
    }
  }

  private async getRepositoryUrl(): Promise<string | undefined> {
    try {
      const remoteUrl = await this.execGitCommand("remote get-url origin");

      // Convert SSH to HTTPS format
      let url = remoteUrl.trim();
      if (url.startsWith("git@github.com:")) {
        url = url.replace("git@github.com:", "https://github.com/");
      }
      if (url.endsWith(".git")) {
        url = url.slice(0, -4);
      }

      return url;
    } catch (error) {
      console.error("GitWatcher: Error getting repository URL:", error);
      return undefined;
    }
  }

  private async execGitCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.workspaceFolder) {
        reject(new Error("No workspace folder"));
        return;
      }

      const cp = require("child_process");
      cp.exec(
        `git ${command}`,
        { cwd: this.workspaceFolder.uri.fsPath },
        (error: any, stdout: string, stderr: string) => {
          if (error) {
            reject(
              new Error(
                `Git command failed: ${error.message}\nStderr: ${stderr}`
              )
            );
          } else {
            resolve(stdout);
          }
        }
      );
    });
  }

  public dispose(): void {
    if (this.gitWatcher) {
      this.gitWatcher.dispose();
    }
    if (this.refsWatcher) {
      this.refsWatcher.dispose();
    }
  }
}
