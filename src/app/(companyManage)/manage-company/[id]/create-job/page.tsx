'use client';

import { useState } from 'react';
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
import api from '@/utils/api';
import z from 'zod';

const createJobSchema = z.object({
    title: z.string().min(1, 'Job title is required'),
    description: z.string().min(1, 'Job description is required'),
    location: z.string().min(1, 'Location is required'),
    employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']),
    salaryMin: z.number().min(0, 'Minimum salary must be positive').optional(),
    salaryMax: z.number().min(0, 'Maximum salary must be positive').optional(),
    requirements: z.string().optional(),
});

type CreateJobFormData = z.infer<typeof createJobSchema>;

const CreateJobPage = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<CreateJobFormData>({
        resolver: zodResolver(createJobSchema),
    });

    const onSubmit = async (formData: CreateJobFormData) => {
        setIsLoading(true);

        try {
            const { data } = await api.post(`/companies/${id}/jobs`, { job: formData });
            toast.success('Job posted successfully!');
            reset();
            router.push(`/manage-company/${id}`);
        } catch (error: any) {
            toast.error('Failed to create job', {
                description: error.response?.data?.message || 'Unknown error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Create Job Posting</CardTitle>
                <CardDescription>Post a new job opening for your company</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <Field className="gap-2">
                        <FieldLabel>
                            Job Title <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                            placeholder="e.g., Senior Software Engineer"
                            {...register('title')}
                        />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={errors.title ? [errors.title] : undefined}
                        />
                    </Field>

                    <Field className="gap-2">
                        <FieldLabel>
                            Description <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Textarea
                            placeholder="Describe the job responsibilities and requirements..."
                            rows={8}
                            {...register('description')}
                        />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={errors.description ? [errors.description] : undefined}
                        />
                    </Field>

                    <Field className="gap-2">
                        <FieldLabel>
                            Location <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                            placeholder="e.g., San Francisco, CA or Remote"
                            {...register('location')}
                        />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={errors.location ? [errors.location] : undefined}
                        />
                    </Field>

                    <Field className="gap-2">
                        <FieldLabel>
                            Employment Type <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Controller
                            name="employmentType"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select employment type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full-time">Full-time</SelectItem>
                                        <SelectItem value="part-time">Part-time</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="internship">Internship</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={errors.employmentType ? [errors.employmentType] : undefined}
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field className="gap-2">
                            <FieldLabel>Minimum Salary (optional)</FieldLabel>
                            <Input
                                type="number"
                                placeholder="0"
                                {...register('salaryMin', { valueAsNumber: true })}
                            />
                            <FieldError
                                className="mt-1 text-xs"
                                errors={errors.salaryMin ? [errors.salaryMin] : undefined}
                            />
                        </Field>

                        <Field className="gap-2">
                            <FieldLabel>Maximum Salary (optional)</FieldLabel>
                            <Input
                                type="number"
                                placeholder="0"
                                {...register('salaryMax', { valueAsNumber: true })}
                            />
                            <FieldError
                                className="mt-1 text-xs"
                                errors={errors.salaryMax ? [errors.salaryMax] : undefined}
                            />
                        </Field>
                    </div>

                    <Field className="gap-2">
                        <FieldLabel>Requirements (optional)</FieldLabel>
                        <Textarea
                            placeholder="List any specific requirements or qualifications..."
                            rows={5}
                            {...register('requirements')}
                        />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={errors.requirements ? [errors.requirements] : undefined}
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
                        {isLoading ? 'Posting...' : 'Post Job'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default CreateJobPage;
