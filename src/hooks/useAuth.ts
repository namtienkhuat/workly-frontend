// hooks/useAuth.ts
import { UserProfile } from '@/types/global';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { TOKEN_KEY } from '@/constants';

const fetchMe = async (): Promise<{ data: UserProfile }> => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const useAuth = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    // Check if token exists before making the query
    const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem(TOKEN_KEY) : false;

    const {
        data: user,
        isLoading,
        isError,
    } = useQuery<{ data: UserProfile }, Error>({
        queryKey: ['auth', 'me'],
        queryFn: fetchMe,
        enabled: hasToken, // Only fetch if token exists
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
        retry: false, // important: don't retry on 401
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    const isAuthenticated = !isLoading && !isError && !!user;

    const logout = async () => {
        try {
            // Call API to sign out on server
            await api.post('/auth/signout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear React Query cache
            queryClient.setQueryData(['auth', 'me'], null);
            queryClient.removeQueries({ queryKey: ['auth', 'me'] });

            // Clear all localStorage data related to authentication
            if (typeof window !== 'undefined') {
                // Remove authentication token
                localStorage.removeItem(TOKEN_KEY);

                // Remove user info stored by chat store
                localStorage.removeItem('userId');
                localStorage.removeItem('userType');

                // Remove chat-related data to prevent data leakage between users
                localStorage.removeItem('hiddenConversations');
                localStorage.removeItem('clearedConversations');

                // Clear all appearance settings keys that contain user-specific data
                // This will remove keys like 'appearance_settings_${userId}'
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (
                        key &&
                        (key.startsWith('appearance_settings_') || key.includes('workly_'))
                    ) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach((key) => localStorage.removeItem(key));
            }

            // Redirect to home page
            router.push('/home');
            router.refresh(); // Force refresh to update the UI
        }
    };

    return {
        user: user?.data ?? null,
        isLoading,
        isAuthenticated,
        isError,
        logout,
        refetch: () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
    };
};
