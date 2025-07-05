// src/webviews/githubReleaseWebview.ts

import * as vscode from "vscode";
import * as cp from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface GitHubReleaseData {
  tagName: string;
  releaseName: string;
  description: string;
  draft: boolean;
  prerelease: boolean;
  generateNotes: boolean;
  targetCommitish: string;
  assets?: string[];
}

export function showGitHubReleaseWebview(
  context: vscode.ExtensionContext,
  onSubmit: (data: GitHubReleaseData, panel: vscode.WebviewPanel) => void
): vscode.WebviewPanel {
  const newPanel = vscode.window.createWebviewPanel(
    "githubRelease",
    "GitHub Release Manager",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [context.extensionUri],
    }
  );

  // Get repository information
  getRepositoryInfo().then((repoInfo) => {
    newPanel.webview.html = getWebviewContent(repoInfo);
  });

  newPanel.webview.onDidReceiveMessage(async (message) => {
    switch (message.command) {
      case "submitRelease":
        onSubmit(message.data, newPanel);
        break;
      case "getPackageVersion":
        const version = await getPackageVersion();
        newPanel.webview.postMessage({
          command: "packageVersion",
          version: version,
        });
        break;
      case "getTags":
        const tags = await getGitTags();
        newPanel.webview.postMessage({
          command: "gitTags",
          tags: tags,
        });
        break;
      case "getBranches":
        const branches = await getGitBranches();
        newPanel.webview.postMessage({
          command: "gitBranches",
          branches: branches,
        });
        break;
      case "generateChangelog":
        const changelog = await generateChangelog(
          message.fromTag,
          message.toTag
        );
        newPanel.webview.postMessage({
          command: "changelog",
          changelog: changelog,
        });
        break;
    }
  });

  return newPanel;
}

async function getRepositoryInfo(): Promise<{
  name: string;
  owner: string;
  url: string;
  currentBranch: string;
  lastCommit: string;
}> {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error("No workspace folder found");
    }

    const gitDir = path.join(workspaceFolder.uri.fsPath, ".git");
    if (!fs.existsSync(gitDir)) {
      throw new Error("Not a git repository");
    }

    // Get remote URL
    const remoteUrl = await execGitCommand("git remote get-url origin");
    const repoMatch = remoteUrl.match(
      /github\.com[\/:](.+?)\/(.+?)(?:\.git)?$/
    );

    const owner = repoMatch?.[1] || "unknown";
    const name = repoMatch?.[2] || "unknown";

    // Get current branch
    const currentBranch = await execGitCommand("git branch --show-current");

    // Get last commit
    const lastCommit = await execGitCommand(
      'git log -1 --format="%h - %s (%an, %ar)"'
    );

    return {
      name,
      owner,
      url: `https://github.com/${owner}/${name}`,
      currentBranch: currentBranch.trim(),
      lastCommit: lastCommit.trim(),
    };
  } catch (error) {
    return {
      name: "Unknown Repository",
      owner: "unknown",
      url: "",
      currentBranch: "main",
      lastCommit: "No commits found",
    };
  }
}

async function getPackageVersion(): Promise<string> {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return "0.0.0";
    }

    const packageJsonPath = path.join(
      workspaceFolder.uri.fsPath,
      "package.json"
    );
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return packageJson.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

async function getGitTags(): Promise<string[]> {
  try {
    const tagsOutput = await execGitCommand("git tag --sort=-version:refname");
    return tagsOutput
      .trim()
      .split("\n")
      .filter((tag) => tag.length > 0)
      .slice(0, 10);
  } catch {
    return [];
  }
}

async function getGitBranches(): Promise<string[]> {
  try {
    const branchesOutput = await execGitCommand(
      'git branch -r --format="%(refname:short)"'
    );
    return branchesOutput
      .trim()
      .split("\n")
      .filter((branch) => branch.length > 0)
      .map((b) => b.replace("origin/", ""));
  } catch {
    return ["main", "master"];
  }
}

async function generateChangelog(
  fromTag?: string,
  toTag?: string
): Promise<string> {
  try {
    const range = fromTag ? `${fromTag}..${toTag || "HEAD"}` : "--all";
    const logOutput = await execGitCommand(
      `git log ${range} --pretty=format:"• %s (%h)" --no-merges`
    );
    return logOutput.trim() || "No changes found.";
  } catch {
    return "Unable to generate changelog.";
  }
}

function execGitCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      reject(new Error("No workspace folder"));
      return;
    }

    cp.exec(
      command,
      { cwd: workspaceFolder.uri.fsPath },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      }
    );
  });
}

function getWebviewContent(repoInfo: {
  name: string;
  owner: string;
  url: string;
  currentBranch: string;
  lastCommit: string;
}): string {
  return `<!DOCTYPE html>
    <html>
    <head>
        <title>GitHub Release Manager</title>
        <meta charset="UTF-8" />
        <style>
            body { 
                font-family: var(--vscode-font-family, Arial, sans-serif); 
                padding: 20px; 
                background: var(--vscode-editor-background, #fff); 
                color: var(--vscode-editor-foreground, #000);
                margin: 0;
                line-height: 1.6;
            }
            .header {
                background: var(--vscode-sideBar-background, #f8f8f8);
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                border: 1px solid var(--vscode-panel-border, #e1e4e8);
            }
            .header h1 {
                margin: 0 0 10px 0;
                color: var(--vscode-textLink-foreground, #007acc);
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .repo-info {
                background: var(--vscode-textBlockQuote-background, #f0f0f0);
                padding: 15px;
                border-radius: 6px;
                margin: 15px 0;
                border-left: 4px solid var(--vscode-textLink-foreground, #007acc);
            }
            .form-section {
                background: var(--vscode-sideBar-background, #f8f8f8);
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                border: 1px solid var(--vscode-panel-border, #e1e4e8);
            }
            .form-section h3 {
                margin: 0 0 15px 0;
                color: var(--vscode-textLink-foreground, #007acc);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .form-group {
                margin-bottom: 15px;
            }
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: var(--vscode-foreground, #000);
            }
            input, textarea, select {
                width: 100%;
                padding: 10px;
                border: 1px solid var(--vscode-input-border, #ccc);
                border-radius: 4px;
                background: var(--vscode-input-background, #fff);
                color: var(--vscode-input-foreground, #000);
                font-size: 14px;
                box-sizing: border-box;
            }
            input:focus, textarea:focus, select:focus {
                outline: none;
                border-color: var(--vscode-focusBorder, #007acc);
                box-shadow: 0 0 0 1px var(--vscode-focusBorder, #007acc);
            }
            textarea {
                min-height: 120px;
                resize: vertical;
                font-family: var(--vscode-font-family, Arial, sans-serif);
            }
            .checkbox-group {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 10px;
            }
            .checkbox-group input[type="checkbox"] {
                width: auto;
                margin: 0;
            }
            .button-group {
                display: flex;
                gap: 10px;
                margin-top: 20px;
                flex-wrap: wrap;
            }
            .btn {
                background: var(--vscode-button-background, #007acc);
                color: var(--vscode-button-foreground, #fff);
                border: none;
                padding: 12px 20px;
                cursor: pointer;
                border-radius: 4px;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: background-color 0.2s;
            }
            .btn:hover {
                background: var(--vscode-button-hoverBackground, #005a9e);
            }
            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .btn-secondary {
                background: var(--vscode-button-secondaryBackground, #5a6069);
                color: var(--vscode-button-secondaryForeground, #fff);
            }
            .btn-secondary:hover {
                background: var(--vscode-button-secondaryHoverBackground, #4c5057);
            }
            .btn-success {
                background: #28a745;
                color: white;
            }
            .btn-success:hover {
                background: #218838;
            }
            .message {
                padding: 12px;
                border-radius: 4px;
                margin: 15px 0;
                display: none;
            }
            .message.success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
                display: block;
            }
            .message.error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
                display: block;
            }
            .tag-suggestions {
                display: flex;
                gap: 5px;
                flex-wrap: wrap;
                margin-top: 5px;
            }
            .tag-suggestion {
                background: var(--vscode-badge-background, #007acc);
                color: var(--vscode-badge-foreground, #fff);
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                cursor: pointer;
                border: none;
            }
            .tag-suggestion:hover {
                opacity: 0.8;
            }
            .changelog-preview {
                background: var(--vscode-textCodeBlock-background, #f6f8fa);
                border: 1px solid var(--vscode-panel-border, #e1e4e8);
                border-radius: 4px;
                padding: 15px;
                margin-top: 10px;
                font-family: var(--vscode-editor-font-family, monospace);
                font-size: 13px;
                white-space: pre-wrap;
                max-height: 200px;
                overflow-y: auto;
            }
            .loading {
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            .spinner {
                width: 16px;
                height: 16px;
                border: 2px solid var(--vscode-progressBar-background, #ccc);
                border-top: 2px solid var(--vscode-textLink-foreground, #007acc);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .help-text {
                font-size: 12px;
                color: var(--vscode-descriptionForeground, #666);
                margin-top: 5px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚀 GitHub Release Manager</h1>
            <div class="repo-info">
                <strong>Repository:</strong> ${repoInfo.owner}/${repoInfo.name}<br>
                <strong>Current Branch:</strong> ${repoInfo.currentBranch}<br>
                <strong>Last Commit:</strong> ${repoInfo.lastCommit}
            </div>
        </div>

        <form id="releaseForm">
            <div class="form-section">
                <h3>🏷️ Release Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="tagName">Tag Name *</label>
                        <input type="text" id="tagName" name="tagName" placeholder="v1.0.0" required />
                        <div class="help-text">Follow semantic versioning (e.g., v1.0.0)</div>
                        <div id="tagSuggestions" class="tag-suggestions"></div>
                    </div>
                    <div class="form-group">
                        <label for="releaseName">Release Title *</label>
                        <input type="text" id="releaseName" name="releaseName" placeholder="Version 1.0.0 - Major Update" required />
                        <div class="help-text">A descriptive title for this release</div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="targetCommitish">Target Branch/Commit</label>
                    <select id="targetCommitish" name="targetCommitish">
                        <option value="${repoInfo.currentBranch}" selected>${repoInfo.currentBranch}</option>
                    </select>
                    <div class="help-text">Branch or commit to create the release from</div>
                </div>
            </div>

            <div class="form-section">
                <h3>📝 Release Notes</h3>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" placeholder="Describe what's new in this release..."></textarea>
                    <div class="help-text">Use Markdown formatting. Leave empty to auto-generate from commits.</div>
                </div>
                <div class="button-group">
                    <button type="button" class="btn btn-secondary" onclick="generateChangelog()">
                        📋 Auto-Generate from Commits
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="loadFromPackageJson()">
                        📦 Load from package.json
                    </button>
                </div>
                <div id="changelogPreview" class="changelog-preview" style="display: none;"></div>
            </div>

            <div class="form-section">
                <h3>⚙️ Release Options</h3>
                <div class="checkbox-group">
                    <input type="checkbox" id="draft" name="draft" />
                    <label for="draft">Save as draft (won't be published immediately)</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="prerelease" name="prerelease" />
                    <label for="prerelease">Mark as pre-release (beta, alpha, etc.)</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="generateNotes" name="generateNotes" checked />
                    <label for="generateNotes">Auto-generate release notes from commits</label>
                </div>
            </div>

            <div id="message" class="message"></div>

            <div class="button-group">
                <button type="submit" class="btn btn-success">
                    🚀 Create Release
                </button>
                <button type="button" class="btn btn-secondary" onclick="previewRelease()">
                    👁️ Preview
                </button>
                <button type="button" class="btn btn-secondary" onclick="saveDraft()">
                    💾 Save as Draft
                </button>
            </div>
        </form>

        <script>
            const vscode = acquireVsCodeApi();
            let tags = [];
            let branches = [];

            // Initialize the form
            document.addEventListener('DOMContentLoaded', function() {
                loadInitialData();
                setupEventListeners();
            });

            function loadInitialData() {
                vscode.postMessage({ command: 'getPackageVersion' });
                vscode.postMessage({ command: 'getTags' });
                vscode.postMessage({ command: 'getBranches' });
            }

            function setupEventListeners() {
                // Auto-fill release name when tag changes
                document.getElementById('tagName').addEventListener('input', function(e) {
                    const tag = e.target.value;
                    const releaseNameField = document.getElementById('releaseName');
                    if (!releaseNameField.value || releaseNameField.value.includes('Version')) {
                        releaseNameField.value = \`Version \${tag} - Release\`;
                    }
                });

                // Form submission
                document.getElementById('releaseForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    submitRelease();
                });
            }

            function submitRelease() {
                const formData = new FormData(document.getElementById('releaseForm'));
                const data = {
                    tagName: formData.get('tagName'),
                    releaseName: formData.get('releaseName'),
                    description: formData.get('description'),
                    targetCommitish: formData.get('targetCommitish'),
                    draft: document.getElementById('draft').checked,
                    prerelease: document.getElementById('prerelease').checked,
                    generateNotes: document.getElementById('generateNotes').checked
                };

                // Validation
                if (!data.tagName || !data.releaseName) {
                    showMessage('Please fill in all required fields.', 'error');
                    return;
                }

                // Show loading state
                const submitBtn = document.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<div class="loading"><div class="spinner"></div> Creating Release...</div>';
                submitBtn.disabled = true;

                vscode.postMessage({
                    command: 'submitRelease',
                    data: data
                });

                // Reset button after 3 seconds if no response
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            }

            function generateChangelog() {
                const latestTag = tags[0];
                const currentTag = document.getElementById('tagName').value || 'HEAD';
                
                const btn = event.target;
                const originalText = btn.innerHTML;
                btn.innerHTML = '<div class="loading"><div class="spinner"></div> Generating...</div>';
                btn.disabled = true;

                vscode.postMessage({
                    command: 'generateChangelog',
                    fromTag: latestTag,
                    toTag: currentTag === 'HEAD' ? undefined : currentTag
                });

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 2000);
            }

            function loadFromPackageJson() {
                vscode.postMessage({ command: 'getPackageVersion' });
            }

            function previewRelease() {
                const description = document.getElementById('description').value;
                const tagName = document.getElementById('tagName').value;
                const releaseName = document.getElementById('releaseName').value;
                
                if (!tagName || !releaseName) {
                    showMessage('Please fill in tag name and release title first.', 'error');
                    return;
                }

                showMessage(\`Preview: Release "\${releaseName}" will be created with tag "\${tagName}"\`, 'success');
            }

            function saveDraft() {
                document.getElementById('draft').checked = true;
                submitRelease();
            }

            function showMessage(text, type) {
                const messageEl = document.getElementById('message');
                messageEl.textContent = text;
                messageEl.className = \`message \${type}\`;
                messageEl.style.display = 'block';
                
                if (type === 'success') {
                    setTimeout(() => {
                        messageEl.style.display = 'none';
                    }, 5000);
                }
            }

            // Handle messages from extension
            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.command) {
                    case 'packageVersion':
                        const tagField = document.getElementById('tagName');
                        if (!tagField.value) {
                            tagField.value = 'v' + message.version;
                        }
                        break;
                    case 'gitTags':
                        tags = message.tags;
                        updateTagSuggestions();
                        break;
                    case 'gitBranches':
                        branches = message.branches;
                        updateBranchOptions();
                        break;
                    case 'changelog':
                        const descriptionField = document.getElementById('description');
                        if (!descriptionField.value) {
                            descriptionField.value = message.changelog;
                        }
                        
                        const preview = document.getElementById('changelogPreview');
                        preview.textContent = message.changelog;
                        preview.style.display = 'block';
                        break;
                    case 'releaseResult':
                        showMessage(message.message, message.success ? 'success' : 'error');
                        if (message.success && message.url) {
                            setTimeout(() => {
                                showMessage(\`Release created successfully! View at: \${message.url}\`, 'success');
                            }, 1000);
                        }
                        break;
                }
            });

            function updateTagSuggestions() {
                const container = document.getElementById('tagSuggestions');
                container.innerHTML = '';
                
                if (tags.length > 0) {
                    const currentVersion = tags[0];
                    const versionMatch = currentVersion.match(/v?(\\d+)\\.(\\d+)\\.(\\d+)/);
                    
                    if (versionMatch) {
                        const [, major, minor, patch] = versionMatch;
                        const suggestions = [
                            \`v\${major}.\${minor}.\${parseInt(patch) + 1}\`,
                            \`v\${major}.\${parseInt(minor) + 1}.0\`,
                            \`v\${parseInt(major) + 1}.0.0\`
                        ];
                        
                        suggestions.forEach(suggestion => {
                            const btn = document.createElement('button');
                            btn.type = 'button';
                            btn.className = 'tag-suggestion';
                            btn.textContent = suggestion;
                            btn.onclick = () => {
                                document.getElementById('tagName').value = suggestion;
                                document.getElementById('releaseName').value = \`Version \${suggestion} - Release\`;
                            };
                            container.appendChild(btn);
                        });
                    }
                }
            }

            function updateBranchOptions() {
                const select = document.getElementById('targetCommitish');
                const currentValue = select.value;
                
                // Clear existing options except the first one
                while (select.children.length > 1) {
                    select.removeChild(select.lastChild);
                }
                
                branches.forEach(branch => {
                    if (branch !== select.children[0].value) {
                        const option = document.createElement('option');
                        option.value = branch;
                        option.textContent = branch;
                        select.appendChild(option);
                    }
                });
                
                // Restore selected value if it still exists
                if (branches.includes(currentValue)) {
                    select.value = currentValue;
                }
            }
        </script>
    </body>
    </html>`;
}
