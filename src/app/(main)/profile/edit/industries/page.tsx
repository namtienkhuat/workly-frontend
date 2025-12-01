'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { toast } from 'sonner';
import { useGetMe } from '@/hooks/useQueryData';
import { patchUserIndustries } from '@/services/apiServices';
import { EditUserIndustriesFormData, editUserIndustriesSchema } from '@/lib/validations/user';
import { Skeleton } from '@/components/ui/skeleton';
import { Industry } from '@/types/global';
import SelectIndustries from '@/app/(main)/profile/edit/_components/selectIndustries';
import { Building2Icon, InfoIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EditIndustriesPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [initialValuesLoaded, setInitialValuesLoaded] = useState(false);

    const {
        data: userProfileData,
        isLoading: isLoadingProfile,
        refetch: refetchUserProfile,
    } = useGetMe();

    const industriesFromProfile = userProfileData?.data?.relationships?.industries || [];

    const {
        handleSubmit,
        control,
        formState: { errors, isDirty },
        reset,
    } = useForm<EditUserIndustriesFormData>({
        resolver: zodResolver(editUserIndustriesSchema),
        defaultValues: {
            industryIds: [],
        },
    });

    useEffect(() => {
        if (!isLoadingProfile && !initialValuesLoaded) {
            const initialIndustryIds = industriesFromProfile.map(
                (industry: Industry) => industry.industryId
            );

            reset({ industryIds: initialIndustryIds });
            setInitialValuesLoaded(true);
        }
    }, [isLoadingProfile, industriesFromProfile, reset, initialValuesLoaded]);

    const onSubmit = async (formData: EditUserIndustriesFormData) => {
        setIsLoading(true);

        const { success, message } = await patchUserIndustries(formData);
        setIsLoading(false);

        if (success) {
            toast.success('Industries updated successfully!');
            reset({ industryIds: formData.industryIds }, { keepDirty: false });
            await refetchUserProfile();
        } else {
            toast.error('Failed to update industries', { description: message });
        }
    };

    if (isLoadingProfile || !initialValuesLoaded) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48 rounded" />
                    <Skeleton className="h-4 w-64 rounded" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-24 w-full rounded" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Building2Icon className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle className="text-2xl">Industries</CardTitle>
                        <CardDescription>
                            Select the industries that align with your professional experience and
                            interests
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertDescription>
                            Choose industries where you have experience or expertise. This helps
                            connect you with relevant opportunities and professionals in your field.
                        </AlertDescription>
                    </Alert>

                    <Field className="gap-2">
                        <FieldLabel className="flex items-center gap-2 text-base">
                            <Building2Icon className="h-4 w-4" />
                            Select Your Industries
                        </FieldLabel>

                        <Controller
                            name="industryIds"
                            control={control}
                            render={({ field }) => (
                                <SelectIndustries
                                    value={field.value}
                                    onChange={field.onChange}
                                    industriesFromProfile={industriesFromProfile}
                                />
                            )}
                        />

                        <FieldError
                            errors={errors.industryIds ? [errors.industryIds] : undefined}
                        />

                        {industriesFromProfile.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                                Currently selected: <strong>{industriesFromProfile.length}</strong>{' '}
                                {industriesFromProfile.length === 1 ? 'industry' : 'industries'}
                            </p>
                        )}
                    </Field>
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

export default EditIndustriesPage;
