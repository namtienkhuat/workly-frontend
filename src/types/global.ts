// Global shared types
export enum CompanySize {
    '1-10' = '1-10',
    '11-50' = '11-50',
    '51-200' = '51-200',
    '201-500' = '201-500',
    '501-1000' = '501-1000',
    '1000+' = '1000+',
}

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export interface CompanyProfile {
    companyId: string;
    name: string;
    industry?: Industry | null;
    size?: CompanySize | string;
    foundedYear?: number;
    description?: string;
    website?: string;
    logoUrl?: string;
    bannerUrl?: string;
    followersCount?: number;
    role?: string;
}

export interface Industry {
    industryId: string;
    name: string;
}

export interface Skill {
    skillId: string;
    name: string;
}

export interface School {
    schoolId: string;
    name: string;
}

export interface Location {
    locationId: string;
    name: string;
}

export interface Education {
    schoolId: string;
    school: School;
    degree: string;
    major: string;
    startDate: string;
    endDate?: string;
    description: string;
}

export interface WorkExperience {
    companyId: string;
    companyName?: string;
    title: string;
    startDate: string;
    endDate?: string;
    description?: string;
}

export interface UserProfile {
    userId: string;
    name: string;
    headline?: string;
    bio?: string;
    email: string;
    username: string;
    role: UserRole;
    avatarUrl?: string;
    bgCoverUrl?: string;
    industries: Industry[];
    skills: Skill[];
    educations: [];
    workExperiences?: WorkExperience[];
    location?: Location;
    locationId?: string;
    followersCount?: number;
    relationships?: {
        educations?: Education[];
        workExperiences?: WorkExperience[];
        location?: Location;
    };
}

export interface Follower {
    userId: string;
    name: string;
    username: string;
    avatarUrl?: string;
    headline?: string;
    followedAt?: string;
}

export interface UserBasicInfo {
    userId: string;
    name: string;
    headline?: string;
    avatarUrl?: string;
}
