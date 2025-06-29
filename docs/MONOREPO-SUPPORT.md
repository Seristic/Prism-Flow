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

## Fallback Behavior

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
