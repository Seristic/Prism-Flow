# Discord Webhook Fixes - v1.2.5

## Issues Fixed

### 1. Automatic Discord Notification Missing from GitHub Release Manager

**Problem**: When creating releases through the GitHub Release Manager, Discord webhooks were not being triggered automatically.

**Root Cause**: The `GitHubReleaseManager` class was successfully creating releases but wasn't calling the Discord notification function.

**Solution**: Modified `src/githubReleaseManager.ts` to:

- Import the `notifyRelease` function from `discordManager`
- Call `notifyRelease()` after successful release creation in `handleReleaseSubmission()`
- Use `singleWebhookOnly: true` to prevent spam if multiple webhooks are configured
- Gracefully handle Discord notification failures without breaking the release process

### 2. Manual Discord Webhook Trigger Added

**Feature**: Added a manual "Send Latest Release Webhook" command for cases where automatic notifications fail or users want to re-send notifications.

**Implementation**:

- Added `sendLatestReleaseWebhook()` function to `discordManager.ts` that:
  - Attempts to get latest release info using GitHub CLI (`gh release view`)
  - Falls back to git tags if CLI unavailable
  - Allows manual input as last resort
  - Sends Discord notification with release details
- Registered new VS Code command: `prismflow.sendLatestReleaseWebhook`
- Added button to the PrismFlow Dashboard under "GitHub Integration" section
- Added command to Command Palette as "PrismFlow: Send Latest Release Webhook"

## New Features

### Dashboard Integration

- **New Button**: "📢 Send Latest Release Webhook" button in the GitHub Integration section
- **Styling**: Uses `btn-warning` class to make it visually distinct as a manual trigger
- **Placement**: Positioned between "Manage GitHub Webhooks" and "Simulate GitHub Release" for logical flow

### Command Palette Access

- Command: `PrismFlow: Send Latest Release Webhook`
- Icon: Rocket (🚀) for consistency with release-related commands
- Group: PrismFlow (appears with other extension commands)

## Usage Instructions

### For Automatic Notifications

1. Ensure Discord webhooks are configured for "releases" events
2. Use the GitHub Release Manager to create releases
3. Discord notifications will be sent automatically after successful release creation

### For Manual Notifications

1. **Via Dashboard**:

   - Open PrismFlow Dashboard (`Ctrl+Shift+P` → "PrismFlow: Show Dashboard")
   - Click "📢 Send Latest Release Webhook" in GitHub Integration section

2. **Via Command Palette**:

   - `Ctrl+Shift+P` → "PrismFlow: Send Latest Release Webhook"

3. **Automatic Detection**:
   - Extension will try to detect latest release automatically using:
     1. GitHub CLI (`gh release view`) - most accurate
     2. Git tags (`git describe --tags --abbrev=0`) - fallback
     3. Manual input - if automated methods fail

## Error Handling

### Automatic Notifications

- Discord notification failures don't prevent release creation
- Errors are logged to console and shown as VS Code error messages
- Release process continues normally even if Discord fails

### Manual Notifications

- Clear error messages for common issues (no webhooks, no git repo, etc.)
- Graceful fallbacks when GitHub CLI or git commands fail
- User-friendly prompts for manual input when automation fails

## Files Modified

1. **src/githubReleaseManager.ts**: Added Discord notification import and call
2. **src/discordManager.ts**: Added `sendLatestReleaseWebhook()` function and helper
3. **src/extension.ts**: Registered new command with Discord manager
4. **src/dashboardManager.ts**: Added callback for new webhook command
5. **src/webviews/dashboardWebview.ts**: Added interface, handler, and button for manual webhook
6. **package.json**: Added command definition and Command Palette entry

## Testing Recommendations

1. **Test Automatic Notifications**:

   - Configure Discord webhook for releases
   - Create a release using GitHub Release Manager
   - Verify Discord notification is sent

2. **Test Manual Trigger**:

   - Try manual webhook trigger with existing release
   - Test fallback scenarios (no GitHub CLI, no git tags)
   - Verify error handling for edge cases

3. **Test Error Scenarios**:
   - Try with no Discord webhooks configured
   - Try in non-git directory
   - Verify graceful error handling

## Notes

- Manual webhook trigger uses `singleWebhookOnly: true` to prevent spam
- Function gracefully handles various git repository states
- Compatible with both GitHub CLI and git-only environments
- Error messages guide users toward resolution steps
