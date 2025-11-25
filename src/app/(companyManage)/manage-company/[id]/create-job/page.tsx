'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
    Select as SelectSingle,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Select from "react-select";

import { toast } from 'sonner';
import z from 'zod';
import jobService from '@/services/job/jobService';
interface OptionType {
    value: string;
    label: string;
}

const skillOptions: OptionType[] = [
    { value: "javascript", label: "JavaScript" },
    { value: "react", label: "React" },
    { value: "typescript", label: "TypeScript" },
];

const industryOptions: OptionType[] = [
    { value: "it", label: "IT" },
    { value: "finance", label: "Finance" },
    { value: "education", label: "Education" },
];

const createJobSchema = z.object({
    title: z.string().min(1, 'Job title is required'),
    description: z.string().min(1, 'Job description is required'),
    location: z.string().min(1, 'Location is required'),
    employmentType: z.enum(['full-time', 'part-time']),
    salaryMin: z.number().min(0, 'Minimum salary must be positive').optional(),
    salaryMax: z.number().min(0, 'Maximum salary must be positive').optional(),
    skills: z.array(z.string()).min(1, 'Skill is required'),
    industry: z.enum(['it', 'finance', 'education']),
});

type CreateJobFormData = z.infer<typeof createJobSchema>;

const CreateJobPage = () => {
    const { id } = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isFetching, setIsFetching] = useState(false);

    const jobId = searchParams.get('jobId');
    const isEditMode = !!jobId;
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

    useEffect(() => {
        const fetchJobData = async () => {
            if (!isEditMode) return;

            try {
                setIsFetching(true);
                const response = await jobService.getJobCompanyDetail(jobId, id);
                const jobData = response.data;

                // Parse salary từ string "$1000 - $2000" thành numbers
                let salaryMin, salaryMax;
                if (jobData.salary) {
                    const salaryMatch = jobData.salary.match(/\$(\d+)\s*-\s*\$(\d+)/) as any;
                    if (salaryMatch) {
                        salaryMin = parseInt(salaryMatch[1]);
                        salaryMax = parseInt(salaryMatch[2]);
                    }
                }

                reset({
                    title: jobData.title || '',
                    description: jobData.content || '',
                    location: jobData.location || '',
                    employmentType: jobData.jobType || 'full-time',
                    salaryMin: salaryMin,
                    salaryMax: salaryMax,
                    skills: jobData.skills || [],
                    industry: jobData.industry || 'it',
                } as CreateJobFormData);
            } catch (error: any) {
                toast.error('Failed to load job data', {
                    description: error.response?.data?.message || 'Unknown error',
                });
                router.push(`/company/${id}/jobs`);
            } finally {
                setIsFetching(false);
            }
        };

        fetchJobData();
    }, [jobId, isEditMode, reset, router, id]);

    const onSubmit = async (formData: CreateJobFormData) => {
        setIsLoading(true);

        try {
            const jobPayload = {
                title: formData.title,
                content: formData.description,
                industry: formData.industry.toLowerCase(),
                location: formData.location,
                jobType: formData.employmentType,
                salary: formData.salaryMin && formData.salaryMax
                    ? `$${formData.salaryMin} - $${formData.salaryMax}`
                    : undefined,
                skills: formData.skills.map(i => i.toLowerCase()),
            };
            if (isEditMode) {
                // Update job
                await jobService.updateJob({
                    jobId: jobId,
                    companyId: id,
                    ...jobPayload
                });
                toast.success('Job updated successfully!');
            } else {
                // Create new job
                await jobService.addJob({ companyId: id, ...jobPayload });
                toast.success('Job posted successfully!');
                reset();
            }

            toast.success('Job posted successfully!');
            reset();
            router.push(`/company/${id}/jobs`);
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
                                <SelectSingle value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select employment type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full-time">Full-time</SelectItem>
                                        <SelectItem value="part-time">Part-time</SelectItem>
                                    </SelectContent>
                                </SelectSingle>
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
                    <div className="grid grid-cols-2 gap-4">
                        <Field className="gap-2">
                            <FieldLabel>
                                Your Skills <span className="text-red-500">*</span>
                            </FieldLabel>

                            <Controller
                                name="skills"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-1">
                                        <Select
                                            isMulti
                                            value={skillOptions.filter(opt => field.value?.includes(opt.value))}
                                            onChange={(options) => {
                                                field.onChange((options as OptionType[]).map(opt => opt.value));
                                            }}
                                            options={skillOptions}
                                            className="text-sm"
                                        />
                                        <FieldError
                                            className="text-xs text-red-500"
                                            errors={errors.skills ? [errors.skills] : undefined}
                                        />
                                    </div>
                                )}
                            />
                        </Field>
                        <Field className="gap-2">
                            <FieldLabel>
                                Your Industrys<span className="text-red-500">*</span>
                            </FieldLabel>

                            <Controller
                                name="industry"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-1">
                                        <Select
                                            value={industryOptions.find(opt => opt.value === field.value)}
                                            onChange={(option) => {
                                                field.onChange(option?.value);
                                            }}
                                            options={industryOptions}
                                            className="text-sm"
                                        />
                                        <FieldError
                                            className="text-xs text-red-500"
                                            errors={errors.industry ? [errors.industry] : undefined}
                                        />
                                    </div>
                                )}
                            />
                        </Field>
                    </div>
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
                        {isLoading
                            ? "Posting..."
                            : isEditMode
                                ? "Update Job"
                                : "Create Job"
                        }
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default CreateJobPage;
