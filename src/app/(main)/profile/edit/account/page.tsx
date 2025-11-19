'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { patchChangePassword, deleteMyAccount } from '@/services/apiServices';
import { ChangePasswordFormData, changePasswordSchema } from '@/lib/validations/user';

const ChangePasswordForm = () => {
    const [isLoading, setIsLoading] = useState(false);
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
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Change Password</CardTitle>
                <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <Field className="gap-2">
                        <FieldLabel>Current Password</FieldLabel>
                        <Input type="password" {...register('currentPassword')} />
                        <FieldError
                            errors={errors.currentPassword ? [errors.currentPassword] : undefined}
                        />
                    </Field>
                    <Field className="gap-2">
                        <FieldLabel>New Password</FieldLabel>
                        <Input type="password" {...register('newPassword')} />
                        <FieldError
                            errors={errors.newPassword ? [errors.newPassword] : undefined}
                        />
                    </Field>
                    <Field className="gap-2">
                        <FieldLabel>Confirm New Password</FieldLabel>
                        <Input type="password" {...register('confirmNewPassword')} />
                        <FieldError
                            errors={
                                errors.confirmNewPassword ? [errors.confirmNewPassword] : undefined
                            }
                        />
                    </Field>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button type="submit" disabled={isLoading || !isDirty}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

const DeleteAccountSection = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        const { success, message } = await deleteMyAccount();
        setIsLoading(false);

        if (success) {
            toast.success('Account deleted successfully.');
            router.push('/');
        } else {
            toast.error('Failed to delete account', {
                description: message,
            });
        }
    };

    return (
        <Card className="border-red-500">
            <CardHeader>
                <CardTitle className="text-2xl text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                    Permanently delete your account and all associated data. This action cannot be
                    undone.
                </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isLoading}>
                            {isLoading ? 'Deleting...' : 'Delete My Account'}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action is permanent. All your data, posts, and connections will
                                be deleted forever.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Yes, delete my account
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
};

const AccountPage = () => {
    return (
        <div className="space-y-6">
            <ChangePasswordForm />
            <DeleteAccountSection />
        </div>
    );
};

export default AccountPage;
