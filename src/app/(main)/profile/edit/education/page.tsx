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
import { patchUserEducation } from '@/services/apiServices';
import { EditUserEducationFormData, editUserEducationSchema } from '@/lib/validations/user';
import { Skeleton } from '@/components/ui/skeleton';
import {
    TrashIcon,
    PlusIcon,
    GraduationCapIcon,
    CalendarIcon,
    BookOpenIcon,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import SelectSchool from '@/app/(main)/profile/edit/_components/SelectSchool';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const convertISOToYear = (value?: string | null): string => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
        return value.substring(0, 4);
    }
    return value;
};

const EditEducationPage = () => {
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
    } = useForm<EditUserEducationFormData>({
        resolver: zodResolver(editUserEducationSchema),
        defaultValues: { educations: [] },
    });

    useEffect(() => {
        if (userProfile && !initialValuesLoaded) {
            const initialEducations = (userProfile?.relationships?.educations || []).map(
                (edu: any) => ({
                    ...edu,
                    startDate: convertISOToYear(edu.startDate),
                    endDate: convertISOToYear(edu.endDate),
                })
            );

            reset({ educations: initialEducations });
            setInitialValuesLoaded(true);
        }
    }, [isLoadingProfile, userProfile, reset, initialValuesLoaded]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'educations',
    });

    const onSubmit = async (formData: EditUserEducationFormData) => {
        setIsLoading(true);

        const convertYearToISO = (value?: string) => {
            if (!value) return '';
            if (/^\d{4}$/.test(value)) {
                return `${value}-01-01T00:00:00.000Z`;
            }
            return value;
        };

        const payload = {
            educations: (formData.educations ?? []).map((edu) => ({
                ...edu,
                startDate: convertYearToISO(edu.startDate),
                endDate: convertYearToISO(edu.endDate),
            })),
        };

        const { success, message } = await patchUserEducation(payload);
        setIsLoading(false);

        if (success) {
            toast.success('Education updated successfully!');
            reset(formData, { keepDirty: false });
            await refetchUserProfile();
        } else {
            toast.error('Failed to update education', {
                description: message,
            });
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
                    <Skeleton className="h-40 w-full rounded" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <GraduationCapIcon className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle className="text-2xl">Education</CardTitle>
                        <CardDescription>
                            Add your educational background and academic achievements
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    {fields.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <GraduationCapIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">
                                No education records added yet
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    append({
                                        schoolId: '',
                                        degree: '',
                                        major: '',
                                        startDate: '',
                                        endDate: '',
                                        description: '',
                                    })
                                }
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Your First Education
                            </Button>
                        </div>
                    )}

                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="p-6 border rounded-lg bg-card space-y-4 relative"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <Badge variant="outline" className="gap-1">
                                    <GraduationCapIcon className="h-3 w-3" />
                                    Education #{index + 1}
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
                                <Field className="gap-2 md:col-span-2">
                                    <FieldLabel>
                                        School <span className="text-destructive">*</span>
                                    </FieldLabel>
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
                                                ? [errors.educations[index].schoolId!]
                                                : undefined
                                        }
                                    />
                                </Field>

                                <Field className="gap-2">
                                    <FieldLabel className="flex items-center gap-2">
                                        <GraduationCapIcon className="h-3.5 w-3.5" />
                                        Degree <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Controller
                                        name={`educations.${index}.degree`}
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select degree" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Associate">
                                                        Associate Degree
                                                    </SelectItem>
                                                    <SelectItem value="Bachelor">
                                                        Bachelor's Degree
                                                    </SelectItem>
                                                    <SelectItem value="Master">
                                                        Master's Degree
                                                    </SelectItem>
                                                    <SelectItem value="Doctorate">
                                                        Doctorate (PhD)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <FieldError
                                        errors={
                                            errors.educations?.[index]?.degree
                                                ? [errors.educations[index].degree!]
                                                : undefined
                                        }
                                    />
                                </Field>

                                <Field className="gap-2">
                                    <FieldLabel className="flex items-center gap-2">
                                        <BookOpenIcon className="h-3.5 w-3.5" />
                                        Major / Field of Study <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Controller
                                        name={`educations.${index}.major`}
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="e.g. Computer Science"
                                            />
                                        )}
                                    />
                                    <FieldError
                                        errors={
                                            errors.educations?.[index]?.major
                                                ? [errors.educations[index].major!]
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
                                        name={`educations.${index}.startDate`}
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="text"
                                                placeholder="e.g. 2018"
                                            />
                                        )}
                                    />
                                    <FieldError
                                        errors={
                                            errors.educations?.[index]?.startDate
                                                ? [errors.educations[index].startDate!]
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
                                        name={`educations.${index}.endDate`}
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="text"
                                                placeholder="e.g. 2022 or leave empty"
                                            />
                                        )}
                                    />
                                    <FieldError
                                        errors={
                                            errors.educations?.[index]?.endDate
                                                ? [errors.educations[index].endDate!]
                                                : undefined
                                        }
                                    />
                                </Field>
                            </div>

                            <Field className="gap-2">
                                <FieldLabel>Description</FieldLabel>
                                <Controller
                                    name={`educations.${index}.description`}
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            placeholder="Describe your studies, achievements, honors, or relevant coursework..."
                                            rows={4}
                                        />
                                    )}
                                />
                                <FieldError
                                    errors={
                                        errors.educations?.[index]?.description
                                            ? [errors.educations[index].description!]
                                            : undefined
                                    }
                                />
                            </Field>

                            {index < fields.length - 1 && <Separator className="mt-4" />}
                        </div>
                    ))}

                    {fields.length > 0 && (
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
                                    description: '',
                                })
                            }
                        >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Another Education
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

export default EditEducationPage;
