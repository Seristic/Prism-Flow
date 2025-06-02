// src/likedLinesStorage.ts
import * as vscode from 'vscode';
import { LikedLineData } from './likedLine';

const LIKED_LINES_STORAGE_KEY = 'prismflow.likedLines';

/**
 * Retrieves all stored liked lines from globalState.
 * Sorts them by timestamp (newest first).
 */
export function getLikedLines(context: vscode.ExtensionContext): LikedLineData[] {
    const stored = context.globalState.get<LikedLineData[]>(LIKED_LINES_STORAGE_KEY, []);
    return stored.sort((a, b) => b.timestamp - a.timestamp); // Sort by most recent first
}

/**
 * Adds a new liked line to storage. Prevents exact duplicates (same file + line).
 */
export function addLikedLine(context: vscode.ExtensionContext, newLine: LikedLineData): void {
    const current = getLikedLines(context);
    // Check for exact duplicates (same file path and line number)
    const isDuplicate = current.some(
        line => line.filePath === newLine.filePath && line.lineNumber === newLine.lineNumber
    );

    if (!isDuplicate) {
        current.unshift(newLine); // Add to the beginning to show newest first
        context.globalState.update(LIKED_LINES_STORAGE_KEY, current);
    }
}

/**
 * Removes a liked line from storage by its unique ID.
 */
export function removeLikedLine(context: vscode.ExtensionContext, id: string): void {
    let current = getLikedLines(context);
    current = current.filter(line => line.id !== id);
    context.globalState.update(LIKED_LINES_STORAGE_KEY, current);
}