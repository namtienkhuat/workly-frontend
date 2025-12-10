'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Briefcase,
    MapPin,
    Clock,
    Building2,
    DollarSign,
    Calendar,
    Upload,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { toast } from 'sonner';
import jobService from '@/services/job/jobService';
import commonService from '@/services/common/commonService';
import { apiPaths } from '@/configs/route';
import { formatDate, formatEndDate } from '@/utils/time';
import { getInitials } from '@/utils/helpers';
import { useGetJobById } from '@/hooks/useQueryData';

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

export default function JobDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string>('');

    const { data: jobData, isLoading } = useGetJobById(id);
    const job = jobData?.data;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<ApplyJobFormData>({
        resolver: zodResolver(applyJobSchema),
    });

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

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <h2 className="text-2xl font-bold">Job not found</h2>
                <Button onClick={() => router.push('/jobs')} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Jobs
                </Button>
            </div>
        );
    }

    const endDateInfo = formatEndDate(job.endDate);
    const isExpired = !!(job.endDate && endDateInfo?.isExpired);

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            {/* Back Button */}
            <Button onClick={() => router.back()} variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>

            {/* Job Header Card */}
            <div className="rounded-3xl border border-border/40 bg-white/80 p-6 shadow-md backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
                <div className="flex items-start gap-4 mb-6">
                    <Avatar className="h-20 w-20 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                            {getInitials(job.company.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-foreground mb-2">{job.title}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                            <Building2 className="h-5 w-5 flex-shrink-0" />
                            <span className="text-lg font-medium">{job.company.name}</span>
                        </div>

                        {/* Job Details */}
                        <div className="flex flex-wrap gap-4 text-sm mb-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Briefcase className="h-4 w-4 flex-shrink-0" />
                                <span className="capitalize">{job.jobType}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <DollarSign className="h-4 w-4 flex-shrink-0" />
                                <span>{job.salary}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4 flex-shrink-0" />
                                <span>{formatDate(job.createdAt)}</span>
                            </div>
                        </div>

                        {/* End Date */}
                        {endDateInfo && (
                            <div
                                className={`inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
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
                        )}
                    </div>
                </div>

                {/* Apply Button */}
                <div className="pt-4 border-t border-border/40">
                    <Button
                        className="w-full rounded-full font-semibold"
                        size="lg"
                        disabled={isExpired}
                        onClick={() => setShowApplyModal(true)}
                    >
                        Apply now
                    </Button>
                </div>
            </div>

            {/* Job Content & Skills Card */}
            <div className="rounded-3xl border border-border/40 bg-white/80 p-6 shadow-md backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
                {/* Job Content */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Job Description</h2>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="whitespace-pre-line text-foreground/90 leading-relaxed">
                            {job.content}
                        </p>
                    </div>
                </div>

                {/* Skills & Requirements */}
                <div className="pt-8 border-t border-border/40">
                    <h2 className="text-2xl font-bold mb-4">Skills & Requirements</h2>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill: string, index: number) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20"
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Level */}
                    {job.level && job.level.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Level</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.level.map((lvl: string, index: number) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="px-4 py-2 text-sm capitalize"
                                    >
                                        {lvl}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Industry */}
                    {job.industry && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">Industry</h3>
                            <Badge variant="outline" className="px-4 py-2 text-sm">
                                {job.industry}
                            </Badge>
                        </div>
                    )}
                </div>
            </div>

            {/* Apply Job Dialog */}
            <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Apply for {job.title}</DialogTitle>
                        <DialogDescription>
                            Please upload your CV and write a cover letter to apply for this
                            position.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* CV Upload */}
                        <Field className="gap-2">
                            <FieldLabel>
                                Upload CV <span className="text-red-500">*</span>
                            </FieldLabel>
                            <Controller
                                name="cv"
                                control={control}
                                render={({ field: { onChange } }) => (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex items-center gap-2"
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = '.pdf,.doc,.docx';
                                                    input.onchange = (e: any) => {
                                                        const files = e.target.files;
                                                        if (files) {
                                                            onChange(files);
                                                            handleFileChange(e);
                                                        }
                                                    };
                                                    input.click();
                                                }}
                                            >
                                                <Upload className="h-4 w-4" />
                                                Choose File
                                            </Button>
                                            {selectedFileName && (
                                                <span className="text-sm text-muted-foreground truncate">
                                                    {selectedFileName}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Accepted formats: PDF, DOC, DOCX (Max 5MB)
                                        </p>
                                    </div>
                                )}
                            />
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
        </div>
    );
}
