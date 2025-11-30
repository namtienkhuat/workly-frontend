'use client';

import { useState, useEffect } from 'react';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useGetCompanyProfile } from '@/hooks/useQueryData';
import { EditCompanyFormData, editCompanySchema } from '@/lib/validations/company';
import SelectIndustry from '@/app/(main)/company/new/_components/SelectIndustry';
import { CompanyProfile, CompanySize } from '@/types/global';
import { patchCompanyProfileData, deleteCompany } from '@/services/apiServices';
import {
    Trash2,
    AlertTriangle,
    Building2Icon,
    FileTextIcon,
    GlobeIcon,
    TrendingUpIcon,
    UsersIcon,
    CalendarIcon,
    InfoIcon,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EditCompanyPage = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        data: companyProfileData,
        isLoading: isLoadingProfile,
        refetch: refetchCompanyProfile,
    } = useGetCompanyProfile(id);
    const companyProfile: CompanyProfile = companyProfileData?.data?.company ?? {};

    const isOwner = companyProfile?.role === 'OWNER';

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isDirty },
    } = useForm<EditCompanyFormData>({
        resolver: zodResolver(editCompanySchema),
    });

    // Reset form when company profile data is loaded
    useEffect(() => {
        if (companyProfile && companyProfile.companyId) {
            reset({
                name: companyProfile.name || '',
                description: companyProfile.description || '',
                website: companyProfile.website || '',
                industryId: companyProfile.industry?.industryId || '',
                size: (companyProfile.size as CompanySize) || undefined,
                foundedYear: companyProfile.foundedYear,
            });
        }
    }, [companyProfile, reset]);

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

    const handleDeleteCompany = async () => {
        setIsDeleting(true);
        const { success, message } = await deleteCompany(id);
        setIsDeleting(false);

        if (success) {
            toast.success('Company deleted successfully!');
            router.push('/');
        } else {
            toast.error('Failed to delete company', {
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
                <div className="flex items-center gap-2">
                    <Building2Icon className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle className="text-2xl">Edit Company Information</CardTitle>
                        <CardDescription>
                            Update your company details and public profile information
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertDescription>
                            Your company information is visible to all users. Keep it accurate and
                            up-to-date to attract the best talent.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <Field className="gap-2">
                            <FieldLabel className="flex items-center gap-2">
                                <Building2Icon className="h-4 w-4" />
                                Company Name <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                                placeholder="Enter company name"
                                {...register('name')}
                                className="h-10"
                            />
                            <p className="text-xs text-muted-foreground">
                                The official name of your company
                            </p>
                            <FieldError
                                className="mt-1 text-xs"
                                errors={errors.name ? [errors.name] : undefined}
                            />
                        </Field>

                        <Field className="gap-2">
                            <FieldLabel className="flex items-center gap-2">
                                <FileTextIcon className="h-4 w-4" />
                                Description
                            </FieldLabel>
                            <Textarea
                                placeholder="Tell us about your company, culture, mission, and what makes it unique..."
                                autoResize
                                {...register('description')}
                                className="min-h-[100px]"
                            />
                            <p className="text-xs text-muted-foreground">
                                A compelling description helps candidates understand your company
                                better
                            </p>
                            <FieldError
                                className="mt-1 text-xs"
                                errors={errors.description ? [errors.description] : undefined}
                            />
                        </Field>

                        <Field className="gap-2">
                            <FieldLabel className="flex items-center gap-2">
                                <GlobeIcon className="h-4 w-4" />
                                Website
                            </FieldLabel>
                            <Input
                                type="url"
                                placeholder="https://www.example.com"
                                {...register('website')}
                                className="h-10"
                            />
                            <p className="text-xs text-muted-foreground">
                                Your company&apos;s official website URL
                            </p>
                            <FieldError
                                className="mt-1 text-xs"
                                errors={errors.website ? [errors.website] : undefined}
                            />
                        </Field>

                        <Field className="gap-2">
                            <FieldLabel className="flex items-center gap-2">
                                <TrendingUpIcon className="h-4 w-4" />
                                Industry <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Controller
                                name="industryId"
                                control={control}
                                render={({ field }) => (
                                    <SelectIndustry value={field.value} onChange={field.onChange} />
                                )}
                            />
                            <p className="text-xs text-muted-foreground">
                                Select the industry that best describes your company
                            </p>
                            <FieldError
                                className="mt-1 text-xs"
                                errors={errors.industryId ? [errors.industryId] : undefined}
                            />
                        </Field>

                        <Field className="gap-2">
                            <FieldLabel className="flex items-center gap-2">
                                <UsersIcon className="h-4 w-4" />
                                Company Size <span className="text-destructive">*</span>
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
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Choose number of employees" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(CompanySize).map((item) => (
                                                    <SelectItem key={item} value={item}>
                                                        <div className="flex items-center gap-2">
                                                            <UsersIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {item} employees
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    );
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Total number of employees in your company
                            </p>
                            <FieldError
                                className="mt-1 text-xs"
                                errors={errors.size ? [errors.size] : undefined}
                            />
                        </Field>

                        <Field className="gap-2">
                            <FieldLabel className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                Founded Year
                            </FieldLabel>
                            <Input
                                type="number"
                                placeholder="e.g. 2020"
                                {...register('foundedYear', { valueAsNumber: true })}
                                className="h-10"
                                min="1800"
                                max={new Date().getFullYear()}
                            />
                            <p className="text-xs text-muted-foreground">
                                The year your company was established
                            </p>
                            <FieldError
                                className="mt-1 text-xs"
                                errors={errors.foundedYear ? [errors.foundedYear] : undefined}
                            />
                        </Field>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 bg-muted/50">
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

            {/* Danger Zone - Only for Owner */}
            {isOwner && (
                <>
                    <Separator className="my-8" />
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <div>
                                <h3 className="text-lg font-semibold text-destructive">
                                    Danger Zone
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Irreversible actions that will permanently affect your company
                                </p>
                            </div>
                        </div>

                        <Card className="border-destructive/50 bg-destructive/5">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            <h4 className="font-semibold text-sm">
                                                Delete This Company
                                            </h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Once you delete a company, there is no going back. All
                                            company data, posts, admin assignments, and job postings
                                            will be permanently removed.
                                        </p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                        className="gap-2 shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Company
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Company
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <div>
                                    Are you absolutely sure you want to delete{' '}
                                    <strong className="text-foreground">
                                        {companyProfile.name}
                                    </strong>
                                    ?
                                </div>
                                <div className="text-destructive font-medium">
                                    This action cannot be undone. This will permanently delete:
                                </div>
                                <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                                    <li>All company information and data</li>
                                    <li>All posts and content</li>
                                    <li>All admin assignments</li>
                                    <li>All job postings</li>
                                </ul>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCompany}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Yes, Delete Company'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};

export default EditCompanyPage;
