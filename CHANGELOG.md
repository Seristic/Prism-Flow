# Change Log - v0.1.0

This commit introduces the initial version of the PrismFlow VS Code extension,
designed to enhance the readability and navigation of deeply nested JSON and
similar bracket-based language structures. It provides visual cues through
depth-based highlighting, active block focus, and error detection, alongside
powerful navigation and contextual information tools.

Features:

- **Core Highlighting**: Implements a depth-based background highlighting system for
  objects (`{}`) and arrays (`[]`), making it easier to visually distinguish
  nesting levels. Configurable colors allow for personalized visual themes.
- **Active Block Highlighting**: Automatically highlights the innermost object or
  array block that currently contains the cursor, providing immediate context
  awareness.
- **Error Detection**: Visually identifies and highlights unmatched opening and
  closing braces (`{`, `}`, `[`, `]`) within the document, aiding in syntax error
  detection.
- **Enhanced Block Labels**: Introduces configurable inline labels displayed after
  closing braces. These labels provide valuable context including the block's
  inferred `name` (e.g., 'Object', 'Array', or property name), its `depth` in the
  document, and its total `line count` and `character count`.
- **Dynamic Status Bar Integration**: A dedicated status bar item dynamically
  displays information about the currently active block, including its depth,
  a generated full JSON-like path (`root.property.subproperty[array]`), its line
  count, and character count.
- **Navigation Commands**:
  - `PrismFlow: Copy Block Path`: Copies the full JSON-like path of the active
    block to the clipboard for quick reference or external use.
  - `PrismFlow: Navigate to Block`: Presents a Quick Pick menu listing all
    highlighted blocks by their full path, depth, line count, and character count,
    allowing users to quickly jump to specific sections of the document.
- **Configurability**: Offers extensive configuration options via VS Code settings
  to customize highlight colors, active highlight style, error highlight style,
  label format, supported languages, status bar item priority, and the root path name.
- **Lifecycle Management**: Implements robust initialization, reinitialization,
  and disposal logic for all `TextEditorDecorationType` instances and the
  `StatusBarItem`. This ensures proper cleanup and prevents common "unknown
  decoration type key" errors, especially when settings change or the extension
  is reactivated.
- **Performance Optimizations**: Incorporates debouncing for `onDidChangeTextDocument`
  and `onDidChangeTextEditorSelection` events to prevent excessive rendering and
  computations during rapid typing or navigation, ensuring a smooth user experience.

Fixes:

- Resolved `undefined` decoration type errors that occurred during extension
  activation and highlight application. This was primarily due to variables
  (`errorDecorationType`, `regularDecorationTypes`) being accessed before their
  proper initialization within the `initializeAndReapplyHighlights` function.
- Corrected a recurring typo from `errorDecorationTypes` to `errorDecorationType`
  in command registrations and highlight application calls, fixing related TypeScript
  compilation errors.
- Adjusted the call to `highlighter.getQuickPickItems()` to correctly reflect its
  signature of expecting no arguments, resolving a compilation error.
- Added a fallback mechanism for `regularDecorationTypes` to ensure at least one
  transparent decoration type exists if no highlight colors are configured,
  preventing potential division-by-zero errors in the highlighting logic.
