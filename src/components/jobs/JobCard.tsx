'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Briefcase,
    MapPin,
    Building2,
    DollarSign,
    Calendar,
    Upload,
    MoreVertical,
    Edit,
    Trash2,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/utils/helpers';
import { formatEndDate } from '@/utils/time';
import { Job } from '@/models/jobModel';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import jobService from '@/services/job/jobService';
import commonService from '@/services/common/commonService';
import { apiPaths } from '@/configs/route';
import { useAuth } from '@/hooks/useAuth';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import { AvatarImage } from '@radix-ui/react-avatar';
import { CompanyProfile } from '@/types/global';

const applyJobSchema = z.object({
    cv: z
        .any()
        .refine((files) => files?.length > 0, 'Please upload your CV')
        .refine((files) => {
            if (!files || files.length === 0) return false;
            const file = files[0];
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            return allowedTypes.includes(file.type);
        }, 'Only PDF and DOC files are allowed')
        .refine((files) => {
            if (!files || files.length === 0) return false;
            return files[0].size <= 5 * 1024 * 1024;
        }, 'File size must be less than 5MB'),
    coverLetter: z
        .string()
        .min(1, 'Cover letter is required')
        .min(10, 'Cover letter must be at least 10 characters'),
});

type ApplyJobFormData = z.infer<typeof applyJobSchema>;

const JobCard = ({
    job,
    isCompanyPage = false,
    canEdit = false,
    onReload,
    companyProfile,
}: {
    job: Job;
    isCompanyPage?: boolean;
    canEdit?: boolean;
    onReload?: () => void;
    companyProfile?: CompanyProfile;
}) => {
    const { isAuthenticated } = useAuth();

    const router = useRouter();
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string>('');
    const [isApplied, setIsApplied] = useState<boolean>(job.isApplied || false);

    const [company, setCompany] = useState<{
        id: string;
        name: string;
        imageUrl?: string;
    }>();

    useEffect(() => {
        if (isCompanyPage) {
            setCompany({
                id: companyProfile?.companyId || '',
                name: companyProfile?.name || '',
                imageUrl: companyProfile?.logoUrl,
            });
        } else {
            setCompany(job.company);
        }
    }, [companyProfile]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ApplyJobFormData>({
        resolver: zodResolver(applyJobSchema),
    });

    const handleCompanyClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/company/${company?.id || ''}`);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFileName(e.target.files[0].name);
        }
    };

    const onSubmit = async (formData: ApplyJobFormData) => {
        setIsSubmitting(true);
        try {
            let cvUrl = '';

            // Upload CV file và lấy URL
            if (formData.cv) {
                // Call API upload file
                const uploadResponse = await commonService.uploadCVToServer(
                    formData.cv,
                    apiPaths.uploadFile
                );
                console.log('uploadResponse', uploadResponse);

                cvUrl = uploadResponse[0].url;
            }

            const applicationData = {
                cvUrl: cvUrl,
                coverLetter: formData.coverLetter,
                jobId: job._id,
            };

            await jobService.applyJob(applicationData);
            setIsApplied(true);
            toast.success('Job applied successfully!');
            setShowApplyModal(false);
            reset();
            setSelectedFileName('');
        } catch (error: any) {
            console.error('Apply job error:', error.response);
            toast.error(error.message || 'Failed to apply for job');
        } finally {
            setIsSubmitting(false);
        }
    };

    const onDeleteJob = async () => {
        setIsDeleting(true);
        try {
            await jobService.deleteJob(job._id, company?.id || '');
            toast.success('Job deleted successfully!');
            setShowDeleteDialog(false);
            if (onReload) {
                onReload();
            } else {
                // If no reload callback, refresh the page
                router.refresh();
            }
        } catch (error: any) {
            console.error('Delete job error:', error);
            toast.error('Failed to delete job', {
                description: error.response?.data?.message || 'Unknown error',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const onEditJob = () => {
        try {
            router.push(`/manage-company/${company?.id}/create-job?jobId=${job._id}`);
        } catch (error) {
            console.error('Edit job error:', error);
            toast.error('Failed to open edit form');
        }
    };

    return (
        <article className="rounded-3xl border border-border/40 bg-white/80 p-6 shadow-md backdrop-blur dark:border-white/10 dark:bg-slate-950/70 transition-all hover:shadow-lg">
            {/* Header */}
            <header className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                        <AvatarImage src={company?.imageUrl || ''} alt={company?.name || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(company?.name || '')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h3
                                // onClick={handleCardClick}
                                className="text-lg font-bold text-foreground mb-1 line-clamp-2 hover:text-primary transition-colors cursor-pointer flex-1"
                            >
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-2 shrink-0">
                                {isApplied && (
                                    <Badge
                                        variant="default"
                                        className="bg-primary text-primary-foreground shrink-0 mt-0.5"
                                    >
                                        Applied
                                    </Badge>
                                )}
                                {canEdit && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditJob();
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowDeleteDialog(true);
                                                }}
                                                className="cursor-pointer text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                        <div
                            className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                            onClick={handleCompanyClick}
                        >
                            <Building2 className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium truncate">{company?.name || ''}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="mb-4">
                <p className="text-sm text-foreground/80 line-clamp-3 mb-4">{job.content}</p>

                {/* Job Details */}
                <div className="flex flex-wrap gap-3 text-sm mb-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Briefcase className="h-4 w-4 flex-shrink-0" />
                        <span className="capitalize">{job.jobType}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <DollarSign className="h-4 w-4 flex-shrink-0" />
                        <span>{job.salary}</span>
                    </div>
                    {/* <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>{formatDate(job.createdAt)}</span>
                    </div> */}
                </div>

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {job.skills.slice(0, 5).map((skill, index) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20"
                            >
                                {skill}
                            </Badge>
                        ))}
                        {job.skills.length > 5 && (
                            <Badge variant="outline" className="px-3 py-1 text-xs">
                                +{job.skills.length - 5} more
                            </Badge>
                        )}
                    </div>
                )}

                {/* Level */}
                {job.level && job.level.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {job.level.map((lvl, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="px-3 py-1 text-xs capitalize"
                            >
                                {lvl}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <footer className="space-y-3 pt-4 border-t border-border/40">
                {job.endDate &&
                    (() => {
                        const endDateInfo = formatEndDate(job.endDate);
                        if (!endDateInfo) return null;
                        return (
                            <div
                                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                                    endDateInfo.isExpired
                                        ? 'bg-destructive/10 text-destructive'
                                        : endDateInfo.isUrgent
                                          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                          : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                <span className="font-medium">{endDateInfo.text}</span>
                            </div>
                        );
                    })()}
                <div className="flex gap-2">
                    <Button
                        className={`flex-1 rounded-full font-semibold ${
                            isApplied
                                ? 'bg-primary/20 text-primary hover:bg-primary/30 cursor-default'
                                : ''
                        }`}
                        size="lg"
                        variant={isApplied ? 'secondary' : 'default'}
                        disabled={
                            // not expired and not applied
                            !!(job.endDate && formatEndDate(job.endDate)?.isExpired) || isApplied
                        }
                        onClick={() => {
                            if (isApplied) return;
                            if (!isAuthenticated) {
                                setShowLoginModal(true);
                            } else {
                                setShowApplyModal(true);
                            }
                        }}
                    >
                        {isApplied ? (
                            <span className="flex items-center gap-2">
                                <span>✓</span>
                                <span>Applied</span>
                            </span>
                        ) : (
                            'Apply Now'
                        )}
                    </Button>
                    {isApplied && (
                        <Button
                            variant="outline"
                            className="rounded-full"
                            onClick={() => {
                                // TODO: Navigate to application details or open modal
                                // router.push(`/jobs/${job._id}/application`);
                            }}
                        >
                            View Application
                        </Button>
                    )}
                </div>
            </footer>

            {/* Apply Modal using Dialog */}
            <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Apply for
                            <span className="text-primary ml-1 font-semibold">{job.title}</span>
                        </DialogTitle>
                        {/* <DialogDescription>
                            Submit your CV and cover letter for this position
                        </DialogDescription> */}
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Field className="gap-2">
                            <FieldLabel>
                                Upload CV <span className="text-red-500">*</span>
                            </FieldLabel>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                <input
                                    type="file"
                                    id="cv-upload"
                                    accept=".pdf,.doc,.docx"
                                    {...register('cv', {
                                        onChange: handleFileChange,
                                    })}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="cv-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600">
                                        Click to upload or drag and drop
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">
                                        PDF, DOC up to 5MB
                                    </span>
                                </label>
                                {selectedFileName && (
                                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
                                        <span>✓</span>
                                        <span>{selectedFileName}</span>
                                    </div>
                                )}
                            </div>
                            <FieldError
                                className="mt-1 text-xs"
                                errors={errors.cv ? [errors.cv] : undefined}
                            />
                        </Field>

                        {/* Cover Letter */}
                        <Field className="gap-2">
                            <FieldLabel>
                                Cover Letter <span className="text-red-500">*</span>
                            </FieldLabel>
                            <Textarea
                                placeholder="Tell us why you're a great fit for this position..."
                                rows={8}
                                {...register('coverLetter')}
                            />
                            <FieldError
                                className="mt-1 text-xs"
                                errors={errors.coverLetter ? [errors.coverLetter] : undefined}
                            />
                        </Field>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowApplyModal(false);
                                    reset();
                                    setSelectedFileName('');
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Login Required Modal */}
            <AuthRequiredModal
                open={showLoginModal}
                onOpenChange={setShowLoginModal}
                featureName="apply for this job"
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the job
                            <span className="text-primary ml-1 font-semibold">{job.title}</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onDeleteJob}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </article>
    );
};

export default JobCard;
