# Change Log

## [1.3.5] - 2025-07-05

### 🔧 Patch Release - Enhanced Discord Webhook Error Handling

#### Fixed

- **🛠️ Discord Webhook Error Debugging**: Enhanced error handling for Discord webhook failures
  - Added detailed error object logging with full error information
  - Enhanced Discord API error code detection (10015, 50013, 10003, etc.)
  - Better error message specificity for common Discord API issues
  - Improved response data parsing for Discord API validation errors

#### Added

- **🧪 Release Webhook Debug Command**: New testing command for debugging release webhook issues
  - Added `PrismFlow: Test Release Webhook (Debug)` command
  - Tests exact same payload structure as actual release notifications
  - Enhanced error logging to identify specific Discord API issues
  - Better troubleshooting guidance for webhook problems

#### Enhanced

- **⚡ Discord API Reliability**: Improved webhook sending reliability
  - Added URL validation before sending webhooks
  - Retry mechanism now applied to release notifications
  - Better detection of network timeouts and rate limiting
  - Enhanced error messages with actionable troubleshooting steps

#### Technical

- **🔧 Enhanced Error Detection**: Improved Discord API error handling
  - Support for Discord error codes alongside message matching
  - Better HTTP response parsing and error extraction
  - Enhanced logging for debugging webhook connectivity issues
  - Comprehensive error categorization and user guidance

## [1.3.4] - 2025-07-05

### 🔧 Patch Release - Workspace-Specific GitHub Webhooks

#### Changed

- **🏗️ GitHub Webhooks Now Workspace-Specific**: Enhanced GitHub webhook management to be workspace-specific rather than global
  - GitHub webhooks are now stored in workspace state instead of global state
  - Each workspace can have its own independent GitHub webhook configurations
  - Backward compatibility maintained through automatic migration system

#### Added

- **🔄 GitHub Webhook Migration**: Automatic migration for existing users
  - Prompts users to migrate existing global GitHub webhooks to current workspace
  - Option to start fresh with new workspace-specific configurations
  - Migration process clears global webhooks to prevent repeated prompts

#### Fixed

- **🛠️ GitHub Webhook Management**: Fixed issues in webhook configuration management
  - Fixed `removeGitHubWebhook` function parameter issue
  - Both `githubSetupManager` and `githubWebhookManager` now use workspace state
  - Improved consistency across all GitHub webhook management functions

#### Technical

- **🔧 Enhanced Webhook Architecture**: Improved internal webhook management
  - Updated both GitHub webhook managers to use `workspaceState`
  - Added migration functions to both GitHub webhook management systems
  - Better separation of concerns between workspace and global configurations
  - Enhanced error handling for webhook operations

## [1.3.3] - 2025-07-05

### 🔧 Patch Release - Fix Automatic Release Detection

#### Fixed

- **🏷️ Automatic Release Notifications**: Fixed GitWatcher to properly detect new Git tags
  - Added dedicated tag file system watcher for `refs/tags/**`
  - Separate `checkForNewTags()` method for tag-specific detection
  - Enhanced fallback polling to check for both commits and tags
  - Now properly detects release tags created after commits (e.g., `git tag v1.3.3`)

#### Enhanced

- **📡 Improved Git Monitoring**: Enhanced GitWatcher detection capabilities
  - Real-time tag creation detection via file system watchers
  - Better logging for tag detection events
  - Immediate Discord notifications when release tags are created
  - Fallback polling every 30 seconds for both commits and tags

#### Technical

- **🔧 GitWatcher Improvements**: Enhanced internal architecture
  - Added `lastKnownTags` tracking to detect new tags
  - Separate event handlers for tag creation and changes
  - Better error handling for tag-related operations
  - Proper disposal of all file system watchers

## [1.3.2] - 2025-07-05

### 🔧 Patch Release - Workspace-Specific Discord Webhooks

#### Changed

- **🏗️ Workspace-Specific Storage**: Discord webhooks are now stored per workspace instead of globally
  - Each project/repository can now have its own Discord webhooks
  - Prevents webhook conflicts between different projects
  - More secure and organized webhook management

#### Enhanced

- **📦 Migration Support**: Automatic migration from global webhooks to workspace-specific
  - Seamless upgrade experience for existing users
  - User prompt to migrate existing global webhooks to current workspace
  - Option to start fresh or use existing webhooks

#### Fixed

- **🔒 Cross-Project Isolation**: Resolves issue where webhooks were shared across all projects
  - Different repositories can now use different Discord channels
  - Prevents accidental notifications to wrong Discord servers
  - Better security by isolating webhook configurations

## [1.3.1] - 2025-01-27

### 🛡️ Patch Release - Enhanced Discord Integration & Error Handling

#### Enhanced

- **🔄 Retry Logic**: Added robust retry mechanism for Discord API calls

  - Exponential backoff for temporary failures (rate limits, timeouts, network issues)
  - Smart error detection that avoids retrying permanent failures (invalid webhooks, missing permissions)
  - Configurable retry attempts with automatic fallback

- **🩺 Advanced Connectivity Diagnostics**: New comprehensive webhook testing command

  - `PrismFlow: Test Discord Connectivity` command for detailed webhook validation
  - Enhanced error messages with specific troubleshooting advice
  - Real-time connectivity status with detailed failure analysis

- **📋 Improved Error Handling**: Enhanced error reporting for Discord notifications
  - Specific error messages for common Discord API issues
  - Detailed troubleshooting guidance for webhook problems
  - Better user feedback for network and permission issues

#### Fixed

- **🔧 Discord Reliability**: Improved reliability of Discord notifications
  - Automatic retry for transient network failures
  - Better handling of Discord API rate limits
  - More stable webhook connections

#### Commands

- **🧪 New Diagnostics**: Enhanced testing capabilities
  - `PrismFlow: Test Discord Connectivity` - Advanced webhook connectivity testing with retry support
  - Comprehensive error analysis and troubleshooting guidance

## [1.3.0] - 2025-07-04

### 🤖 Major Feature Release - Automatic Git Detection for External Pushes

#### New Features

- **🔍 GitWatcher Class**: Automatically monitors Git repository for external changes

  - File system watchers for `.git/refs` and `.git/HEAD` directories
  - Real-time detection of commits made outside the extension (Copilot, CLI, etc.)
  - 30-second polling as fallback to ensure no changes are missed
  - Automatic Discord notifications for external Git pushes

- **📡 Comprehensive Monitoring**:
  - Detects pushes, pulls, merges, and branch switches
  - Automatically extracts commit information (hash, message, author)
  - Identifies repository URL from git remote for Discord notifications
  - Recognizes release tags (v1.2.3 pattern) and sends release notifications

#### Enhanced

- **🎯 Discord Integration**: Seamless integration with existing Discord webhook system
  - Automatically triggers `notifyPush()` for detected commits
  - Automatically triggers `notifyRelease()` for detected version tags
  - Proper error handling and user notifications
  - No duplicate notifications for extension-triggered commands

#### Fixed

- **❌ Missing External Push Notifications**: Resolved issue where Discord notifications were not sent for Git operations performed outside the extension
  - Now detects Copilot commits, CLI commits, and other external Git operations
  - Ensures all Git pushes generate Discord notifications when webhooks are configured

#### Technical

- **🔧 Extension Lifecycle**: Proper integration with VS Code extension lifecycle
  - GitWatcher initialized in `activate()` function
  - Proper disposal in `deactivate()` function
  - Added test command `prismflow.testGitWatcher` for debugging

#### Commands

- **🧪 Test Commands**: Added `PrismFlow: Test Git Watcher` command for manual testing and validation

## [1.2.8] - 2025-07-04

### 🔧 Patch Release - Manual Discord Integration Enhancement & Bug Fixes

#### Enhanced

- **📱 Discord Event Coverage**: Complete implementation for all GitHub event types in Discord notifications
  - Enhanced notification functions for pull requests, issues, discussions, and deployments
  - Improved event simulation commands for comprehensive testing
  - Better error handling and webhook validation from v1.2.7 maintained

#### Fixed

- **🐛 Compilation Issues**: Resolved TypeScript compilation errors in event simulation commands
  - Fixed function reference errors in command registration
  - Corrected local function calls for better code organization
  - Improved TypeScript compliance and error handling

#### Technical

- **⚡ Code Quality**: Manual code refinements and optimizations
  - Better separation of concerns in event simulation functions
  - Enhanced code maintainability and documentation
  - Improved function organization and TypeScript compliance

#### Commands

- **🎮 Simulation Commands**: All GitHub event simulation commands properly registered
  - `PrismFlow: Simulate Pull Request Event`
  - `PrismFlow: Simulate Issue Event`
  - `PrismFlow: Simulate Discussion Event`
  - `PrismFlow: Simulate Deployment Event`

### 🔄 Maintained Features

- **✅ All v1.2.7 Enhancements**: Enhanced Discord webhook debugging and error detection preserved
- **✅ Security Excellence**: All security improvements continue to be maintained
- **✅ Dashboard Integration**: Complete dashboard functionality maintained
- **✅ Testing Tools**: Webhook testing and validation tools remain fully functional

---

## [1.2.7] - 2025-07-04

### 🔧 Patch Release - Enhanced Discord Webhook Debugging & Error Detection

#### Enhanced

- **🔍 Advanced Error Detection**: Comprehensive Discord API error identification and reporting
  - Specific error detection for UNKNOWN_WEBHOOK, MISSING_PERMISSIONS, CHANNEL_NOT_FOUND
  - Clear, actionable error messages instead of generic failures
  - Enhanced debugging tools for webhook connectivity issues

#### Added

- **🧪 New Testing Command**: `PrismFlow: Test Discord Webhook` for debugging connectivity
  - One-click webhook testing to verify all release webhooks
  - Immediate feedback with specific error details
  - Perfect for troubleshooting webhook configuration issues

#### Fixed

- **🛡️ Webhook Validation**: Enhanced URL format validation to prevent common errors
  - Proactive error prevention for malformed Discord webhook URLs
  - Better user guidance on valid webhook URL formats
  - Improved error handling prevents release process interruption

#### Technical

- **📈 User Experience**: Significantly improved Discord webhook reliability
  - Clear guidance on how to fix webhook issues
  - Easy testing and debugging capabilities
  - Faster problem identification and resolution
  - Enhanced success rate for webhook configurations

### 🔄 Maintained Features

- **✅ All v1.2.6 Features**: Complete dashboard integration and release automation preserved
- **✅ Security Excellence**: All security improvements from v1.2.3+ maintained
- **✅ GitHub Integration**: Complete GitHub CLI integration and release automation

---

## [1.2.5] - 2025-07-04

### 🔧 Patch Release - GitHub CLI Integration Enhancement

#### Enhanced

- **🚀 GitHub Release Automation**: Improved GitHub CLI integration for seamless release management
  - Enhanced release creation workflow with comprehensive release notes
  - Automated git tagging and GitHub release publishing
  - Better asset management for .vsix packages
  - Streamlined deployment process from development to marketplace

#### Fixed

- **💬 Discord Release Notifications**: Fixed missing automatic Discord webhooks for GitHub releases
  - GitHub Release Manager now automatically sends Discord notifications after successful releases
  - Added manual "Send Latest Release Webhook" command for retry/backup scenarios
  - Enhanced webhook error handling to prevent release process interruption
  - Added dashboard button and Command Palette access for manual webhook triggers

#### Technical

- **📦 Release Pipeline**: Optimized build and release process
  - Automated version tagging with descriptive commit messages
  - Enhanced GitHub release notes with security context
  - Improved asset upload and management
  - Better integration between VS Code Marketplace and GitHub releases

#### Documentation

- **📋 Process Documentation**: Updated release procedures
  - Enhanced build status tracking
  - Improved version management documentation
  - Better release workflow guidance
  - Updated deployment best practices

### 🛡️ Continued Security Focus

This patch release maintains our commitment to security and quality:

- **✅ Same Security Standards**: All security improvements from v1.2.3+ maintained
- **✅ Enhanced QA Tools**: QA testing commands remain fully functional
- **✅ Comprehensive Testing**: Release tested against full security checklist
- **✅ Transparent Process**: Continued clear documentation of security context

---

## [1.2.4] - 2025-07-04

### ✨ New Features - QA Testing Tools

#### Added

- **🔧 Quick Access Commands**: Added VS Code commands for instant access to QA documentation
  - `PrismFlow: Open QA Testing Checklist` - Opens the comprehensive testing checklist
  - `PrismFlow: Open Developer QA Guide` - Opens the developer testing guide
  - `PrismFlow: Create Custom QA Checklist` - Creates a customizable copy for project-specific needs

#### Enhanced

- **📋 QA Documentation**: Improved QA testing workflow with better accessibility
  - Quick Command Palette access to all QA tools
  - Custom checklist creation preserves original while allowing customization
  - Better version control handling for team sharing
  - Enhanced developer guide with customization instructions

#### Technical

- **🎯 Smart File Handling**: Custom checklist command intelligently handles existing files
  - Prompts user when custom checklist already exists (Open/Overwrite/Cancel)
  - Preserves original checklist for extension updates
  - Adds customization headers and tracking information
  - Proper error handling and user feedback

### 🛡️ Security Context

This release continues our commitment to quality and security following the resolution of malware-like behavior in v1.2.2:

- **✅ Enhanced QA Process**: New tools make comprehensive testing more accessible
- **✅ Team Collaboration**: Custom checklists enable team-specific testing standards
- **✅ Version Safety**: Custom files won't be overwritten by extension updates
- **✅ Comprehensive Testing**: All features tested against our security checklist

---

## [1.2.3] - 2025-07-03

### 🚨 CRITICAL FIX - Malware-like Behavior Resolved

#### Fixed

- **🛡️ File Creation Watcher Disabled**: Immediately disabled the file creation watcher that was causing malware-like behavior
  - **Problem**: Extension was intercepting ALL file creation events (including npm packages)
  - **Impact**: During `npm install`, the extension would open and modify every created file
  - **Result**: VS Code treated every npm package file as "unsaved changes" requiring manual save
  - **Solution**: Completely disabled the file creation watcher until it can be properly filtered

#### Technical Details

- The file watcher was using `"**/*"` pattern which caught ALL file creations
- Each file creation triggered: `openTextDocument()` → `showTextDocument()` → `editor.edit()`
- This caused VS Code to open hundreds of files during npm operations
- Extension was automatically adding header comments to npm package files
- **This feature is now disabled** and will be reimplemented with proper filtering

#### Quality Assurance Improvements

- **📋 Created comprehensive QA testing checklist** (`QA-TESTING-CHECKLIST.md`)
- **🔍 Mandatory pre-release testing** covering all critical scenarios
- **🛡️ Enhanced security testing** to prevent malware-like behavior
- **📖 Updated documentation** with security and quality commitments
- **🚨 Critical failure indicators** to stop releases immediately if issues detected

#### Impact

- ✅ No more file flooding during npm operations
- ✅ No more automatic file modifications of npm packages
- ✅ Normal npm install/update behavior restored
- ❌ Header comments for new files temporarily disabled (will be restored with proper filtering)

## [1.2.2] - 2025-06-29

### 🐛 Hotfix - Discord Webhook Selection

#### Fixed

- **🎯 Webhook Targeting**: Fixed missing `singleWebhookOnly` parameter in monorepo Discord notifications
  - Ensures monorepo updates only notify the primary webhook as intended
  - Prevents notifications from still being sent to all configured webhooks
  - Completes the Discord spam prevention feature introduced in v1.2.1

## [1.2.1] - 2025-06-29

### 🐛 Patch Update - Discord Notification Fix

#### Fixed

- **📢 Discord Spam Prevention**: Fixed issue where monorepo updates sent multiple Discord notifications
  - Now sends only ONE consolidated notification for entire monorepo update using `singleWebhookOnly=true`
  - Notification sent only to the primary/first webhook to prevent spam across multiple channels
  - Notification includes count of packages updated (e.g., "3 packages updated")
  - Prevents Discord channel flooding when updating multiple packages
  - Uses root package.json repository URL for notification consistency

## [1.2.0] - 2025-06-29

### �️ Minor Update - Monorepo Support

#### Added

- **🏗️ Monorepo Support**: Enhanced version management for multi-package projects
  - Automatically detect and update all package.json files in workspace
  - Configurable exclude patterns for directories to skip
  - Option to update all packages simultaneously to the same version
  - Smart detection with user choice between monorepo and single-file mode
  - Comprehensive documentation and configuration options

#### Technical

- Enhanced `versionManager.ts` with multi-package detection and update capabilities
- Added configuration settings for monorepo support and exclude patterns
- Created `docs/MONOREPO-SUPPORT.md` with detailed usage instructions
- Maintains full backward compatibility with existing single-package workflows

## [1.1.0] - 2025-06-29

### 🎯 Minor Update - Dashboard Reliability Improvements

#### Changed

- **🔮 Dashboard Streamlining**: Removed all highlighting and liked lines controls from dashboard
  - Dashboard now focuses exclusively on reliable global management commands
  - All highlighting and liked lines features moved to Command Palette only
  - Eliminates editor focus issues and infinite loops with unsupported editors
- **📋 Enhanced Command Palette Instructions**: Dashboard now displays comprehensive guide
  - Clear list of all available Command Palette commands with descriptions
  - Better user guidance on where to find each feature
  - Professional instruction layout matching VS Code design

#### Fixed

- **🐛 Editor Focus Issues**: Resolved dashboard focus problems with unsupported editors

  - No more infinite loops when code-runner-output or similar panels are active
  - Eliminated "Unsupported language" errors from dashboard actions
  - Removed complex editor state management that caused unreliable behavior

- **⚡ Dashboard Reliability**: All dashboard commands now work consistently
  - Simplified command execution without editor context dependencies
  - Clean, predictable behavior for all management functions
  - Enhanced logging for better debugging and support

#### Technical

- Simplified `dashboardManager.ts` by removing complex editor filtering logic
- Updated `dashboardWebview.ts` with streamlined UI and clear instructions
- Removed highlighting-specific callbacks and message handlers
- Enhanced PrismFlow output channel logging for better debugging

## [1.0.0] - 2025-06-28

### 🎉 Major Release - Dashboard Integration

#### Added

- **🔮 PrismFlow Dashboard**: Complete unified webview interface for all extension features

  - Centralized command access with organized categories
  - Modern VS Code-themed UI with icons and responsive design
  - Real-time status feedback and loading states
  - Persistent webview that retains context when hidden

- **🚀 GitHub Release Manager**: Full-featured release creation interface

  - Complete replacement for GitHub's web interface
  - Smart form auto-completion with version suggestions
  - Auto-changelog generation from git commits
  - Support for drafts, pre-releases, and release notes
  - GitHub CLI integration with git fallback
  - Branch/commit targeting and validation

- **⚙️ Enhanced Webview Architecture**:
  - Persistent webviews for uninterrupted workflows
  - Message-based communication between webviews and extension
  - Comprehensive error handling and user feedback
  - Professional UI components matching VS Code design

#### Improved

- **📦 Command Organization**: All commands now accessible through the dashboard
- **🎯 User Experience**: Streamlined workflows with visual feedback
- **🔧 Extension Architecture**: Modular webview system for better maintainability
- **📚 Documentation**: Updated with new dashboard features

#### Technical

- Migrated from `preview: true` to stable release
- Enhanced TypeScript interfaces for webview communication
- Improved error handling across all components
- Added comprehensive validation for release creation

## [0.1.4] - Previous Releases

### Features from Previous Versions

- Added GitHub webhook setup assistant
  - Generate secure random webhook secrets
  - Guide users through GitHub event selection
  - Copy secrets to clipboard
  - Provide setup instructions
  - Manage webhook configurations
- Added comprehensive roadmap document (ROADMAP.md)
- Added contribution guidelines (CONTRIBUTING.md)

## [0.1.0] - 2025-06-01

Initial release of PrismFlow

### Added

- Core Highlighting: Implements a depth-based background highlighting system for objects (`{}`) and arrays (`[]`), making it easier to visually distinguish nesting levels
- Active Block Highlighting: Automatically highlights the innermost object or array block that currently contains the cursor
- Error Detection: Visually identifies and highlights unmatched opening and closing braces
- Enhanced Block Labels: Introduces configurable inline labels displayed after closing brackets
- Block Path Navigation: Allows copying and navigating to specific blocks via path
- Status Bar Integration: Provides current block information in the status bar
- Configurable Settings: Customizable colors, label format, and more
- Liked Lines Feature: Bookmark and navigate to lines across your workspace
- Automated .gitignore Management: Automatically adds common patterns to .gitignore
- Automated New File Comments: Adds header comments to newly created files
- Discord Webhook Integration: Send notifications for GitHub events to Discord
- Version Management Tools: Interactive version updating with changelog management

### Changed

- Initial release

### Fixed

- Initial release
