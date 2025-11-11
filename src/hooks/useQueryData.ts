import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import { getSession, useSession } from 'next-auth/react';

export type QueryFn<T> = (context: QueryFunctionContext) => Promise<T>;

export const getDataWithStatus: QueryFn<any> = async ({ queryKey }: QueryFunctionContext) => {
    const [url, params] = queryKey as [string, Record<string, any>];
    if (!url) {
        throw new Error('The query key is missing.');
    }
    try {
        const response = await api.get(url, {
            params,
        });
        return {
            data: response.data,
            statusCode: response.status,
            status: true,
        };
    } catch (error: any) {
        return {
            status: false,
            message: error.response.data.message,
        };
    }
};

export function useData<T>(
    queryKey: [string, Record<string, any>],
    queryFn: QueryFn<{ data: T; status: number }>,
    enabled: boolean = true,
    refetchOnWindowFocus: boolean = true,
    retry: any = 3,
    gcTime: number = 10 * 60 * 1000, // Default 5 minutes
    staleTime: number = 10 * 60 * 1000, // Default 0
    retryDelay: number = 3000
) {
    const { data, isLoading, error, refetch, isFetching } = useQuery<
        {
            data: any;
            status: number;
        },
        Error
    >({
        queryKey,
        queryFn,
        enabled,
        refetchOnWindowFocus,
        retry,
        gcTime,
        staleTime,
        retryDelay,
    });

    return {
        data: data?.data ?? null,
        status: data?.status,
        isLoading,
        error,
        refetch,
        isFetching,
    };
}

export function useGetCompanyProfile(id: string) {
    return useData([`/companies/${id}`, {}], getDataWithStatus);
}

export function useGetIndustry(queryParams: Record<string, any> = {}) {
    return useData(['/industries', queryParams], getDataWithStatus);
}

export function useGetMe() {
    const { status, data } = useSession();
    console.log('datadatadata', data, status);

    return useData(['/users/me', {}], getDataWithStatus, status === 'authenticated');
}

export const useGetSkills = ({ search }: { search?: string }) =>
    useQuery({
        queryKey: ['skills', search],
        queryFn: async () => {
            const res = await api.get('/skills', { params: { search } });
            return res.data;
        },
    });

export function useGetSchools(queryParams: Record<string, any> = {}) {
    return useData(['/schools', queryParams], getDataWithStatus);
}

export function useGetUserProfile(id: string) {
    const url = `/users/${id}`;
    const params = {};

    return useData([url, params], getDataWithStatus, !!id);
}
