import { CreateCompanyFormData } from '@/lib/validations/company';
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
