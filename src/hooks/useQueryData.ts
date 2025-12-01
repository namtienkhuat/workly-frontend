import {
    QueryFunctionContext,
    useQuery,
    useMutation,
    UseMutationOptions,
} from '@tanstack/react-query';
import api from '@/utils/api';

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
    return useData(
        ['/me?include=education,industry,skill,location,work-experience', {}],
        getDataWithStatus
    );
}

export function useGetSkills(queryParams: Record<string, any> = {}) {
    return useData([`/skills`, queryParams], getDataWithStatus);
}

export function useGetAllSkills(queryParams: Record<string, any> = {}) {
    return useData(['/skills', queryParams], getDataWithStatus);
}

export function useGetSchools(queryParams: Record<string, any> = {}) {
    return useData([`/schools`, queryParams], getDataWithStatus);
}

export function useGetAllSchools(queryParams: Record<string, any> = {}) {
    return useData(['/schools', queryParams], getDataWithStatus);
}

export function useGetUserBasicInfo(id: string) {
    return useData([`/users/${id}?include=location`, {}], getDataWithStatus);
}

export function useGetUserProfile(id: string) {
    return useData(
        [`/users/${id}?include=skill,education,industry,location,work-experience`, {}],
        getDataWithStatus
    );
}

export function useGetAllIndustries(queryParams: Record<string, any> = {}) {
    return useData([`/industries`, queryParams], getDataWithStatus);
}

// Mutation functions
interface CreateConversationPayload {
    participantId: string;
    participantType: 'USER' | 'COMPANY';
}

interface ConversationResponse {
    success: boolean;
    message: string;
    data: any;
}

export const createConversation = async (
    payload: CreateConversationPayload
): Promise<ConversationResponse> => {
    try {
        const response = await api.post('/conversations', payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to create conversation');
    }
};

export function useCreateConversation(
    options?: UseMutationOptions<ConversationResponse, Error, CreateConversationPayload>
) {
    return useMutation<ConversationResponse, Error, CreateConversationPayload>({
        mutationFn: createConversation,
        ...options,
    });
}

// Chat-related queries
export function useGetConversations(queryParams: Record<string, any> = {}) {
    return useData(['/conversations', queryParams], getDataWithStatus);
}

export function useGetConversationById(conversationId: string) {
    return useData([`/conversations/${conversationId}`, {}], getDataWithStatus);
}

export function useGetMessages(conversationId: string, queryParams: Record<string, any> = {}) {
    return useData([`/messages/${conversationId}`, queryParams], getDataWithStatus);
}

// Company management queries
export function useGetMyCompanies(queryParams: Record<string, any> = {}) {
    return useData(['/companies/my-companies', queryParams], getDataWithStatus);
}

export function useGetCompanyAdmins(companyId: string) {
    return useData([`/companies/${companyId}/admins`, {}], getDataWithStatus);
}