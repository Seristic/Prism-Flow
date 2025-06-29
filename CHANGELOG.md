# Change Log

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
