'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useGetCompanyProfile } from '@/hooks/useQueryData';
import { EditCompanyFormData, editCompanySchema } from '@/lib/validations/company';
import SelectIndustry from '@/app/(main)/company/new/_components/SelectIndustry';
import { CompanyProfile, CompanySize } from '@/types/global';
import { patchCompanyProfileData } from '@/services/apiServices';

const EditCompanyPage = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        data: companyProfileData,
        isLoading: isLoadingProfile,
        refetch: refetchCompanyProfile,
    } = useGetCompanyProfile(id);
    const companyProfile: CompanyProfile = companyProfileData?.data?.company ?? {};

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isDirty },
    } = useForm<EditCompanyFormData>({
        resolver: zodResolver(editCompanySchema),
        defaultValues: {
            ...companyProfile,
            industryId: companyProfile.industry?.industryId,
        },
    });

    const onSubmit = async (formData: EditCompanyFormData) => {
        setIsLoading(true);

        const { success, message } = await patchCompanyProfileData(id, formData);
        setIsLoading(false);

        if (success) {
            toast.success('Company information updated successfully!');
            refetchCompanyProfile();
            router.push(`/manage-company/${id}`);
        } else {
            toast.error('Failed to update company', {
                description: message,
            });
        }
    };

    if (isLoadingProfile) {
        return (
            <Card>
                <CardHeader>
                    <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="h-10 w-full bg-muted animate-pulse rounded" />
                        <div className="h-24 w-full bg-muted animate-pulse rounded" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!companyProfile) return <div>Company not found</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Edit Company Information</CardTitle>
                <CardDescription>Update your company details and information</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <Field className="gap-2">
                        <FieldLabel>
                            Name <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input placeholder="Company name" {...register('name')} />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={errors.name ? [errors.name] : undefined}
                        />
                    </Field>

                    <Field className="gap-2">
                        <FieldLabel>Description</FieldLabel>
                        <Textarea
                            placeholder="Company description"
                            autoResize
                            {...register('description')}
                        />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={errors.description ? [errors.description] : undefined}
                        />
                    </Field>

                    <Field className="gap-2">
                        <FieldLabel>Website</FieldLabel>
                        <Input
                            type="url"
                            placeholder="https://www.example.com"
                            {...register('website')}
                        />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={errors.website ? [errors.website] : undefined}
                        />
                    </Field>

                    <Field className="gap-2">
                        <FieldLabel>
                            Industry <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Controller
                            name="industryId"
                            control={control}
                            render={({ field }) => (
                                <SelectIndustry value={field.value} onChange={field.onChange} />
                            )}
                        />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={errors.industryId ? [errors.industryId] : undefined}
                        />
                    </Field>

                    <Field className="gap-2">
                        <FieldLabel>
                            Number of employees <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Controller
                            name="size"
                            control={control}
                            render={({ field }) => {
                                return (
                                    <Select
                                        value={field.value || ''}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose number of employees" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(CompanySize).map((item) => (
                                                <SelectItem key={item} value={item}>
                                                    {item}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                );
                            }}
                        />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={errors.size ? [errors.size] : undefined}
                        />
                    </Field>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading || !isDirty}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default EditCompanyPage;
