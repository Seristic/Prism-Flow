// src/constants.ts
import * as vscode from "vscode"; // <-- VS Code API for decoration types

/**
 * Delay in milliseconds for debouncing text document changes and selection changes.
 * Prevents excessive processing on rapid user input.
 */
export const DEBOUNCE_DELAY = 100;

/**
 * Regex pattern to find any curly brace ({, }) or square bracket ([, ]).
 * Used for general brace/bracket parsing to track nesting levels.
 */
export const BRACKET_PATTERN = /[\{\}\[\]]/g;

/**
 * Regex pattern to identify the start of an object or array declaration.
 * This is crucial for distinguishing actual data structures from generic code blocks.
 * It matches:
 * - "key": {
 * - "key": [
 * - { (when at the start of a line, after whitespace, or a comma/newline)
 * - [ (when at the start of a line, after whitespace, or a comma/newline)
 */
export const OBJECT_OR_ARRAY_START_PATTERN =
  /(?:\"([A-Za-z_][A-Za-z0-9_]*)\"\s*:\s*|\s*[,\n]\s*|\s*|\)\s*=>\s*|\)\s*|\bfunction\s+[A-Za-z_][A-Za-z0-9_]*\s*\([^)]*\)\s*)\{|\[/g;

/**
 * Default background color for labels (e.g., -- Object (Depth: X)).
 * This is the greenish background you see behind block labels.
 */
export const DEFAULT_LABEL_BG_COLOR = "rgba(0, 128, 0, 0.7)";

/**
 * Default format string for block labels.
 * This can either be a predefined format name from the enum in package.json,
 * or a custom format string with placeholders:
 * - {name}: The block's inferred name (e.g., 'Object', 'details')
 * - {depth}: The block's nesting depth
 * - {lines}: The number of lines in the block
 * - {chars}: The number of characters in the block
 */
export const DEFAULT_LABEL_FORMAT = "depth-name-lines";

/**
 * Default highlight colors used for cycling through nesting levels.
 * These are RGBA values with a default opacity, which can be overridden by 'highlightOpacity'.
 * Each nesting level gets its own color, making it easier to see structure at a glance.
 */
export const DEFAULT_HIGHLIGHT_COLORS = [
  "rgba(255, 255, 0, 0.3)", // Yellow
  "rgba(0, 255, 255, 0.3)", // Cyan
  "rgba(255, 0, 255, 0.3)", // Magenta
  "rgba(0, 255, 0, 0.3)", // Green
  "rgba(255, 165, 0, 0.3)", // Orange
  "rgba(100, 100, 255, 0.3)", // Light Blue
  "rgba(255, 100, 100, 0.3)", // Light Red
];

/**
 * Default opacity for background highlights.
 * You can make highlights more or less transparent by changing this value.
 */
export const DEFAULT_HIGHLIGHT_OPACITY = 0.3;

/**
 * Default style properties for the active block highlight.
 * This is an object that directly maps to VS Code's `DecorationRenderOptions`.
 */
/**
 * The default style options for highlighting the active element in the editor.
 *
 * - Adds a subtle white border around the highlighted element.
 * - Displays a white marker in the editor's overview ruler (scrollbar).
 * - The marker spans the full overview ruler lane.
 *
 * @see vscode.DecorationRenderOptions
 */
export const DEFAULT_ACTIVE_HIGHLIGHT_STYLE: vscode.DecorationRenderOptions = {
  // <-- Added type annotation
  border: "1px solid rgba(255, 255, 255, 0.8)", // A subtle white border
  overviewRulerColor: "rgba(255, 255, 255, 0.8)", // White marker in scrollbar
  overviewRulerLane: vscode.OverviewRulerLane.Full, // Show marker across the lane
};

/**
 * Whether to show the overview ruler marker by default.
 * If true, you'll see colored markers in the scrollbar for highlighted blocks.
 */
export const DEFAULT_SHOW_OVERVIEW_RULER = true;

/**
 * Style for highlighting errors in the document.
 * Shows a light red background and a wavy underline to catch your attention.
 */
export const DEFAULT_ERROR_HIGHLIGHT_STYLE: vscode.DecorationRenderOptions = {
  backgroundColor: "rgba(255, 0, 0, 0.1)", // Light red background
  textDecoration: "underline wavy red", // Wavy red underline
  overviewRulerColor: "red", // Red marker in scrollbar
  overviewRulerLane: vscode.OverviewRulerLane.Full,
};

export const DEFAULT_SHOW_DEPTH_IN_STATUS_BAR = true;

export const DEFAULT_STATUS_BAR_PRIORITY = 100;

export const DEFAULT_ROOT_PATH_NAME = "$";

/**
 * Default list of language IDs where PrismFlow should be active.
 * Add or remove language IDs here to control where the extension works.
 */
export const DEFAULT_SUPPORTED_LANGUAGES = [
  "json",
  "javascript",
  "typescript",
  "jsonc",
];
