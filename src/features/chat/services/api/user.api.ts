import api from '@/utils/api';
import { ParticipantType } from '../../types';

export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    address?: string;
    bio?: string;
    userId: string;
}

export interface CompanyProfile {
    id: string;
    name: string;
    email?: string;
    logo?: string;
    description?: string;
    website?: string;
    address?: string;
    phoneNumber?: string;
    companyId: string;
}

export type ParticipantProfile = UserProfile | CompanyProfile;

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<ApiResponse<{ user: UserProfile }>> {
    const response = await api.get<ApiResponse<{ user: UserProfile }>>(`/users/${userId}`);
    return response.data;
}

/**
 * Get company by ID
 */
export async function getCompanyById(
    companyId: string
): Promise<ApiResponse<{ company: CompanyProfile }>> {
    const response = await api.get<ApiResponse<{ company: CompanyProfile }>>(
        `/companies/${companyId}`
    );
    return response.data;
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
                console.error(
                    `Failed to fetch info for ${participant.type} ${participant.id}:`,
                    error
                );
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
