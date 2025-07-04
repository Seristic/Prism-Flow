<!-- PROJECT-STRUCTURE.md -->

# PrismFlow Project Structure

## 📁 Directory Organization

```
PrismFlow/
├── 📦 builds/                    # Extension packages and build history
│   ├── BUILD-STATUS.md           # Build status tracking and glossary
│   ├── prismflow-1.0.0.vsix      # v1.0.0 - Dashboard integration (superseded)
│   ├── prismflow-1.1.0.vsix      # v1.1.0 - Dashboard reliability (superseded)
│   ├── prismflow-1.2.0.vsix      # v1.2.0 - Monorepo support (superseded)
│   ├── prismflow-1.2.1.vsix      # v1.2.1 - Discord fix (superseded)
│   ├── prismflow-1.2.2.vsix      # v1.2.2 - REMOVED (malware-like behavior)
│   └── prismflow-1.2.3.vsix      # v1.2.3 - CURRENT (security fix)
│
├── 📚 docs/                      # Documentation
│   ├── DEVELOPER-QA-GUIDE.md     # Developer testing guide
│   └── MONOREPO-SUPPORT.md       # Monorepo feature documentation
│
├── 🗃️ archive/                   # Historical files and old documentation
│   ├── README.md                 # Archive index
│   ├── DASHBOARD-TESTING-FINAL.md
│   ├── TESTING-DASHBOARD.md
│   ├── RELEASE-1.1.0.md
│   ├── cleanup-final.ps1
│   ├── prevent-temp-files.ps1
│   ├── test-dashboard.js
│   └── test-highlighting.js
│
├── 💻 src/                       # Source code
│   ├── extension.ts              # Main extension file
│   ├── versionManager.ts         # Version and monorepo management
│   ├── discordManager.ts         # Discord webhook integration
│   ├── highlighter.ts            # Code highlighting logic
│   ├── decorationManager.ts      # VS Code decoration management
│   ├── likedLinesProvider.ts     # Liked lines feature
│   ├── gitignoreManager.ts       # Gitignore automation
│   ├── dashboardManager.ts       # Dashboard interface
│   ├── githubReleaseManager.ts   # GitHub release creation
│   └── webviews/                 # Webview components
│
├── 🎨 assets/                    # Extension assets
│   └── icon.png                  # Extension icon
│
├── 🗃️ wiki-pages/                # Wiki content backup
│
├── 📋 Root Files
│   ├── README.md                 # Main project documentation
│   ├── CHANGELOG.md              # Version history and changes
│   ├── QA-TESTING-CHECKLIST.md  # Mandatory pre-release testing
│   ├── SECURITY.md               # Security policy and procedures
│   ├── CONTRIBUTING.md           # Contribution guidelines
│   ├── LICENSE.md                # Project license (SOLACE)
│   ├── ROADMAP.md                # Development roadmap
│   ├── package.json              # Extension configuration
│   ├── tsconfig.json             # TypeScript configuration
│   ├── eslint.config.mjs         # Linting configuration
│   ├── .gitignore                # Git ignore rules
│   ├── .vscodeignore             # VS Code packaging ignore
│   └── .vscode-test.mjs          # Testing configuration
│
└── 🔧 Build Output
    ├── out/                      # Compiled JavaScript
    └── node_modules/             # Dependencies
```

## 📊 File Status Legend

- 📦 **Current Release Files**: Actively maintained and distributed
- 📚 **Active Documentation**: Current documentation and guides
- 🗃️ **Archived Files**: Historical files kept for reference
- 💻 **Source Code**: Active development files
- 🔧 **Build Artifacts**: Generated files and dependencies

## 🛠️ Quick Navigation

### For Users

- **Installation**: See [README.md](README.md)
- **Latest Download**: [builds/prismflow-1.2.3.vsix](builds/prismflow-1.2.3.vsix)
- **Documentation**: [docs/](docs/) directory
- **Security Info**: [SECURITY.md](SECURITY.md)

### For Developers

- **QA Testing**: [QA-TESTING-CHECKLIST.md](QA-TESTING-CHECKLIST.md)
- **Testing Guide**: [docs/DEVELOPER-QA-GUIDE.md](docs/DEVELOPER-QA-GUIDE.md)
- **Build Status**: [builds/BUILD-STATUS.md](builds/BUILD-STATUS.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)

### For Maintainers

- **Build Archive**: [builds/](builds/) directory
- **Change History**: [CHANGELOG.md](CHANGELOG.md)
- **Security Policy**: [SECURITY.md](SECURITY.md)
- **Development Plan**: [ROADMAP.md](ROADMAP.md)

---

**Last Updated**: July 3, 2025  
**Project Organization**: Post-cleanup structure for v1.2.3+
