// src/gitignoreManager.ts
import * as vscode from "vscode";
import * as path from "path";
import ignore from "ignore";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

// --- NEW/UPDATED INTERFACES ---

// This interface defines the structure of the Git API object returned by getAPI(1)
interface GitAPI {
  readonly repositories: Repository[];
  getRepository(uri: vscode.Uri): Repository | undefined;
  // You might add other Git API properties/methods here if you use them,
  // e.g., onDidOpenRepository, onDidCloseRepository, etc.
}

// This interface defines the structure of the Git extension's exports
// It contains the getAPI method that returns the GitAPI object
interface GitExtension {
  getAPI(version: 1): GitAPI;
  // Other exports can be added here if needed, but getAPI is the primary one.
}

// This interface defines the structure of a single Git repository object
// It now correctly includes 'state' for untracked changes
export interface Repository {
  readonly rootUri: vscode.Uri;
  readonly state: {
    workingTreeChanges: Array<{ uri: vscode.Uri; status: number }>; // status 6 for untracked
    // Other properties like mergeChanges, stagedChanges, etc., can also be here
  };
  // Other properties of a Repository object might include events, etc.,
  // but these are the ones relevant to your current logic.
}

// --- END NEW/UPDATED INTERFACES ---

// Helper function to execute a Git command directly
async function executeGitCommand(
  repoRootPath: string,
  args: string[]
): Promise<string> {
  try {
    const { stdout, stderr } = await execPromise(`git ${args.join(" ")}`, {
      cwd: repoRootPath,
    });
    if (stderr) {
      console.warn(
        `PrismFlow Git Command Stderr for '${args.join(
          " "
        )}' in ${repoRootPath}: ${stderr}`
      );
    }
    return stdout;
  } catch (error: any) {
    // If git command fails (e.g., git not in PATH, or invalid repo)
    const errorMessage = `PrismFlow Error executing Git command 'git ${args.join(
      " "
    )}' in ${repoRootPath}: ${error.message}`;
    console.error(errorMessage);
    throw new Error(errorMessage); // Re-throw to propagate the error
  }
}

// Helper function to get the Git API instance
// THIS FUNCTION WAS MISSING IN THE PREVIOUS "FULL CODE" RESPONSE
export async function getGitApi(): Promise<GitAPI | undefined> {
  try {
    const gitExtension =
      vscode.extensions.getExtension<GitExtension>("vscode.git");
    if (!gitExtension) {
      console.warn("PrismFlow: Git extension not found.");
      return undefined;
    }

    // Wait for Git extension to activate if it's not active
    if (!gitExtension.isActive) {
      console.log("PrismFlow: Activating Git extension...");
      await gitExtension.activate();
      console.log("PrismFlow: Git extension activated.");
    }

    const gitApi = gitExtension.exports.getAPI(1);
    if (!gitApi) {
      console.warn("PrismFlow: Git API not available.");
      return undefined;
    }

    // Increase max attempts and delay to ensure repositories are loaded
    let attempts = 0;
    const maxAttempts = 10; // Increased attempts
    const delayMs = 1000; // Increased delay to 1 second per attempt

    while (
      (!gitApi.repositories ||
        gitApi.repositories.length === 0 ||
        (gitApi.repositories[0] && !gitApi.repositories[0].state)) &&
      attempts < maxAttempts
    ) {
      console.log(
        `PrismFlow Debug: Git API repositories empty or state not ready. Retrying (${
          attempts + 1
        }/${maxAttempts})...`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      attempts++;
    }

    if (!gitApi.repositories || gitApi.repositories.length === 0) {
      console.warn(
        "PrismFlow: No Git repositories found after multiple attempts."
      );
      return undefined;
    }

    // Optionally, try to explicitly get the repo for the workspace folder (diagnostic)
    if (
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
    ) {
      const workspaceFolderUri = vscode.workspace.workspaceFolders[0].uri;
      const fetchedRepo = gitApi.getRepository(workspaceFolderUri);
      if (fetchedRepo) {
        console.log(
          `PrismFlow Debug: Successfully fetched repository for workspace folder: ${workspaceFolderUri.fsPath}`
        );
      } else {
        console.warn(
          `PrismFlow Warn: Could not fetch repository explicitly for workspace folder. Using first available repo.`
        );
      }
    }

    return gitApi;
  } catch (error: any) {
    console.error(
      `PrismFlow: Error getting Git API: ${error.message || error}`
    );
    return undefined;
  }
}

// Helper to create an ignore matcher
function getIgnoredMatcher(patterns: string[]) {
  return ignore().add(patterns);
}

// Function to find or create a .gitignore file
export async function findOrCreateGitignoreFile(
  repoRootUri: vscode.Uri
): Promise<vscode.Uri | undefined> {
  const gitignorePath = path.join(repoRootUri.fsPath, ".gitignore");
  const gitignoreUri = vscode.Uri.file(gitignorePath);

  try {
    await vscode.workspace.fs.stat(gitignoreUri);
    // File exists
    return gitignoreUri;
  } catch (error: any) {
    // File does not exist, attempt to create it
    if (error.code === "FileNotFound" || error.name === "EntryNotFound") {
      try {
        await vscode.workspace.fs.writeFile(
          gitignoreUri,
          new Uint8Array(Buffer.from(""))
        );
        console.log(`PrismFlow: Created new .gitignore at ${gitignorePath}`);
        return gitignoreUri;
      } catch (createError: any) {
        vscode.window.showErrorMessage(
          `PrismFlow: Failed to create .gitignore file at ${gitignorePath}. Error: ${createError.message}`
        );
        console.error(`PrismFlow: Failed to create .gitignore:`, createError);
        return undefined;
      }
    } else {
      vscode.window.showErrorMessage(
        `PrismFlow: Error checking for .gitignore at ${gitignorePath}. Error: ${error.message}`
      );
      console.error(`PrismFlow: Error checking .gitignore:`, error);
      return undefined;
    }
  }
}

// Function to read existing .gitignore patterns
export async function readGitignorePatterns(
  gitignoreUri: vscode.Uri
): Promise<string[]> {
  try {
    const content = await vscode.workspace.fs.readFile(gitignoreUri);
    const text = new TextDecoder().decode(content);
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== "" && !line.startsWith("#"));
  } catch (error: any) {
    console.error(`PrismFlow: Failed to read .gitignore: ${error.message}`);
    return [];
  }
}

// Function to append patterns to .gitignore
export async function appendPatternsToGitignore(
  gitignoreUri: vscode.Uri,
  patterns: string[]
): Promise<void> {
  try {
    const newContent = `\n# Added by PrismFlow\n${patterns.join("\n")}\n`;
    const existingContent = new TextDecoder().decode(
      await vscode.workspace.fs.readFile(gitignoreUri)
    );
    const combinedContent = existingContent + newContent;
    await vscode.workspace.fs.writeFile(
      gitignoreUri,
      new Uint8Array(Buffer.from(combinedContent))
    );
    console.log(
      `PrismFlow: Appended ${patterns.length} patterns to .gitignore`
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(
      `PrismFlow: Failed to append patterns to .gitignore: ${error.message}`
    );
    console.error(`PrismFlow: Failed to append patterns:`, error);
  }
}

// Function to identify candidates from untracked files
export async function identifyGitignoreCandidates(
  repository: Repository,
  commonPatterns: string[],
  existingGitignorePatterns: string[],
  explicitUntrackedFilesUris: vscode.Uri[] // Explicitly pass the untracked URIs
): Promise<string[]> {
  const suggestions: Set<string> = new Set();
  const repoRootPath = repository.rootUri.fsPath;
  console.log(
    `PrismFlow Debug: identifyGitignoreCandidates - Repo Root: ${repoRootPath}`
  );

  // Create an ignore matcher for existing patterns
  const existingMatcher = getIgnoredMatcher(existingGitignorePatterns);
  console.log(
    `PrismFlow Debug: identifyGitignoreCandidates - Existing Gitignore Patterns:`,
    existingGitignorePatterns
  );

  // Use the explicitly passed untracked file URIs
  console.log(
    `PrismFlow Debug: identifyGitignoreCandidates - Raw Untracked Changes URIs (explicit):`,
    explicitUntrackedFilesUris.map((uri) => uri.fsPath)
  );

  const untrackedFiles = explicitUntrackedFilesUris.map((uri) =>
    path.relative(repoRootPath, uri.fsPath).replace(/\\/g, "/")
  );
  console.log(
    `PrismFlow Debug: identifyGitignoreCandidates - Relative Untracked Files:`,
    untrackedFiles
  );

  // Create an ignore matcher for common patterns (these are the patterns we want to suggest)
  console.log(
    `PrismFlow Debug: identifyGitignoreCandidates - Common Patterns Configured:`,
    commonPatterns
  );

  // --- DEBUGGING LOGIC AND FALLBACK MATCHING ---
  console.log("PrismFlow Debug: untrackedFiles:", untrackedFiles);
  console.log("PrismFlow Debug: commonPatterns:", commonPatterns);

  // Try both ignore matcher and fallback substring match
  for (const pattern of commonPatterns) {
    // Use ignore matcher
    const matcher = getIgnoredMatcher([pattern]);
    const matches = untrackedFiles.filter((f) => matcher.ignores(f));
    if (matches.length > 0) {
      // Check if any of these matched files are *not* already ignored by existing .gitignore rules
      const newMatches = matches.filter((f) => !existingMatcher.ignores(f));
      if (newMatches.length > 0) {
        suggestions.add(pattern);
        console.log(
          `PrismFlow Debug: Pattern '${pattern}' matches NEW files (ignore matcher):`,
          newMatches
        );
      } else {
        console.log(
          `PrismFlow Debug: Pattern '${pattern}' matches existing ignored files (ignore matcher):`,
          matches
        );
      }
    } else {
      console.log(
        `PrismFlow Debug: Pattern '${pattern}' no matches by ignore matcher.`
      );
    }

    // Fallback: substring match (for debugging)
    const fallbackMatches = untrackedFiles.filter((f) =>
      f.includes(pattern.replace(new RegExp("\\\\$"), ""))
    );
    if (fallbackMatches.length > 0) {
      // Check if any of these fallback matched files are *not* already ignored by existing .gitignore rules
      const newFallbackMatches = fallbackMatches.filter(
        (f) => !existingMatcher.ignores(f)
      );
      if (newFallbackMatches.length > 0) {
        // Only add to suggestions if not already added by ignore matcher (to avoid duplicates if both work)
        if (!suggestions.has(pattern)) {
          suggestions.add(pattern);
          console.log(
            `PrismFlow Debug: Pattern '${pattern}' matches NEW files (substring fallback):`,
            newFallbackMatches
          );
        } else {
          console.log(
            `PrismFlow Debug: Pattern '${pattern}' also matches (substring fallback), but already suggested.`
          );
        }
      } else {
        console.log(
          `PrismFlow Debug: Pattern '${pattern}' matches existing ignored files (substring fallback):`,
          fallbackMatches
        );
      }
    } else {
      console.log(
        `PrismFlow Debug: Pattern '${pattern}' no matches by substring fallback.`
      );
    }
  }
  // --- END DEBUGGING LOGIC AND FALLBACK MATCHING ---

  console.log(`PrismFlow Debug: Final suggestions:`, Array.from(suggestions));
  return Array.from(suggestions);
}

/**
 * Main function to run the gitignore automation.
 * @param options.autoConfirm If true, patterns will be added without user confirmation.
 * @returns A promise resolving to the list of patterns that were added, or undefined if cancelled/no patterns.
 */
export async function runGitignoreAutomation(options?: {
  autoConfirm?: boolean;
}): Promise<string[] | undefined> {
  const config = vscode.workspace.getConfiguration("prismflow.gitignore");
  const commonPatterns: string[] = config.get("commonPatterns", []);

  if (!commonPatterns || commonPatterns.length === 0) {
    vscode.window.showWarningMessage(
      'PrismFlow: No common .gitignore patterns configured. Please check "prismflow.gitignore.commonPatterns" setting.'
    );
    return;
  }

  const git = await getGitApi(); // 'git' is now correctly typed as GitAPI
  if (!git || git.repositories.length === 0) {
    vscode.window.showInformationMessage(
      "PrismFlow: No Git repositories found in the current workspace. Gitignore automation requires a Git repository."
    );
    return;
  }

  const addedPatterns: string[] = [];

  for (const repo of git.repositories) {
    const repoRootUri = repo.rootUri;
    const repoRootPath = repoRootUri.fsPath;

    await vscode.window.withProgress(
      {
        location: options?.autoConfirm
          ? vscode.ProgressLocation.Window
          : vscode.ProgressLocation.Notification,
        title: `PrismFlow: Checking .gitignore for ${path.basename(
          repoRootPath
        )}`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: "Finding .gitignore..." });
        const gitignoreUri = await findOrCreateGitignoreFile(repoRootUri);
        if (!gitignoreUri) {
          vscode.window.showErrorMessage(
            `PrismFlow: Could not find or create .gitignore for ${repoRootPath}. Skipping this repository.`
          );
          return;
        }

        progress.report({ message: "Reading existing patterns..." });
        const existingPatterns = await readGitignorePatterns(gitignoreUri);

        // --- NEW METHOD: Get untracked changes by executing 'git status --porcelain' ---
        let untrackedFilesUris: vscode.Uri[] = [];
        try {
          progress.report({
            message: "Detecting untracked files via Git command...",
          });
          const gitStatusOutput = await executeGitCommand(repoRootPath, [
            "status",
            "--porcelain",
            "--untracked-files=all",
          ]);
          const lines = gitStatusOutput
            .split(/\r?\n/)
            .filter((line) => line.trim() !== "");

          for (const line of lines) {
            // Untracked files start with '??'
            if (line.startsWith("?? ")) {
              // The path starts after '?? ' (3 characters)
              let filePath = line.substring(3).trim();

              // Git status --porcelain quotes paths with spaces. JSON.parse unquotes and unescapes.
              // Example: "path with spaces" -> path with spaces
              // Example: "path\\with\\back\\slash" -> path\with\back\slash
              if (filePath.startsWith('"') && filePath.endsWith('"')) {
                try {
                  filePath = JSON.parse(filePath);
                } catch (e) {
                  console.warn(
                    `PrismFlow Warn: Could not parse quoted path '${filePath}': ${e}`
                  );
                  // If JSON.parse fails, use the raw string and hope for the best
                }
              }

              // Reconstruct the full path
              const fullPath = path.join(repoRootPath, filePath);
              untrackedFilesUris.push(vscode.Uri.file(fullPath));
            }
          }
          console.log(
            `PrismFlow Debug: Found ${untrackedFilesUris.length} untracked files via 'git status --porcelain'.`
          );
          console.log(
            `PrismFlow Debug: Raw untracked URIs (from git status):`,
            untrackedFilesUris.map((uri) => uri.fsPath)
          );
        } catch (error: any) {
          vscode.window.showErrorMessage(
            `PrismFlow: Failed to get untracked files using Git command for ${path.basename(
              repoRootPath
            )}. Error: ${error.message || error}`
          );
          console.error(`PrismFlow: Git command untracked file error:`, error);
          return; // Skip this repository if the command fails
        }

        if (untrackedFilesUris.length === 0) {
          console.warn(
            `PrismFlow Debug: No untracked files found via 'git status --porcelain'. This might mean there are no untracked files or Git is not properly configured.`
          );
        }
        // --- END NEW METHOD ---

        progress.report({ message: "Identifying untracked files..." });
        // Pass the correctly obtained untracked files URIs to the identification function
        const candidatePatterns = await identifyGitignoreCandidates(
          repo,
          commonPatterns,
          existingPatterns,
          untrackedFilesUris
        );

        if (candidatePatterns.length === 0) {
          vscode.window.showInformationMessage(
            `PrismFlow: No new untracked files found that match common patterns for ${path.basename(
              repoRootPath
            )}.`
          );
          return;
        }

        let patternsToAppend: string[] = [];

        if (options?.autoConfirm) {
          patternsToAppend = candidatePatterns;
        } else {
          const options = candidatePatterns.map((p) => ({
            label: p,
            description: "Will be added to .gitignore",
          }));
          const selectedPatterns = await vscode.window.showQuickPick(options, {
            title: `PrismFlow: Add these patterns to .gitignore for ${path.basename(
              repoRootPath
            )}?`,
            canPickMany: true,
            placeHolder: "Select patterns to add (Esc to cancel)",
          });

          if (!selectedPatterns || selectedPatterns.length === 0) {
            vscode.window.showInformationMessage(
              `PrismFlow: No patterns selected for .gitignore update for ${path.basename(
                repoRootPath
              )}.`
            );
            return;
          }
          patternsToAppend = selectedPatterns.map((s) => s.label);
        }

        if (patternsToAppend.length > 0) {
          progress.report({ message: "Appending patterns to .gitignore..." });
          await appendPatternsToGitignore(gitignoreUri, patternsToAppend);
          addedPatterns.push(...patternsToAppend);
          vscode.window.showInformationMessage(
            `PrismFlow: Successfully updated .gitignore for ${path.basename(
              repoRootPath
            )} with ${patternsToAppend.length} new pattern(s).`
          );
        }
      }
    );
  }
  return addedPatterns.length > 0 ? addedPatterns : undefined;
}

export async function activate(context: vscode.ExtensionContext) {
  console.log("PrismFlow extension is now active!");

  let disposable = vscode.commands.registerCommand(
    "prismflow.autoAddGitignorePatterns",
    async () => {
      await runGitignoreAutomation();
    }
  );

  context.subscriptions.push(disposable);

  // Set up interval to run automation
  const interval = vscode.workspace
    .getConfiguration("prismflow.gitignore")
    .get("automationInterval", 60); // Default to 60 minutes
  if (interval > 0) {
    console.log(`PrismFlow: Running automation every ${interval} minutes.`);
    const intervalId = setInterval(async () => {
      // Only run if there are active workspace folders
      if (
        vscode.workspace.workspaceFolders &&
        vscode.workspace.workspaceFolders.length > 0
      ) {
        const addedPatterns = await runGitignoreAutomation({
          autoConfirm: true,
        }); // Auto-confirm
        if (addedPatterns && addedPatterns.length > 0) {
          vscode.window.showInformationMessage(
            `PrismFlow: Automatically added ${addedPatterns.length} patterns to .gitignore.`
          );
        }
      } else {
        console.log(
          "PrismFlow: Skipping automated run, no workspace folders open."
        );
      }
    }, interval * 60 * 1000); // Convert minutes to milliseconds

    context.subscriptions.push({
      dispose: () => clearInterval(intervalId), // Clean up the interval when extension deactivates
    });
  } else {
    console.log(
      "PrismFlow: Automation is disabled (automationInterval is 0 or less)."
    );
  }
}

export function deactivate() {
  console.log("PrismFlow extension is deactivated.");
}
