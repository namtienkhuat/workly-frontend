'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useGetMe } from '@/hooks/useQueryData';
import { UserProfile } from '@/types/global';
import { patchUserProfile } from '@/services/apiServices';
import { EditUserProfileFormData, editUserProfileSchema } from '@/lib/validations/user';
import { Skeleton } from '@/components/ui/skeleton';

const EditProfilePage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        data: userProfileData,
        isLoading: isLoadingProfile,
        refetch: refetchUserProfile,
    } = useGetMe();
    const userProfile: UserProfile = userProfileData?.data?.user;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isDirty },
        reset,
    } = useForm<EditUserProfileFormData>({
        resolver: zodResolver(editUserProfileSchema),
        // defaultValues: userProfile,
    });

    useEffect(() => {
        if (userProfile) {
            reset(userProfile);
        }
    }, [userProfile, reset]);

    const onSubmit = async (formData: EditUserProfileFormData) => {
        setIsLoading(true);

        const { success, message } = await patchUserProfile(formData);
        setIsLoading(false);

        if (success) {
            toast.success('Profile updated successfully!');
            const refetchResult = await refetchUserProfile();

            const latestUserProfile = refetchResult.data?.data?.user;

            if (latestUserProfile) {
                reset(latestUserProfile);
            }
        } else {
            toast.error('Failed to update profile', {
                description: message,
            });
        }
    };

    if (isLoadingProfile || !userProfile) {
        if (!userProfile && !isLoadingProfile) {
            return <div>User not found</div>;
        }
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48 rounded" />
                    <Skeleton className="h-4 w-64 rounded" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-24 w-full rounded" />
                </CardContent>
            </Card>
        );
    }

    if (!userProfile) return <div>User not found</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Edit Profile</CardTitle>
                <CardDescription>Update your personal details and information</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <Field className="gap-2">
                        <FieldLabel>
                            Name <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input placeholder="Your name" {...register('name')} />
                        <FieldError errors={errors.name ? [errors.name] : undefined} />
                    </Field>

                    <Field className="gap-2">
                        <FieldLabel>
                            Email <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input type="email" placeholder="Your email" {...register('email')} />
                        <FieldError errors={errors.email ? [errors.email] : undefined} />
                    </Field>

                    {/* <Field className="gap-2">
                        <FieldLabel>
                            Username <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input placeholder="Your username" {...register('username')} />
                        <FieldError errors={errors.username ? [errors.username] : undefined} />
                    </Field> */}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="submit" disabled={isLoading || !isDirty}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default EditProfilePage;
