# 🤝 Contributing to PrismFlow

We welcome contributions to PrismFlow! This guide will help you get started with contributing code, documentation, bug reports, and feature requests.

## 🚀 Quick Start for Contributors

1. **Fork the Repository**: Create your own fork on GitHub
2. **Clone Locally**: Clone your fork to your development machine
3. **Set Up Development**: Install dependencies and set up development environment
4. **Make Changes**: Implement your feature or fix
5. **Test Thoroughly**: Run tests and QA checklist
6. **Submit Pull Request**: Create a pull request with your changes

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Contribution Process](#code-contribution-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Contributions](#documentation-contributions)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)
- [Code Review Process](#code-review-process)

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Git** (latest version)
- **VS Code** (latest stable version)
- **TypeScript** knowledge (for code contributions)

### Repository Structure

```
prism-flow/
├── src/                    # Source code
│   ├── extension.ts        # Main extension entry point
│   ├── commands/           # Command implementations
│   ├── webviews/          # Webview implementations
│   ├── managers/          # Feature managers
│   └── utils/             # Utility functions
├── docs/                  # Documentation
├── wiki-pages/            # Wiki documentation
├── builds/                # Extension builds
├── tests/                 # Test files
├── package.json           # Extension manifest
├── tsconfig.json          # TypeScript configuration
└── README.md              # Main documentation
```

### Code Style

PrismFlow follows these coding standards:

- **TypeScript**: Strict type checking enabled
- **ESLint**: Linting rules enforced
- **Prettier**: Code formatting (if configured)
- **Naming**: camelCase for variables, PascalCase for classes
- **Comments**: JSDoc for public functions

## 🛠️ Development Setup

### 1. Fork and Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/prism-flow.git
cd prism-flow

# Add upstream remote
git remote add upstream https://github.com/seristic/prism-flow.git
```

### 2. Install Dependencies

```bash
# Install npm dependencies
npm install

# Verify installation
npm run compile
```

### 3. Development Environment

```bash
# Start TypeScript compiler in watch mode
npm run watch

# Open in VS Code
code .
```

### 4. Running the Extension

1. **Open in VS Code**: Open the project folder in VS Code
2. **Start Debugging**: Press `F5` or go to Run > Start Debugging
3. **Extension Host**: A new VS Code window opens with the extension loaded
4. **Test Features**: Test your changes in the Extension Development Host

### 5. Building and Packaging

```bash
# Compile TypeScript
npm run compile

# Run linting
npm run lint

# Package extension
npx vsce package

# Run tests (if available)
npm test
```

## 🔄 Code Contribution Process

### 1. Choose What to Contribute

**Good First Issues**:

- Documentation improvements
- Bug fixes
- Small feature enhancements
- Test coverage improvements

**Larger Contributions**:

- New features
- Architecture improvements
- Performance optimizations
- Security enhancements

### 2. Create Development Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 3. Make Your Changes

#### Code Guidelines

**File Organization**:

- Keep files focused on single responsibility
- Use descriptive file and function names
- Organize imports logically
- Add appropriate error handling

**TypeScript Standards**:

```typescript
// Good: Explicit types and documentation
/**
 * Updates the version in package.json files
 * @param version New version string
 * @param packages Array of package paths
 * @returns Promise resolving to updated file count
 */
export async function updateVersion(
  version: string,
  packages: string[]
): Promise<number> {
  // Implementation
}

// Avoid: Implicit types and no documentation
export async function updateVersion(version, packages) {
  // Implementation
}
```

**Error Handling**:

```typescript
// Good: Proper error handling
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error("Operation failed:", error);
  vscode.window.showErrorMessage(`Failed: ${error.message}`);
  throw error;
}

// Avoid: Silent failures
try {
  await riskyOperation();
} catch (error) {
  // Silent failure - don't do this
}
```

### 4. Testing Your Changes

#### Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] New features work as expected
- [ ] Existing features still work
- [ ] No performance regressions
- [ ] Error handling works properly

#### QA Testing

Run the comprehensive QA checklist:

```bash
# Open QA checklist
Ctrl+Shift+P → "PrismFlow: Open QA Testing Checklist"
```

Follow all applicable items in the QA checklist, especially:

- File operation safety
- Package manager compatibility
- Performance testing
- Error handling verification

### 5. Commit Your Changes

#### Commit Message Format

```bash
# Feature commits
git commit -m "feat: add manual Discord webhook trigger

- Add sendLatestReleaseWebhook function
- Add dashboard button for manual trigger
- Include error handling and fallbacks"

# Bug fix commits
git commit -m "fix: resolve Discord notification timing issue

- Fix race condition in webhook sending
- Add proper async/await handling
- Update error messages for clarity"

# Documentation commits
git commit -m "docs: update Discord integration guide

- Add manual webhook trigger instructions
- Include troubleshooting section
- Fix broken links in table of contents"
```

#### Commit Best Practices

- **Atomic Commits**: One logical change per commit
- **Clear Messages**: Descriptive commit messages
- **Include Context**: Explain why, not just what
- **Reference Issues**: Link to relevant GitHub issues

### 6. Submit Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create pull request on GitHub
```

#### Pull Request Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing

- [ ] Manual testing completed
- [ ] QA checklist followed
- [ ] No breaking changes
- [ ] Error handling tested

## Screenshots (if applicable)

Add screenshots or GIFs showing the changes

## Additional Context

Any additional information about the changes
```

## 🧪 Testing Guidelines

### Manual Testing

#### Core Features Testing

1. **Dashboard Functionality**: Test all dashboard buttons and features
2. **Command Palette**: Verify all commands work correctly
3. **Discord Integration**: Test webhook setup and notifications
4. **GitHub Integration**: Test release manager and webhook setup
5. **Version Management**: Test version updates and changelog generation

#### Edge Case Testing

1. **Error Scenarios**: Test with invalid inputs
2. **Network Issues**: Test with poor/no internet connection
3. **Permission Issues**: Test with read-only files
4. **Large Projects**: Test with large codebases
5. **Monorepos**: Test with complex project structures

### Automated Testing

#### Writing Tests (Future)

```typescript
// Example test structure
describe("Discord Manager", () => {
  test("should validate webhook URLs correctly", () => {
    const validUrl = "https://discord.com/api/webhooks/123/abc";
    const invalidUrl = "https://invalid-url.com";

    expect(validateWebhookUrl(validUrl)).toBe(true);
    expect(validateWebhookUrl(invalidUrl)).toBe(false);
  });
});
```

### Performance Testing

#### Memory Usage

- Monitor VS Code memory usage with extension loaded
- Check for memory leaks during long sessions
- Verify proper cleanup of resources

#### Startup Time

- Measure extension activation time
- Ensure activation doesn't block VS Code startup
- Test on different machine configurations

## 📚 Documentation Contributions

### Wiki Pages

#### Updating Existing Pages

1. **Read Current Content**: Understand existing documentation
2. **Identify Gaps**: Find missing or outdated information
3. **Make Improvements**: Add clarity, examples, or corrections
4. **Test Instructions**: Verify all instructions work correctly

#### Creating New Pages

1. **Follow Structure**: Use consistent formatting and organization
2. **Include Examples**: Provide concrete examples and code snippets
3. **Add Navigation**: Link to related pages
4. **Review Guidelines**: Follow markdown best practices

### Code Documentation

#### JSDoc Standards

```typescript
/**
 * Sends a Discord notification for a GitHub release
 * @param context VS Code extension context
 * @param releaseName Name of the release (e.g., "v1.2.5")
 * @param releaseUrl URL to the GitHub release
 * @param description Release description or changelog
 * @param singleWebhookOnly Whether to use only one webhook to prevent spam
 * @returns Promise that resolves when notification is sent
 * @throws Error if no webhooks configured or network issues
 */
export async function notifyRelease(
  context: vscode.ExtensionContext,
  releaseName: string,
  releaseUrl: string,
  description: string,
  singleWebhookOnly: boolean = false
): Promise<void>;
```

## 🐛 Bug Reports

### Before Reporting

1. **Search Existing Issues**: Check if bug already reported
2. **Reproduce Consistently**: Ensure bug can be reproduced
3. **Test Latest Version**: Verify bug exists in latest version
4. **Gather Information**: Collect relevant system information

### Bug Report Template

```markdown
## Bug Description

Clear description of the bug

## Steps to Reproduce

1. Step one
2. Step two
3. Step three

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Environment

- OS: [Windows/macOS/Linux]
- VS Code Version: [e.g., 1.85.0]
- PrismFlow Version: [e.g., 1.2.5]
- Node.js Version: [if relevant]

## Additional Context

- Error messages
- Screenshots
- Log output
- Related issues
```

### Providing Logs

#### VS Code Developer Tools

1. **Open Developer Tools**: `Help > Toggle Developer Tools`
2. **Check Console**: Look for error messages
3. **Copy Relevant Logs**: Include in bug report

#### Extension Logs

```bash
# Enable extension logging
"prismflow.logging.enabled": true

# Check logs in VS Code output panel
View > Output > Select "PrismFlow" from dropdown
```

## 🌟 Feature Requests

### Before Requesting

1. **Check Roadmap**: Review planned features
2. **Search Issues**: Look for similar requests
3. **Consider Scope**: Ensure feature fits extension goals
4. **Think About Implementation**: Consider technical feasibility

### Feature Request Template

```markdown
## Feature Description

Clear description of the proposed feature

## Problem Statement

What problem does this solve?

## Proposed Solution

How should this feature work?

## Alternatives Considered

Other ways to solve the problem

## Use Cases

Who would use this feature and how?

## Implementation Notes

Technical considerations or suggestions
```

## 👀 Code Review Process

### For Contributors

#### Before Requesting Review

- [ ] Code compiles without errors
- [ ] Manual testing completed
- [ ] QA checklist followed
- [ ] Documentation updated
- [ ] Commit messages are clear

#### Responding to Reviews

1. **Be Responsive**: Address feedback promptly
2. **Ask Questions**: Clarify unclear feedback
3. **Make Changes**: Implement requested changes
4. **Test Again**: Verify changes work correctly

### For Reviewers

#### Review Checklist

- [ ] Code follows project standards
- [ ] Changes are well-tested
- [ ] Documentation is updated
- [ ] No security issues
- [ ] Performance impact considered

#### Review Guidelines

1. **Be Constructive**: Provide helpful feedback
2. **Explain Reasoning**: Help contributor understand suggestions
3. **Suggest Improvements**: Offer specific recommendations
4. **Approve When Ready**: Don't hold up good contributions

## 🎯 Contribution Areas

### High Priority

1. **Testing Framework**: Help establish automated testing
2. **Performance Optimization**: Improve extension performance
3. **Error Handling**: Enhance error messages and recovery
4. **Documentation**: Improve and expand documentation
5. **Accessibility**: Make extension more accessible

### Medium Priority

1. **New Features**: Implement requested features
2. **Code Refactoring**: Improve code organization
3. **UI/UX Improvements**: Enhance user experience
4. **Integration Tests**: Add comprehensive testing
5. **Localization**: Add multi-language support

### Ongoing Needs

1. **Bug Fixes**: Address reported issues
2. **Documentation Updates**: Keep docs current
3. **Community Support**: Help other users
4. **Code Reviews**: Review other contributions
5. **Testing**: Help test new features

## 🏆 Recognition

### Contributors

All contributors are recognized in:

- **README.md**: Contributors section
- **CHANGELOG.md**: Release notes
- **GitHub**: Contributor graphs and statistics

### Types of Contributions

We value all types of contributions:

- **Code**: Features, bug fixes, improvements
- **Documentation**: Wiki pages, guides, examples
- **Testing**: Manual testing, bug reports, QA
- **Design**: UI/UX improvements, icons, themes
- **Community**: Support, discussions, feedback

## 📞 Getting Help

### Development Questions

- **GitHub Discussions**: [Project Discussions](https://github.com/seristic/prism-flow/discussions)
- **Issues**: Create issue with "question" label
- **Code Comments**: Ask questions in pull request comments

### Community Support

- **Discord**: [Join our Discord server] (if available)
- **Gitter**: [Project Chat Room] (if available)
- **Email**: [Contact maintainers] (if available)

## 🔗 Additional Resources

- **[Home](Home.md)** - Main documentation hub
- **[Discord Integration](Discord-Integration.md)** - Discord setup guide
- **[GitHub Webhook](GitHub-Webhook.md)** - GitHub integration guide
- **[Version Management](Version-Management.md)** - Version control workflows
- **[Roadmap](Roadmap.md)** - Future development plans

---

**Thank you for contributing to PrismFlow! Your contributions help make the extension better for everyone.** 🚀
