# PrismFlow

_Navigate Your Code with Clarity and Flow. Keep your repositories clean effortlessly._

---

## ✨ Description

**PrismFlow** is an accessibility-focused VS Code extension designed to revolutionize how you understand and navigate your codebase, while ensuring your Git repositories remain clean and focused.

In the dynamic world of development, code can quickly become complex and daunting, and untracked files can clutter your workspace. PrismFlow steps in to illuminate your path and streamline your workflow.

This extension intelligently highlights logical code blocks (like functions, objects, loops, or custom sections) and displays concise, contextual information directly in the editor's whitespace for instant clarity.

Beyond navigation, PrismFlow also introduces powerful `.gitignore` automation. It intelligently detects common untracked files (like build outputs, temporary files, or dependency folders) and can automatically add them to your `.gitignore`, keeping your repositories tidy without manual intervention. **Additionally, PrismFlow helps you kickstart new files by automatically inserting a header comment with essential file details like language and path.**

Experience a more intuitive and inclusive way to explore your code, making complex structures clear, easy to follow, and your Git management effortless.

---

## 🚀 Features

- **Intelligent Block Highlighting:** Automatically identifies and visually highlights distinct code blocks for quick recognition.
- **Contextual Whitespace Labels:** Displays names or summaries of code blocks in the adjacent whitespace, providing glanceable information.
- **Automated `.gitignore` Management:** Automatically detects untracked files matching configurable common patterns (e.g., `node_modules/`, `dist/`, `.env`).
- **Configurable Automation Interval:** Set the frequency at which PrismFlow scans for untracked files and updates your `.gitignore` in the background.
- **User Notifications:** Get discreet notifications when PrismFlow automatically adds new patterns to your `.gitignore`.
- **Automated New File Comments:** Automatically inserts a header comment into newly created files, including the detected language and the file's path.
- **Enhanced Readability:** Reduces cognitive load by visually segmenting code and offering immediate context.
- **Improved Navigation:** Quickly jump to or understand the purpose of different code sections.
- **Accessibility First:** Designed with a focus on making code more approachable and understandable for everyone.
- **Reliable Git Integration:** Leverages direct Git commands for accurate detection of untracked files, ensuring robust performance.

---

## 💻 Installation

### Via VS Code Marketplace (Coming Soon!)

Once PrismFlow is published, you'll be able to install it directly from the Visual Studio Code Marketplace:

1.  Open VS Code.
2.  Go to the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3.  Search for **PrismFlow**.
4.  Click **Install**.

### From Source (for Developers)

To run the development version or contribute:

1.  **Clone this repository:**

    ```bash
    git clone [https://github.com/seristic/prismflow.git](https://github.com/seristic/prismflow.git)
    cd prismflow
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Open the project in VS Code:**

    ```bash
    code .
    ```

4.  Press `F5` to open a new Extension Development Host window. Your PrismFlow extension will be active in this new window.

---

## 💡 Usage

### Code Structure Navigation (Primary Feature)

Once activated, PrismFlow automatically analyzes your active editor to identify logical code blocks based on common programming language structures (e.g., `if` statements, `for` loops, function definitions, object literals).

- **Visual Highlights:** You'll see a subtle background highlight applied to these detected blocks.
- **Whitespace Labels:** Next to the opening line of a highlighted block, a small label containing its inferred name or purpose will appear in the margin, allowing you to quickly scan and understand the code's structure at a glance.

### Automated `.gitignore` Management

PrismFlow can help keep your Git repositories clean by automatically adding patterns for common untracked files to your `.gitignore`.

#### Manual Trigger

You can manually run the automation at any time:

1.  Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
2.  Search for and select: **PrismFlow: Auto-Add Gitignore Patterns**.
3.  A quick pick menu will appear, allowing you to select which suggested patterns you'd like to add to your `.gitignore` file.

#### Automatic Background Checks

For a truly hands-off experience, PrismFlow can run periodically in the background:

- Based on the `prismflow.gitignore.automationInterval` setting (see [Configuration](#️-configuration) below), the extension will automatically scan your repositories for untracked files.
- If it finds untracked files matching your configured `commonPatterns`, it will automatically add them to your `.gitignore` file without requiring user confirmation.
- You will receive a brief information message notification in VS Code letting you know that patterns were automatically added.

### Automated New File Comments

When you create a new file in your workspace, PrismFlow will automatically detect it and insert a basic header comment at the top. This comment includes:

- The appropriate line comment syntax for the detected language (e.g., `//`, `#`, `

---

## 🤝 Contributing

We welcome contributions to PrismFlow! If you have ideas for new features, bug fixes, or improvements, please feel free to:

- Open an issue to report bugs or suggest enhancements.
- Fork the repository and submit a pull request.

Please refer to our `CONTRIBUTING.md` (to be created) for more details on our contribution guidelines.

---

## 📝 License

This project is licensed under The SOLACE License (Software Of Liberty And Community Equity).

See [**LICENSE**](LICENSE.md) for the full license text.
