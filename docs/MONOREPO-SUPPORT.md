<!-- docs\MONOREPO-SUPPORT.md -->

# PrismFlow Monorepo Support

## Overview

PrismFlow now supports monorepo projects with multiple `package.json` files. This feature allows you to update the version across all packages in your workspace simultaneously, ensuring consistency across your entire project.

## Configuration

To enable monorepo support, add this to your VS Code settings:

```json
{
  "prismflow.version.enableMonorepoSupport": true,
  "prismflow.version.monorepoExcludePatterns": [
    "node_modules/**",
    ".git/**",
    "dist/**",
    "build/**",
    "out/**",
    ".vscode/**"
  ]
}
```

### Settings Explained

- **`enableMonorepoSupport`** (boolean, default: `false`): Enables the monorepo detection and multi-package update functionality
- **`monorepoExcludePatterns`** (array, default: common exclude patterns): Directories to skip when searching for package.json files

## How It Works

1. **Detection**: When you run "PrismFlow: Update Package Version", the extension scans your workspace for all `package.json` files
2. **Filtering**: Directories matching exclude patterns are skipped (node_modules, build folders, etc.)
3. **User Choice**: If multiple packages are found, you can choose to:
   - Update all packages to the same version
   - Select a single package to update
   - Cancel the operation

## Example Workflow

Consider this project structure:

```
my-project/
├── package.json (root)
├── client/
│   └── package.json
├── server/
│   └── package.json
├── shared/
│   └── package.json
└── node_modules/ (excluded)
```

When you run the version update command:

1. **Detection**: PrismFlow finds 4 package.json files
2. **Display**: Shows you all packages with their current versions:
   ```
   Found 4 package.json files:
   • package.json (my-project@1.0.0)
   • client/package.json (my-client@1.0.0)
   • server/package.json (my-server@1.0.0)
   • shared/package.json (my-shared@1.0.0)
   ```
3. **Choice**: You choose "Update All"
4. **Version Selection**: Choose version type (major, minor, patch, etc.)
5. **Confirmation**: Confirm the operation
6. **Update**: All packages updated to the new version simultaneously

## Benefits

- **Consistency**: Ensures all packages in your monorepo have the same version
- **Efficiency**: Update multiple packages with a single command
- **Safety**: Clear confirmation before making changes
- **Flexibility**: Can still update individual packages if needed
- **Configurable**: Customize which directories to exclude
- **Single Notification**: Sends only one Discord webhook notification for the entire monorepo update (not one per package)

## Discord Integration

When updating multiple packages in monorepo mode:

- **Single Notification**: Only one Discord webhook notification is sent for the entire operation
- **Consolidated Message**: The notification includes the number of packages updated
- **Smart Detection**: Uses the root package.json repository URL for the notification
- **No Spam**: Prevents multiple notifications that would otherwise flood your Discord channel

Example notification message:

```
Monorepo version updated from 1.0.0 to 1.1.0 (3 packages updated)
```

This is much better than receiving 3 separate notifications for the same version update!

- If `enableMonorepoSupport` is `false`, works like the original single-package mode
- If only one package.json is found, automatically uses single-package mode
- If monorepo detection fails, falls back to single-package mode with file selection

## Use Cases

Perfect for:

- **Full-stack projects** with separate client/server packages
- **Microservices** with shared dependencies
- **Library projects** with multiple sub-packages
- **Workspaces** with related packages that should have synchronized versions

## Tips

1. **Start with root package**: The extension uses the root package.json version as the base for version increments
2. **Test first**: Always test version updates in a development branch
3. **Use semantic versioning**: The extension respects semver for all version operations
4. **Check changelogs**: Each package can maintain its own CHANGELOG.md file
5. **Review changes**: Always review the changes before committing

## Troubleshooting

### No packages found

- Check that `package.json` files exist in your workspace
- Verify exclude patterns aren't too broad
- Ensure workspace folder is properly opened in VS Code

### Updates fail

- Check file permissions for all package.json files
- Ensure all package.json files have valid JSON syntax
- Review the PrismFlow output logs for detailed error messages

### Performance with large projects

- Add more directories to `monorepoExcludePatterns` to skip unnecessary scanning
- Consider disabling monorepo support for very large workspaces if not needed

## Quality Assurance

PrismFlow follows a comprehensive QA testing process to ensure reliability and security:

- **🛡️ Security Testing**: All releases tested for safe file operations and npm compatibility
- **📋 QA Checklist**: Every release follows our [mandatory testing checklist](../QA-TESTING-CHECKLIST.md)
- **🔍 Developer Guide**: See our [Developer QA Guide](DEVELOPER-QA-GUIDE.md) for testing best practices
- **🚨 Safety First**: Extension is designed to never interfere with package manager operations

### Recent Security Improvements (v1.2.3+)

After resolving malware-like behavior in earlier versions, monorepo support is now:

- ✅ **Completely safe** - No interference with npm/yarn/pnpm operations
- ✅ **User-controlled** - All operations require explicit user consent
- ✅ **Thoroughly tested** - Comprehensive QA process prevents regressions
- ✅ **Well-documented** - Clear guides and security policies

**If you experience any unusual behavior, please [report it immediately](https://github.com/seristic/prism-flow/issues).**
