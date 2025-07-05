# PrismFlow v1.3.2 Release Notes

**Release Date:** July 5, 2025

## 🏗️ Workspace-Specific Discord Webhooks

This patch release fixes an important oversight in Discord webhook management by making webhooks workspace-specific instead of global.

### 🔧 What Changed

Previously, Discord webhooks were stored globally across all VS Code workspaces, which meant:

- ❌ All projects shared the same Discord webhooks
- ❌ Different repositories would send notifications to the same Discord channels
- ❌ No isolation between different projects

Now, Discord webhooks are stored per workspace, which means:

- ✅ Each project/repository can have its own Discord webhooks
- ✅ Different repositories can use different Discord channels
- ✅ Better security and organization of webhook configurations
- ✅ No accidental cross-project notifications

### 📦 Migration Support

For existing users with global webhooks, the extension now provides:

- **Automatic Detection**: Extension detects existing global webhooks during activation
- **User Prompt**: Asks if you want to migrate existing webhooks to the current workspace
- **Flexible Options**: Choose to migrate or start fresh for each workspace
- **Seamless Upgrade**: No disruption to existing functionality

### 🚀 Benefits

1. **Project Isolation**: Each project maintains its own Discord integration
2. **Better Security**: Webhook URLs are isolated per project
3. **Organized Management**: Easier to manage webhooks for different repositories
4. **Flexible Configuration**: Different notification settings per project

### 🛠️ Migration Process

When you first open a workspace after updating to v1.3.2:

1. **If you have global webhooks**: You'll see a prompt asking if you want to use them for this workspace
2. **Choose "Yes, use them"**: Migrates your existing webhooks to this workspace
3. **Choose "No, start fresh"**: Starts with a clean webhook configuration
4. **Global webhooks are cleared**: Prevents repeated prompts in other workspaces

### 📋 What This Means for You

- **New Projects**: Set up Discord webhooks as usual - they'll be workspace-specific
- **Existing Projects**: You'll be prompted to migrate or start fresh when opening each workspace
- **Multiple Projects**: Each can now have different Discord channels and notification settings
- **Team Collaboration**: Better isolation when working on multiple client projects

### 🔄 Backwards Compatibility

This release is fully backwards compatible:

- Existing webhook functionality remains unchanged
- All webhook commands work the same way
- Webhook setup process is identical
- Only the storage location has changed (global → workspace)

### 🚨 Important Notes

- **One-time migration**: The migration prompt appears only once per workspace
- **Manual setup**: If you choose not to migrate, you'll need to set up webhooks again for each workspace
- **Recommended action**: Migrate existing webhooks if they're appropriate for the current project

## 🐛 Bug Reports & Feedback

Please report any issues on our [GitHub repository](https://github.com/seristic/prism-flow/issues).

---

**Previous Updates**: Check [CHANGELOG.md](CHANGELOG.md) for the complete version history including v1.3.1's Discord enhancements and v1.3.0's automatic Git detection features.
