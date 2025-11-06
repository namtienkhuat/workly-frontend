export interface OnboardingData {
    role: 'user' | 'company' | null;
    name: string;
    email: string;

    username?: string;
    workStatus?: string;
    experienceLevel?: string;
    jobSearchStatus?: string;

    previousCompany?: string;
    hasNoExperience?: boolean;

    phone?: string;
    profession?: string;
    companyPosition?: string;
    location?: string;
    jobPosition?: string;
}

export interface StepProps {
    data: OnboardingData;
    updateFormData: (field: keyof OnboardingData, value: any) => void;
    setStepValid: (isValid: boolean) => void;
}
