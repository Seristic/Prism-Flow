<!-- TESTING-DASHBOARD.md -->

# PrismFlow Dashboard Testing Guide

## Current Changes Made:

1. **Modified dashboard command execution** to automatically focus a text editor when no active editor exists but visible editors are present
2. **Added comprehensive debug logging** to trace command execution flow
3. **Enhanced error handling** and user feedback in the dashboard

## Testing Steps:

### Step 1: Install the Updated Extension

1. In VS Code, go to Extensions (Ctrl+Shift+X)
2. Click the "..." menu and select "Install from VSIX..."
3. Select the `prismflow-1.0.0.vsix` file in this directory
4. Reload VS Code if prompted

### Step 2: Open Test Files

1. Open the `test-dashboard.js` file in VS Code
2. Also open `test-highlighting.js` (both files should be visible in tabs)

### Step 3: Open the Dashboard

1. Open Command Palette (Ctrl+Shift+P)
2. Run "PrismFlow: Show Dashboard"
3. The dashboard should open in a new panel/tab

### Step 4: Test Dashboard Highlighting

**Important**: Keep the Developer Console open to see debug logs:

- Press F12 or Ctrl+Shift+I to open Developer Tools
- Go to Console tab to see debug messages

#### Test A: Dashboard with Visible Editors

1. With both test files open and visible
2. Click on the Dashboard tab/panel to focus it (this should make activeTextEditor undefined)
3. Click "🔄 Refresh Highlights" button in the dashboard
4. **Expected behavior**:
   - Debug logs should show the command execution
   - The system should automatically focus a text editor
   - Highlights should be applied to visible JavaScript files
   - Success message should appear in the dashboard

#### Test B: Clear Highlights

1. With highlights applied, click "🧹 Clear All Highlights" in the dashboard
2. **Expected behavior**:
   - All highlights should be removed from visible editors
   - Success message should appear

### Step 5: Monitor Debug Output

Look for these debug messages in the Console:

```
Dashboard executing command: prismflow.applyHighlights
Visible editors count: X
Active editor: exists/none
Focusing first visible editor... (if needed)
prismflow.applyHighlights command called
Applying PrismFlow decorations...
```

## Expected Results:

- ✅ Dashboard buttons should work even when dashboard is focused
- ✅ Highlighting should apply to visible JavaScript/TypeScript files
- ✅ Clear function should remove all highlights
- ✅ User feedback should appear in dashboard status area
- ✅ No "Please open a file in the editor first" errors when files are open

## If Still Not Working:

Check the debug console for error messages and note:

1. What debug messages appear when clicking buttons
2. Whether the editor gets focused automatically
3. Any error messages in the console
4. Whether the commands are being called at all

## Alternative Test:

If dashboard still doesn't work, try these commands directly:

1. Focus a text editor (click on the test-dashboard.js tab)
2. Use Ctrl+Shift+P and run "PrismFlow: Refresh Highlights"
3. This should work and help isolate if the issue is dashboard-specific

The key change is that the dashboard now automatically focuses a text editor when needed, which should resolve the "no active editor" issue that was preventing highlighting from working.
