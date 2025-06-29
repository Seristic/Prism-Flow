// src\webviews\githubWebhookSetupWebview.ts

import * as vscode from "vscode";

export function showGitHubWebhookSetupWebview(
  onSubmit: (
    data: { url: string; secret: string },
    panel: vscode.WebviewPanel
  ) => void,
  repoUrl?: string // Add optional repository URL
) {
  const panel = vscode.window.createWebviewPanel(
    "githubWebhookSetup",
    "GitHub Webhook Setup",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  panel.webview.html = getWebviewContent(repoUrl);

  panel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case "submitWebhook":
        onSubmit(message.data, panel);
        break;
    }
  });
}

function getWebviewContent(repoUrl?: string): string {
  const repoInfo = repoUrl
    ? `<div class="repo-info"><strong>Repository:</strong> ${repoUrl}</div>`
    : "";

  return `<!DOCTYPE html>
    <html>
    <head>
        <title>GitHub Webhook Setup</title>
        <meta charset="UTF-8" />
        <style>
            body { font-family: var(--vscode-font-family, Arial, sans-serif); padding: 20px; background: var(--vscode-editor-background, #fff); color: var(--vscode-editor-foreground, #000);}
            .form-group { margin-bottom: 15px; }
            input, textarea { width: 100%; padding: 8px; margin-top: 5px; }
            button { background: var(--vscode-button-background, #007acc); color: var(--vscode-button-foreground, #fff); border: none; padding: 10px 20px; cursor: pointer; border-radius: 3px;}
            .success { color: green; margin-top: 20px; }
            .error { color: red; margin-top: 20px; }
            .repo-info { background: var(--vscode-textBlockQuote-background, #f0f0f0); padding: 10px; margin-bottom: 20px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <h2>GitHub Webhook Setup</h2>
        ${repoInfo}
        <form id="webhookForm">
            <div class="form-group">
                <label for="webhookUrl">Webhook URL:</label>
                <input type="text" id="webhookUrl" name="webhookUrl" placeholder="Enter webhook URL" required />
            </div>
            <div class="form-group">
                <label for="secret">Secret (optional):</label>
                <input type="password" id="secret" name="secret" placeholder="Leave empty to auto-generate" />
            </div>
            <button type="submit">Setup Webhook</button>
        </form>
        <div id="result"></div>
        <script>
            const vscode = acquireVsCodeApi();

            document.getElementById('webhookForm').addEventListener('submit', function(event) {
                event.preventDefault();
                const url = document.getElementById('webhookUrl').value.trim();
                const secret = document.getElementById('secret').value.trim();
                if (!url) {
                    showResult('Please enter a webhook URL.', false);
                    return;
                }
                vscode.postMessage({
                    command: 'submitWebhook',
                    data: { url, secret }
                });
            });

            window.addEventListener('message', event => {
                const message = event.data;
                if (message.command === 'webhookResult') {
                    showResult(message.message, message.ok);
                }
            });

            function showResult(msg, ok) {
                const el = document.getElementById('result');
                el.textContent = msg;
                el.className = ok ? 'success' : 'error';
            }
        </script>
    </body>
    </html>`;
}
