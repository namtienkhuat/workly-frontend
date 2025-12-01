export interface Job {
    _id: string;
    title: string;
    content: string;
    industry: string;
    salary: string;
    location: string;
    jobType: string;
    skills: string[];
    endDate: string;
    level: string[];
    isExpired: boolean
}

export interface Candidate {
    _id: string;
    jobId: string;
    userId: string;
    name: string;
    email: string;
    cvUrl: string;
    coverLetter: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
    note?: string;
}
