'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { toast } from 'sonner';
import { useGetMe } from '@/hooks/useQueryData';
import { patchUserSkills } from '@/services/apiServices';
import { EditUserSkillsFormData, editUserSkillsSchema } from '@/lib/validations/user';
import SelectSkills from '../_components/SelectSkills';
import { Skeleton } from '@/components/ui/skeleton';
import { Skill } from '@/types/global';

const EditSkillsPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [initialValuesLoaded, setInitialValuesLoaded] = useState(false);

    const {
        data: userProfileData,
        isLoading: isLoadingProfile,
        refetch: refetchUserProfile,
    } = useGetMe();

    const skillsFromProfile = userProfileData?.data?.relationships?.skills || [];

    const {
        handleSubmit,
        control,
        formState: { errors, isDirty },
        reset,
    } = useForm<EditUserSkillsFormData>({
        resolver: zodResolver(editUserSkillsSchema),
        defaultValues: {
            skillIds: [],
        },
    });

    useEffect(() => {
        if (!isLoadingProfile && !initialValuesLoaded) {
            const initialSkillIds = skillsFromProfile.map((skill: Skill) => skill.skillId);

            reset({ skillIds: initialSkillIds });
            setInitialValuesLoaded(true);
        }
    }, [isLoadingProfile, skillsFromProfile, reset, initialValuesLoaded]);

    const onSubmit = async (formData: EditUserSkillsFormData) => {
        setIsLoading(true);

        const { success, message } = await patchUserSkills(formData);
        setIsLoading(false);

        if (success) {
            toast.success('Skills updated successfully!');

            reset({ skillIds: formData.skillIds }, { keepDirty: false });

            refetchUserProfile();
        } else {
            toast.error('Failed to update skills', { description: message });
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
                <CardTitle className="text-2xl">Edit Skills</CardTitle>
                <CardDescription>
                    Select the skills that best describe your expertise.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent>
                    <Field className="gap-2">
                        <FieldLabel>
                            Your Skills <span className="text-red-500">*</span>
                        </FieldLabel>

                        <Controller
                            name="skillIds"
                            control={control}
                            render={({ field }) => (
                                <SelectSkills
                                    value={field.value}
                                    onChange={field.onChange}
                                    skillsFromProfile={skillsFromProfile}
                                />
                            )}
                        />

                        <FieldError errors={errors.skillIds ? [errors.skillIds] : undefined} />
                    </Field>
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

export default EditSkillsPage;
