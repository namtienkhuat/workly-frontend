import { CreateCompanyFormData } from '@/lib/validations/company';
import api from '@/utils/api';

export const postCompanyPage = async (body: { company: CreateCompanyFormData }) => {
    try {
        const { data } = await api.post('/companies', body);
        return {
            status: 'success',
            success: true,
            data,
        };
    } catch (error: any) {
        return {
            status: 'error',
            success: false,
            message: error.response?.data?.message || 'Unknown error',
        };
    }
};
