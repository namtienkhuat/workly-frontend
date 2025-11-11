import { fetchWithCookie } from '@/lib/fetcher';
import { CreateCompanyFormData, EditCompanyFormData } from '@/lib/validations/company';
import {
    ChangePasswordFormData,
    EditUserEducationFormData,
    EditUserProfileFormData,
    EditUserSkillsFormData,
} from '@/lib/validations/user';
import api from '@/utils/api';

export const postCompanyPage = async (company: CreateCompanyFormData) => {
    try {
        console.log('company: ', company);
        const { data } = await api.post('/companies', company);

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

export const patchCompanyProfileData = async (id: string, company: EditCompanyFormData) => {
    try {
        const { data } = await api.patch(`/companies/${id}`, company);

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

// USER
export const patchUserProfile = async (formData: EditUserProfileFormData) => {
    try {
        const { data } = await api.patch(`/users/me`, formData);

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

export async function patchUserSkills(formData: { skillIds: string[] }) {
    const { ok, data } = await fetchWithCookie('/me/skills', {
        method: 'PATCH',
        body: JSON.stringify(formData),
    });

    return {
        success: ok,
        message: data?.message || (ok ? 'Updated' : 'Failed'),
    };
}

export const patchUserEducation = async (formData: EditUserEducationFormData) => {
    try {
        // BE của bạn (updateUserEducations) mong đợi một mảng (array)
        const { data } = await api.patch('/users/me/educations', formData.educations);

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

export const patchChangePassword = async (formData: ChangePasswordFormData) => {
    try {
        // API BE của bạn chỉ cần 'currentPassword' và 'newPassword'
        const payload = {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
        };

        const { data } = await api.patch('/users/me/change-password', payload);

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

export const deleteMyAccount = async () => {
    try {
        // "Bộ chặn" (interceptor) trong api.ts sẽ tự động gắn token
        // API BE của bạn là "/users/me"
        const { data } = await api.delete('/users/me');

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
