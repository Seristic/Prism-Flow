# 🐙 GitHub Webhook Integration Guide

PrismFlow's GitHub integration provides seamless webhook setup and management for automating notifications and workflows between your GitHub repositories and Discord channels.

## 🚀 Quick Start

1. **GitHub CLI Setup**: Install and authenticate GitHub CLI
2. **Repository Setup**: Ensure you're in a Git repository with GitHub remote
3. **Webhook Configuration**: Use PrismFlow to set up webhooks automatically
4. **Test Integration**: Verify webhooks are working with test events

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [GitHub CLI Setup](#github-cli-setup)
- [Webhook Setup](#webhook-setup)
- [GitHub Release Manager](#github-release-manager)
- [Webhook Management](#webhook-management)
- [Troubleshooting](#troubleshooting)
- [Security & Best Practices](#security--best-practices)

## 📋 Prerequisites

### Required Tools

1. **Git**: Repository must be a Git repository
2. **GitHub Remote**: Repository must have GitHub origin remote
3. **GitHub CLI** (recommended): For full automation features
4. **Network Access**: Ability to connect to GitHub APIs

### Repository Requirements

- Git repository with GitHub remote origin
- Push access to the repository
- Admin access for webhook creation (repository settings)
- Valid GitHub authentication

## 🔧 GitHub CLI Setup

### Installation

#### Windows

```powershell
# Using winget
winget install --id GitHub.cli

# Using Chocolatey
choco install gh

# Using Scoop
scoop install gh
```

#### macOS

```bash
# Using Homebrew
brew install gh

# Using MacPorts
sudo port install gh
```

#### Linux

```bash
# Ubuntu/Debian
sudo apt install gh

# CentOS/RHEL/Fedora
sudo dnf install gh

# Arch Linux
sudo pacman -S github-cli
```

### Authentication

1. **Login to GitHub**:

   ```bash
   gh auth login
   ```

2. **Choose authentication method**:

   - Login with a web browser (recommended)
   - Paste authentication token

3. **Select preferences**:

   - Choose HTTPS or SSH for Git operations
   - Select default Git protocol

4. **Verify authentication**:
   ```bash
   gh auth status
   ```

### Repository Setup

1. **Clone or navigate to repository**:

   ```bash
   git clone https://github.com/username/repository.git
   cd repository
   ```

2. **Verify GitHub remote**:

   ```bash
   git remote -v
   ```

3. **Test GitHub CLI access**:
   ```bash
   gh repo view
   ```

## ⚙️ Webhook Setup

### Automatic Setup (Recommended)

1. **Via Dashboard**:

   - Open PrismFlow Dashboard: `Ctrl+Shift+P` → "PrismFlow: Show Dashboard"
   - Click **"⚙️ Setup GitHub Webhook"** in GitHub Integration section

2. **Via Command Palette**:
   ```
   Ctrl+Shift+P → "PrismFlow: Setup GitHub Webhook"
   ```

### Setup Process

The setup wizard will guide you through:

1. **Repository Verification**:

   - Checks if you're in a Git repository
   - Verifies GitHub remote origin
   - Confirms GitHub CLI authentication

2. **Webhook Configuration**:

   - Discord webhook URL input
   - Event type selection
   - Webhook name assignment
   - Secret generation (optional)

3. **GitHub Webhook Creation**:
   - Automatic webhook creation via GitHub CLI
   - Permission verification
   - Connection testing

### Manual Setup (Advanced)

If automatic setup fails, you can manually configure webhooks:

1. **In GitHub Repository**:

   - Go to repository Settings
   - Click "Webhooks" in left sidebar
   - Click "Add webhook"

2. **Webhook Configuration**:

   - **Payload URL**: Your Discord webhook URL
   - **Content type**: `application/json`
   - **Secret**: Generate secure secret (optional)
   - **Events**: Select events to trigger webhook

3. **PrismFlow Configuration**:
   - Add webhook details to PrismFlow
   - Test webhook connection
   - Configure event handling

## 🚀 GitHub Release Manager

### Release Creation Workflow

1. **Open Release Manager**:

   ```
   Ctrl+Shift+P → "PrismFlow: GitHub Release Manager"
   ```

2. **Release Configuration**:

   - **Tag Name**: Version tag (e.g., v1.2.5)
   - **Release Name**: Human-readable release name
   - **Description**: Release notes and changelog
   - **Target Branch**: Branch to create release from
   - **Release Type**: Draft, prerelease, or final release

3. **Automatic Process**:
   - Git tag creation
   - GitHub release creation
   - Asset upload (if configured)
   - Discord notification (if webhooks configured)

### Release Features

#### GitHub CLI Integration

- **Automatic Release Creation**: Uses `gh release create` for full automation
- **Release Notes Generation**: Option to auto-generate release notes
- **Asset Management**: Upload build artifacts automatically
- **Branch Targeting**: Create releases from specific branches/commits

#### Fallback Support

- **Git-only Mode**: Creates tags and provides GitHub URLs if CLI unavailable
- **Manual Completion**: Guides user through manual release creation
- **Error Recovery**: Clear instructions for completing failed releases

#### Discord Integration

- **Automatic Notifications**: Sends Discord webhook after successful release
- **Manual Trigger**: Option to manually send release notifications
- **Error Handling**: Release creation continues even if Discord notification fails

### Release Best Practices

1. **Version Naming**: Use semantic versioning (v1.2.3)
2. **Release Notes**: Include clear changelog and breaking changes
3. **Testing**: Test releases in development environment first
4. **Asset Preparation**: Ensure build artifacts are ready before release
5. **Communication**: Notify team before major releases

## 🔧 Webhook Management

### Managing Existing Webhooks

1. **Via Dashboard**:

   - Open PrismFlow Dashboard
   - Click **"🔧 Manage GitHub Webhooks"**

2. **Via Command Palette**:
   ```
   Ctrl+Shift+P → "PrismFlow: Manage GitHub Webhooks"
   ```

### Webhook Operations

#### View Webhooks

- List all configured webhooks
- Check webhook status and configuration
- View event subscriptions
- Monitor webhook activity

#### Edit Webhooks

- Update webhook URLs
- Modify event subscriptions
- Change webhook settings
- Update security configuration

#### Delete Webhooks

- Remove unused webhooks
- Clean up old configurations
- Confirmation prompts prevent accidents
- Immediate effect on event handling

### Webhook Testing

#### Test Commands

```bash
# Test release webhook
PrismFlow: Simulate GitHub Release

# Test push webhook
PrismFlow: Simulate GitHub Push

# Manual release notification
PrismFlow: Send Latest Release Webhook
```

#### Verification Steps

1. **Connection Test**: Verify webhook URL accessibility
2. **Event Test**: Send test events to webhook
3. **Response Validation**: Confirm proper event handling
4. **Error Testing**: Verify error handling and recovery

## 🔍 Troubleshooting

### Common Issues

#### GitHub CLI Not Found

**Symptoms**: Commands fail with "gh not found" or similar
**Solutions**:

1. Install GitHub CLI using instructions above
2. Restart VS Code after installation
3. Verify CLI is in system PATH
4. Try manual authentication: `gh auth login`

#### Authentication Failed

**Symptoms**: "authentication required" or permission errors
**Solutions**:

1. Re-authenticate: `gh auth login`
2. Check token permissions
3. Verify repository access
4. Try different authentication method

#### Repository Not Found

**Symptoms**: "repository not found" or "not a git repository"
**Solutions**:

1. Ensure you're in correct directory
2. Verify GitHub remote: `git remote -v`
3. Check repository permissions
4. Re-clone repository if needed

#### Webhook Creation Failed

**Symptoms**: Webhook setup fails or doesn't appear in GitHub
**Solutions**:

1. Check repository admin permissions
2. Verify GitHub CLI authentication
3. Try manual webhook creation
4. Check network connectivity

### Error Messages

#### "Not a Git repository"

- **Cause**: Command run outside Git repository
- **Solution**: Navigate to Git repository root
- **Check**: Run `git status` to verify

#### "GitHub CLI not authenticated"

- **Cause**: GitHub CLI not logged in
- **Solution**: Run `gh auth login`
- **Verify**: Run `gh auth status`

#### "Insufficient permissions"

- **Cause**: User lacks repository admin access
- **Solution**: Contact repository admin or use personal repository
- **Alternative**: Use manual webhook setup

#### "Network connection failed"

- **Cause**: Network issues or firewall blocking
- **Solution**: Check internet connection, try different network
- **Corporate**: Contact IT about GitHub access

### Debug Information

#### Checking GitHub CLI Status

```bash
# Check authentication
gh auth status

# Check repository information
gh repo view

# List existing webhooks
gh api repos/:owner/:repo/hooks
```

#### Verification Commands

```bash
# Verify Git repository
git status

# Check remote repositories
git remote -v

# Test GitHub connectivity
gh api user
```

## 🛡️ Security & Best Practices

### Webhook Security

#### Secure Configuration

1. **Use HTTPS**: Always use HTTPS webhook URLs
2. **Secret Tokens**: Configure webhook secrets for verification
3. **Minimal Permissions**: Use least-privilege access principles
4. **Regular Rotation**: Rotate webhook secrets periodically

#### Access Control

1. **Repository Permissions**: Limit who can modify webhooks
2. **Team Access**: Control team member access to webhook settings
3. **Audit Logs**: Monitor webhook configuration changes
4. **Backup Configuration**: Document webhook settings

### Development Practices

#### Testing

1. **Development Webhooks**: Use separate webhooks for testing
2. **Staging Environment**: Test releases in staging first
3. **Event Filtering**: Only subscribe to necessary events
4. **Error Monitoring**: Monitor webhook failures and errors

#### Maintenance

1. **Regular Updates**: Keep GitHub CLI and PrismFlow updated
2. **Cleanup**: Remove unused webhooks and configurations
3. **Documentation**: Document webhook purposes and configurations
4. **Monitoring**: Monitor webhook performance and reliability

### Privacy Considerations

#### Data Sharing

**What Gets Shared**:

- Repository names and URLs
- Release information and tags
- Commit messages and metadata
- User information associated with events

**What Doesn't Get Shared**:

- Repository source code
- Private repository contents (unless explicitly configured)
- User credentials or tokens
- Local development environment details

#### Best Practices

1. **Review Webhook Data**: Understand what data is shared
2. **Public Repository Awareness**: Consider public visibility
3. **Sensitive Information**: Avoid sensitive data in commit messages
4. **Team Communication**: Inform team about webhook configurations

## 📊 Integration Examples

### Release Workflow

```bash
# 1. Prepare release
git tag v1.2.5
git push origin v1.2.5

# 2. Create GitHub release (automatic via PrismFlow)
PrismFlow: GitHub Release Manager

# 3. Discord notification sent automatically
# 4. Manual notification if needed
PrismFlow: Send Latest Release Webhook
```

### Development Workflow

```bash
# 1. Regular development
git commit -m "Add new feature"
git push origin main

# 2. Webhook triggers Discord notification
# 3. Team receives update in Discord channel
```

## 🔗 Related Documentation

- **[Discord Integration](Discord-Integration.md)** - Discord webhook setup and management
- **[Version Management](Version-Management.md)** - Version control and release workflows
- **[Contributing Guide](Contributing.md)** - Development and contribution guidelines
- **[Home](Home.md)** - Main documentation hub

## 💡 Tips & Advanced Usage

### Automation Tips

1. **CI/CD Integration**: Combine with GitHub Actions for full automation
2. **Release Scripts**: Create scripts for consistent release processes
3. **Multi-Repository**: Use consistent webhook patterns across repositories
4. **Event Filtering**: Optimize webhook events for your workflow

### Team Collaboration

1. **Shared Configuration**: Document webhook settings for team
2. **Role-Based Access**: Use GitHub teams for webhook management
3. **Notification Channels**: Organize Discord channels by event type
4. **Release Coordination**: Use webhooks for release communication

### Monitoring & Maintenance

1. **Webhook Health**: Monitor webhook delivery success rates
2. **Performance Tracking**: Track webhook response times
3. **Error Alerting**: Set up alerts for webhook failures
4. **Regular Audits**: Review webhook configurations periodically

---

**Ready to integrate GitHub with Discord? Start with the PrismFlow Dashboard and click "⚙️ Setup GitHub Webhook"!** 🚀
