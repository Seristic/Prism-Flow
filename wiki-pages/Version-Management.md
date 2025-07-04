# 🏷️ Version Management Guide

PrismFlow provides comprehensive version management tools for both single projects and monorepos, with automated changelog generation, version synchronization, and release workflows.

## 🚀 Quick Start

1. **Check Current Version**: View current project version
2. **Update Version**: Increment version using semantic versioning
3. **Manage Changelog**: Automatic changelog updates
4. **Monorepo Support**: Synchronize versions across multiple packages

## 📋 Table of Contents

- [Version Commands](#version-commands)
- [Semantic Versioning](#semantic-versioning)
- [Monorepo Support](#monorepo-support)
- [Changelog Management](#changelog-management)
- [Release Workflows](#release-workflows)
- [Configuration](#configuration)
- [Best Practices](#best-practices)

## 🎯 Version Commands

### Basic Version Operations

#### Show Current Version

```
Ctrl+Shift+P → "PrismFlow: Show Current Version"
```

- Displays current version from package.json
- Shows version across all packages in monorepos
- Includes version history and changelog information

#### Update Version

```
Ctrl+Shift+P → "PrismFlow: Update Version"
```

- Interactive version increment selection
- Supports semantic versioning (major, minor, patch)
- Automatic package.json updates
- Changelog entry generation

### Dashboard Access

1. **Open Dashboard**: `Ctrl+Shift+P` → "PrismFlow: Show Dashboard"
2. **Version Section**: Click buttons in "Version Management" section
3. **Quick Actions**: One-click version operations

## 📊 Semantic Versioning

### Version Format

PrismFlow follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes, incompatible API changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Version Types

#### Patch Release (x.x.X)

```
Current: 1.2.3
New:     1.2.4
```

- Bug fixes
- Security patches
- Documentation updates
- Performance improvements

#### Minor Release (x.X.x)

```
Current: 1.2.3
New:     1.3.0
```

- New features
- New functionality
- Backward compatible changes
- Deprecations

#### Major Release (X.x.x)

```
Current: 1.2.3
New:     2.0.0
```

- Breaking changes
- API changes
- Incompatible updates
- Architecture changes

### Pre-release Versions

#### Alpha Releases

```
1.3.0-alpha.1
1.3.0-alpha.2
```

- Early development versions
- Unstable features
- Internal testing

#### Beta Releases

```
1.3.0-beta.1
1.3.0-beta.2
```

- Feature complete
- Public testing
- Bug fixes only

#### Release Candidates

```
1.3.0-rc.1
1.3.0-rc.2
```

- Final testing
- Production-ready
- Last chance for critical fixes

## 🏗️ Monorepo Support

### Package Detection

PrismFlow automatically detects monorepo structures:

```
project/
├── package.json          # Root package
├── packages/
│   ├── core/
│   │   └── package.json   # Sub-package
│   ├── ui/
│   │   └── package.json   # Sub-package
│   └── utils/
│       └── package.json   # Sub-package
```

### Version Synchronization

#### Synchronized Updates

- **All Packages**: Update all package.json files simultaneously
- **Version Consistency**: Ensure consistent versioning across packages
- **Dependency Updates**: Update internal package dependencies

#### Selective Updates

- **Package Selection**: Choose which packages to update
- **Independent Versioning**: Allow different versions per package
- **Dependency Management**: Smart internal dependency resolution

### Monorepo Commands

#### Update All Packages

```
PrismFlow: Update Version (Monorepo Mode)
```

- Updates all package.json files
- Maintains internal dependency versions
- Generates unified changelog

#### Check Version Consistency

```
PrismFlow: Show Current Version (Monorepo Mode)
```

- Shows versions across all packages
- Highlights version inconsistencies
- Provides synchronization recommendations

## 📝 Changelog Management

### Automatic Generation

PrismFlow automatically maintains CHANGELOG.md files:

#### Changelog Structure

```markdown
# Change Log

## [1.2.4] - 2025-07-04

### Added

- New feature descriptions

### Changed

- Modified functionality

### Fixed

- Bug fixes and patches

### Deprecated

- Features marked for removal

### Removed

- Deleted functionality

### Security

- Security-related changes
```

#### Entry Types

**Added**: New features

- New commands
- New functionality
- New configuration options

**Changed**: Modifications to existing features

- Behavior changes
- Performance improvements
- API modifications

**Fixed**: Bug fixes

- Issue resolutions
- Error corrections
- Stability improvements

**Deprecated**: Features marked for removal

- API deprecations
- Feature warnings
- Migration guidance

**Removed**: Deleted functionality

- Removed features
- Deleted APIs
- Cleanup operations

**Security**: Security-related changes

- Vulnerability fixes
- Security improvements
- Privacy enhancements

### Manual Changelog Editing

#### Edit Changelog

```
Ctrl+Shift+P → "PrismFlow: Edit Changelog"
```

- Opens CHANGELOG.md for editing
- Provides changelog template
- Validates changelog format

#### Changelog Templates

- **Feature Release**: Template for new features
- **Patch Release**: Template for bug fixes
- **Security Release**: Template for security updates
- **Breaking Changes**: Template for major releases

## 🚀 Release Workflows

### Standard Release Process

1. **Version Update**: Use PrismFlow to increment version
2. **Changelog Review**: Review and edit generated changelog
3. **Commit Changes**: Commit version and changelog updates
4. **Create Release**: Use GitHub Release Manager
5. **Publish**: Automatic publishing and notifications

### Automated Workflow

#### Pre-release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog entries complete
- [ ] Version numbers consistent
- [ ] Dependencies updated

#### Release Steps

1. **Version Bump**: `PrismFlow: Update Version`
2. **Review Changes**: Check package.json and CHANGELOG.md
3. **Commit**: `git commit -m "Release v1.2.4"`
4. **Tag**: `git tag v1.2.4`
5. **Push**: `git push origin main --tags`
6. **GitHub Release**: Use GitHub Release Manager
7. **Notifications**: Automatic Discord notifications

### Hotfix Releases

#### Emergency Patches

```
Current: 1.2.3
Hotfix:  1.2.4
```

1. **Create Hotfix Branch**: `git checkout -b hotfix/1.2.4`
2. **Apply Fix**: Make necessary changes
3. **Version Update**: Update to patch version
4. **Test**: Verify fix works
5. **Merge**: Merge to main and develop branches
6. **Release**: Create immediate release

## ⚙️ Configuration

### Extension Settings

#### Version Management

```json
{
  "prismflow.version.autoIncrement": true,
  "prismflow.version.includePrerelease": false,
  "prismflow.version.syncMonorepo": true,
  "prismflow.version.generateChangelog": true
}
```

#### Monorepo Settings

```json
{
  "prismflow.monorepo.enabled": true,
  "prismflow.monorepo.packagePaths": ["packages/*"],
  "prismflow.monorepo.syncVersions": true,
  "prismflow.monorepo.updateDependencies": true
}
```

#### Changelog Settings

```json
{
  "prismflow.changelog.autoGenerate": true,
  "prismflow.changelog.format": "keepachangelog",
  "prismflow.changelog.includeCommits": false,
  "prismflow.changelog.groupByType": true
}
```

### Project Configuration

#### package.json Configuration

```json
{
  "name": "my-project",
  "version": "1.2.3",
  "prismflow": {
    "version": {
      "strategy": "semantic",
      "autoIncrement": true,
      "syncDependencies": true
    },
    "changelog": {
      "enabled": true,
      "template": "keepachangelog"
    }
  }
}
```

#### Monorepo Configuration

```json
{
  "name": "my-monorepo",
  "version": "1.0.0",
  "workspaces": ["packages/*"],
  "prismflow": {
    "monorepo": {
      "syncVersions": true,
      "packages": ["packages/*"],
      "independent": false
    }
  }
}
```

## 💡 Best Practices

### Version Strategy

#### Semantic Versioning Guidelines

1. **Breaking Changes**: Always increment major version
2. **New Features**: Increment minor version
3. **Bug Fixes**: Increment patch version
4. **Pre-releases**: Use alpha/beta/rc suffixes

#### Release Frequency

- **Patch Releases**: Weekly or as needed for critical fixes
- **Minor Releases**: Monthly for new features
- **Major Releases**: Quarterly or when breaking changes needed

### Changelog Best Practices

#### Writing Good Changelog Entries

1. **Be Specific**: Describe what changed and why
2. **User Impact**: Focus on user-facing changes
3. **Breaking Changes**: Clearly mark breaking changes
4. **Migration Guides**: Provide upgrade instructions

#### Changelog Organization

- **Group by Type**: Use Add/Changed/Fixed/etc. sections
- **Chronological Order**: Most recent changes first
- **Link to Issues**: Reference GitHub issues and PRs
- **Keep Formatting**: Consistent markdown formatting

### Monorepo Management

#### Version Synchronization

1. **Consistent Versioning**: Keep all packages on same version
2. **Dependency Updates**: Update internal dependencies together
3. **Release Coordination**: Release all packages simultaneously
4. **Testing**: Test packages together before release

#### Package Independence

1. **Selective Updates**: Update only changed packages
2. **Independent Testing**: Test packages individually
3. **Gradual Rollout**: Release packages incrementally
4. **Backward Compatibility**: Maintain compatibility between packages

### Release Management

#### Pre-release Testing

1. **Staging Environment**: Test in production-like environment
2. **User Acceptance**: Get feedback from key users
3. **Performance Testing**: Verify performance characteristics
4. **Compatibility Testing**: Test with different VS Code versions

#### Release Communication

1. **Team Notification**: Inform team of upcoming releases
2. **User Communication**: Announce releases to users
3. **Documentation Updates**: Update documentation for new features
4. **Support Preparation**: Prepare support team for new features

## 🔍 Troubleshooting

### Common Issues

#### Version Mismatch in Monorepo

**Symptoms**: Different versions across packages
**Solutions**:

1. Use `PrismFlow: Update Version` with sync option
2. Manually update package.json files
3. Check for ignored packages in configuration

#### Changelog Not Updating

**Symptoms**: CHANGELOG.md not updated automatically
**Solutions**:

1. Check changelog settings in configuration
2. Verify CHANGELOG.md file exists
3. Ensure proper file permissions

#### Version Command Fails

**Symptoms**: Version update commands error
**Solutions**:

1. Check package.json exists and is valid
2. Verify file write permissions
3. Ensure Git repository is clean

### Error Messages

#### "Package.json not found"

- **Cause**: No package.json in current directory
- **Solution**: Navigate to project root or create package.json

#### "Invalid version format"

- **Cause**: Current version doesn't follow semantic versioning
- **Solution**: Manually fix version in package.json

#### "Git repository has uncommitted changes"

- **Cause**: Dirty git working directory
- **Solution**: Commit or stash changes before version update

## 🔗 Related Documentation

- **[GitHub Webhook Setup](GitHub-Webhook.md)** - Release automation with GitHub
- **[Discord Integration](Discord-Integration.md)** - Release notifications
- **[Contributing Guide](Contributing.md)** - Development workflow
- **[Home](Home.md)** - Main documentation hub

## 📊 Version History Example

### Release Timeline

```
v1.0.0 - Initial release
v1.1.0 - Added Discord integration
v1.2.0 - Added GitHub webhooks
v1.2.1 - Fixed notification bug
v1.2.2 - Security patch
v1.2.3 - Performance improvements
v1.2.4 - Bug fixes
v1.3.0 - Added monorepo support
```

### Changelog Example

```markdown
## [1.3.0] - 2025-07-04

### Added

- Monorepo version synchronization
- Multi-package update support
- Independent package versioning
- Bulk dependency updates

### Changed

- Improved version update workflow
- Enhanced changelog generation
- Better error handling for version operations

### Fixed

- Version consistency checks in monorepos
- Changelog formatting issues
- Package.json update reliability

### Security

- Improved file permission handling
- Better validation of version inputs
```

---

**Ready to manage your project versions? Start with the PrismFlow Dashboard and explore the Version Management section!** 🚀
