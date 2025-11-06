import { z } from 'zod';

export const confirmInfoSchema = z.object({
    name: z.string().min(1, 'Tên là bắt buộc.'),
    email: z.string().min(1, 'Email là bắt buộc.').email('Email không hợp lệ.'),
    username: z.string().min(3, 'Tên tài khoản phải có ít nhất 3 ký tự.'),
});
export type ConfirmInfoFormData = z.infer<typeof confirmInfoSchema>;

export const createProfileSchema = z.object({
    name: z.string().min(1, 'Tên là bắt buộc.'),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ.'),
    email: z.string().min(1, 'Email là bắt buộc.').email('Email không hợp lệ.'),
    profession: z.string().min(1, 'Nghề nghiệp là bắt buộc.'),
    companyPosition: z.string().min(1, 'Vị trí là bắt buộc.'),
    location: z.string().min(1, 'Địa điểm là bắt buộc.'),
});
export type CreateProfileFormData = z.infer<typeof createProfileSchema>;

export const onboardingSchema = z
    .object({
        role: z.enum(['user', 'company']),
        name: z.string().min(1, 'Tên là bắt buộc.').optional(),
        email: z.string().email('Email không hợp lệ').optional(),
        username: z.string().min(3, 'Tên tài khoản phải có ít nhất 3 ký tự.').optional(),
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
            message: "Vui lòng nhập công ty trước đây hoặc chọn 'Không có kinh nghiệm'.",
            path: ['previousCompany'],
        }
    );
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
