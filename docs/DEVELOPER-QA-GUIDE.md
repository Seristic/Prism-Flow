<!-- docs\DEVELOPER-QA-GUIDE.md -->

# Developer Guide: Using the QA Testing Checklist

## 🎯 Purpose

This guide explains how to use the [QA Testing Checklist](../QA-TESTING-CHECKLIST.md) to ensure safe, high-quality releases of PrismFlow.

## 📋 When to Use the Checklist

**MANDATORY for ALL releases:**

- Public releases to VS Code Marketplace
- Beta releases for testing
- Release candidates
- Hotfixes and patches

**RECOMMENDED for:**

- Major feature development
- Significant refactoring
- Security-related changes
- Performance improvements

## 🚀 Pre-Release Testing Process

### 🔧 **Quick Access to QA Documents**

PrismFlow includes built-in commands to quickly access the QA documentation:

#### **Open QA Testing Checklist:**

1. **Via Command Palette:**

   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type: `PrismFlow: Open QA Testing Checklist`
   - Press Enter

2. **Via Quick Open:**
   - Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac)
   - Type: `QA-TESTING-CHECKLIST.md`
   - Press Enter

#### **Open Developer QA Guide:**

1. **Via Command Palette:**

   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type: `PrismFlow: Open Developer QA Guide`
   - Press Enter

2. **Via Quick Open:**
   - Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac)
   - Type: `DEVELOPER-QA-GUIDE.md`
   - Press Enter

### 1. **Preparation**

```bash
# Ensure clean environment
git status  # Should show clean working tree
npm run compile  # Should complete without errors
npx vsce package  # Should create .vsix without issues
```

### 2. **Create Test Environment**

- Use a separate VS Code instance
- Install the packaged extension (`code --install-extension prismflow-x.x.x.vsix`)
- Test in both empty and project workspaces
- Test with and without other extensions

### 3. **Follow the Checklist**

- Work through each section systematically
- **DO NOT SKIP** any critical items marked with (CRITICAL)
- Document any issues found
- Fix issues before proceeding

### 4. **Critical Failure Points**

**STOP IMMEDIATELY if you observe:**

- Extension automatically opens files
- Extension automatically modifies files
- Extension interferes with npm/package operations
- File flooding or forced saves
- High memory/CPU usage
- VS Code crashes or freezes

### 5. **Documentation**

Use this template for test sessions:

```markdown
## Test Session: [YYYY-MM-DD]

**Version:** [x.x.x]
**Tester:** [Your Name]
**Environment:** [Windows 11, VS Code 1.x.x]

### Core Functionality: ✅ PASS / ❌ FAIL

- [ ] Extension activation
- [ ] Command palette commands
- [ ] Settings functionality
- [ ] Highlighting features
- [ ] Status bar integration

### File Operations: ✅ PASS / ❌ FAIL

- [ ] Manual file creation
- [ ] No automatic modifications
- [ ] No file interception

### npm Operations: ✅ PASS / ❌ FAIL

- [ ] npm install - no interference
- [ ] npm update - no interference
- [ ] No file flooding
- [ ] No forced saves

### Monorepo Support: ✅ PASS / ❌ FAIL

- [ ] Package detection
- [ ] Version updates
- [ ] Exclude patterns
- [ ] Single notification

### Discord Integration: ✅ PASS / ❌ FAIL

- [ ] Webhook setup
- [ ] Notifications sent correctly
- [ ] Single webhook for monorepo
- [ ] Error handling

### Performance: ✅ PASS / ❌ FAIL

- [ ] Normal memory usage
- [ ] Fast activation
- [ ] Responsive UI
- [ ] No resource leaks

### Issues Found:

1. [Describe any issues]

### Overall Assessment:

[ ] ✅ READY FOR RELEASE
[ ] ❌ NEEDS FIXES - DO NOT RELEASE

### Notes:

[Any additional observations]
```

## 🔧 Testing Tools & Commands

### Extension Testing

```bash
# Package extension
npx vsce package

# Install for testing
code --install-extension prismflow-x.x.x.vsix

# Check extension logs
# Open: View > Output > PrismFlow
```

### Performance Testing

```bash
# Monitor VS Code performance
# Help > Toggle Developer Tools > Performance tab

# Check memory usage
# View > Command Palette > "Developer: Show Running Extensions"
```

### File Operation Testing

```bash
# Test npm operations in a test directory
mkdir test-npm && cd test-npm
npm init -y
npm install express  # Should work without extension interference
```

## 🚨 Red Flags - Stop Testing Immediately

### File System Issues

- Extension opens files automatically
- Extension modifies files without permission
- File save dialogs appear unexpectedly
- Files appear "dirty" without changes

### Package Manager Issues

- npm install hangs or behaves oddly
- Package files opened in editor
- Extension error messages during npm operations
- Unexpected file modifications in node_modules

### Performance Issues

- VS Code becomes slow or unresponsive
- High CPU usage by extension
- Memory usage continuously growing
- Extension causes crashes

### User Experience Issues

- Commands don't work as expected
- Error messages are confusing
- Settings don't take effect
- UI elements don't respond

## ✅ What Good Behavior Looks Like

### Normal Operation

- Extension activates silently
- Commands work when invoked
- No automatic file operations
- Settings changes take effect immediately
- Error messages are clear and helpful

### File Operations

- Extension only modifies files when explicitly requested
- All file operations have clear confirmation
- No interference with external tools
- Respect for user's file permissions

### Performance

- Fast extension activation (< 2 seconds)
- Responsive UI interactions
- Stable memory usage
- No impact on VS Code performance

## 📝 Best Practices

### Before Testing

1. Read the full checklist before starting
2. Prepare clean test environments
3. Have test projects ready (monorepo, single package)
4. Close unnecessary applications

### During Testing

1. Test each item thoroughly
2. Try edge cases and error conditions
3. Document everything, even minor issues
4. Take breaks to maintain focus

### After Testing

1. Complete the test documentation
2. Fix any issues found before release
3. Re-test if significant changes were made
4. Get a second opinion on critical issues

### For Teams

1. Have different people test different sections
2. Cross-verify critical functionality
3. Share test results and documentation
4. Establish clear go/no-go criteria

## 🎯 Success Criteria

A release is ready when:

- ✅ All checklist items pass
- ✅ No critical failures observed
- ✅ Performance is acceptable
- ✅ Documentation is updated
- ✅ Test results are documented
- ✅ Team consensus on readiness

## 📞 Questions & Support

If you're unsure about any test results:

1. Document your concerns clearly
2. Test in a different environment
3. Get a second opinion from another developer
4. When in doubt, delay the release

**Remember: It's better to delay a release than to ship broken functionality.**

---

_This testing process was implemented after v1.2.3 to prevent the malware-like behavior that occurred in earlier versions. Following this process helps ensure user safety and extension quality._

### 📝 **Editing the QA Testing Checklist**

**⚠️ Important**: Don't edit the original `QA-TESTING-CHECKLIST.md` directly, as it may be overwritten by extension updates.

#### **Recommended Approach: Create a Custom Checklist**

1. **Create Custom Checklist:**

   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type: `PrismFlow: Create Custom QA Checklist`
   - Press Enter

2. **This will create:** `QA-TESTING-CHECKLIST-CUSTOM.md`
   - ✅ **Safe to edit** - Won't be overwritten by updates
   - ✅ **Team shareable** - Can be tracked in version control
   - ✅ **Project-specific** - Customize for your needs
   - ✅ **Original preserved** - Default checklist remains intact

#### **Alternative: Quick Access to Original (Read-Only)**

For reference or quick checking, you can still open the original:

- Press `Ctrl+Shift+P` and type: `PrismFlow: Open QA Testing Checklist`
- This opens the original file (use for reference, not editing)

### **Customization Benefits:**

#### **✅ Safe to Modify:**

- Add project-specific test cases
- Modify test descriptions for clarity
- Add additional edge cases
- Update environment requirements
- Customize the testing template
- Add team-specific processes

#### **✅ Version Control Friendly:**

- Track your customizations in Git
- Share with team members
- Document changes and rationale
- Maintain testing standards across projects

#### **✅ Update-Safe:**

- Original checklist can be updated by extension
- Your customizations are preserved
- No conflicts with extension updates
- Easy to merge improvements from original

#### **Structure of the Checklist:**

The checklist is organized into 10 main sections:

1. **Core Extension Functionality** - Basic operations
2. **File Operations** - Critical security checks
3. **Monorepo Support** - Multi-package testing
4. **Discord Integration** - Webhook functionality
5. **Dashboard & UI** - User interface testing
6. **Version Management** - Package operations
7. **Performance & Stability** - Resource usage
8. **Edge Cases & Scenarios** - Unusual conditions
9. **Pre-Release Final Checks** - Final validation
10. **Release Process** - Deployment readiness
