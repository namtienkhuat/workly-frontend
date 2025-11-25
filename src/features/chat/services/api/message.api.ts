import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
    Message,
    SendMessagePayload,
    GetMessagesParams,
    ApiResponse,
    PaginatedResponse,
} from '../../types';
import { CHAT_CONSTANTS, API_ENDPOINTS } from '../../constants/chat.constants';
import { TOKEN_KEY } from '@/constants';
import { useChatStore } from '../../store';

// Create axios instance for message API
const messageApi = axios.create({
    baseURL: CHAT_CONSTANTS.CHAT_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Get current chat identity from Zustand store
function getCurrentChatIdentity() {
    if (typeof window === 'undefined') return null;

    const state = useChatStore.getState();
    const userId = state.currentUserId;
    const userType = state.currentUserType;

    // Keep uppercase to match DB format (COMPANY, USER)
    return userId && userType ? { userId, userType } : null;
}

// Request interceptor to add auth token and chat identity headers
messageApi.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Get current chat identity
        const identity = getCurrentChatIdentity();

        // Add identity override headers if present (for company mode)
        // The backend will use these headers if provided, otherwise use JWT identity
        if (identity) {
            config.headers['x-user-id'] = identity.userId;
            config.headers['x-user-type'] = identity.userType;

            console.log('🔄 Adding identity headers:', {
                userId: identity.userId,
                userType: identity.userType,
            });
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

export const messageApiService = {
    /**
     * Send a message
     */
    async sendMessage(payload: SendMessagePayload): Promise<ApiResponse<Message>> {
        const response = await messageApi.post<ApiResponse<Message>>(
            API_ENDPOINTS.MESSAGES,
            payload
        );
        return response.data;
    },

    /**
     * Get messages for a conversation
     */
    async getMessages(
        conversationId: string,
        params?: GetMessagesParams
    ): Promise<PaginatedResponse<Message[]>> {
        const response = await messageApi.get<PaginatedResponse<Message[]>>(
            API_ENDPOINTS.MESSAGES_BY_CONVERSATION(conversationId),
            { params }
        );
        return response.data;
    },

    /**
     * Mark a specific message as read
     */
    async markMessageAsRead(messageId: string): Promise<ApiResponse<Message>> {
        const response = await messageApi.put<ApiResponse<Message>>(
            API_ENDPOINTS.MARK_MESSAGE_READ(messageId)
        );
        return response.data;
    },

    /**
     * Mark all messages in a conversation as read
     */
    async markAllMessagesAsRead(conversationId: string): Promise<ApiResponse<null>> {
        const response = await messageApi.put<ApiResponse<null>>(
            API_ENDPOINTS.MARK_ALL_READ(conversationId)
        );
        return response.data;
    },
};
