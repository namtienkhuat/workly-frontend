// hooks/useAuth.ts
import { UserProfile } from '@/types/global';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';

const fetchMe = async (): Promise<UserProfile> => {
    const response = await api.get('/auth/me');
    console.log('fetchMe response:', response);
    return response.data;
};

export const useAuth = () => {
    const queryClient = useQueryClient();

    const {
        data: user,
        isLoading,
        isError,
    } = useQuery<UserProfile, Error>({
        queryKey: ['auth', 'me'],
        queryFn: fetchMe,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
        retry: false, // important: don't retry on 401
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    const isAuthenticated = !isLoading && !isError && !!user;

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            queryClient.setQueryData(['auth', 'me'], null);
            queryClient.removeQueries({ queryKey: ['auth', 'me'] });
        }
    };

    return {
        user: user ?? null,
        isLoading,
        isAuthenticated,
        isError,
        logout,
        refetch: () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
    };
};
