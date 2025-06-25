# Change Log

## [Unreleased]

### Added

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
