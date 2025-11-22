import React from "react";
import { FaMapMarkerAlt, FaBriefcase, FaDollarSign } from "react-icons/fa";

interface JobCardProps {
    title: string;
    company: string;
    location: string;
    type: string;
    salary?: string;
    description: string;
    postedAt: string;
}

const JobCard: React.FC<JobCardProps> = ({
    title,
    location,
    company,
    type,
    salary,
    description,
    postedAt,
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{company}</p>
                </div>
                <span className="text-sm text-gray-400">{postedAt}</span>
            </div>

            {/* Job Info */}
            <div className="flex flex-wrap gap-4 mb-4 text-gray-600 dark:text-gray-300 text-sm">
                <div className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-gray-400" />
                    {location}
                </div>
                <div className="flex items-center gap-1">
                    <FaBriefcase className="text-gray-400" />
                    {type}
                </div>
                {salary && (
                    <div className="flex items-center gap-1">
                        <FaDollarSign className="text-gray-400" />
                        {salary}
                    </div>
                )}
            </div>

            {/* Description */}
            <p className="text-gray-700 dark:text-gray-200 line-clamp-3">{description}</p>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Apply
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    Save
                </button>
            </div>
        </div>
    );
};

export default JobCard;
