'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, MapPin, Building2, DollarSign, Calendar, Upload } from 'lucide-react';
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import jobService from '@/services/job/jobService';
import commonService from '@/services/common/commonService';
import { apiPaths } from '@/configs/route';

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

const JobCard = ({ job }: { job: Job }) => {
    const router = useRouter();
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string>('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ApplyJobFormData>({
        resolver: zodResolver(applyJobSchema),
    });

    const handleCardClick = () => {
        router.push(`/jobs/${job._id}`);
    };

    const handleCompanyClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/company/${job.company.id}`);
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

    return (
        <article className="rounded-3xl border border-border/40 bg-white/80 p-6 shadow-md backdrop-blur dark:border-white/10 dark:bg-slate-950/70 transition-all hover:shadow-lg">
            {/* Header */}
            <header className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3 flex-1">
                    <Avatar
                        className="h-14 w-14 border-2 border-primary/20 cursor-pointer hover:border-primary/40 transition-colors"
                        onClick={handleCompanyClick}
                    >
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(job.company.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h3
                            onClick={handleCardClick}
                            className="text-lg font-bold text-foreground mb-1 line-clamp-2 hover:text-primary transition-colors cursor-pointer"
                        >
                            {job.title}
                        </h3>
                        <div
                            className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                            onClick={handleCompanyClick}
                        >
                            <Building2 className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium truncate">{job.company.name}</span>
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
                        className="flex-1 rounded-full font-semibold"
                        size="lg"
                        disabled={!!(job.endDate && formatEndDate(job.endDate)?.isExpired)}
                        onClick={() => setShowApplyModal(true)}
                    >
                        Ứng tuyển ngay
                    </Button>
                    {/* <Button
                        variant="outline"
                        className="rounded-full"
                        size="lg"
                        onClick={handleCardClick}
                    >
                        Xem chi tiết
                    </Button> */}
                </div>
            </footer>

            {/* Apply Modal using Dialog */}
            <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Apply for {job.title}</DialogTitle>
                        <DialogDescription>
                            Submit your CV and cover letter for this position
                        </DialogDescription>
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
        </article>
    );
};

export default JobCard;
