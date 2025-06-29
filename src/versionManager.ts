// src/versionManager.ts
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as semver from "semver";
import { notifyRelease } from "./discordManager";
import { logger } from "./extension";

// Interface for version data
interface VersionData {
  version: string;
  description: string;
  date: string;
}

// Interface for package.json files found in workspace
interface PackageInfo {
  path: string;
  name: string;
  version: string;
  relativePath: string;
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
 * Find all package.json files in the workspace
 */
export async function findAllPackageJsonFiles(
  workspaceRoot: string
): Promise<PackageInfo[]> {
  const packageFiles: PackageInfo[] = [];
  const config = vscode.workspace.getConfiguration("prismflow");
  const excludePatterns = config.get("version.monorepoExcludePatterns", [
    "node_modules/**",
    ".git/**", 
    "dist/**",
    "build/**",
    "out/**",
    ".vscode/**"
  ]) as string[];
  
  // Convert patterns to simple directory names for now (basic implementation)
  const excludeDirs = excludePatterns
    .map(pattern => pattern.replace(/[/*]+$/g, ''))
    .filter(dir => !dir.includes('/'));

  async function searchDirectory(
    dir: string,
    basePath: string = ""
  ): Promise<void> {
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relativePath = path.join(basePath, item.name);

        // Skip excluded directories
        if (
          item.isDirectory() &&
          !excludeDirs.includes(item.name)
        ) {
          await searchDirectory(fullPath, relativePath);
        } else if (item.isFile() && item.name === "package.json") {
          try {
            const packageJson = JSON.parse(fs.readFileSync(fullPath, "utf8"));
            packageFiles.push({
              path: fullPath,
              name: packageJson.name || "unnamed",
              version: packageJson.version || "0.0.0",
              relativePath: relativePath,
            });
          } catch (error) {
            logger.error(`Failed to parse package.json at ${fullPath}:`, error);
          }
        }
      }
    } catch (error) {
      logger.error(`Failed to read directory ${dir}:`, error);
    }
  }

  await searchDirectory(workspaceRoot);
  return packageFiles;
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
 * Update multiple package.json files with the same version
 */
export async function updateMultiplePackageVersions(
  extensionContext: vscode.ExtensionContext,
  packageInfos: PackageInfo[],
  newVersion: string,
  description: string = ""
): Promise<{ success: number; failed: string[] }> {
  const results = { success: 0, failed: [] as string[] };

  for (const packageInfo of packageInfos) {
    try {
      const success = await updatePackageVersion(
        extensionContext,
        packageInfo.path,
        newVersion,
        description
      );

      if (success) {
        results.success++;
        logger.log(
          `Updated ${packageInfo.relativePath} to version ${newVersion}`
        );
      } else {
        results.failed.push(packageInfo.relativePath);
        logger.error(`Failed to update ${packageInfo.relativePath}`);
      }
    } catch (error) {
      results.failed.push(packageInfo.relativePath);
      logger.error(`Error updating ${packageInfo.relativePath}:`, error);
    }
  }

  return results;
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
    vscode.window.showInformationMessage("Version update canceled.");
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
 * Enhanced version update wizard with monorepo support
 */
export async function runEnhancedVersionUpdateWizard(
  context: vscode.ExtensionContext
): Promise<void> {
  if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
    vscode.window.showErrorMessage("No workspace folder is open.");
    return;
  }

  const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const config = vscode.workspace.getConfiguration("prismflow");
  const enableMonorepoSupport = config.get("version.enableMonorepoSupport", false);
  
  // Find all package.json files
  const packageInfos = await findAllPackageJsonFiles(workspaceRoot);
  
  if (packageInfos.length === 0) {
    vscode.window.showErrorMessage("No package.json files found in the workspace.");
    return;
  }

  logger.log(`Found ${packageInfos.length} package.json files in workspace`);
  
  // If monorepo support is disabled or only one package.json, use single file mode
  if (!enableMonorepoSupport || packageInfos.length === 1) {
    await runVersionUpdateWizard(context);
    return;
  }

  // Show package.json files found
  const packageList = packageInfos.map(pkg => 
    `  • ${pkg.relativePath} (${pkg.name}@${pkg.version})`
  ).join('\n');
  
  const choice = await vscode.window.showInformationMessage(
    `Found ${packageInfos.length} package.json files:\n\n${packageList}\n\nUpdate all packages to the same version?`,
    { modal: true },
    "Update All",
    "Select Single File",
    "Cancel"
  );

  if (!choice || choice === "Cancel") {
    return;
  }

  if (choice === "Select Single File") {
    await runVersionUpdateWizard(context);
    return;
  }

  // Get the root package.json version as base
  const rootPackage = packageInfos.find(pkg => pkg.relativePath === 'package.json');
  const currentVersion = rootPackage ? rootPackage.version : packageInfos[0].version;

  // Ask which type of update to perform
  const versionUpdateType = await vscode.window.showQuickPick(
    [
      {
        label: "Major Version Update",
        description: `Increment first number (x.0.0)`,
        detail: `Current: ${currentVersion} → New: ${semver.inc(currentVersion, "major")}`,
      },
      {
        label: "Minor Version Update", 
        description: `Increment second number (0.x.0)`,
        detail: `Current: ${currentVersion} → New: ${semver.inc(currentVersion, "minor")}`,
      },
      {
        label: "Patch Version Update",
        description: `Increment third number (0.0.x)`,
        detail: `Current: ${currentVersion} → New: ${semver.inc(currentVersion, "patch")}`,
      },
      {
        label: "Prerelease Version Update",
        description: `Add prerelease suffix (0.0.0-alpha.x)`,
        detail: `Current: ${currentVersion} → New: ${semver.inc(currentVersion, "prerelease")}`,
      },
      {
        label: "Custom Version",
        description: "Enter a custom version number",
        detail: "You will be prompted to enter a custom version",
      },
    ],
    {
      placeHolder: "Select the type of version update to perform",
    }
  );

  if (!versionUpdateType) {
    return;
  }

  let newVersion = "";
  
  if (versionUpdateType.label === "Custom Version") {
    const customVersion = await vscode.window.showInputBox({
      prompt: "Enter the new version number",
      placeHolder: "e.g., 1.2.3",
      validateInput: (value) => {
        if (!value || !semver.valid(value)) {
          return "Please enter a valid semantic version (e.g., 1.2.3)";
        }
        return null;
      },
    });

    if (!customVersion) {
      return;
    }

    newVersion = customVersion;
  } else {
    const updateType = versionUpdateType.label.toLowerCase().split(" ")[0] as 
      | "major" | "minor" | "patch" | "prerelease";
    newVersion = semver.inc(currentVersion, updateType) || "";
  }

  if (!newVersion) {
    vscode.window.showErrorMessage("Invalid version number.");
    return;
  }

  // Ask for description
  const description = await vscode.window.showInputBox({
    prompt: "Enter a description for this version update (optional)",
    placeHolder: "e.g., Bug fixes and performance improvements",
  });

  // Show confirmation
  const confirmationMessage = `Update all ${packageInfos.length} packages to version ${newVersion}?\n\nPackages to update:\n${packageList}`;
  
  const confirmed = await vscode.window.showWarningMessage(
    confirmationMessage,
    { modal: true },
    "Update All",
    "Cancel"
  );

  if (confirmed !== "Update All") {
    return;
  }

  // Update all packages
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Updating package versions...",
      cancellable: false,
    },
    async (progress) => {
      progress.report({ increment: 0, message: "Starting updates..." });
      
      const results = await updateMultiplePackageVersions(
        context,
        packageInfos,
        newVersion,
        description || ""
      );

      progress.report({ increment: 100, message: "Updates complete!" });
      
      if (results.success === packageInfos.length) {
        vscode.window.showInformationMessage(
          `✅ Successfully updated all ${results.success} packages to version ${newVersion}!`
        );
      } else if (results.success > 0) {
        vscode.window.showWarningMessage(
          `⚠️ Updated ${results.success} packages successfully, but ${results.failed.length} failed:\n${results.failed.join(', ')}`
        );
      } else {
        vscode.window.showErrorMessage(
          `❌ Failed to update any packages. Check the PrismFlow logs for details.`
        );
      }
    }
  );
}

/**
 * Register version management commands
 */
export function registerVersionCommands(
  context: vscode.ExtensionContext
): void {
  // Register the update version command with enhanced monorepo support
  context.subscriptions.push(
    vscode.commands.registerCommand("prismflow.updateVersion", () => {
      runEnhancedVersionUpdateWizard(context);
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
