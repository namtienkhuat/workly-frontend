'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/utils/api';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { paths } from '@/configs/route';

const ResetPasswordPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const params = useParams();

    const token = params.token as string;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        setIsLoading(true);
        if (!token) {
            toast.error('Invalid or expired token.');
            setIsLoading(false);
            return;
        }

        try {
            await api.patch(`/auth/reset-password/${token}`, { newPassword: data.password });

            toast.success('Password reset successfully!', {
                description: 'You can now log in with your new password.',
            });

            router.push(paths.signin);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Invalid or expired token.';
            toast.error('Error', { description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center ...">
            <div className="w-full max-w-md">
                <div className="rounded-lg border bg-white p-8 shadow-lg">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold ...">Reset Password</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter your new password to access your account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password')}
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...register('confirmPassword')}
                                className={errors.confirmPassword ? 'border-red-500' : ''}
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save New Password'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
