'use client';
import React from 'react';

type JobManageCardProps = {
    jobId: string;
    title: string;
    industry: string;
    jobType: string;
    salary: string;
    skills: string[];
    level: string[];
    onViewCandidates: (jobId: string) => void;
};

export default function JobManageCard({
    jobId,
    title,
    industry,
    jobType,
    salary,
    skills,
    level,
    onViewCandidates,
}: JobManageCardProps) {
    return (
        <div className="bg-white shadow-md rounded-lg p-6 ml-5 hover:shadow-lg transition-shadow min-w-[40vw] my-10">
            <div className="flex flex-col">
                <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>

                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                        {industry && <span className="badge">{industry}</span>}
                        {jobType && <span className="badge">{jobType}</span>}
                        {salary && <span className="badge">{salary}</span>}
                    </div>

                    {skills && skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}

                    {level && level.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {level.map((lvl) => (
                                <span
                                    key={lvl}
                                    className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium"
                                >
                                    {lvl}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => onViewCandidates(jobId)}
                        className="px-3 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors"
                    >
                        View Candidates
                    </button>
                </div>
            </div>
        </div>
    );
}
