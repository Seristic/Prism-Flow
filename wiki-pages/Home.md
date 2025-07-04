# 🌈 PrismFlow Wiki

Welcome to the official PrismFlow documentation wiki! PrismFlow is a powerful VS Code extension that enhances your development workflow with intelligent code highlighting, Git integration, Discord notifications, and comprehensive project management tools.

## 🚀 Quick Links

- **[Installation & Setup](#installation--setup)**
- **[Feature Overview](#feature-overview)**
- **[Discord Integration](Discord-Integration.md)**
- **[GitHub Webhook Setup](GitHub-Webhook.md)**
- **[Version Management](Version-Management.md)**
- **[Contributing Guide](Contributing.md)**
- **[Roadmap](Roadmap.md)**

## 📦 Installation & Setup

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "PrismFlow"
4. Click Install
5. Reload VS Code

### Manual Installation

```bash
git clone https://github.com/seristic/prism-flow.git
cd prism-flow
npm install
npm run compile
```

## ✨ Feature Overview

### 🎮 Unified Dashboard

- Central command center for all PrismFlow features
- Quick access to Git, Discord, Version, and GitHub management
- One-click access to QA testing tools and documentation

### 🎨 Intelligent Code Highlighting

- **Block Highlighting**: Visualize nested code structures with rainbow colors
- **Smart Detection**: Automatically identifies code blocks, functions, and structures
- **Custom Colors**: Configurable color schemes for different languages
- **Performance Optimized**: Efficient highlighting without impacting VS Code performance

### ❤️ Liked Lines System

- **Bookmark Important Lines**: Mark significant code lines for easy reference
- **Quick Navigation**: Jump between liked lines instantly
- **Persistent Storage**: Liked lines saved across VS Code sessions
- **Export/Import**: Share liked lines between team members

### 📂 .gitignore Management

- **Auto-Generation**: Intelligent .gitignore creation for different project types
- **Template Library**: Pre-built templates for popular frameworks
- **Custom Rules**: Add project-specific ignore patterns
- **Merge Protection**: Smart merging with existing .gitignore files

### 💬 Discord Integration

- **GitHub Event Notifications**: Real-time updates for releases, pushes, and more
- **Webhook Management**: Easy setup and configuration of Discord webhooks
- **Event Filtering**: Choose which GitHub events to monitor
- **Spam Prevention**: Smart notification grouping for monorepos

### 🚀 GitHub Integration

- **Release Manager**: Complete release creation and publishing workflow
- **Webhook Setup**: Automated GitHub webhook configuration
- **Repository Management**: Easy access to GitHub features from VS Code
- **CLI Integration**: Seamless GitHub CLI integration

### 🏗️ Monorepo Support

- **Multi-Package Management**: Update multiple package.json files simultaneously
- **Version Synchronization**: Keep versions consistent across packages
- **Bulk Operations**: Apply changes across entire monorepo structure
- **Intelligent Detection**: Automatic monorepo structure recognition

### 🔍 QA & Testing Tools

- **Testing Checklist**: Comprehensive QA checklist for releases
- **Custom Checklists**: Create project-specific testing workflows
- **Developer Guides**: Built-in documentation and best practices
- **Security Testing**: Built-in security validation tools

## 🎯 Getting Started

### 1. Open the Dashboard

```
Ctrl+Shift+P → "PrismFlow: Show Dashboard"
```

### 2. Configure Your Workflow

- Set up Discord webhooks for notifications
- Configure GitHub integration
- Customize highlighting colors
- Set up version management preferences

### 3. Start Using Features

- Use `Ctrl+Shift+P` to access all PrismFlow commands
- Click dashboard buttons for quick access to features
- Explore the liked lines system for code bookmarking
- Try the intelligent block highlighting

## 📱 Command Reference

### Essential Commands

- `PrismFlow: Show Dashboard` - Open the main dashboard
- `PrismFlow: Apply Highlights` - Enable code highlighting
- `PrismFlow: Clear Highlights` - Disable code highlighting
- `PrismFlow: Like Current Line` - Bookmark current line
- `PrismFlow: Show Liked Lines` - View all bookmarked lines

### GitHub Commands

- `PrismFlow: GitHub Release Manager` - Create and manage releases
- `PrismFlow: Setup GitHub Webhook` - Configure GitHub integration
- `PrismFlow: Send Latest Release Webhook` - Manual Discord notification trigger

### Version Management

- `PrismFlow: Update Version` - Increment project version
- `PrismFlow: Show Current Version` - Display current version info

### QA & Testing

- `PrismFlow: Open QA Testing Checklist` - Access testing guidelines
- `PrismFlow: Open Developer QA Guide` - View development best practices

## 🛡️ Security & Privacy

PrismFlow is designed with security and privacy as top priorities:

- **No Telemetry**: Zero data collection or tracking
- **Local Operation**: All processing happens locally
- **User Consent**: All actions require explicit user permission
- **Open Source**: Full source code available for audit
- **Regular Security Reviews**: Comprehensive security testing for each release

## 🤝 Community & Support

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/seristic/prism-flow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/seristic/prism-flow/discussions)
- **Wiki**: This documentation wiki
- **Security**: See [SECURITY.md](../SECURITY.md) for security reports

### Contributing

- **Code Contributions**: See [Contributing Guide](Contributing.md)
- **Documentation**: Help improve this wiki
- **Bug Reports**: Report issues on GitHub
- **Feature Requests**: Suggest new features

## 📋 Troubleshooting

### Common Issues

#### Extension Not Loading

1. Check VS Code version compatibility
2. Restart VS Code
3. Disable other extensions temporarily
4. Check VS Code console for errors

#### Highlighting Not Working

1. Ensure file is supported language
2. Try `PrismFlow: Apply Highlights` command
3. Check extension settings
4. Verify no conflicting extensions

#### Discord Notifications Not Working

1. Verify webhook URL is correct
2. Check Discord server permissions
3. Test with `PrismFlow: Send Latest Release Webhook`
4. Review webhook configuration in dashboard

#### GitHub Integration Issues

1. Ensure GitHub CLI is installed and authenticated
2. Verify repository has GitHub remote
3. Check network connectivity
4. Review GitHub permissions

### Performance Tips

- Use highlighting selectively on large files
- Regularly clean up liked lines
- Keep extension updated for latest optimizations
- Monitor VS Code performance panel

## 🔄 Updates & Versioning

PrismFlow follows semantic versioning:

- **Major** (x.0.0): Breaking changes
- **Minor** (0.x.0): New features, backward compatible
- **Patch** (0.0.x): Bug fixes, security updates

### Update Notifications

- Automatic VS Code extension updates
- Release notes in changelog
- Discord notifications (if configured)
- GitHub release notifications

## 📚 Additional Resources

- **[Discord Integration Guide](Discord-Integration.md)** - Detailed Discord setup
- **[GitHub Webhook Guide](GitHub-Webhook.md)** - GitHub integration setup
- **[Version Management Guide](Version-Management.md)** - Version control workflows
- **[Contributing Guide](Contributing.md)** - How to contribute to PrismFlow
- **[Roadmap](Roadmap.md)** - Future features and development plans

---

**Welcome to PrismFlow! Start with the dashboard and explore the features that enhance your development workflow.** 🚀
