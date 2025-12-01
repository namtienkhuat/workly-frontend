'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useGetMe } from '@/hooks/useQueryData';
import { UserProfile } from '@/types/global';
import { patchUserWorkExperiences } from '@/services/apiServices';
import {
    EditUserWorkExperiencesFormData,
    editUserWorkExperiencesSchema,
} from '@/lib/validations/user';
import { Skeleton } from '@/components/ui/skeleton';
import { TrashIcon, PlusIcon, BriefcaseIcon, CalendarIcon } from 'lucide-react';
import SelectCompany from '@/app/(main)/profile/edit/_components/SelectCompany';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const convertISOToYear = (value?: string | null): string => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
        return value.substring(0, 4);
    }
    return value;
};

const EditWorkExperiencesPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [initialValuesLoaded, setInitialValuesLoaded] = useState(false);

    const {
        data: userProfileData,
        isLoading: isLoadingProfile,
        refetch: refetchUserProfile,
    } = useGetMe();
    const userProfile: UserProfile = userProfileData?.data;

    const {
        handleSubmit,
        control,
        formState: { errors, isDirty },
        reset,
        watch,
    } = useForm<EditUserWorkExperiencesFormData>({
        resolver: zodResolver(editUserWorkExperiencesSchema),
        defaultValues: { workExperiences: [] },
    });

    useEffect(() => {
        if (userProfile && !initialValuesLoaded) {
            const initialWorkExperiences = (
                userProfile?.relationships?.workExperiences || []
            ).map((exp: any) => ({
                ...exp,
                startDate: convertISOToYear(exp.startDate),
                endDate: convertISOToYear(exp.endDate),
            }));

            reset({ workExperiences: initialWorkExperiences });
            setInitialValuesLoaded(true);
        }
    }, [isLoadingProfile, userProfile, reset, initialValuesLoaded]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'workExperiences',
    });

    const onSubmit = async (formData: EditUserWorkExperiencesFormData) => {
        setIsLoading(true);

        const convertYearToISO = (value?: string) => {
            if (!value) return '';
            if (/^\d{4}$/.test(value)) {
                return `${value}-01-01T00:00:00.000Z`;
            }
            return value;
        };

        const payload = {
            workExperiences: (formData.workExperiences ?? []).map((exp) => ({
                ...exp,
                startDate: convertYearToISO(exp.startDate),
                endDate: convertYearToISO(exp.endDate),
            })),
        };

        const { success, message } = await patchUserWorkExperiences(payload);
        setIsLoading(false);

        if (success) {
            toast.success('Work experiences updated successfully!');
            await refetchUserProfile();
        } else {
            toast.error('Failed to update work experiences', {
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

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <BriefcaseIcon className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle className="text-2xl">Work Experiences</CardTitle>
                        <CardDescription>
                            Add your professional work experience and build your career timeline
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    {fields.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <BriefcaseIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">
                                No work experiences added yet
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    append({
                                        companyId: '',
                                        companyName: '',
                                        title: '',
                                        startDate: '',
                                        endDate: '',
                                        description: '',
                                    })
                                }
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Your First Experience
                            </Button>
                        </div>
                    )}

                    {fields.map((field, index) => {
                        const companyIdValue = watch(`workExperiences.${index}.companyId`);
                        const isUnlisted = companyIdValue === 'UNLISTED';

                        return (
                            <div
                                key={field.id}
                                className="p-6 border rounded-lg bg-card space-y-4 relative"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <Badge variant="outline" className="gap-1">
                                        <BriefcaseIcon className="h-3 w-3" />
                                        Experience #{index + 1}
                                    </Badge>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => remove(index)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field className="gap-2">
                                        <FieldLabel>
                                            Company <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Controller
                                            name={`workExperiences.${index}.companyId`}
                                            control={control}
                                            render={({ field }) => (
                                                <SelectCompany
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        />
                                        <FieldError
                                            errors={
                                                errors.workExperiences?.[index]?.companyId
                                                    ? [errors.workExperiences[index].companyId!]
                                                    : undefined
                                            }
                                        />
                                    </Field>

                                    {isUnlisted && (
                                        <Field className="gap-2">
                                            <FieldLabel>Company Name</FieldLabel>
                                            <Controller
                                                name={`workExperiences.${index}.companyName`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        placeholder="Enter company name"
                                                        {...field}
                                                    />
                                                )}
                                            />
                                            <FieldError
                                                errors={
                                                    errors.workExperiences?.[index]?.companyName
                                                        ? [
                                                              errors.workExperiences[index]
                                                                  .companyName!,
                                                          ]
                                                        : undefined
                                                }
                                            />
                                        </Field>
                                    )}

                                    <Field className={`gap-2 ${isUnlisted ? '' : 'md:col-span-2'}`}>
                                        <FieldLabel>
                                            Job Title <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Controller
                                            name={`workExperiences.${index}.title`}
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    placeholder="e.g. Senior Software Engineer"
                                                    {...field}
                                                />
                                            )}
                                        />
                                        <FieldError
                                            errors={
                                                errors.workExperiences?.[index]?.title
                                                    ? [errors.workExperiences[index].title!]
                                                    : undefined
                                            }
                                        />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field className="gap-2">
                                        <FieldLabel className="flex items-center gap-2">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            Start Year <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Controller
                                            name={`workExperiences.${index}.startDate`}
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="text"
                                                    placeholder="e.g. 2020"
                                                    {...field}
                                                />
                                            )}
                                        />
                                        <FieldError
                                            errors={
                                                errors.workExperiences?.[index]?.startDate
                                                    ? [errors.workExperiences[index].startDate!]
                                                    : undefined
                                            }
                                        />
                                    </Field>

                                    <Field className="gap-2">
                                        <FieldLabel className="flex items-center gap-2">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            End Year
                                            <span className="text-xs text-muted-foreground font-normal">
                                                (Leave empty if current)
                                            </span>
                                        </FieldLabel>
                                        <Controller
                                            name={`workExperiences.${index}.endDate`}
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="text"
                                                    placeholder="e.g. 2024 or leave empty"
                                                    {...field}
                                                />
                                            )}
                                        />
                                        <FieldError
                                            errors={
                                                errors.workExperiences?.[index]?.endDate
                                                    ? [errors.workExperiences[index].endDate!]
                                                    : undefined
                                            }
                                        />
                                    </Field>
                                </div>

                                <Field className="gap-2">
                                    <FieldLabel>Description</FieldLabel>
                                    <Controller
                                        name={`workExperiences.${index}.description`}
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea
                                                placeholder="Describe your role, responsibilities, and achievements..."
                                                rows={4}
                                                {...field}
                                            />
                                        )}
                                    />
                                    <FieldError
                                        errors={
                                            errors.workExperiences?.[index]?.description
                                                ? [errors.workExperiences[index].description!]
                                                : undefined
                                        }
                                    />
                                </Field>

                                {index < fields.length - 1 && <Separator className="mt-4" />}
                            </div>
                        );
                    })}

                    {fields.length > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                                append({
                                    companyId: '',
                                    companyName: '',
                                    title: '',
                                    startDate: '',
                                    endDate: '',
                                    description: '',
                                })
                            }
                        >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Another Experience
                        </Button>
                    )}
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

export default EditWorkExperiencesPage;

