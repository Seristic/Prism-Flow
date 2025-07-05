# PrismFlow

### 🆕 **Latest Updates (v1.3.3)**

- **�️ Fixed Release Detection**: Automatic Discord notifications now work properly when Git tags are created
- **� Enhanced Tag Monitoring**: Real-time detection of release tags via dedicated file system watchers
- **� Immediate Notifications**: Discord messages sent instantly when version tags are created
- **� Better Git Integration**: Enhanced GitWatcher with separate commit and tag tracking

### 🛡️ **Enhanced Discord Integration (v1.3.1)**

- **🔄 Retry Logic**: Robust retry mechanism with exponential backoff for Discord API calls
- **🩺 Advanced Connectivity Diagnostics**: Comprehensive webhook testing with detailed troubleshooting
- **📋 Improved Error Handling**: Specific error messages and troubleshooting guidance for Discord issues
- **🧪 Testing Tools**: Enhanced `Test Discord Connectivity` command with real-time validation

### 🤖 **Automatic Git Detection (v1.3.0)**

- **📡 Real-time Monitoring**: Automatically detects external Git pushes (made via Copilot, CLI, etc.) and sends Discord notifications
- **🔄 Background Processing**: File system watchers monitor `.git/refs` and `.git/HEAD` for instant change detection
- **🏷️ Release Tag Detection**: Automatically detects version tags and sends release notifications
- **30-second polling ensures no Git operations are missed**

**Visualize Code Structure • Manage Monorepos • Automate Workflows**

Code with Clarity and Flow. Keep your repositories clean effortlessly.

### 🆕 **Latest Updates (v1.2.9)**

- **🤖 Automatic Git Detection**: GitWatcher now automatically detects external Git pushes (made via Copilot, CLI, etc.) and sends Discord notifications
- **📡 Real-time Monitoring**: File system watchers monitor `.git/refs` and `.git/HEAD` for instant change detection
- **� Background Processing**: 30-second polling ensures no Git operations are missed
- **🏷️ Release Tag Detection**: Automatically detects version tags and sends release notifications

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/Seristic.prismflow)](https://marketplace.visualstudio.com/items?itemName=Seristic.prismflow)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/Seristic.prismflow)](https://marketplace.visualstudio.com/items?itemName=Seristic.prismflow)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/Seristic.prismflow)](https://marketplace.visualstudio.com/items?itemName=Seristic.prismflow)
[![License](https://img.shields.io/badge/license-SOLACE-orange)](./LICENSE.md)

## ✨ Description

**PrismFlow** is an accessibility-focused VS Code extension designed to revolutionize how you understand and navigate your codebase, while ensuring your Git repositories remain clean and focused.

This extension features a **unified dashboard interface** that centralizes all functionality, intelligent code block highlighting, automated repository management, and comprehensive GitHub integration including a full release management system.

## 🎯 Latest Updates

### 🚨 **Security Notice - v1.2.2 Pulled Due to Malware-like Behavior**

- **⚠️ CRITICAL**: Version 1.2.2 was immediately pulled from VS Code Marketplace due to malware-like file interception
- **✅ RESOLVED**: Version 1.2.3+ completely fixes the issue with comprehensive security improvements
- **🛡️ SAFE**: Current version (1.2.4) includes enhanced QA tools and comprehensive security testing
- **📋 IMPROVED**: New QA testing process prevents similar issues in future releases

### 🆕 **Latest Updates (v1.2.5)**

- **� GitHub Integration**: Enhanced GitHub CLI integration for streamlined release management
- **� Release Automation**: Improved build and deployment pipeline with automated tagging
- **� Process Optimization**: Better asset management and release workflow
- **� Documentation**: Enhanced release procedures and deployment best practices

### 🏗️ **Monorepo Support** (v1.2.0+)

- **Multi-Package Version Management**: Automatically detect and update all package.json files in your workspace
- **Smart Detection**: Configurable exclude patterns to skip node_modules, dist folders, etc.
- **Unified Versioning**: Update all packages to the same version with one command
- **Discord Integration**: Single consolidated notification for monorepo updates (no spam)

<!-- ![PrismFlow Demo](https://raw.githubusercontent.com/seristic/prism-flow/main/images/demo.gif) -->

## 🎯 New in Version 1.0.0

### � **PrismFlow Dashboard**

- **Centralized Control**: Access all features from a single, beautifully designed interface
- **Modern UI**: VS Code-themed design with intuitive icons and responsive layout
- **Real-time Feedback**: Visual status updates and loading states for all operations
- **Organized Categories**: Features grouped by functionality for easy discovery

### �🚀 **GitHub Release Manager**

- **Complete GitHub Integration**: Create releases without leaving VS Code
- **Smart Automation**: Auto-generate changelogs and suggest version numbers
- **Professional Workflow**: Support for drafts, pre-releases, and detailed release notes
- **CLI & Git Integration**: Works with GitHub CLI or falls back to git commands

## 🚀 Key Features

- **🔮 Unified Dashboard:** Simple, reliable management interface for global commands
- **🏗️ Monorepo Support:** Update multiple package.json files simultaneously
- **🚀 GitHub Release Manager:** Complete release creation and management
- **✨ Intelligent Block Highlighting:** Visualize nested code structures
- **❤️ Liked Lines System:** Bookmark and navigate to important lines
- **📂 .gitignore Automation:** Keep repositories clean with no effort
- **💬 Discord Integration:** Complete webhook support for all GitHub events (pushes, releases, pull requests, issues, discussions, deployments) with testing and simulation tools
- **🔍 QA Testing Tools:** Quick access to testing checklist and developer guides
- **🐙 GitHub Webhook Setup:** Simple webhook configuration with secure secrets
- **🏷️ Version Management:** Update versions and maintain changelogs with monorepo support

## 📱 Discord Integration

PrismFlow provides comprehensive Discord webhook integration for all GitHub event types:

### Supported GitHub Events

- **📝 Pushes**: Commit notifications with author and repository information
- **🚀 Releases**: Automated and manual release notifications with changelog details
- **🔄 Pull Requests**: Notifications for opened, closed, merged, and updated PRs
- **🐛 Issues**: Notifications for opened, closed, updated, and assigned issues
- **💬 Discussions**: Notifications for created, answered, and updated discussions
- **🚀 Deployments**: Status notifications for success, failure, pending, and in-progress deployments

### Features

- **🔧 Easy Setup**: Use `PrismFlow: Setup Discord Webhook Integration` command
- **🧪 Testing Tools**: Built-in webhook testing and validation
- **🎮 Simulation**: Test all event types with simulation commands
- **🛡️ Error Handling**: Comprehensive error detection and reporting
- **🤖 Automatic Detection**: GitWatcher monitors for external Git pushes (Copilot, CLI, etc.) and automatically sends Discord notifications
- **📡 Real-time Monitoring**: File system watchers detect Git repository changes instantly
- **📊 Multi-webhook Support**: Configure multiple webhooks for different channels
- **🎨 Rich Embeds**: Beautiful Discord messages with colors and formatting

### Quick Setup

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run `PrismFlow: Setup Discord Webhook Integration`
3. Enter your Discord webhook URL
4. Select which GitHub events to monitor
5. Test the connection

## 🎮 Quick Start

1. **Open the Dashboard**: Use `Ctrl+Shift+P` → "PrismFlow: Show Dashboard"
2. **Global Management**: Use dashboard buttons for Git, Discord, Version, and GitHub management
3. **Editor Features**: Use `Ctrl+Shift+P` for highlighting, liked lines, and navigation commands
4. **Follow Instructions**: Dashboard shows exactly which commands are available via Command Palette

## 📚 Documentation

Visit our [Wiki](https://github.com/seristic/prism-flow/wiki) for detailed documentation:

- [Installation Guide](https://github.com/Seristic/Prism-Flow/wiki)
- [Development Roadmap](https://github.com/Seristic/Prism-Flow/wiki/Development-Roadmap#prismflow-development-roadmap)
- [Monorepo Support Guide](docs/MONOREPO-SUPPORT.md)
- [QA Testing Checklist](QA-TESTING-CHECKLIST.md)
- [Build History & Status](builds/BUILD-STATUS.md)

## 📦 Downloads & Releases

- **Latest Release**: [v1.2.8](builds/prismflow-1.2.8.vsix) - Current stable version
- **Build Archive**: See [builds/](builds/) directory for all releases
- **Build Status**: Check [builds/BUILD-STATUS.md](builds/BUILD-STATUS.md) for detailed version information
- **VS Code Marketplace**: [Official extension page](https://marketplace.visualstudio.com/items?itemName=Seristic.prismflow)

## 🛡️ Security & Quality Assurance

**PrismFlow is committed to user safety and code quality:**

- **✅ Comprehensive QA Testing**: Every release follows our [mandatory QA checklist](QA-TESTING-CHECKLIST.md)
- **✅ Non-Intrusive**: Extension does NOT automatically modify or interfere with your files
- **✅ Safe Package Operations**: npm/yarn/pnpm operations work normally without interference
- **✅ No Malware Behavior**: Extension respects user control and file integrity
- **✅ Open Source**: Full source code available for audit

### Recent Security Improvements (v1.2.3)

After identifying and resolving malware-like behavior in earlier versions, we've implemented:

- **Enhanced Testing**: Mandatory QA checklist covering all critical scenarios
- **File Safety**: Extension no longer intercepts file creation events
- **npm Compatibility**: Package manager operations work without interference
- **User Control**: All file modifications require explicit user action

**We take security seriously. If you notice any unusual behavior, please [report it immediately](https://github.com/seristic/prism-flow/issues).**

## 💻 Installation

### VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "PrismFlow"
4. Click Install

### Manual Installation

```bash
git clone https://github.com/seristic/prism-flow.git
cd prism-flow
npm install
npm run compile
```

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under The SOLACE License (Software Of Liberty And Community Equity).

See [LICENSE](LICENSE.md) for the full license text.
