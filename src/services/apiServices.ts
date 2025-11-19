import { TOKEN_KEY } from '@/constants';
import { LoginFormData, SignupFormData } from '@/lib/validations/auth';
import { CreateCompanyFormData, EditCompanyFormData } from '@/lib/validations/company';
import {
    ChangePasswordFormData,
    EditUserEducationFormData,
    EditUserProfileFormData,
} from '@/lib/validations/user';
import api from '@/utils/api';

///////////////////////////////////////////////////////////////////////
// AUTH
export const postSignin = async (payload: LoginFormData) => {
    try {
        const { data } = await api.post('/auth/signin', payload);
        if (data.success) {
            localStorage.setItem(TOKEN_KEY, data.data.token);
        }
        return {
            status: 'success',
            success: true,
            data: data.data.user,
        };
    } catch (error: any) {
        return {
            status: 'error',
            success: false,
            message: error?.message || 'Unknown error',
        };
    }
};

export const postSignup = async (payload: SignupFormData) => {
    try {
        const { data } = await api.post('/auth/signup', payload);
        if (data.success) {
            localStorage.setItem(TOKEN_KEY, data.data.token);
        }
        return {
            status: 'success',
            success: true,
            data: data.data.user,
        };
    } catch (error: any) {
        return {
            status: 'error',
            success: false,
            message: error?.message || 'Unknown error',
        };
    }
};

export const logout = async () => {
    try {
        const { data } = await api.post('/auth/signout');
        localStorage.removeItem(TOKEN_KEY);
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

///////////////////////////////////////////////////////////////////////
// COMPANY
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

export const patchCompanyMedia = async (id: string, formData: FormData) => {
    try {
        const { data } = await api.patch(`/companies/${id}/media`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

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

export const followCompany = async (companyId: string) => {
    try {
        const { data } = await api.post(`/companies/${companyId}/follow`);
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

export const unfollowCompany = async (companyId: string) => {
    try {
        const { data } = await api.delete(`/companies/${companyId}/follow`);
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

///////////////////////////////////////////////////////////////////////
// USER
export const patchUserProfile = async (formData: EditUserProfileFormData) => {
    try {
        const { data } = await api.patch(`/me`, formData);

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
        const { data } = await api.patch('/me/skills', formData);

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

export async function patchUserIndustries(formData: { industryIds: string[] }) {
    try {
        const { data } = await api.patch('/me/industries', formData);

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
        const { data } = await api.patch('/me/educations', formData.educations);

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

export const patchUserMedia = async (formData: FormData) => {
    try {
        // Acepts: avatar, background
        const { data } = await api.patch(`/me/media`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

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

        const { data } = await api.patch('/me/change-password', payload);

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
        const { data } = await api.delete('/me');

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
