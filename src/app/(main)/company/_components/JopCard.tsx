import React from "react";
import { Job } from "@/models/jobModel";

const JobCard: React.FC<Job> = ({
    id,
    title,
    content,
    industry,
    salary,
    location,
    jobType,
    skills,
}) => {
    return (
        <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {title}
                    </h3>
                    <p className="text-gray-700 font-medium">{industry}</p>
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