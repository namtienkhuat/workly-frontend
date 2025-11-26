/**
 * Utility functions for managing user-specific appearance settings
 */

export type FontSize = 'small' | 'medium' | 'large';
export type AccentColor = 'blue' | 'green' | 'purple' | 'orange';

export interface AppearanceSettings {
    fontSize: FontSize;
    accentColor: AccentColor;
}

const DEFAULT_SETTINGS: AppearanceSettings = {
    fontSize: 'medium',
    accentColor: 'green',
};

/**
 * Get localStorage key for user's appearance settings
 */
function getStorageKey(userId?: string): string | null {
    if (!userId) return null;
    return `workly_appearance_${userId}`;
}

/**
 * Get appearance settings for a specific user
 */
export function getAppearanceSettings(userId?: string): AppearanceSettings {
    if (!userId) return DEFAULT_SETTINGS;

    const key = getStorageKey(userId);
    if (!key) return DEFAULT_SETTINGS;

    try {
        const stored = localStorage.getItem(key);
        if (!stored) return DEFAULT_SETTINGS;

        const parsed = JSON.parse(stored);
        return {
            fontSize: parsed.fontSize || DEFAULT_SETTINGS.fontSize,
            accentColor: parsed.accentColor || DEFAULT_SETTINGS.accentColor,
        };
    } catch (error) {
        console.error('Failed to load appearance settings:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Save appearance settings for a specific user
 */
export function saveAppearanceSettings(userId: string, settings: AppearanceSettings): void {
    const key = getStorageKey(userId);
    if (!key) return;

    try {
        localStorage.setItem(key, JSON.stringify(settings));
    } catch (error) {
        console.error('Failed to save appearance settings:', error);
    }
}

/**
 * Apply appearance settings to the document
 */
export function applyAppearanceSettings(settings: AppearanceSettings): void {
    const root = document.documentElement;

    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${settings.fontSize}`);

    // Apply accent color
    root.classList.remove('accent-blue', 'accent-green', 'accent-purple', 'accent-orange');
    root.classList.add(`accent-${settings.accentColor}`);
}

/**
 * Get current user ID from token (for use in blocking scripts)
 * This is a simplified version - adjust based on your JWT structure
 */
export function getUserIdFromToken(): string | null {
    try {
        const token = localStorage.getItem('workly_token');
        if (!token) return null;

        // JWT format: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(atob(parts[1]));
        return payload.id || payload.userId || payload.sub || null;
    } catch (error) {
        return null;
    }
}

