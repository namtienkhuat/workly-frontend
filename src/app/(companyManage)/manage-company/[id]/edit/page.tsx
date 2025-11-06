'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useGetCompanyProfile } from '@/hooks/useQueryData';
import { NUMBER_OF_EMPLOYEES } from '@/constants';
import api from '@/utils/api';
import z from 'zod';

const industry = [
    { label: 'IT', value: 'IT' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Sales', value: 'Sales' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Education', value: 'Education' },
    { label: 'Healthcare', value: 'Healthcare' },
    { label: 'Manufacturing', value: 'Manufacturing' },
    { label: 'Retail', value: 'Retail' },
    { label: 'Other', value: 'Other' },
];

const editCompanySchema = z.object({
    name: z.string().min(1, 'Company name is required'),
    description: z.string().optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    industryId: z.string().min(1, 'Industry must be provided'),
    numberOfEmployees: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '> 1000']),
    foundedYear: z
        .number()
        .int('Founded year must be an integer')
        .min(1800, 'Founded year looks wrong')
        .max(new Date().getFullYear(), 'Founded year cannot be in the future')
        .optional(),
    location: z.string().optional(),
});

type EditCompanyFormData = z.infer<typeof editCompanySchema>;

const EditCompanyPage = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const { data: companyProfileData, isLoading: isLoadingProfile } = useGetCompanyProfile(
        id as string
    );
    const companyProfile = companyProfileData?.data?.company;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<EditCompanyFormData>({
        resolver: zodResolver(editCompanySchema),
        defaultValues: {
            name: companyProfile?.name || '',
            description: companyProfile?.description || '',
            website: companyProfile?.website || '',
            industryId: companyProfile?.industry?.id || '',
            location: companyProfile?.location || '',
        },
    });

    useEffect(() => {
        if (companyProfile) {
            reset({
                name: companyProfile.name || '',
                description: companyProfile.description || '',
                website: companyProfile.website || '',
                industryId: companyProfile.industry?.id || '',
                location: companyProfile.location || '',
            });
        }
    }, [companyProfile, reset]);

    const onSubmit = async (formData: EditCompanyFormData) => {
        setIsLoading(true);

        try {
            await api.patch(`/companies/${id}`, { company: formData });
            toast.success('Company information updated successfully!');
            router.refresh();
        } catch (error: any) {
            toast.error('Failed to update company', {
                description: error.response?.data?.message || 'Unknown error',
            });
        } finally {
            setIsLoading(false);
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
                            rows={5}
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
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {industry.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                            name="numberOfEmployees"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select number of employees" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {NUMBER_OF_EMPLOYEES.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={
                                errors.numberOfEmployees ? [errors.numberOfEmployees] : undefined
                            }
                        />
                    </Field>

                    <Field className="gap-2">
                        <FieldLabel>Location</FieldLabel>
                        <Input placeholder="City, Country" {...register('location')} />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={errors.location ? [errors.location] : undefined}
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
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default EditCompanyPage;
