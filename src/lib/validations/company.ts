import { CompanySize } from '@/types/global';
import z from 'zod';

export const createCompanySchema = z.object({
    name: z.string().min(1, 'Company name is required'),
    industryId: z.string().min(1, 'Industry must be provided'),
    size: z.enum(Object.values(CompanySize)),
    foundedYear: z
        .number()
        .int('Founded year must be an integer')
        .min(1800, 'Founded year looks wrong')
        .max(new Date().getFullYear(), 'Founded year cannot be in the future'),
});

export const editCompanySchema = z.object({
    name: z.string().min(1, 'Company name is required'),
    description: z.string().optional(),
    foundedYear: z
        .number()
        .int()
        .min(1800, 'Founed year look wrong')
        .max(new Date().getFullYear(), 'Founded year can not be in the future'),
    size: z.enum(Object.values(CompanySize)),
    industryId: z.string().min(1, 'Industry must be provided'),
    website: z.url({ message: 'Website must be a valid url' }).optional(),
    logoUrl: z
        .url({
            message: 'LogoURL must be valid',
        })
        .optional(),
    bannerUrl: z
        .url({
            message: 'BannerURL must be valid',
        })
        .optional(),
});

export type CreateCompanyFormData = z.infer<typeof createCompanySchema>;
export type EditCompanyFormData = z.infer<typeof editCompanySchema>;
