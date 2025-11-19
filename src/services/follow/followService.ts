import { getDataWithStatus, useData } from '@/hooks/useQueryData';
import api from '@/utils/api';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

// Follow/Unfollow mutations
interface FollowResponse {
    success: boolean;
    message: string;
}

export const getFollowUserStatus = async (userId: string) => {
    try {
        const { data } = await api.get(`/users/${userId}/is-following`);
        return {
            status: 'success',
            success: true,
            data: data.data,
        };
    } catch (error: any) {
        return {
            status: 'error',
            success: false,
            message: error?.message || 'Unknown error',
        };
    }
};

export const getFollowCompanyStatus = async (companyId: string) => {
    try {
        const { data } = await api.get(`/companies/${companyId}/is-following`);
        return {
            status: 'success',
            success: true,
            data: data.data,
        };
    } catch (error: any) {
        return {
            status: 'error',
            success: false,
            message: error?.message || 'Unknown error',
        };
    }
};

export function useGetCompanyFollowers(
    id: string,
    queryParams: Record<string, any> = {},
    enabled: boolean = true
) {
    return useData([`/companies/${id}/followers`, queryParams], getDataWithStatus, enabled);
}

export function useGetUserFollowers(
    id: string,
    queryParams: Record<string, any> = {},
    enabled: boolean = true
) {
    return useData([`/users/${id}/followers`, queryParams], getDataWithStatus, enabled);
}

export function useFollowUser(options?: UseMutationOptions<FollowResponse, Error, string>) {
    return useMutation<FollowResponse, Error, string>({
        mutationFn: async (userId: string) => {
            try {
                const response = await api.post(`/users/${userId}/follow`);
                return response.data;
            } catch (error: any) {
                throw new Error(error.response?.data?.message || 'Failed to follow user');
            }
        },
        ...options,
    });
}

export function useUnfollowUser(options?: UseMutationOptions<FollowResponse, Error, string>) {
    return useMutation<FollowResponse, Error, string>({
        mutationFn: async (userId: string) => {
            try {
                const response = await api.delete(`/users/${userId}/follow`);
                return response.data;
            } catch (error: any) {
                throw new Error(error.response?.data?.message || 'Failed to unfollow user');
            }
        },
        ...options,
    });
}

export function useFollowCompany(options?: UseMutationOptions<FollowResponse, Error, string>) {
    return useMutation<FollowResponse, Error, string>({
        mutationFn: async (companyId: string) => {
            try {
                const response = await api.post(`/companies/${companyId}/follow`);
                return response.data;
            } catch (error: any) {
                throw new Error(error.response?.data?.message || 'Failed to follow company');
            }
        },
        ...options,
    });
}

export function useUnfollowCompany(options?: UseMutationOptions<FollowResponse, Error, string>) {
    return useMutation<FollowResponse, Error, string>({
        mutationFn: async (companyId: string) => {
            try {
                const response = await api.delete(`/companies/${companyId}/follow`);
                return response.data;
            } catch (error: any) {
                throw new Error(error.response?.data?.message || 'Failed to unfollow company');
            }
        },
        ...options,
    });
}
