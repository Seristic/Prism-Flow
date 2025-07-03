# PrismFlow QA Testing Checklist

## 🚨 MANDATORY PRE-RELEASE TESTING

**⚠️ NEVER RELEASE WITHOUT COMPLETING THIS CHECKLIST**

This checklist was created after v1.2.3 to prevent malware-like behavior and ensure extension quality. Every item must be tested and verified before any public release.

---

## 1. 🔧 **Core Extension Functionality**

### Basic Operations
- [ ] Extension activates without errors
- [ ] All commands appear in Command Palette
- [ ] Extension settings are accessible and functional
- [ ] No console errors during normal operation
- [ ] Extension deactivates cleanly

### Highlighting Features
- [ ] Syntax highlighting works on JSON files
- [ ] Syntax highlighting works on JavaScript files
- [ ] Syntax highlighting works on TypeScript files
- [ ] Active block highlighting responds to cursor movement
- [ ] Error highlighting shows unmatched braces correctly
- [ ] Block labels display correctly with different format options

### Status Bar Integration
- [ ] Status bar shows current block information
- [ ] Status bar updates when cursor moves
- [ ] Status bar tooltip shows detailed information
- [ ] Status bar hides when no active block

---

## 2. 📁 **File Operations & Workspace Behavior**

### File Creation (CRITICAL - This caused the malware issue)
- [ ] Create new file manually - NO automatic modifications
- [ ] Create new file via VS Code File Explorer - NO automatic modifications
- [ ] Create new file via terminal/CLI - NO automatic modifications
- [ ] Extension does NOT intercept file creation events
- [ ] Extension does NOT automatically open created files
- [ ] Extension does NOT automatically modify created files

### npm/Package Manager Operations (CRITICAL)
- [ ] Run `npm install` - Extension does NOT interfere
- [ ] Run `npm update` - Extension does NOT interfere
- [ ] Run `yarn install` - Extension does NOT interfere
- [ ] Run `pnpm install` - Extension does NOT interfere
- [ ] Package files are NOT opened automatically
- [ ] Package files are NOT modified automatically
- [ ] NO file flooding during package operations
- [ ] NO forced save prompts during package operations

### Workspace Operations
- [ ] Opening workspace folders works normally
- [ ] Switching between workspaces works normally
- [ ] File tree operations work normally
- [ ] Git operations work normally
- [ ] Search operations work normally

---

## 3. 🏗️ **Monorepo Support**

### Configuration
- [ ] `prismflow.version.enableMonorepoSupport` setting works
- [ ] `prismflow.version.monorepoExcludePatterns` setting works
- [ ] Settings can be enabled/disabled without restart
- [ ] Default exclude patterns work correctly

### Detection & Scanning
- [ ] Correctly finds all package.json files in workspace
- [ ] Respects exclude patterns (node_modules, .git, etc.)
- [ ] Handles workspaces with no package.json files
- [ ] Handles workspaces with single package.json file
- [ ] Handles workspaces with multiple package.json files

### Version Updates
- [ ] Can update all packages to same version
- [ ] Can select individual packages to update
- [ ] Version increment options work (major, minor, patch)
- [ ] Confirmation dialog works properly
- [ ] Updates are applied correctly to all selected packages
- [ ] CHANGELOG.md files are updated correctly
- [ ] Process can be cancelled safely

---

## 4. 🔔 **Discord Integration**

### Basic Webhook Setup
- [ ] Discord webhook setup wizard works
- [ ] Webhook URLs are validated correctly
- [ ] Webhook secrets are generated securely
- [ ] Webhook configurations are saved correctly
- [ ] Multiple webhooks can be configured

### Notification Behavior
- [ ] Single package updates send notifications correctly
- [ ] Monorepo updates send ONLY ONE notification (not per package)
- [ ] `singleWebhookOnly` parameter works correctly
- [ ] Notifications go to correct webhook (primary for monorepo)
- [ ] Notification messages are formatted correctly
- [ ] Failed notifications show appropriate error messages

### Edge Cases
- [ ] Notifications work with no Discord webhooks configured
- [ ] Notifications work with invalid webhook URLs
- [ ] Notifications work with network issues
- [ ] Notifications don't block version update process

---

## 5. 📊 **Dashboard & UI**

### Dashboard Functionality
- [ ] Dashboard opens without errors
- [ ] All dashboard commands work correctly
- [ ] Dashboard shows current extension status
- [ ] Dashboard handles errors gracefully
- [ ] Dashboard closes cleanly

### Command Palette Integration
- [ ] All commands appear in Command Palette
- [ ] Command descriptions are clear and accurate
- [ ] Commands execute without errors
- [ ] Commands provide appropriate feedback

### User Interface
- [ ] Settings UI is accessible and functional
- [ ] Error messages are clear and helpful
- [ ] Progress indicators work correctly
- [ ] Confirmation dialogs work correctly

---

## 6. 🔄 **Version Management**

### Single Package Mode
- [ ] Can update single package.json files
- [ ] Version increments work correctly
- [ ] Semantic versioning is respected
- [ ] CHANGELOG.md is updated correctly
- [ ] Discord notifications work correctly

### Edge Cases
- [ ] Handles invalid package.json files gracefully
- [ ] Handles missing package.json files gracefully
- [ ] Handles permission errors gracefully
- [ ] Handles corrupted files gracefully
- [ ] Handles very large workspaces efficiently

---

## 7. 🧪 **Performance & Stability**

### Memory Usage
- [ ] Extension doesn't cause memory leaks
- [ ] Extension doesn't consume excessive memory
- [ ] Extension cleans up resources properly
- [ ] Extension handles large files efficiently

### Performance
- [ ] Extension activates quickly
- [ ] Highlighting updates respond quickly
- [ ] File operations don't block UI
- [ ] Workspace scanning is efficient

### Error Handling
- [ ] Extension handles errors gracefully
- [ ] Error messages are helpful and actionable
- [ ] Extension doesn't crash VS Code
- [ ] Extension logs errors appropriately

---

## 8. 🔍 **Edge Cases & Scenarios**

### Unusual Workspaces
- [ ] Works with very large workspaces (1000+ files)
- [ ] Works with nested workspaces
- [ ] Works with symlinked files/folders
- [ ] Works with read-only files
- [ ] Works with network drives

### File Types
- [ ] Works with various JSON file types
- [ ] Works with JavaScript variants (ES6, JSX, etc.)
- [ ] Works with TypeScript variants (TSX, etc.)
- [ ] Handles binary files appropriately
- [ ] Handles very large files appropriately

### Network & Connectivity
- [ ] Works offline
- [ ] Handles network timeouts gracefully
- [ ] Handles slow network connections
- [ ] Handles proxy configurations

---

## 9. 📋 **Pre-Release Final Checks**

### Code Quality
- [ ] TypeScript compilation succeeds with no errors
- [ ] All linting passes
- [ ] No console warnings during normal operation
- [ ] No deprecated API usage
- [ ] Code follows project conventions

### Documentation
- [ ] README.md is updated with latest features
- [ ] CHANGELOG.md includes all changes
- [ ] Configuration documentation is accurate
- [ ] Examples work correctly
- [ ] Troubleshooting guides are current

### Package Validation
- [ ] Extension packages successfully with `vsce package`
- [ ] Package size is reasonable (< 10MB)
- [ ] All necessary files are included
- [ ] No unnecessary files are included
- [ ] Extension metadata is correct

---

## 10. 🚀 **Release Process**

### Final Verification
- [ ] Install packaged extension in clean VS Code instance
- [ ] Test all major features in clean environment
- [ ] Verify no conflicts with other extensions
- [ ] Test uninstall/reinstall process
- [ ] Verify extension store metadata

### Post-Release Monitoring
- [ ] Monitor for error reports
- [ ] Monitor extension performance metrics
- [ ] Monitor user feedback
- [ ] Monitor download/usage statistics
- [ ] Prepare hotfix plan if needed

---

## 🔥 **CRITICAL FAILURE INDICATORS**

**STOP RELEASE IMMEDIATELY IF ANY OF THESE OCCUR:**

- ❌ Extension automatically opens files without user action
- ❌ Extension automatically modifies files without user action
- ❌ Extension interferes with npm/package manager operations
- ❌ Extension causes file flooding or forced saves
- ❌ Extension consumes excessive memory or CPU
- ❌ Extension crashes VS Code
- ❌ Extension blocks other VS Code operations
- ❌ Extension exhibits malware-like behavior

---

## 📝 **Testing Notes Template**

```
## Test Session: [Date]
**Version:** [Version Number]
**Tester:** [Name]
**Environment:** [OS, VS Code Version]

### Test Results:
- [ ] All core functionality: PASS/FAIL
- [ ] File operations: PASS/FAIL  
- [ ] npm operations: PASS/FAIL
- [ ] Monorepo support: PASS/FAIL
- [ ] Discord integration: PASS/FAIL
- [ ] Performance: PASS/FAIL

### Issues Found:
1. [Issue description]
2. [Issue description]

### Notes:
[Additional observations]

### Recommendation:
[ ] READY FOR RELEASE
[ ] NEEDS FIXES - DO NOT RELEASE
```

---

## 📚 **Additional Resources**

- [VS Code Extension Testing Guide](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Extension Performance Best Practices](https://code.visualstudio.com/api/advanced-topics/extension-performance)
- [PrismFlow Issue Tracker](https://github.com/seristic/prism-flow/issues)

---

**Remember: Quality over speed. It's better to delay a release than to release broken functionality.**
