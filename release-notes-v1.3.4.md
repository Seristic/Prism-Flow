# PrismFlow v1.3.4 Release Notes

**Release Date:** July 5, 2025  
**Type:** Patch Release  
**Focus:** Workspace-Specific GitHub Webhooks

---

## 🏗️ GitHub Webhooks Are Now Workspace-Specific

**Major Enhancement**: GitHub webhook configurations are now workspace-specific rather than global, matching the Discord webhook behavior from v1.3.2.

### What This Means For You

- **🔒 Workspace Isolation**: Each VS Code workspace now has its own independent GitHub webhook configurations
- **🔄 No More Conflicts**: Different projects can have different GitHub webhook settings without interfering with each other
- **⚡ Better Organization**: Webhook configurations stay with the project they belong to

### Automatic Migration

When you open a workspace with existing global GitHub webhooks:

1. **🔍 Detection**: PrismFlow automatically detects existing global webhooks
2. **❓ Choice**: You'll be prompted to migrate them to the current workspace or start fresh
3. **✅ Migration**: If you choose to migrate, webhooks are moved to workspace storage
4. **🧹 Cleanup**: Global webhooks are cleared to prevent repeated prompts

---

## 🛠️ Technical Improvements

### Fixed Issues

- **Fixed `removeGitHubWebhook` Function**: Resolved parameter mismatch that could cause errors
- **Unified Webhook Management**: Both `githubSetupManager` and `githubWebhookManager` now consistently use workspace state
- **Better Error Handling**: Improved reliability of webhook configuration operations

### Enhanced Architecture

- **Workspace State Storage**: All GitHub webhook data now stored per-workspace
- **Migration System**: Automatic backward compatibility for existing users
- **Consistent API**: Unified approach between Discord and GitHub webhook management

---

## 🔄 Migration Process

### For Existing Users

If you have GitHub webhooks configured from previous versions:

1. **First Launch**: Open any workspace where you want to use your existing webhooks
2. **Migration Prompt**: Choose "Yes, use them" to migrate to this workspace
3. **Complete**: Your webhooks are now workspace-specific and ready to use

### For New Users

- Start fresh with workspace-specific configurations
- No migration needed - everything works as expected

---

## 🎯 Benefits

### Project Organization
- **🏢 Team Workflows**: Different teams can have different webhook configurations
- **🔀 Multi-Project**: Work on multiple projects without webhook conflicts
- **📁 Portable**: Webhook settings can be shared with team members via workspace settings

### Development Experience
- **🔄 Consistent Behavior**: GitHub webhooks now match Discord webhook behavior
- **🛡️ Isolation**: No accidental webhook triggering across unrelated projects
- **⚡ Quick Setup**: Per-project webhook configuration

---

## 📋 What's Unchanged

- **✅ All Existing Features**: All GitHub webhook functionality remains the same
- **✅ Setup Process**: GitHub webhook setup wizard works exactly as before
- **✅ Event Types**: All supported GitHub events (push, release, pull_request, etc.) still work
- **✅ Discord Integration**: Release notifications and webhook testing unchanged

---

## 🚀 Getting Started

### New GitHub Webhook Setup

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run `PrismFlow: Setup GitHub Webhook`
3. Follow the setup wizard
4. Your webhook is now workspace-specific!

### Managing Existing Webhooks

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run `PrismFlow: Manage GitHub Webhooks`
3. View, edit, or delete workspace-specific webhooks

---

## 🔗 Related Features

- **Discord Webhooks**: Also workspace-specific (since v1.3.2)
- **Git Monitoring**: Automatic release detection (v1.3.3)
- **Dashboard Integration**: All webhook features accessible via PrismFlow dashboard

---

## 🛠️ For Developers

### Storage Changes

```typescript
// Before: Global storage
context.globalState.get("github-webhook-configs")

// After: Workspace storage
context.workspaceState.get("github-webhook-configs")
```

### Migration Function

Automatic migration handles the transition transparently with user consent.

---

## 📞 Support

If you encounter any issues with the migration or workspace-specific webhooks:

1. **Check Console**: Look for migration-related messages in the VS Code output
2. **Restart VS Code**: Sometimes helps with state transitions
3. **Re-setup**: You can always set up new webhooks if migration has issues
4. **Report Issues**: [GitHub Issues](https://github.com/Seristic/Prism-Flow/issues)

---

**Enjoy workspace-specific GitHub webhooks! 🎉**
