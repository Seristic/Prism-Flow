// src/utils.ts

export function adjustRgbaOpacity(color: string, opacity: number): string {
    if (color.startsWith('rgba')) {
        const parts = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (parts && parts.length === 5) {
            return `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${opacity})`;
        }
    } else if (color.startsWith('#')) {
        // Convert HEX to RGB, then apply opacity
        const hex = color.slice(1);
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    // Fallback if color format is not recognized or invalid
    return `rgba(128, 128, 128, ${opacity})`; // Default to grey with opacity
}