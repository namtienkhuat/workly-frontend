import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
    Conversation,
    CreateConversationPayload,
    GetConversationsParams,
    ApiResponse,
    PaginatedResponse,
} from '../../types';
import { CHAT_CONSTANTS, API_ENDPOINTS } from '../../constants/chat.constants';
import { TOKEN_KEY } from '@/constants';

// Create axios instance for conversation API
const conversationApi = axios.create({
    baseURL: CHAT_CONSTANTS.CHAT_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
conversationApi.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

export const conversationApiService = {
    /**
     * Create or get existing conversation with a participant
     */
    async createOrGetConversation(
        payload: CreateConversationPayload
    ): Promise<ApiResponse<Conversation>> {
        const response = await conversationApi.post<ApiResponse<Conversation>>(
            API_ENDPOINTS.CONVERSATIONS,
            payload
        );
        return response.data;
    },

    /**
     * Get all conversations for current user
     */
    async getConversations(
        params?: GetConversationsParams
    ): Promise<PaginatedResponse<Conversation[]>> {
        const response = await conversationApi.get<PaginatedResponse<Conversation[]>>(
            API_ENDPOINTS.CONVERSATIONS,
            { params }
        );
        return response.data;
    },

    /**
     * Get conversation by ID
     */
    async getConversationById(conversationId: string): Promise<ApiResponse<Conversation>> {
        const response = await conversationApi.get<ApiResponse<Conversation>>(
            API_ENDPOINTS.CONVERSATION_BY_ID(conversationId)
        );
        return response.data;
    },

    /**
     * Delete conversation
     */
    async deleteConversation(conversationId: string): Promise<ApiResponse<null>> {
        const response = await conversationApi.delete<ApiResponse<null>>(
            API_ENDPOINTS.CONVERSATION_BY_ID(conversationId)
        );
        return response.data;
    },
};
