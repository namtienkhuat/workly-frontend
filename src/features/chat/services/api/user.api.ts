import api from '@/utils/api';
import { ParticipantType } from '../../types';

export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string; // Legacy field name
    avatarUrl?: string; // Backend field name
    phoneNumber?: string;
    dateOfBirth?: string;
    address?: string;
    bio?: string;
    userId: string;
    isDeleted?: boolean; // Mark account as deleted
}

export interface CompanyProfile {
    id: string;
    name: string;
    email?: string;
    logo?: string; // Legacy field name
    logoUrl?: string; // Backend field name
    description?: string;
    website?: string;
    address?: string;
    phoneNumber?: string;
    companyId: string;
    isDeleted?: boolean; // Mark company as deleted
}

export type ParticipantProfile = UserProfile | CompanyProfile;

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

/**
 * Get user by ID
 * Returns deleted placeholder if user not found
 */
export async function getUserById(userId: string): Promise<ApiResponse<{ user: UserProfile }>> {
    try {
        const response = await api.get<ApiResponse<{ user: UserProfile }>>(`/users/${userId}`);
        return response.data;
    } catch (error: any) {
        // If user not found (deleted), return placeholder
        if (error.response?.status === 404) {
            return {
                success: true,
                data: {
                    user: {
                        id: userId,
                        userId: userId,
                        email: '',
                        name: 'Tài khoản không tồn tại',
                        avatar: '',
                        isDeleted: true,
                    } as UserProfile & { isDeleted: boolean },
                },
            };
        }
        throw error;
    }
}

/**
 * Get company by ID
 * Returns deleted placeholder if company not found
 */
export async function getCompanyById(
    companyId: string
): Promise<ApiResponse<{ company: CompanyProfile }>> {
    try {
        const response = await api.get<ApiResponse<{ company: CompanyProfile }>>(
            `/companies/${companyId}`
        );
        return response.data;
    } catch (error: any) {
        // If company not found (deleted), return placeholder
        if (error.response?.status === 404) {
            return {
                success: true,
                data: {
                    company: {
                        id: companyId,
                        companyId: companyId,
                        name: 'Company not found',
                        logo: '',
                        isDeleted: true,
                    } as CompanyProfile & { isDeleted: boolean },
                },
            };
        }
        throw error;
    }
}

/**
 * Get participant info (user or company)
 */
export async function getParticipantInfo(
    participantId: string,
    participantType: ParticipantType
): Promise<ParticipantProfile> {
    if (participantType === ParticipantType.USER) {
        const response = await getUserById(participantId);
        return response.data?.user;
    } else {
        const response = await getCompanyById(participantId);
        return response.data?.company;
    }
}

/**
 * Batch get participants info
 */
export async function getParticipantsInfo(
    participants: Array<{ id: string; type: ParticipantType }>
): Promise<Record<string, ParticipantProfile>> {
    const results: Record<string, ParticipantProfile> = {};

    await Promise.all(
        participants.map(async (participant) => {
            try {
                const info = await getParticipantInfo(participant.id, participant.type);
                results[participant.id] = info;
            } catch (error) {
                // Failed to fetch participant info
            }
        })
    );

    return results;
}

export const userApiService = {
    getUserById,
    getCompanyById,
    getParticipantInfo,
    getParticipantsInfo,
};
