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
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

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
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password to keep it secure.</CardDescription>
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

const SignOutSection = () => {
    const router = useRouter();
    const { logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await logout();
            toast.success('Signed out successfully');
            router.push('/');
        } catch (error) {
            toast.error('Failed to sign out');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sign Out</CardTitle>
                <CardDescription>Sign out from your account on this device.</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={isLoading}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Sign out from your account?</AlertDialogTitle>
                            <AlertDialogDescription>
                                You will be redirected to the login page.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSignOut}>
                                Yes, sign me out
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
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
                <CardTitle className="text-red-600">Delete Account</CardTitle>
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
                                This action is permanent and cannot be undone. All your data,
                                posts, connections, and profile information will be deleted forever.
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

const AccountSettingsPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
                <p className="text-muted-foreground mt-1">
                    Manage your account security and preferences.
                </p>
            </div>

            <ChangePasswordForm />
            <SignOutSection />
            <DeleteAccountSection />
        </div>
    );
};

export default AccountSettingsPage;

