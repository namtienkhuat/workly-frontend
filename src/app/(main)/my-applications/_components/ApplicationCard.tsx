'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, MapPin, Building2, DollarSign, Calendar, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getInitials, getCVUrl } from '@/utils/helpers';
import DocumentViewer from '@/app/(companyManage)/_components/DocumentViewer';

export interface Application {
    _id: string;
    cvUrl: string;
    coverLetter: string;
    jobId: string;
    userId: string;
    email: string;
    name: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
    jobIdObj: string;
    jobInfo: {
        companyInfo: {
            companyId: string;
            size: string;
            name: string;
            foundedYear: number;
        };
        _id: string;
        companyId: string;
        title: string;
        content: string;
        industry: string;
        location: string;
        jobType: string;
        salary: string;
        endDate: string;
        skills: string[];
        level: string[];
        createdAt: string;
    };
}

export default function ApplicationCard({ application }: { application: Application }) {
    const router = useRouter();
    const [showCVPreview, setShowCVPreview] = useState(false);
    const [showFullContent, setShowFullContent] = useState(false);

    const { jobInfo } = application;
    const company = jobInfo.companyInfo;

    // Check if content is long (more than 200 characters)
    const isContentLong = jobInfo.content.length > 200;
    const displayContent =
        showFullContent || !isContentLong
            ? jobInfo.content
            : jobInfo.content.substring(0, 200) + '...';

    const handleCompanyClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/company/${company.companyId}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'ACCEPTED':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'REJECTED':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <>
            <article className="rounded-3xl border border-border/40 bg-white/80 p-6 shadow-md backdrop-blur dark:border-white/10 dark:bg-slate-950/70 transition-all hover:shadow-lg">
                {/* Header */}
                <header className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 flex-1">
                        <Avatar className="h-14 w-14 border-2 border-primary/20">
                            <AvatarImage src={company?.name || ''} alt={company?.name || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {getInitials(company?.name || '')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2 hover:text-primary transition-colors cursor-pointer flex-1">
                                    {jobInfo.title}
                                </h3>
                                <Badge
                                    variant="outline"
                                    className={`${getStatusColor(application.status)} shrink-0 border`}
                                >
                                    {application.status}
                                </Badge>
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
                    <p className="text-sm text-foreground/80 mb-2 whitespace-pre-line">
                        {displayContent}
                    </p>
                    {isContentLong && (
                        <button
                            onClick={() => setShowFullContent(!showFullContent)}
                            className="text-primary text-sm font-medium hover:underline"
                        >
                            {showFullContent ? 'Show less' : 'Show more'}
                        </button>
                    )}

                    {/* Job Details */}
                    <div className="flex flex-wrap gap-3 text-sm mb-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span>{jobInfo.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Briefcase className="h-4 w-4 flex-shrink-0" />
                            <span className="capitalize">{jobInfo.jobType}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <DollarSign className="h-4 w-4 flex-shrink-0" />
                            <span>{jobInfo.salary}</span>
                        </div>
                    </div>

                    {/* Skills */}
                    {jobInfo.skills && jobInfo.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {jobInfo.skills.slice(0, 5).map((skill, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20"
                                >
                                    {skill}
                                </Badge>
                            ))}
                            {jobInfo.skills.length > 5 && (
                                <Badge variant="outline" className="px-3 py-1 text-xs">
                                    +{jobInfo.skills.length - 5} more
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Level */}
                    {jobInfo.level && jobInfo.level.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {jobInfo.level.map((lvl, index) => (
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

                    {/* Cover Letter Preview */}
                    {application.coverLetter && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1 font-medium">
                                Your Cover Letter:
                            </p>
                            <p className="text-sm text-foreground/80 line-clamp-3">
                                {application.coverLetter}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <footer className="space-y-3 pt-4 border-t border-border/40">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>
                            Applied on{' '}
                            {new Date(application.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full rounded-full font-semibold"
                        size="lg"
                        onClick={() => setShowCVPreview(true)}
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        View My CV
                    </Button>
                </footer>
            </article>

            {/* CV Preview Modal */}
            {showCVPreview && (
                <div
                    className="fixed inset-0 bg-black/60 flex justify-center items-center z-[60] p-4"
                    onClick={() => setShowCVPreview(false)}
                >
                    <div
                        className="bg-white rounded-lg w-full max-w-[90vw] h-full max-h-[90vh] flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
                            <h3 className="font-semibold text-lg truncate mr-4">
                                Your CV for {jobInfo.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <a
                                    href={getCVUrl(application.cvUrl)}
                                    download
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    Download CV
                                </a>
                                <button
                                    onClick={() => setShowCVPreview(false)}
                                    className="text-gray-500 hover:text-black text-2xl w-8 h-8 flex items-center justify-center"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* CV Viewer */}
                        <div className="flex-1 overflow-auto min-h-0">
                            <DocumentViewer fileUrl={getCVUrl(application.cvUrl)} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
