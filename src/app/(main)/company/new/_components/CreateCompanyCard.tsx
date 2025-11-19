'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CompanySize } from '@/types/global';
import { postCompanyPage } from '@/services/apiServices';
import SelectIndustry from './SelectIndustry';
import { createCompanySchema, type CreateCompanyFormData } from '@/lib/validations/company';

const CreateCompanyCard = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<CreateCompanyFormData>({
        resolver: zodResolver(createCompanySchema),
    });

    const onSubmit = async (formData: CreateCompanyFormData) => {
        setIsLoading(true);
        const { success, message, data } = await postCompanyPage(formData);
        setIsLoading(false);

        if (success) {
            toast.success('Company created successfully!');
            router.push(`/manage-company/${data.company.companyId}`);
            reset();
        } else {
            toast.error('Failed to create company', {
                description: message,
            });
        }
    };

    return (
        <Card className="max-w-md mt-6 shadow-sm">
            <CardHeader>
                <CardTitle className="text-3xl font-bold tracking-tight text-primary">
                    Create company page
                </CardTitle>
                <CardDescription>
                    Fill in the information and create a company page!
                </CardDescription>
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
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
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
                            )}
                        />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={errors.size ? [errors.size] : undefined}
                        />
                    </Field>
                    <Field className="gap-2">
                        <FieldLabel>
                            Founded year <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                            type="number"
                            inputMode="numeric"
                            placeholder="Example: 2018"
                            min={1900}
                            {...register('foundedYear', {
                                valueAsNumber: true,
                            })}
                        />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={errors.foundedYear ? [errors.foundedYear] : undefined}
                        />
                    </Field>
                </CardContent>
                <CardFooter className="flex items-center justify-between gap-4 border-t px-6 py-4">
                    <div className="flex items-center gap-3">
                        <p className="text-sm text-muted-foreground">You already have team?</p>
                        <Button
                            type="button"
                            variant="secondary"
                            className="bg-gray-200 text-gray-900 hover:bg-gray-300"
                            onClick={() => toast.info('This feature is not available yet')}
                        >
                            Join team
                        </Button>
                    </div>
                    <div className="h-6 w-px bg-border" />

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-green-600 text-white hover:bg-green-700"
                    >
                        {isLoading ? 'Creating...' : 'Create'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default CreateCompanyCard;
