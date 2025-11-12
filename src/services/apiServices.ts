import { CreateCompanyFormData, EditCompanyFormData } from '@/lib/validations/company';
import {
    ChangePasswordFormData,
    EditUserEducationFormData,
    EditUserProfileFormData,
} from '@/lib/validations/user';
import api from '@/utils/api';

export const postCompanyPage = async (company: CreateCompanyFormData) => {
    try {
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
    try {
        const { data } = await api.patch('/users/me/skills', formData);

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
}

export const patchUserEducation = async (formData: EditUserEducationFormData) => {
    try {
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
        const payload = {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            confirmNewPassword: formData.confirmNewPassword,
        };

        const { data } = await api.patch('/users/me/change-password', payload);

        return {
            status: 'success',
            success: true,
            data: data.message,
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
        const { data } = await api.delete('/users/me');

        return {
            status: 'success',
            success: true,
            data: data.message,
        };
    } catch (error: any) {
        return {
            status: 'error',
            success: false,
            message: error?.message || 'Unknown error',
        };
    }
};
