'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useGetMe } from '@/hooks/useQueryData';
import { UserProfile } from '@/types/global';
import { patchUserProfile, patchUserLocation } from '@/services/apiServices';
import { EditUserProfileFormData, editUserProfileSchema } from '@/lib/validations/user';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { UserIcon, MailIcon, BriefcaseIcon, MapPinIcon, InfoIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SelectLocation from './_components/SelectLocation';

const EditProfilePage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuth();

    const {
        data: userProfileData,
        isLoading: isLoadingProfile,
        refetch: refetchUserProfile,
    } = useGetMe();
    const userProfile: UserProfile = userProfileData?.data?.user;
    const userLocation = userProfileData?.data?.relationships?.location;

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
        setValue,
        watch,
    } = useForm<EditUserProfileFormData>({
        resolver: zodResolver(editUserProfileSchema),
        // defaultValues: userProfile,
    });

    const selectedLocationId = watch('locationId');

    useEffect(() => {
        if (userProfile) {
            reset({
                name: userProfile.name,
                email: userProfile.email,
                headline: userProfile.headline,
                locationId: userLocation?.locationId || undefined,
            });
        }
    }, [userProfile, userLocation, reset]);

    const onSubmit = async (formData: EditUserProfileFormData) => {
        setIsLoading(true);

        const { locationId, ...profileData } = formData;

        // Update basic profile (name, email, headline)
        const profileResult = await patchUserProfile(profileData);

        // Update location separately
        const locationResult = await patchUserLocation({ locationId });

        setIsLoading(false);

        if (profileResult.success && locationResult.success) {
            toast.success('Profile updated successfully!');

            // Invalidate both queries to refetch fresh data
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['/me?include=education,industry,skill,location,work-experience'],
                }),
                queryClient.invalidateQueries({
                    queryKey: [`/users/${currentUser?.userId}?include=location`],
                }),
            ]);

            const refetchResult = await refetchUserProfile();

            const latestUserProfile = refetchResult.data?.data?.user;
            const latestUserLocation = refetchResult.data?.data?.relationships?.location;

            if (latestUserProfile) {
                reset({
                    name: latestUserProfile.name,
                    email: latestUserProfile.email,
                    headline: latestUserProfile.headline,
                    locationId: latestUserLocation?.locationId || undefined,
                });
            }
        } else {
            toast.error('Failed to update profile', {
                description: profileResult.message || locationResult.message,
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
                <div className="flex items-center gap-2">
                    <UserIcon className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle className="text-2xl">Edit Profile</CardTitle>
                        <CardDescription>
                            Update your personal details and public profile information
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertDescription>
                            Your profile information is visible to other users. Keep it professional
                            and up-to-date to make a great impression.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <Field className="gap-2">
                            <FieldLabel className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4" />
                                Full Name <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                                placeholder="Enter your full name"
                                {...register('name')}
                                className="h-10"
                            />
                            <FieldError errors={errors.name ? [errors.name] : undefined} />
                        </Field>

                        <Field className="gap-2">
                            <FieldLabel className="flex items-center gap-2">
                                <MailIcon className="h-4 w-4" />
                                Email Address <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                                type="email"
                                placeholder="your.email@example.com"
                                {...register('email')}
                                disabled
                                className="h-10 bg-muted/50 cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground">
                                Email cannot be changed for security reasons
                            </p>
                            <FieldError errors={errors.email ? [errors.email] : undefined} />
                        </Field>

                        <Field className="gap-2">
                            <FieldLabel className="flex items-center gap-2">
                                <BriefcaseIcon className="h-4 w-4" />
                                Current Position / Headline
                            </FieldLabel>
                            <Input
                                placeholder="e.g. Senior Software Engineer at TechCorp"
                                {...register('headline')}
                                className="h-10"
                            />
                            <p className="text-xs text-muted-foreground">
                                A brief professional headline that appears on your profile
                            </p>
                            <FieldError errors={errors.headline ? [errors.headline] : undefined} />
                        </Field>

                        <Field className="gap-2">
                            <FieldLabel className="flex items-center gap-2">
                                <MapPinIcon className="h-4 w-4" />
                                Location
                            </FieldLabel>
                            <SelectLocation
                                value={selectedLocationId}
                                onChange={(value) =>
                                    setValue('locationId', value, { shouldDirty: true })
                                }
                            />
                            <FieldError
                                errors={errors.locationId ? [errors.locationId] : undefined}
                            />
                        </Field>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 bg-muted/50">
                    <Button type="submit" disabled={isLoading || !isDirty}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default EditProfilePage;
