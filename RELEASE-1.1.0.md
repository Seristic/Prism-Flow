# PrismFlow v1.1.0 Release Notes

## 🎯 Dashboard Reliability Improvements

This minor update focuses on improving the reliability and user experience of the PrismFlow Dashboard by streamlining its functionality and fixing editor focus issues.

## ✨ What's New

### Dashboard Streamlining
- **Removed highlighting and liked lines controls** from the dashboard
- **Command Palette integration** - All editor-specific features now use Command Palette exclusively
- **Enhanced instructions** - Dashboard now shows comprehensive Command Palette guide
- **Simplified interface** - Focus on reliable global management commands only

### Bug Fixes
- **Fixed editor focus issues** that caused infinite loops with unsupported editors
- **Eliminated "Unsupported language" errors** from dashboard actions
- **Resolved conflicts** with code-runner-output and similar panels
- **Improved reliability** of all dashboard commands

## 🔧 Technical Improvements

- Simplified `dashboardManager.ts` by removing complex editor filtering logic
- Enhanced error handling and logging
- Streamlined webview architecture
- Better separation of concerns between dashboard and editor-specific features

## 💡 User Experience

### Dashboard Commands (Buttons)
- Auto-Add Gitignore Patterns
- Setup Discord Webhook
- Manage Discord Webhooks
- Update Package Version
- Show Current Version
- Create GitHub Release
- Setup GitHub Webhook
- Manage GitHub Webhooks
- Simulate GitHub Release
- Simulate GitHub Push

### Command Palette Only (Ctrl+Shift+P)
- **PrismFlow: Apply Highlights** - Apply syntax highlighting
- **PrismFlow: Clear Highlights** - Clear all highlighting
- **PrismFlow: Refresh Liked Lines** - Refresh liked lines view
- **PrismFlow: Like Current Line** - Like line at cursor
- **PrismFlow: Copy Block Path** - Copy code block path
- **PrismFlow: Navigate to Block** - Navigate to code block

## 🚀 Migration Guide

No action required! All existing functionality is preserved:

- **Dashboard users**: Continue using dashboard for management commands
- **Command Palette users**: All commands work exactly as before
- **New users**: Dashboard now provides clear guidance on where to find each feature

## 📦 Installation

- **VS Code Marketplace**: Extension will auto-update
- **Manual**: Install `prismflow-1.1.0.vsix`

## 🎉 Why This Update?

This update solves the core issue where dashboard highlighting commands were unreliable due to VS Code's editor state management. By moving editor-specific features to the Command Palette (where they belong), we've achieved:

- **100% reliable dashboard commands**
- **No more infinite loops or focus issues**
- **Clearer user expectations**
- **Better separation of concerns**

The dashboard is now a clean, reliable management interface while the Command Palette handles editor-specific features with proper context awareness.
