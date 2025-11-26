import React, { useEffect, useState } from "react";
import { Job } from "@/models/jobModel";
import { MoreHorizontalIcon } from "lucide-react";
import { useParams } from "next/navigation";
import jobService from "@/services/job/jobService";
import { toast } from "sonner";
import profileService from "@/services/profile/profileService";
import { useRouter } from "next/navigation";

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
    canUploadCompany
}) => {
    const [open, setOpen] = useState(false);
    const params = useParams()
    const router = useRouter()



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
            <p className="text-gray-600 mb-4 line-clamp-3">{content}</p>

            {/* Skills */}
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

            {/* Action Button */}
            <div className="flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Apply
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                    Save Job
                </button>
            </div>
        </div>
    );
};

export default JobCard;