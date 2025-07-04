# 💬 Discord Integration Guide

PrismFlow's Discord integration provides real-time notifications for GitHub events, keeping your team informed about project activity directly in your Discord channels.

## 🚀 Quick Start

1. **Set up Discord Webhook**: Use the dashboard or command palette
2. **Configure Events**: Choose which GitHub events to monitor
3. **Test Integration**: Send a test notification to verify setup
4. **Automatic Notifications**: Receive notifications for releases, pushes, and more

## 📋 Table of Contents

- [Setting Up Discord Webhooks](#setting-up-discord-webhooks)
- [Supported GitHub Events](#supported-github-events)
- [Webhook Management](#webhook-management)
- [Manual Notifications](#manual-notifications)
- [Troubleshooting](#troubleshooting)
- [Security & Privacy](#security--privacy)

## 🔧 Setting Up Discord Webhooks

### Method 1: Dashboard (Recommended)

1. Open PrismFlow Dashboard:

   ```
   Ctrl+Shift+P → "PrismFlow: Show Dashboard"
   ```

2. Click **"⚙️ Setup Discord Webhook"** in the Discord Integration section

3. Follow the setup wizard:
   - Enter your Discord webhook URL
   - Choose a friendly name for the webhook
   - Select which GitHub events to monitor
   - Test the webhook connection

### Method 2: Command Palette

1. Open Command Palette: `Ctrl+Shift+P`
2. Run: `PrismFlow: Setup Discord Webhook Integration`
3. Follow the same setup wizard as above

### Creating a Discord Webhook URL

1. **In Discord**:

   - Go to your Discord server
   - Click on the channel where you want notifications
   - Click the gear icon (Channel Settings)
   - Go to "Integrations" → "Webhooks"
   - Click "New Webhook" or "Create Webhook"
   - Copy the webhook URL

2. **Webhook URL Format**:
   ```
   https://discord.com/api/webhooks/[ID]/[TOKEN]
   ```

## 📡 Supported GitHub Events

### Available Event Types

| Event Type        | Description             | When Triggered                                |
| ----------------- | ----------------------- | --------------------------------------------- |
| **Releases**      | New version releases    | When GitHub Release Manager creates a release |
| **Pushes**        | Code commits and pushes | When code is pushed to repository             |
| **Pull Requests** | PR activities           | PR creation, updates, merges                  |
| **Issues**        | Issue activities        | Issue creation, updates, closures             |
| **Discussions**   | Discussion activities   | New discussions, comments                     |
| **Deployments**   | Deployment events       | Deployment status changes                     |

### Event Configuration

- **Multiple Events**: Select multiple event types for comprehensive monitoring
- **Event Filtering**: Choose only the events relevant to your workflow
- **Per-Webhook Settings**: Different webhooks can monitor different events

## ⚙️ Webhook Management

### Managing Existing Webhooks

1. **Via Dashboard**:

   - Open PrismFlow Dashboard
   - Click **"🔧 Manage Discord Webhooks"**
   - View, edit, or delete existing webhooks

2. **Via Command Palette**:
   ```
   Ctrl+Shift+P → "PrismFlow: Manage Discord Webhooks"
   ```

### Webhook Operations

#### View Webhooks

- See all configured webhooks
- Check which events each webhook monitors
- View webhook names and status

#### Edit Webhooks

- Change webhook URLs
- Update event selections
- Modify webhook names
- Test webhook connections

#### Delete Webhooks

- Remove unused webhooks
- Confirmation dialog prevents accidental deletion
- Immediate effect on notifications

### Testing Webhooks

#### Automatic Testing

- **Test Button**: Available during setup and management
- **Connection Verification**: Validates webhook URL format and accessibility
- **Response Validation**: Confirms Discord server receives the test message

#### Manual Testing Commands

```
PrismFlow: Simulate GitHub Release
PrismFlow: Simulate GitHub Push
```

## 🔄 Manual Notifications

### Send Latest Release Webhook

For cases where automatic notifications fail or you want to re-send notifications:

#### Via Dashboard

1. Open PrismFlow Dashboard
2. Click **"📢 Send Latest Release Webhook"** in GitHub Integration section

#### Via Command Palette

```
Ctrl+Shift+P → "PrismFlow: Send Latest Release Webhook"
```

#### How It Works

1. **Automatic Detection**: Tries to detect latest release using:

   - GitHub CLI (`gh release view`) - most accurate
   - Git tags (`git describe --tags`) - fallback
   - Manual input - if automated methods fail

2. **Smart Notification**: Sends properly formatted Discord embed with:
   - Release name and version
   - Release URL
   - Release description
   - Release date

### Simulation Commands

#### Simulate GitHub Release

```
PrismFlow: Simulate GitHub Release
```

- Test release notifications with custom data
- Useful for testing webhook configuration
- Doesn't create actual GitHub releases

#### Simulate GitHub Push

```
PrismFlow: Simulate GitHub Push
```

- Test push notifications with custom commit data
- Verify webhook configuration for push events
- Safe testing without actual code changes

## 🔍 Troubleshooting

### Common Issues

#### Notifications Not Received

**Check Webhook Configuration**:

1. Verify webhook URL is correct
2. Ensure Discord server permissions allow webhooks
3. Check that events are properly selected
4. Test webhook connection using built-in test feature

**Check Extension Status**:

1. Ensure PrismFlow is enabled and up-to-date
2. Verify VS Code has network access
3. Check VS Code console for error messages
4. Try manual webhook trigger to isolate issues

#### Discord Permission Issues

**Bot Permissions**:

- Webhook needs "Send Messages" permission in target channel
- Channel must allow webhooks
- Server settings must allow integrations

**Troubleshooting Steps**:

1. Recreate webhook in Discord
2. Check channel permissions
3. Verify server integration settings
4. Test with different channel

#### Network Connectivity

**Common Causes**:

- Corporate firewall blocking webhooks
- VPN interference
- Network proxy issues
- Internet connectivity problems

**Solutions**:

1. Check network connectivity to discord.com
2. Try from different network
3. Configure proxy settings if needed
4. Contact network administrator if in corporate environment

### Error Messages

#### "Invalid Discord webhook URL"

- **Cause**: Malformed webhook URL
- **Solution**: Copy URL directly from Discord webhook settings
- **Check**: URL should match pattern `https://discord.com/api/webhooks/[ID]/[TOKEN]`

#### "Failed to send Discord notification"

- **Cause**: Network issues or webhook configuration problems
- **Solution**: Use manual webhook trigger to test, check network connectivity
- **Debug**: Check VS Code console for detailed error messages

#### "No Discord webhooks configured"

- **Cause**: No webhooks set up for the event type
- **Solution**: Set up webhook using dashboard or command palette
- **Note**: Different event types require separate configuration

## 🛡️ Security & Privacy

### Data Handling

**Local Storage**:

- Webhook URLs stored locally in VS Code settings
- No data sent to external services except Discord
- Webhook tokens encrypted in local storage

**Network Security**:

- HTTPS-only connections to Discord
- No telemetry or tracking
- Minimal data transmitted (only notification content)

### Best Practices

**Webhook Security**:

1. **Protect Webhook URLs**: Don't share webhook URLs publicly
2. **Regular Rotation**: Rotate webhook tokens periodically
3. **Limited Scope**: Use dedicated channels for notifications
4. **Access Control**: Limit who can modify webhooks in Discord

**Extension Security**:

1. **Keep Updated**: Use latest PrismFlow version
2. **Review Permissions**: Understand what data is shared
3. **Monitor Activity**: Watch for unexpected notifications
4. **Secure Environment**: Use in trusted development environments

### Privacy Considerations

**What Gets Shared**:

- Repository name and URL (if public)
- Release names and descriptions
- Commit messages and author names
- Timestamps and event types

**What Doesn't Get Shared**:

- Source code content
- Private repository details (unless explicitly configured)
- User personal information
- Development environment details

## 📊 Notification Examples

### Release Notification

```
🚀 New Release: v1.2.5
A new version has been released!

Release URL: https://github.com/user/repo/releases/tag/v1.2.5
Release Date: July 4, 2025, 10:30 AM
```

### Push Notification

```
📝 New Commit Pushed
Fix bug in navigation feature

Author: John Doe <john@example.com>
Repository: https://github.com/user/repo
```

### Test Notification

```
🔔 PrismFlow Test Notification
This is a test notification from PrismFlow Discord integration.

Repository: https://github.com/user/repo
```

## 🔗 Related Documentation

- **[GitHub Webhook Setup](GitHub-Webhook.md)** - GitHub integration setup
- **[Version Management](Version-Management.md)** - Release management workflows
- **[Contributing Guide](Contributing.md)** - How to contribute to PrismFlow
- **[Home](Home.md)** - Main documentation hub

## 💡 Tips & Best Practices

### Optimization Tips

1. **Event Selection**: Only monitor events relevant to your workflow
2. **Channel Organization**: Use dedicated channels for different event types
3. **Notification Timing**: Consider team time zones for notification scheduling
4. **Spam Prevention**: Use single webhook mode for monorepos

### Team Collaboration

1. **Shared Webhooks**: Use team-shared Discord channels
2. **Role Mentions**: Configure Discord to mention relevant roles
3. **Channel Threading**: Use threads for detailed discussions
4. **Integration Documentation**: Document webhook setup for team members

### Development Workflow

1. **Testing Channels**: Use separate channels for development testing
2. **Production Separation**: Different webhooks for dev/staging/production
3. **Error Monitoring**: Watch for failed webhook notifications
4. **Regular Maintenance**: Periodically review and clean up webhooks

---

**Ready to get started? Open the PrismFlow Dashboard and click "⚙️ Setup Discord Webhook" to begin!** 🚀
