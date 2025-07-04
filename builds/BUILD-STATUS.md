<!-- builds\BUILD-STATUS.md -->

# PrismFlow Build History & Status

## 📦 Build Archive

This directory contains all compiled extension packages with their release status and notes.

---

## 🗂️ Package Inventory

| Version | File                   | Status            | Release Date | Notes                                         |
| ------- | ---------------------- | ----------------- | ------------ | --------------------------------------------- |
| 1.2.5   | `prismflow-1.2.5.vsix` | ✅ **CURRENT**    | 2025-07-04   | GitHub CLI integration and release automation |
| 1.2.4   | `prismflow-1.2.4.vsix` | ⬆️ **SUPERSEDED** | 2025-07-04   | QA testing tools (replaced by 1.2.5)          |
| 1.2.3   | `prismflow-1.2.3.vsix` | ⬆️ **SUPERSEDED** | 2025-07-03   | Security fix release (replaced by 1.2.5)      |
| 1.2.2   | `prismflow-1.2.2.vsix` | ❌ **REMOVED**    | 2025-06-29   | Pulled due to malware-like behavior           |
| 1.2.1   | `prismflow-1.2.1.vsix` | ⬆️ **SUPERSEDED** | 2025-06-29   | Discord notification fix, replaced by 1.2.5   |
| 1.2.0   | `prismflow-1.2.0.vsix` | ⬆️ **SUPERSEDED** | 2025-06-29   | Monorepo support initial release              |
| 1.1.0   | `prismflow-1.1.0.vsix` | ⬆️ **SUPERSEDED** | 2025-06-29   | Dashboard reliability improvements            |
| 1.0.0   | `prismflow-1.0.0.vsix` | ⬆️ **SUPERSEDED** | 2025-06-28   | Major release with dashboard integration      |

---

## 📊 Build Status Legend

### ✅ **CURRENT**

- **Definition**: The latest stable release available for public use
- **Action**: Actively distributed on VS Code Marketplace
- **Support**: Fully supported with updates and bug fixes

### ❌ **REMOVED**

- **Definition**: Builds pulled from distribution due to critical issues
- **Action**: Removed from VS Code Marketplace, users advised to upgrade
- **Support**: No longer supported, security/functionality issues present

### ⬆️ **SUPERSEDED**

- **Definition**: Stable builds replaced by newer versions
- **Action**: No longer distributed but retained for reference
- **Support**: Limited support, users advised to upgrade

### 🚧 **DEPRECATED** _(Future use)_

- **Definition**: Builds scheduled for removal or end-of-life
- **Action**: Still available but marked for discontinuation
- **Support**: Minimal support, migration path provided

---

## 🚨 Critical Security Information

### Version 1.2.2 - SECURITY INCIDENT

**⚠️ CRITICAL ISSUE**: This version exhibited malware-like behavior that:

- Automatically intercepted file creation events
- Opened and modified files during npm operations
- Caused file flooding and forced saves
- Interfered with package manager operations

**🛡️ RESOLUTION**:

- **Immediately pulled** from VS Code Marketplace
- **Fixed in v1.2.3** with comprehensive security improvements
- **Enhanced QA process** implemented to prevent similar issues

**📋 USER ACTION REQUIRED**:

- If using v1.2.2, **upgrade to v1.2.3 immediately**
- Check for any unwanted file modifications
- Report any persistent issues

---

## 📈 Release Timeline

```
2025-07-04  v1.2.5  ✅ GitHub integration enhancement + Discord webhook fixes
2025-07-04  v1.2.4  ⬆️ QA testing tools enhancement
2025-07-03  v1.2.3  ⬆️ Security fix release
2025-06-29  v1.2.2  ❌ PULLED - Malware-like behavior
2025-06-29  v1.2.1  ⬆️ Discord notification fix
2025-06-29  v1.2.0  ⬆️ Monorepo support added
2025-06-29  v1.1.0  ⬆️ Dashboard reliability improvements
2025-06-28  v1.0.0  ⬆️ Major dashboard integration release
```

---

## 🔍 Build Details

### v1.2.5 (Current) ✅

**Release Type**: Patch Release - GitHub CLI Integration + Discord Webhook Fixes  
**Size**: ~2.9MB  
**Key Changes**:

- ✅ Enhanced GitHub CLI integration for streamlined releases
- ✅ **FIXED**: Discord webhook notifications now trigger automatically from GitHub Release Manager
- ✅ **NEW**: Manual "Send Latest Release Webhook" command and dashboard button
- ✅ **ENHANCED**: Improved webhook error handling and graceful fallbacks
- ✅ **ADDED**: Complete wiki documentation restoration with comprehensive guides
- ✅ Improved release automation and asset management
- ✅ Better git tagging and version control workflows
- ✅ Optimized deployment pipeline from development to marketplace

**Discord Integration Improvements**:

- Fixed missing automatic Discord notifications for GitHub releases
- Added manual webhook trigger for backup/retry scenarios
- Enhanced error handling prevents release process interruption
- Smart release detection using GitHub CLI with git fallbacks
- New dashboard button: "📢 Send Latest Release Webhook"
- Command palette access: "PrismFlow: Send Latest Release Webhook"

**Documentation Restoration**:

- Complete wiki pages restored with comprehensive content
- Detailed Discord integration guide with troubleshooting
- Complete GitHub webhook setup and CLI configuration guide
- Comprehensive version management and monorepo support guide
- Detailed contributing guide with development setup instructions
- Complete development roadmap with future vision and timeline

**Process Improvements**:

- Automated GitHub release creation with Discord notifications
- Better integration between VS Code Marketplace, GitHub, and Discord
- Streamlined build and deployment workflow
- Enhanced asset upload and management
- Repository cleanup with empty file removal (content preserved in archive)

**Maintained Features**:

- All QA testing tools from v1.2.4 remain fully functional
- Complete security improvements from v1.2.3+ maintained
- Enhanced testing process continues to prevent security issues
- Comprehensive documentation and transparency maintained

### v1.2.4 (Superseded) ⬆️

**Release Type**: QA Tools Enhancement  
**Size**: ~2.87MB  
**Key Changes**:

- ✅ Added QA testing tool commands for quick access
- ✅ Custom QA checklist creation without affecting defaults
- ✅ Enhanced developer QA guide with customization instructions
- ✅ Improved team collaboration for testing standards
- ✅ Better version control handling for custom checklists

**New Commands**:

- `PrismFlow: Open QA Testing Checklist` - Quick access to testing checklist
- `PrismFlow: Open Developer QA Guide` - Quick access to developer guide
- `PrismFlow: Create Custom QA Checklist` - Create customizable project-specific checklist

**Quality Improvements**:

- Enhanced QA accessibility for developers
- Preserved original checklist while enabling customization
- Better documentation for testing workflows
- Continued security-focused development process

### v1.2.3 (Superseded) ⬆️

**Release Type**: Critical Security Fix  
**Size**: ~2.85MB  
**Key Changes**:

- ✅ Fixed malware-like file creation behavior
- ✅ Disabled problematic file watcher
- ✅ Enhanced QA testing process
- ✅ Comprehensive security documentation
- ✅ All core features remain functional

**Security Improvements**:

- No automatic file interception
- Safe npm/package manager operation
- User-controlled file modifications only
- Comprehensive testing framework

### v1.2.2 (REMOVED) ❌

**Release Type**: Regular Update  
**Size**: ~2.85MB  
**Critical Issues**:

- ❌ File creation watcher caused malware-like behavior
- ❌ Automatic file opening and modification
- ❌ Interference with npm operations
- ❌ File flooding during package installations

**Why Removed**:

- User reports of unwanted file modifications
- npm install operations disrupted
- Extension behavior resembled malware
- Immediate security risk to users

### v1.2.1 (Superseded) ⬆️

**Release Type**: Hotfix  
**Size**: ~2.85MB  
**Key Changes**:

- ✅ Fixed Discord webhook spam in monorepo updates
- ✅ Single webhook notification implementation
- ✅ Improved notification targeting

**Status**: Stable but superseded by security fix

### v1.2.0 (Superseded) ⬆️

**Release Type**: Minor Feature Release  
**Size**: ~2.85MB  
**Key Changes**:

- ✅ Monorepo support implementation
- ✅ Multi-package version management
- ✅ Configurable exclude patterns
- ✅ Enhanced Discord integration

**Status**: Stable feature release, superseded

### v1.1.0 (Superseded) ⬆️

**Release Type**: Minor Update  
**Size**: ~2.85MB  
**Key Changes**:

- ✅ Dashboard reliability improvements
- ✅ Command Palette integration
- ✅ Enhanced user guidance
- ✅ Editor focus issue fixes

**Status**: Stable release, superseded

### v1.0.0 (Superseded) ⬆️

**Release Type**: Major Release  
**Size**: ~2.85MB  
**Key Changes**:

- ✅ Unified dashboard interface
- ✅ GitHub release manager
- ✅ Enhanced webview architecture
- ✅ Professional UI components

**Status**: Stable major release, superseded

---

## 🛠️ Build Management

### Current Build Process

1. **Development**: Feature development and testing
2. **QA Testing**: Mandatory [QA checklist](../QA-TESTING-CHECKLIST.md) completion
3. **Security Review**: Security testing and validation
4. **Packaging**: `npx vsce package` to create .vsix
5. **Archive**: Move to builds directory with status tracking
6. **Documentation**: Update this file with build details

### Quality Assurance (Post v1.2.3)

- ✅ **Mandatory QA Checklist**: All releases must pass comprehensive testing
- ✅ **Security Testing**: Specific tests for malware-like behavior prevention
- ✅ **Performance Validation**: Memory, CPU, and startup time testing
- ✅ **npm Compatibility**: Verification of package manager operation safety
- ✅ **Documentation Updates**: Release notes and change tracking

### File Naming Convention

- Format: `prismflow-[version].vsix`
- Example: `prismflow-1.2.3.vsix`
- Version follows semantic versioning (major.minor.patch)

---

## 📋 Maintenance Notes

### Archive Retention Policy

- ✅ **Current Release**: Kept indefinitely for distribution
- ✅ **Superseded Releases**: Kept for 1 year minimum for reference
- ❌ **Removed Releases**: Kept permanently for security analysis
- 🗑️ **Cleanup**: Old builds may be archived to external storage after 2 years

### Security Scanning

- All builds scanned for security vulnerabilities
- Dependency analysis performed before packaging
- Manual security review for all file operations
- QA testing includes security validation

### Version Control Integration

- Build creation triggers git tagging
- Release notes updated in CHANGELOG.md
- Documentation updated with each build
- Security issues tracked in SECURITY.md

---

## 📞 Support & Reporting

### Current Version Support

- **v1.2.3**: Full support and active development
- **v1.2.1 and earlier**: Limited support, upgrade recommended
- **v1.2.2**: No support, immediate upgrade required

### Issue Reporting

- **Security Issues**: Report privately via [SECURITY.md](../SECURITY.md)
- **General Issues**: [GitHub Issues](https://github.com/seristic/prism-flow/issues)
- **Build Problems**: Include version number and build details

### Emergency Procedures

1. **Critical Security Issue**: Immediate build removal from marketplace
2. **User Notification**: GitHub issue and security advisory
3. **Fix Development**: Rapid development and testing cycle
4. **Emergency Release**: Expedited release process with full QA

---

**Last Updated**: July 3, 2025  
**Maintained by**: PrismFlow Development Team  
**Next Review**: July 10, 2025
