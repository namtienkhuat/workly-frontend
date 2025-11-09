// Global shared types
export enum CompanySize {
    '1-10' = '1-10',
    '11-50' = '11-50',
    '51-200' = '51-200',
    '201-500' = '201-500',
    '501-1000' = '501-1000',
    '1000+' = '1000+',
}

export interface CompanyProfile {
    companyId: string;
    name: string;
    industry: Industry;
    size: CompanySize;
    foundedYear: number;
    description?: string;
    website?: string;
    logoUrl?: string;
    bannerUrl?: string;
}

export interface Industry {
    industryId: string;
    name: string;
}
