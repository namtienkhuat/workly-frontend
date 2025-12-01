'use client';

import { Candidate } from "@/models/jobModel";
import { getCVUrl } from "@/utils/helpers";
import { useState } from "react";
import DocumentViewer from "./DocumentViewer";

export default function CandidateCard({
    candidate,
    onFeedback
}: {
    candidate: Candidate;
    jobId: string;
    onFeedback?: (userId: string, status: 'ACCEPTED' | 'REJECTED') => Promise<void>;
}) {
    const [showPDFPreview, setShowPDFPreview] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const isPDF = getCVUrl(candidate.cvUrl);

    const handleAccept = async () => {
        if (!onFeedback) return;

        setIsProcessing(true);
        try {
            await onFeedback(candidate.userId, 'ACCEPTED');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!onFeedback) return;

        setIsProcessing(true);
        try {
            await onFeedback(candidate.userId, 'REJECTED');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className="border rounded-lg p-4 mb-3 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-semibold text-lg">{candidate.name}</h3>
                        <p className="text-sm text-gray-600">{candidate.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${candidate.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : candidate.status === 'ACCEPTED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                        {candidate.status}
                    </span>
                </div>

                {candidate.coverLetter && (
                    <div className="mb-3">
                        <p className="text-sm text-gray-700 line-clamp-3">
                            {candidate.coverLetter}
                        </p>
                    </div>
                )}

                {candidate.cvUrl && (
                    <div className="mb-3">
                        <button
                            onClick={() => setShowPDFPreview(true)}
                            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                        >
                            <span>📄</span>
                            {isPDF ? 'Preview CV' : 'View CV'}
                        </button>
                    </div>
                )}

                {candidate.status === 'PENDING' && onFeedback && (
                    <div className="flex gap-2">
                        <button
                            className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                            onClick={handleAccept}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Accept'}
                        </button>
                        <button
                            className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                            onClick={handleReject}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Reject'}
                        </button>
                    </div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                    Applied: {new Date(candidate.createdAt).toLocaleDateString()}
                </div>
            </div>

            {showPDFPreview && (
                <div
                    className="fixed inset-0 bg-black/60 flex justify-center items-center z-[60]"
                    onClick={() => setShowPDFPreview(false)}
                >
                    <div
                        className="bg-white rounded-lg w-[90vw] h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="font-semibold text-lg">
                                {candidate.name}'s CV
                            </h3>
                            <div className="flex items-center gap-2">
                                <a
                                    href={candidate.cvUrl}
                                    download
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                                >
                                    Download
                                </a>
                                <button
                                    onClick={() => setShowPDFPreview(false)}
                                    className="text-gray-500 hover:text-black text-2xl w-8 h-8 flex items-center justify-center"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <DocumentViewer fileUrl={getCVUrl(candidate.cvUrl)} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}