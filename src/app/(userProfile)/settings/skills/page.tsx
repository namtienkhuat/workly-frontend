'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form'; // <-- Import Controller
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
import { toast } from 'sonner';
import { useGetMe } from '@/hooks/useQueryData';
import { UserProfile } from '@/types/global';
import { patchUserSkills } from '@/services/apiServices';
import { EditUserSkillsFormData, editUserSkillsSchema } from '@/lib/validations/user';
import SelectSkills from '../_components/SelectSkills';
import { Skeleton } from '@/components/ui/skeleton';

const EditSkillsPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        data: userProfileData,
        isLoading: isLoadingProfile,
        refetch: refetchUserProfile,
    } = useGetMe();
    const userProfile: UserProfile = userProfileData?.data;

    const defaultSkillIds = userProfile?.skills?.map((skill) => skill.skillId) || [];

    const {
        handleSubmit,
        control,
        formState: { errors, isDirty },
    } = useForm<EditUserSkillsFormData>({
        resolver: zodResolver(editUserSkillsSchema),
        values: {
            skillIds: defaultSkillIds,
        },
    });

    const onSubmit = async (formData: EditUserSkillsFormData) => {
        setIsLoading(true);

        const { success, message } = await patchUserSkills(formData);
        setIsLoading(false);

        if (success) {
            toast.success('Skills updated successfully!');
            refetchUserProfile();
        } else {
            toast.error('Failed to update skills', {
                description: message,
            });
        }
    };

    if (isLoadingProfile) {
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
                                <SelectSkills value={field.value} onChange={field.onChange} />
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
