// src/webviews/dashboardWebview.ts

import * as vscode from "vscode";

export interface DashboardCallbacks {
  onRefreshHighlights: () => void;
  onClearHighlights: () => void;
  onCopyBlockPath: () => void;
  onNavigateToBlock: () => void;
  onLikeCurrentLine: () => void;
  onRefreshLikedLines: () => void;
  onAutoAddGitignore: () => void;
  onSetupDiscordWebhook: () => void;
  onManageDiscordWebhooks: () => void;
  onUpdateVersion: () => void;
  onShowCurrentVersion: () => void;
  onSimulateGithubRelease: () => void;
  onSimulateGithubPush: () => void;
  onSetupGitHubWebhook: () => void;
  onManageGitHubWebhooks: () => void;
  onShowGitHubReleaseManager: () => void; // Add new callback
}

export function showDashboardWebview(callbacks: DashboardCallbacks) {
  const panel = vscode.window.createWebviewPanel(
    "prismflowDashboard",
    "PrismFlow Dashboard",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  panel.webview.html = getDashboardContent();

  panel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case "refreshHighlights":
        callbacks.onRefreshHighlights();
        break;
      case "clearHighlights":
        callbacks.onClearHighlights();
        break;
      case "copyBlockPath":
        callbacks.onCopyBlockPath();
        break;
      case "navigateToBlock":
        callbacks.onNavigateToBlock();
        break;
      case "likeCurrentLine":
        callbacks.onLikeCurrentLine();
        break;
      case "refreshLikedLines":
        callbacks.onRefreshLikedLines();
        break;
      case "autoAddGitignore":
        callbacks.onAutoAddGitignore();
        break;
      case "setupDiscordWebhook":
        callbacks.onSetupDiscordWebhook();
        break;
      case "manageDiscordWebhooks":
        callbacks.onManageDiscordWebhooks();
        break;
      case "updateVersion":
        callbacks.onUpdateVersion();
        break;
      case "showCurrentVersion":
        callbacks.onShowCurrentVersion();
        break;
      case "simulateGithubRelease":
        callbacks.onSimulateGithubRelease();
        break;
      case "simulateGithubPush":
        callbacks.onSimulateGithubPush();
        break;
      case "setupGitHubWebhook":
        callbacks.onSetupGitHubWebhook();
        break;
      case "manageGitHubWebhooks":
        callbacks.onManageGitHubWebhooks();
        break;
      case "showGitHubReleaseManager":
        callbacks.onShowGitHubReleaseManager();
        break;
    }
  });

  return panel;
}

function getDashboardContent(): string {
  return `<!DOCTYPE html>
    <html>
    <head>
        <title>PrismFlow Dashboard</title>
        <meta charset="UTF-8" />
        <style>
            body { 
                font-family: var(--vscode-font-family, Arial, sans-serif); 
                padding: 20px; 
                background: var(--vscode-editor-background, #fff); 
                color: var(--vscode-editor-foreground, #000);
                margin: 0;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid var(--vscode-panel-border, #ccc);
            }
            .header h1 {
                margin: 0;
                color: var(--vscode-textLink-foreground, #007acc);
            }
            .header p {
                margin: 10px 0 0 0;
                color: var(--vscode-descriptionForeground, #666);
            }
            .section {
                margin-bottom: 30px;
                padding: 20px;
                background: var(--vscode-sideBar-background, #f8f8f8);
                border-radius: 8px;
                border: 1px solid var(--vscode-panel-border, #e1e4e8);
            }
            .section h2 {
                margin: 0 0 15px 0;
                color: var(--vscode-textLink-foreground, #007acc);
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .section-icon {
                font-size: 1.2em;
            }
            .button-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
                margin-top: 15px;
            }
            .btn {
                background: var(--vscode-button-background, #007acc);
                color: var(--vscode-button-foreground, #fff);
                border: none;
                padding: 12px 16px;
                cursor: pointer;
                border-radius: 4px;
                transition: background-color 0.2s;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }
            .btn:hover {
                background: var(--vscode-button-hoverBackground, #005a9e);
            }
            .btn-secondary {
                background: var(--vscode-button-secondaryBackground, #5a6069);
                color: var(--vscode-button-secondaryForeground, #fff);
            }
            .btn-secondary:hover {
                background: var(--vscode-button-secondaryHoverBackground, #4c5057);
            }
            .status-bar {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: var(--vscode-statusBar-background, #007acc);
                color: var(--vscode-statusBar-foreground, #fff);
                padding: 8px 20px;
                text-align: center;
                font-size: 12px;
            }
            .icon {
                font-style: normal;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔮 PrismFlow Dashboard</h1>
            <p>Centralized control for all PrismFlow features</p>
        </div>

        <div class="section">
            <h2><span class="section-icon">✨</span>Code Highlighting</h2>
            <div class="button-grid">
                <button class="btn" onclick="executeCommand('refreshHighlights')">
                    <span class="icon">🔄</span> Refresh Highlights
                </button>
                <button class="btn btn-secondary" onclick="executeCommand('clearHighlights')">
                    <span class="icon">🧹</span> Clear All Highlights
                </button>
                <button class="btn" onclick="executeCommand('copyBlockPath')">
                    <span class="icon">📋</span> Copy Block Path
                </button>
                <button class="btn" onclick="executeCommand('navigateToBlock')">
                    <span class="icon">🧭</span> Navigate to Block
                </button>
            </div>
        </div>

        <div class="section">
            <h2><span class="section-icon">❤️</span>Liked Lines</h2>
            <div class="button-grid">
                <button class="btn" onclick="executeCommand('likeCurrentLine')">
                    <span class="icon">💖</span> Like Current Line
                </button>
                <button class="btn btn-secondary" onclick="executeCommand('refreshLikedLines')">
                    <span class="icon">🔄</span> Refresh Liked Lines
                </button>
            </div>
        </div>

        <div class="section">
            <h2><span class="section-icon">📂</span>Git Management</h2>
            <div class="button-grid">
                <button class="btn" onclick="executeCommand('autoAddGitignore')">
                    <span class="icon">🚫</span> Auto-Add Gitignore Patterns
                </button>
            </div>
        </div>

        <div class="section">
            <h2><span class="section-icon">💬</span>Discord Integration</h2>
            <div class="button-grid">
                <button class="btn" onclick="executeCommand('setupDiscordWebhook')">
                    <span class="icon">⚙️</span> Setup Discord Webhook
                </button>
                <button class="btn btn-secondary" onclick="executeCommand('manageDiscordWebhooks')">
                    <span class="icon">🔧</span> Manage Discord Webhooks
                </button>
            </div>
        </div>

        <div class="section">
            <h2><span class="section-icon">🏷️</span>Version Management</h2>
            <div class="button-grid">
                <button class="btn" onclick="executeCommand('updateVersion')">
                    <span class="icon">⬆️</span> Update Package Version
                </button>
                <button class="btn btn-secondary" onclick="executeCommand('showCurrentVersion')">
                    <span class="icon">📋</span> Show Current Version
                </button>
            </div>
        </div>

        <div class="section">
            <h2><span class="section-icon">🐙</span>GitHub Integration</h2>
            <div class="button-grid">
                <button class="btn btn-success" onclick="executeCommand('showGitHubReleaseManager')">
                    <span class="icon">🚀</span> Create GitHub Release
                </button>
                <button class="btn" onclick="executeCommand('setupGitHubWebhook')">
                    <span class="icon">⚙️</span> Setup GitHub Webhook
                </button>
                <button class="btn btn-secondary" onclick="executeCommand('manageGitHubWebhooks')">
                    <span class="icon">🔧</span> Manage GitHub Webhooks
                </button>
                <button class="btn" onclick="executeCommand('simulateGithubRelease')">
                    <span class="icon">🎯</span> Simulate GitHub Release
                </button>
                <button class="btn" onclick="executeCommand('simulateGithubPush')">
                    <span class="icon">📤</span> Simulate GitHub Push
                </button>
            </div>
        </div>

        <div class="status-bar">
            PrismFlow Dashboard • Click any button to execute commands
        </div>

        <script>
            const vscode = acquireVsCodeApi();

            function executeCommand(command) {
                vscode.postMessage({
                    command: command
                });
                
                // Visual feedback
                const btn = event.target.closest('button');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<span class="icon">⏳</span> Executing...';
                btn.disabled = true;
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 1000);
            }

            // Show success message
            window.addEventListener('message', event => {
                const message = event.data;
                if (message.command === 'showMessage') {
                    const statusBar = document.querySelector('.status-bar');
                    const originalText = statusBar.textContent;
                    statusBar.textContent = message.text;
                    statusBar.style.background = message.type === 'success' ? '#28a745' : '#dc3545';
                    
                    setTimeout(() => {
                        statusBar.textContent = originalText;
                        statusBar.style.background = 'var(--vscode-statusBar-background, #007acc)';
                    }, 3000);
                }
            });
        </script>
    </body>
    </html>`;
}
