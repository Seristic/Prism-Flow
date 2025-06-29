// src/versionManager.ts
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as semver from "semver";
import { notifyRelease } from "./discordManager";

// Interface for version data
interface VersionData {
  version: string;
  description: string;
  date: string;
}

/**
 * Get the current package version
 */
export function getCurrentVersion(packageJsonPath: string): string | null {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return packageJson.version;
  } catch (error) {
    console.error("Error reading package.json:", error);
    return null;
  }
}

/**
 * Update the package version
 */
export async function updatePackageVersion(
  extensionContext: vscode.ExtensionContext,
  packageJsonPath: string,
  newVersion: string,
  description: string = ""
): Promise<boolean> {
  try {
    // Read and parse package.json
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonContent);

    // Store the old version for comparison
    const oldVersion = packageJson.version;

    // Update the version
    packageJson.version = newVersion;

    // Write updated package.json
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + "\n",
      "utf8"
    );

    // Update changelog
    await updateChangelog(packageJsonPath, newVersion, description);

    // Get the repository URL for notification
    const repoUrl = packageJson.repository?.url || "";

    // Notify via Discord if this is a valid semver change
    if (
      semver.valid(oldVersion) &&
      semver.valid(newVersion) &&
      semver.gt(newVersion, oldVersion)
    ) {
      notifyRelease(
        extensionContext,
        `v${newVersion}`,
        repoUrl,
        description || `Version updated from ${oldVersion} to ${newVersion}`
      );
    }

    return true;
  } catch (error) {
    console.error("Error updating package.json:", error);
    return false;
  }
}

/**
 * Update the CHANGELOG.md with the new version info
 */
async function updateChangelog(
  packageJsonPath: string,
  version: string,
  description: string
): Promise<void> {
  const changelogPath = path.join(
    path.dirname(packageJsonPath),
    "CHANGELOG.md"
  );

  // Check if changelog exists
  if (!fs.existsSync(changelogPath)) {
    // Create a new changelog if it doesn't exist
    const initialContent = `# Change Log\n\n## v${version} - ${
      new Date().toISOString().split("T")[0]
    }\n\n${description || "Initial release"}\n`;
    fs.writeFileSync(changelogPath, initialContent, "utf8");
    return;
  }

  // Read existing changelog
  let changelogContent = fs.readFileSync(changelogPath, "utf8");

  // Format the new entry
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const newEntry = `## v${version} - ${date}\n\n${
    description || "No description provided."
  }\n\n`;

  // Add the new entry after the heading
  const headingRegex = /# Change Log/i;
  if (headingRegex.test(changelogContent)) {
    changelogContent = changelogContent.replace(
      headingRegex,
      `# Change Log\n\n${newEntry}`
    );
  } else {
    changelogContent = `# Change Log\n\n${newEntry}${changelogContent}`;
  }

  // Write back to file
  fs.writeFileSync(changelogPath, changelogContent, "utf8");
}

/**
 * Run interactive version update wizard
 */
export async function runVersionUpdateWizard(
  context: vscode.ExtensionContext
): Promise<void> {
  // Find the package.json
  let packageJsonPath = "";

  if (
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
  ) {
    const potentialPath = path.join(
      vscode.workspace.workspaceFolders[0].uri.fsPath,
      "package.json"
    );
    if (fs.existsSync(potentialPath)) {
      packageJsonPath = potentialPath;
    }
  }

  if (!packageJsonPath) {
    const selected = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select package.json",
      filters: {
        JSON: ["json"],
      },
    });

    if (!selected || selected.length === 0) {
      vscode.window.showErrorMessage(
        "No package.json selected. Version update canceled."
      );
      return;
    }

    packageJsonPath = selected[0].fsPath;
  }

  // Get current version
  const currentVersion = getCurrentVersion(packageJsonPath);
  if (!currentVersion) {
    vscode.window.showErrorMessage(
      "Could not determine current version from package.json."
    );
    return;
  }

  // Ask which type of update to perform
  const versionUpdateType = await vscode.window.showQuickPick(
    [
      {
        label: "Major Version Update",
        description: `Increment first number (x.0.0)`,
        detail: `Current: ${currentVersion} → New: ${semver.inc(
          currentVersion,
          "major"
        )}`,
      },
      {
        label: "Minor Version Update",
        description: `Increment second number (0.x.0)`,
        detail: `Current: ${currentVersion} → New: ${semver.inc(
          currentVersion,
          "minor"
        )}`,
      },
      {
        label: "Patch Version Update",
        description: `Increment third number (0.0.x)`,
        detail: `Current: ${currentVersion} → New: ${semver.inc(
          currentVersion,
          "patch"
        )}`,
      },
      {
        label: "Custom Version",
        description: "Enter a specific version number",
        detail: `Current: ${currentVersion}`,
      },
    ],
    {
      placeHolder: "Select type of version update",
    }
  );

  if (!versionUpdateType) {
    return; // User cancelled
  }

  let newVersion = "";

  // Handle version calculation based on selection
  if (versionUpdateType.label === "Custom Version") {
    newVersion =
      (await vscode.window.showInputBox({
        prompt: "Enter new version",
        placeHolder: "e.g., 1.0.0",
        value: currentVersion,
      })) || "";

    if (!semver.valid(newVersion)) {
      vscode.window.showErrorMessage(
        "Invalid version format. Please use semantic versioning (e.g., 1.0.0)"
      );
      return;
    }
  } else {
    // Calculate the new version based on the selection
    const updateType = versionUpdateType.label.startsWith("Major")
      ? "major"
      : versionUpdateType.label.startsWith("Minor")
      ? "minor"
      : "patch";
    newVersion = semver.inc(currentVersion, updateType) || "";
  }

  if (!newVersion) {
    vscode.window.showErrorMessage("Failed to determine new version.");
    return;
  }

  // Get a changelog description
  const description =
    (await vscode.window.showInputBox({
      prompt: "Enter version update description",
      placeHolder: "What changed in this version?",
      ignoreFocusOut: true,
    })) || "";

  // Confirm the update
  const confirmUpdate = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: `Update version from ${currentVersion} to ${newVersion}?`,
  });

  if (confirmUpdate !== "Yes") {
    vscode.window.showInformationMessage("Version update cancelled.");
    return;
  }

  // Perform the update
  const success = await updatePackageVersion(
    context,
    packageJsonPath,
    newVersion,
    description
  );

  if (success) {
    vscode.window.showInformationMessage(
      `Version successfully updated to ${newVersion}`
    );
  } else {
    vscode.window.showErrorMessage(
      "Failed to update version. Check the console for errors."
    );
  }
}

/**
 * Register version management commands
 */
export function registerVersionCommands(
  context: vscode.ExtensionContext
): void {
  // Register the update version command
  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.updateVersion", () => {
      runVersionUpdateWizard(context);
    })
  );

  // Register a command to show the current version
  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.showCurrentVersion", () => {
      if (
        vscode.workspace.workspaceFolders &&
        vscode.workspace.workspaceFolders.length > 0
      ) {
        const packageJsonPath = path.join(
          vscode.workspace.workspaceFolders[0].uri.fsPath,
          "package.json"
        );

        if (fs.existsSync(packageJsonPath)) {
          const currentVersion = getCurrentVersion(packageJsonPath);
          if (currentVersion) {
            vscode.window.showInformationMessage(
              `PrismFlow current version: ${currentVersion}`
            );
          } else {
            vscode.window.showErrorMessage(
              "Could not determine current version from package.json."
            );
          }
        } else {
          vscode.window.showErrorMessage(
            "Could not find package.json in the workspace root."
          );
        }
      } else {
        vscode.window.showErrorMessage("No workspace folder is open.");
      }
    })
  );
}
