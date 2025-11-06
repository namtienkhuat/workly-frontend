import z from 'zod';

export const createCompanySchema = z.object({
    name: z.string().min(1, 'Company name is required'),
    industryId: z.string().min(1, 'Industry must be provided'),
    numberOfEmployees: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '> 1000']),
    foundedYear: z
        .number()
        .int('Founded year must be an integer')
        .min(1800, 'Founded year looks wrong')
        .max(new Date().getFullYear(), 'Founded year cannot be in the future'),
});

export type CreateCompanyFormData = z.infer<typeof createCompanySchema>;
