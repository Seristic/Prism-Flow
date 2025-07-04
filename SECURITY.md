<!-- SECURITY.md -->

# Security Policy

## 🛡️ Supported Versions

| Version     | Supported | Status                           |
| ----------- | --------- | -------------------------------- |
| 1.2.8       | ✅ Yes    | Current - Enhanced features      |
| 1.2.3-1.2.7 | ✅ Yes    | Secure                           |
| 1.2.0-1.2.2 | ❌ No     | Security issue resolved in 1.2.3 |
| < 1.2.0     | ❌ No     | Upgrade required                 |

## 🚨 Recent Security Fixes

### v1.2.3 - Critical Security Fix (July 3, 2025)

**Issue**: Extension exhibited malware-like behavior by automatically intercepting and modifying files during npm operations.

**Resolution**:

- Completely disabled problematic file creation watcher
- Implemented comprehensive QA testing checklist
- Enhanced security documentation
- All core features remain functional and safe

**Impact**: Users experienced file flooding and forced saves during package manager operations.

**Action Required**: Upgrade to v1.2.3 immediately if using earlier versions.

## 🔍 Security Principles

PrismFlow follows these security principles:

### 1. **User Consent & Control**

- ✅ All file modifications require explicit user action
- ✅ No automatic file interception or modification
- ✅ Clear confirmation dialogs for destructive operations
- ✅ Users control all extension behavior through settings

### 2. **Non-Intrusive Operation**

- ✅ Extension does NOT interfere with package managers (npm, yarn, pnpm)
- ✅ Extension does NOT automatically open or modify files
- ✅ Extension does NOT block or hijack VS Code operations
- ✅ Extension operates only when explicitly invoked by user

### 3. **Data Protection**

- ✅ No telemetry or analytics data collection
- ✅ Local operation only (except for Discord webhooks if configured)
- ✅ No unauthorized network requests
- ✅ Webhook URLs stored locally and encrypted

### 4. **Code Quality & Testing**

- ✅ Mandatory QA testing before every release
- ✅ Open source code available for audit
- ✅ Comprehensive error handling
- ✅ Performance monitoring and optimization

## 📋 QA & Testing

Every release must pass our [comprehensive QA checklist](QA-TESTING-CHECKLIST.md) including:

- **File Operation Safety**: Verification that extension doesn't interfere with file operations
- **Package Manager Compatibility**: Testing with npm, yarn, pnpm operations
- **Performance Testing**: Memory usage, CPU usage, startup time
- **Error Handling**: Graceful failure modes and recovery
- **Security Testing**: No malware-like behavior detection

## 🚨 Reporting Security Vulnerabilities

If you discover a security vulnerability, please:

### 1. **DO NOT** create a public issue

### 2. **DO** report it privately via:

- Email: [security contact needed]
- GitHub Security Advisories: [Use private vulnerability reporting]

### 3. **Include in your report:**

- Extension version affected
- VS Code version and OS
- Detailed description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if any)

### 4. **Response timeline:**

- **24 hours**: Acknowledgment of report
- **72 hours**: Initial assessment and severity classification
- **7 days**: Fix development and testing (for high severity)
- **14 days**: Release of security update (for high severity)

## 🔒 Security Features

### Built-in Security Measures

1. **File System Protection**

   - No automatic file creation or modification
   - All file operations require explicit user consent
   - No file watching beyond necessary functionality

2. **Network Security**

   - Minimal network usage (only for Discord webhooks if enabled)
   - No telemetry or tracking
   - HTTPS-only connections where applicable

3. **Permission Model**
   - Follows VS Code extension security model
   - Minimal required permissions
   - Clear permission usage documentation

### Security Best Practices for Users

1. **Keep Updated**: Always use the latest version
2. **Review Settings**: Understand what each setting does
3. **Monitor Behavior**: Report any unusual extension behavior
4. **Backup Important Files**: Before major version updates
5. **Use in Test Environments**: Test new features in non-production environments

## 🛠️ Security Development Practices

### Code Development

- **Secure by Design**: Security considerations in all feature development
- **Input Validation**: All user inputs validated and sanitized
- **Error Handling**: Comprehensive error handling to prevent crashes
- **Code Review**: All changes reviewed for security implications

### Testing & QA

- **Security Testing**: Part of mandatory QA checklist
- **Performance Testing**: Prevent resource exhaustion attacks
- **Edge Case Testing**: Handle malformed inputs gracefully
- **Integration Testing**: Verify safe interaction with VS Code APIs

### Release Process

- **Security Scan**: Automated security scanning of dependencies
- **Manual Review**: Manual security review of all changes
- **Staged Rollout**: Careful monitoring of new releases
- **Rapid Response**: Ability to quickly patch security issues

## 📞 Contact Information

- **General Issues**: [GitHub Issues](https://github.com/seristic/prism-flow/issues)
- **Security Issues**: [Private reporting recommended]
- **Project Maintainer**: [Contact information needed]

## 📜 Security History

| Date       | Version | Issue                      | Severity | Status   |
| ---------- | ------- | -------------------------- | -------- | -------- |
| 2025-07-03 | 1.2.3   | Malware-like file behavior | High     | ✅ Fixed |

---

**Remember: Security is a shared responsibility. Users, maintainers, and the community all play a role in keeping PrismFlow secure.**
