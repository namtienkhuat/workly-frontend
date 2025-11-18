'use client';

/**
 * ChatProvider - Temporarily disabled
 * 
 * Previous implementation used old chat components (ChatWindowsManager, ChatPopupManager)
 * which have been refactored into the new feature-based architecture.
 * 
 * Window/Popup functionality can be re-implemented later if needed
 * using components from @/features/chat
 */

interface ChatProviderProps {
    children: React.ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
    // Temporarily disabled - chat windows/popups functionality
    // will be re-implemented with new architecture if needed
    return <>{children}</>;
}
