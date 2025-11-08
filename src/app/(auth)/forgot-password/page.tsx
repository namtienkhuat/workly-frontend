'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/utils/api';
import { toast } from 'sonner';

const ForgotPasswordPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', data);

            setIsSubmitted(true);
        } catch (error: any) {
            if (error.response?.status >= 500) {
                toast.error('Server error. Please try again later.');
            } else {
                setIsSubmitted(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center ...">
            <div className="w-full max-w-md">
                <div className="rounded-lg border bg-white p-8 shadow-lg">
                    {isSubmitted ? (
                        <div className="text-center">
                            <h1 className="text-2xl font-bold">Check Your Email</h1>
                            <p className="mt-4 text-gray-600">
                                If your email exists in our system, you’ll receive a link to reset
                                your password within a few minutes.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8 text-center">
                                <h1 className="text-3xl font-bold ...">Forgot your password?</h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Enter your email and we’ll send you a password reset link.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        {...register('email')}
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
