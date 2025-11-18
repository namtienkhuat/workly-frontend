// UI-specific types

export interface ChatPopupState {
    conversationId: string;
    isMinimized: boolean;
    position: number;
}

export type ChatViewMode = 'full' | 'popup' | 'window';

export interface ChatWindowPosition {
    conversationId: string;
    position: number;
}

