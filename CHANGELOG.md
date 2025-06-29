# Change Log

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
