# PrismFlow

**Visualize Code Structure • Manage Monorepos • Automate Workflows**

Code with Clarity and Flow. Keep your repositories clean effortlessly.

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/Seristic.prismflow)](https://marketplace.visualstudio.com/items?itemName=Seristic.prismflow)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/Seristic.prismflow)](https://marketplace.visualstudio.com/items?itemName=Seristic.prismflow)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/Seristic.prismflow)](https://marketplace.visualstudio.com/items?itemName=Seristic.prismflow)
[![License](https://img.shields.io/badge/license-SOLACE-orange)](./LICENSE.md)

## ✨ Description

**PrismFlow** is an accessibility-focused VS Code extension designed to revolutionize how you understand and navigate your codebase, while ensuring your Git repositories remain clean and focused.

This extension features a **unified dashboard interface** that centralizes all functionality, intelligent code block highlighting, automated repository management, and comprehensive GitHub integration including a full release management system.

## 🎯 Latest Updates

### 🚨 **Version 1.2.3 - Critical Security Fix**

- **RESOLVED**: Malware-like behavior where extension interfered with npm operations
- **FIXED**: Extension no longer intercepts or modifies files during package installations
- **IMPROVED**: Enhanced QA testing process to prevent similar issues
- **STATUS**: All core features remain fully functional and safe

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
- **💬 Discord Integration:** Get notifications for GitHub events
- **🐙 GitHub Webhook Setup:** Simple webhook configuration with secure secrets
- **🏷️ Version Management:** Update versions and maintain changelogs with monorepo support

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
