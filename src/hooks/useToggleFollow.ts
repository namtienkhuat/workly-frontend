import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import api from '@/utils/api';

interface FollowResponse {
    success: boolean;
    message: string;
}

type FollowType = 'user' | 'company';

interface ToggleFollowParams {
    id: string;
    isFollowing: boolean;
    type: FollowType;
}

export function useToggleFollow(
    options?: UseMutationOptions<FollowResponse, Error, ToggleFollowParams>
) {
    return useMutation<FollowResponse, Error, ToggleFollowParams>({
        mutationFn: async ({ id, isFollowing, type }: ToggleFollowParams) => {
            try {
                const entityType = type === 'user' ? 'users' : 'companies';
                const endpoint = `/${entityType}/${id}/follow`;
                const response = isFollowing
                    ? await api.delete(endpoint)
                    : await api.post(endpoint);
                return response.data;
            } catch (error: any) {
                throw new Error(error.response?.data?.message || 'Failed to toggle follow status');
            }
        },
        ...options,
    });
}
