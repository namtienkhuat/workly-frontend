'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { patchChangePassword } from '@/services/apiServices';
import { ChangePasswordFormData, changePasswordSchema } from '@/lib/validations/user';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';

const ChangePasswordPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
    });

    const onSubmit = async (formData: ChangePasswordFormData) => {
        setIsLoading(true);
        const { success, message } = await patchChangePassword(formData);
        setIsLoading(false);

        if (success) {
            toast.success('Password changed successfully!');
            reset();
        } else {
            toast.error('Failed to change password', {
                description: message,
            });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Shield className="h-6 w-6 text-primary" />
                    </div>
                    Change Password
                </h2>
                <p className="text-muted-foreground mt-2">
                    Update your password to keep your account secure. Choose a strong password that
                    you haven&apos;t used elsewhere.
                </p>
            </div>

            <Card className="border-2 shadow-lg">
                <CardHeader className="space-y-1 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Lock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Security Settings</CardTitle>
                            <CardDescription>
                                Enter your current password and choose a new one
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-5">
                        <Field className="gap-2">
                            <FieldLabel className="flex items-center gap-2 text-base font-semibold">
                                <Lock className="h-4 w-4" />
                                Current Password
                            </FieldLabel>
                            <div className="relative">
                                <Input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    {...register('currentPassword')}
                                    placeholder="Enter your current password"
                                    className="pr-10 h-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <FieldError
                                errors={
                                    errors.currentPassword ? [errors.currentPassword] : undefined
                                }
                            />
                        </Field>
                        <Field className="gap-2">
                            <FieldLabel className="flex items-center gap-2 text-base font-semibold">
                                <Lock className="h-4 w-4" />
                                New Password
                            </FieldLabel>
                            <div className="relative">
                                <Input
                                    type={showNewPassword ? 'text' : 'password'}
                                    {...register('newPassword')}
                                    placeholder="Enter your new password"
                                    className="pr-10 h-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <FieldError
                                errors={errors.newPassword ? [errors.newPassword] : undefined}
                            />
                        </Field>
                        <Field className="gap-2">
                            <FieldLabel className="flex items-center gap-2 text-base font-semibold">
                                <Lock className="h-4 w-4" />
                                Confirm New Password
                            </FieldLabel>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    {...register('confirmNewPassword')}
                                    placeholder="Confirm your new password"
                                    className="pr-10 h-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <FieldError
                                errors={
                                    errors.confirmNewPassword
                                        ? [errors.confirmNewPassword]
                                        : undefined
                                }
                            />
                        </Field>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-3 bg-muted/30 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => reset()}
                            disabled={isLoading || !isDirty}
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !isDirty}
                            className="min-w-[120px]"
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default ChangePasswordPage;
