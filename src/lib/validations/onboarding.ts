import { z } from 'zod';

export const confirmInfoSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().min(1, 'Email is required.').email('Invalid email address.'),
    username: z.string().min(3, 'Username must be at least 3 characters.'),
});
export type ConfirmInfoFormData = z.infer<typeof confirmInfoSchema>;

export const createProfileSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    phone: z.string().min(10, 'Invalid phone number.'),
    email: z.string().min(1, 'Email is required.').email('Invalid email address.'),
    profession: z.string().min(1, 'Profession is required.'),
    companyPosition: z.string().min(1, 'Position is required.'),
    location: z.string().min(1, 'Location is required.'),
});
export type CreateProfileFormData = z.infer<typeof createProfileSchema>;

export const onboardingSchema = z
    .object({
        role: z.enum(['user', 'company']),
        name: z.string().min(1, 'Name is required.').optional(),
        email: z.string().email('Invalid email address.').optional(),
        username: z.string().min(3, 'Username must be at least 3 characters.').optional(),
        workStatus: z.string().optional(),
        experienceLevel: z.string().optional(),
        jobSearchStatus: z.string().optional(),
        phone: z.string().min(0).optional(),
        profession: z.string().optional(),
        companyPosition: z.string().optional(),
        location: z.string().optional(),
        jobPosition: z.string().optional(),
        hasNoExperience: z.boolean().optional(),
        previousCompany: z.string().optional(),
    })
    .refine(
        (data) => {
            if (!data.hasNoExperience && !data.previousCompany) {
                return false;
            }
            return true;
        },
        {
            message: "Please enter your previous company or check 'No experience'.",
            path: ['previousCompany'],
        }
    );
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
