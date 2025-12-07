import { z } from 'zod';

// Schema cho form "Edit Profile" (tab đầu tiên)
export const editUserProfileSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email('Invalid email address.'),
    headline: z.string().optional(),
    locationId: z.string().optional(),
    // username: z.string().min(3, 'Username must be at least 3 characters.'),
});

export type EditUserProfileFormData = z.infer<typeof editUserProfileSchema>;

export const editUserSkillsSchema = z.object({
    skillIds: z.array(z.string()),
});

export type EditUserSkillsFormData = z.infer<typeof editUserSkillsSchema>;

export const editUserIndustriesSchema = z.object({
    industryIds: z.array(z.string()),
});

export type EditUserIndustriesFormData = z.infer<typeof editUserIndustriesSchema>;

export const educationEntrySchema = z
    .object({
        schoolId: z.string().min(1, 'School is required.'),
        degree: z.string().min(1, 'Degree is required.'),
        major: z.string().min(1, 'Major is required.'),
        startDate: z.string().min(1, 'Start date is required.'),
        endDate: z
            .union([z.string(), z.literal('')])
            .transform((val) => (val === '' ? undefined : val))
            .optional(),
        description: z.string().optional(),
    })
    .refine(
        (data) => {
            if (!data.endDate) {
                return true;
            }
            const startYear = parseInt(data.startDate.trim(), 10);
            const endYear = parseInt(data.endDate.trim(), 10);
            if (isNaN(startYear) || isNaN(endYear)) {
                return true;
            }
            return endYear >= startYear;
        },
        {
            message: 'End year must be greater than or equal to start year.',
            path: ['endDate'],
        }
    );

// Schema cho form "Edit Education"
export const editUserEducationSchema = z.object({
    educations: z.array(educationEntrySchema).optional(),
});

export type EditUserEducationFormData = z.infer<typeof editUserEducationSchema>;

// Schema cho Work Experience
export const workExperienceEntrySchema = z
    .object({
        companyId: z.string().min(1, 'Company is required.'),
        companyName: z.string().optional(),
        title: z.string().min(1, 'Job title is required.'),
        startDate: z.string().min(1, 'Start date is required.'),
        endDate: z
            .union([z.string(), z.literal('')])
            .transform((val) => (val === '' ? undefined : val))
            .optional(),
        description: z.string().optional(),
    })
    .refine(
        (data) => {
            // If endDate is empty or not provided, validation passes (current job)
            if (!data.endDate || data.endDate.trim() === '') {
                return true;
            }
            // If both dates are provided, check if endDate >= startDate
            const startYear = parseInt(data.startDate.trim(), 10);
            const endYear = parseInt(data.endDate.trim(), 10);
            // Check if both are valid years (4 digits)
            if (isNaN(startYear) || isNaN(endYear)) {
                return true; // Let other validations handle invalid format
            }
            return endYear >= startYear;
        },
        {
            message: 'End year must be greater than or equal to start year.',
            path: ['endDate'],
        }
    );

export const editUserWorkExperiencesSchema = z.object({
    workExperiences: z.array(workExperienceEntrySchema).optional(),
});

export type EditUserWorkExperiencesFormData = z.infer<typeof editUserWorkExperiencesSchema>;

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required.'),
        newPassword: z.string().min(8, 'Password must be at least 8 characters'),
        confirmNewPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: 'New passwords do not match.',
        path: ['confirmNewPassword'],
    });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
