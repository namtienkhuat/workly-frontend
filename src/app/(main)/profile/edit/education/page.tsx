'use client';

import { useState } from 'react';
// 1. Import 'useFieldArray'
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
import { toast } from 'sonner';
import { useGetMe } from '@/hooks/useQueryData';
import { UserProfile } from '@/types/global';
import { patchUserEducation } from '@/services/apiServices';
import {
    EditUserEducationFormData,
    editUserEducationSchema,
    educationEntrySchema,
} from '@/lib/validations/user';
import SelectSchool from '../_components/SelectSchool';
import { Skeleton } from '@/components/ui/skeleton';
import { TrashIcon, PlusIcon } from 'lucide-react';

const EditEducationPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        data: userProfileData,
        isLoading: isLoadingProfile,
        refetch: refetchUserProfile,
    } = useGetMe();
    const userProfile: UserProfile = userProfileData?.data;
    console.log('userProfile: ', userProfile);

    const defaultEducations = userProfile?.educations || [];

    const {
        handleSubmit,
        control,
        formState: { errors, isDirty },
    } = useForm<EditUserEducationFormData>({
        resolver: zodResolver(editUserEducationSchema),
        values: {
            educations: defaultEducations,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'educations',
    });

    const onSubmit = async (formData: EditUserEducationFormData) => {
        setIsLoading(true);
        const { success, message } = await patchUserEducation(formData);
        setIsLoading(false);

        if (success) {
            toast.success('Education updated successfully!');
            refetchUserProfile();
        } else {
            toast.error('Failed to update education', {
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
                    <Skeleton className="h-40 w-full rounded" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Edit Education</CardTitle>
                <CardDescription>Manage your educational background.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md relative space-y-4">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => remove(index)}
                            >
                                <TrashIcon className="h-4 w-4 text-red-500" />
                            </Button>

                            <Field className="gap-2">
                                <FieldLabel>School</FieldLabel>
                                <Controller
                                    name={`educations.${index}.schoolId`}
                                    control={control}
                                    render={({ field }) => (
                                        <SelectSchool
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                <FieldError
                                    errors={
                                        errors.educations?.[index]?.schoolId
                                            ? [errors.educations?.[index]?.schoolId]
                                            : undefined
                                    }
                                />
                            </Field>

                            <Field className="gap-2">
                                <FieldLabel>Degree</FieldLabel>
                                <Controller
                                    name={`educations.${index}.degree`}
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} placeholder="e.g., Bachelor's" />
                                    )}
                                />
                                <FieldError
                                    errors={
                                        errors.educations?.[index]?.degree
                                            ? [errors.educations?.[index]?.degree]
                                            : undefined
                                    }
                                />
                            </Field>

                            <Field className="gap-2">
                                <FieldLabel>Major</FieldLabel>
                                <Controller
                                    name={`educations.${index}.major`}
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} placeholder="e.g., Computer Science" />
                                    )}
                                />
                                <FieldError
                                    errors={
                                        errors.educations?.[index]?.major
                                            ? [errors.educations?.[index]?.major]
                                            : undefined
                                    }
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field className="gap-2">
                                    <FieldLabel>Start Date</FieldLabel>
                                    <Controller
                                        name={`educations.${index}.startDate`}
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="text"
                                                placeholder="e.g., 2018"
                                            />
                                        )}
                                    />
                                    <FieldError
                                        errors={
                                            errors.educations?.[index]?.startDate
                                                ? [errors.educations?.[index]?.startDate]
                                                : undefined
                                        }
                                    />
                                </Field>
                                <Field className="gap-2">
                                    <FieldLabel>End Date (Optional)</FieldLabel>
                                    <Controller
                                        name={`educations.${index}.endDate`}
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="text"
                                                placeholder="e.g., 2022 or Present"
                                            />
                                        )}
                                    />
                                </Field>
                            </div>

                            <Field className="gap-2">
                                <FieldLabel>Description</FieldLabel>
                                <Controller
                                    name={`educations.${index}.description`}
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Can you describe your major, degree e.g.,"
                                        />
                                    )}
                                />
                                <FieldError
                                    errors={
                                        errors.educations?.[index]?.major
                                            ? [errors.educations?.[index]?.major]
                                            : undefined
                                    }
                                />
                            </Field>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                            append({
                                schoolId: '',
                                degree: '',
                                major: '',
                                startDate: '',
                                endDate: '',
                            })
                        }
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Education
                    </Button>
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

export default EditEducationPage;
