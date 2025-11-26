'use client';

import { useEffect } from 'react';
import { applyAppearanceSettings } from '@/utils/appearance-settings';

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Listen for storage changes (when settings are saved in another tab)
        const handleStorageChange = (e: StorageEvent) => {
            // Check if it's a user-specific appearance setting
            if (e.key?.startsWith('workly_appearance_') && e.newValue) {
                try {
                    const settings = JSON.parse(e.newValue);
                    applyAppearanceSettings(settings);
                } catch (error) {
                    console.error('Failed to apply appearance settings from storage:', error);
                }
            }
        };

        // Listen for custom event (for same-tab updates when user saves)
        const handleSettingsChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            const { settings } = customEvent.detail;

            if (settings) {
                applyAppearanceSettings(settings);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('appearance-settings-changed', handleSettingsChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('appearance-settings-changed', handleSettingsChange);
        };
    }, []);

    return <>{children}</>;
}

