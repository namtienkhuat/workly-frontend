import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';
import {
    Message,
    SendMessagePayload,
    GetMessagesParams,
    ApiResponse,
    PaginatedResponse,
} from '../../types';
import { CHAT_CONSTANTS, API_ENDPOINTS } from '../../constants/chat.constants';

// Create axios instance for message API
const messageApi = axios.create({
    baseURL: CHAT_CONSTANTS.CHAT_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
messageApi.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await getSession();
        if (token?.apiToken) {
            config.headers.Authorization = `Bearer ${token.apiToken}`;
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

