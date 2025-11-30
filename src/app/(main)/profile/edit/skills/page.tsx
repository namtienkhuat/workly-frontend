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
import { patchUserSkills } from '@/services/apiServices';
import { EditUserSkillsFormData, editUserSkillsSchema } from '@/lib/validations/user';
import SelectSkills from '../_components/SelectSkills';
import { Skeleton } from '@/components/ui/skeleton';
import { Skill } from '@/types/global';
import { SparklesIcon, InfoIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EditSkillsPage = () => {
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
            await refetchUserProfile();
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
                <div className="flex items-center gap-2">
                    <SparklesIcon className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle className="text-2xl">Skills</CardTitle>
                        <CardDescription>
                            Showcase your technical and professional skills to highlight your
                            expertise
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertDescription>
                            Add skills that you're proficient in. These help employers and
                            recruiters find you for relevant opportunities.
                        </AlertDescription>
                    </Alert>

                    <Field className="gap-2">
                        <FieldLabel className="flex items-center gap-2 text-base">
                            <SparklesIcon className="h-4 w-4" />
                            Select Your Skills
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

                        {skillsFromProfile.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                                Currently selected: <strong>{skillsFromProfile.length}</strong>{' '}
                                {skillsFromProfile.length === 1 ? 'skill' : 'skills'}
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

export default EditSkillsPage;
