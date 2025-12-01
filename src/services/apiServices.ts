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

export async function patchUserLocation(formData: { locationId?: string }) {
    try {
        const { data } = await api.patch('/me/location', formData);

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

export const patchUserWorkExperiences = async (formData: { workExperiences?: any[] }) => {
    try {
        const { data } = await api.patch('/me/work-experiences', formData.workExperiences);

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

///////////////////////////////////////////////////////////////////////
// COMPANY ADMINS
export const addCompanyAdmin = async (
    companyId: string,
    payload: { userId?: string; email?: string }
) => {
    try {
        const { data } = await api.post(`/companies/${companyId}/admins`, payload);

        return {
            status: 'success',
            success: true,
            data: data.data,
            message: data.message,
        };
    } catch (error: any) {
        return {
            status: 'error',
            success: false,
            message: error?.response?.data?.message || error?.message || 'Unknown error',
        };
    }
};

export const removeCompanyAdmin = async (companyId: string, userId: string) => {
    try {
        const { data } = await api.delete(`/companies/${companyId}/admins/${userId}`);

        return {
            status: 'success',
            success: true,
            data: data.data,
            message: data.message,
        };
    } catch (error: any) {
        return {
            status: 'error',
            success: false,
            message: error?.response?.data?.message || error?.message || 'Unknown error',
        };
    }
};

export const deleteCompany = async (companyId: string) => {
    try {
        const { data } = await api.delete(`/companies/${companyId}`);

        return {
            status: 'success',
            success: true,
            data: data.data,
            message: data.message,
        };
    } catch (error: any) {
        return {
            status: 'error',
            success: false,
            message: error?.response?.data?.message || error?.message || 'Unknown error',
        };
    }
};

///////////////////////////////////////////////////////////////////////
// LOCATIONS
export const getLocations = async (search?: string) => {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        params.append('limit', '100');
        
        const { data } = await api.get(`/locations?${params.toString()}`);

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