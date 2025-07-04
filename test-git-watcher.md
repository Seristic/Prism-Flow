# GitWatcher Test Plan

## What was implemented:

1. **GitWatcher Class** (`src/gitWatcher.ts`):

   - Monitors `.git/refs` directory for changes (detects pushes, pulls, etc.)
   - Monitors `.git/HEAD` file for changes (detects checkouts, merges, etc.)
   - Automatically triggers Discord notifications for external Git pushes
   - Detects release tags and sends release notifications
   - Polls every 30 seconds as a fallback mechanism

2. **Integration with Extension** (`src/extension.ts`):

   - GitWatcher is initialized in the `activate()` function
   - Disposed properly in the `deactivate()` function
   - Added test command `prismflow.testGitWatcher` for debugging

3. **Features**:
   - **Automatic Detection**: Detects commits made outside the extension (Copilot, CLI, etc.)
   - **Discord Notifications**: Sends Discord webhooks for pushes and releases
   - **Repository URL Detection**: Automatically gets the repository URL from git remote
   - **Release Tag Detection**: Monitors for version tags (v1.2.3 pattern)

## How it solves the issue:

**BEFORE**: Discord notifications only sent when using extension commands
**AFTER**: Discord notifications automatically sent for ANY Git push/commit, regardless of how it was made

## Test Steps:

1. **Setup**: Ensure Discord webhooks are configured for "pushes" events
2. **Test External Push**: Make a commit using VS Code Copilot or command line
3. **Verify**: Check that Discord notification is sent automatically
4. **Test Release Tags**: Create a version tag (e.g., `git tag v1.2.9`)
5. **Verify**: Check that Discord release notification is sent

## Manual Test Command:

Use the command `PrismFlow: Test Git Watcher` to manually test the functionality.

## File System Watching:

The GitWatcher monitors these files/directories:

- `.git/refs/**` - Detects branch updates, new commits
- `.git/HEAD` - Detects branch switches, merges
- 30-second polling - Fallback for any missed file system events

This ensures that ANY change to the Git repository state is detected and triggers appropriate Discord notifications.
