import React, { useState } from "react";
import { Job } from "@/models/jobModel";
import { MoreHorizontalIcon, X, Upload } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import jobService from "@/services/job/jobService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import profileService from "@/services/profile/profileService";
import commentService from "@/services/comment/commentService";
import commonService from "@/services/common/commonService";
import { apiPaths } from "@/configs/route";

const applyJobSchema = z.object({
    cv: z.any()
        .refine((files) => files?.length > 0, "Please upload your CV")
        .refine((files) => {
            if (!files || files.length === 0) return false;
            const file = files[0];
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            return allowedTypes.includes(file.type);
        }, "Only PDF and DOC files are allowed")
        .refine((files) => {
            if (!files || files.length === 0) return false;
            return files[0].size <= 5 * 1024 * 1024;
        }, "File size must be less than 5MB"),
    coverLetter: z.string()
        .min(1, "Cover letter is required")
        .min(10, "Cover letter must be at least 10 characters"),
});

type ApplyJobFormData = z.infer<typeof applyJobSchema>;

const JobCard: React.FC<Job & { onReload: any, canUploadCompany: boolean }> = ({
    _id,
    title,
    content,
    industry,
    salary,
    location,
    jobType,
    skills,
    onReload,
    canUploadCompany,
    endDate,
    level,
    isExpired
}) => {
    const [open, setOpen] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string>("");

    const params = useParams();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        watch
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
            let cvUrl = "";

            // Upload CV file và lấy URL
            if (formData.cv) {
                // Call API upload file
                const uploadResponse = await commonService.uploadCVToServer(formData.cv, apiPaths.uploadFile);
                console.log("uploadResponse", uploadResponse);

                cvUrl = uploadResponse[0].url;
            }

            const applicationData = {
                cvUrl: cvUrl,
                coverLetter: formData.coverLetter,
                jobId: _id
            };

            await jobService.applyJob(applicationData);
            toast.success('Job applied successfully!');
            setShowApplyModal(false);
            reset();
            setSelectedFileName("");
        } catch (error: any) {
            console.error('Apply job error:', error.response);
            toast.error(error.message)
        } finally {
            setIsSubmitting(false);
        }
    };

    const onDeleteJob = async () => {
        try {
            await jobService.deleteJob(_id, params.id as string);
            toast.success('Job deleted successfully!');
            onReload();
        } catch (error: any) {
            console.error('Delete job error:', error);
            toast.error('Failed to delete job', {
                description: error.response?.data?.message || 'Unknown error',
            });
        } finally {
            setOpen(false);
        }
    };

    const onEditJob = () => {
        try {
            router.push(`/manage-company/${params.id}/create-job?jobId=${_id}`);
            setOpen(false);
        } catch (error) {
            console.error('Edit job error:', error);
            toast.error('Failed to open edit form');
        }
    };

    return (
        <>
            <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white relative">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {title}
                        </h3>
                        <p className="text-gray-700 font-medium">{industry}</p>
                    </div>
                    {/* More options */}
                    <div className="relative">
                        {canUploadCompany && (
                            <>
                                <MoreHorizontalIcon
                                    className="cursor-pointer hover:bg-gray-100 rounded p-1"
                                    onClick={() => setOpen(!open)}
                                />
                                {open && (
                                    <div className="absolute right-0 top-full mt-2 w-32 bg-white border rounded shadow-lg z-10">
                                        <button
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t"
                                            onClick={() => {
                                                setOpen(false);
                                                onEditJob()
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 rounded-b"
                                            onClick={() => {
                                                setOpen(false);
                                                onDeleteJob();
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <span>📍</span>
                        <span>{location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>💼</span>
                        <span>{jobType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>💰</span>
                        <span>{salary}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>🏢</span>
                        <span>{industry}</span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4">{content}</p>

                {/* Skills */}
                <div className="flex">
                    <span className="text-[14px] mr-2">Skill:</span>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {skills.map((skill, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex">
                    <span className="text-[14px] mr-2">Level:</span>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {level.map((level, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                            >
                                {level}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-between items-center">
                    <Button
                        className={isExpired ? 'bg-gray-400 cursor-not-allowed' : ''}
                        disabled={isExpired}
                        onClick={() => setShowApplyModal(true)}
                    >
                        Apply
                    </Button>
                    <div className="text-[#dddddd]">CV submissions close at {endDate.split('T')[0]}</div>
                </div>
            </div>

            {/* Apply Modal using Dialog */}
            <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Apply for {title}</DialogTitle>
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
                                        onChange: handleFileChange
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
                                    setSelectedFileName("");
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Submit Application"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default JobCard;