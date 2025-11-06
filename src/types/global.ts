// Global shared types

export interface CompanyProfile {
    id: string;
    name: string;
    description: string;
    location: string;
    website?: string;
    size?: string;
    industry: Industry;
}

export interface Industry {
    id: string;
    name: string;
}
