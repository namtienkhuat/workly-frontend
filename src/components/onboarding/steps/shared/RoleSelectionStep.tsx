'use client';

import { useRouter } from 'next/navigation';
import { COMPANY_ONBOARDING_FLOW, USER_ONBOARDING_FLOW } from '@/lib/onboarding-config';
import React from 'react';

interface RoleCardProps {
    title: string;
    description: string;
    onClick: () => void;
    icon: React.ReactNode;
}

const RoleCard = ({ title, description, onClick, icon }: RoleCardProps) => (
    <button
        onClick={onClick}
        className="group flex w-full flex-col rounded-lg border-2 border-gray-200 bg-white p-8 text-left shadow-sm transition-all duration-200 hover:border-green-500 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-50"
    >
        <div className="h-10 w-10 text-green-600">{icon}</div>
        <h3 className="mt-4 text-2xl font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-base text-gray-500">{description}</p>
    </button>
);

const ApplicantIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
    </svg>
);
const RecruiterIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.375M9 12h6.375m-6.375 5.25h6.375M5.25 21v-2.25a2.25 2.25 0 0 1 2.25-2.25h1.5a2.25 2.25 0 0 1 2.25 2.25V21m-4.5 0h4.5m-12-18h1.5a2.25 2.25 0 0 1 2.25 2.25V21m-4.5 0h4.5"
        />
    </svg>
);

export default function RoleSelectionStep() {
    const router = useRouter();

    const handleSelectRole = (role: 'user' | 'company') => {
        if (role === 'user') {
            const firstUserStep = USER_ONBOARDING_FLOW[0];
            router.push(`/user/${firstUserStep}`);
        } else {
            const firstCompanyStep = COMPANY_ONBOARDING_FLOW[0];
            router.push(`/company/${firstCompanyStep}`);
        }
    };

    return (
        <div className="flex w-full max-w-3xl animate-fade-in flex-col items-center text-center">
            <h1 className="text-5xl font-bold text-gray-800">Welcome to Workly!</h1>
            <p className="mt-4 text-lg text-gray-600">Who are you?</p>

            <div className="mt-12 flex w-full flex-col gap-8 md:flex-row">
                <RoleCard
                    icon={<ApplicantIcon />}
                    title="Candidate"
                    description="I want to apply for jobs online, set up my personal profile, expand my networking and search for job opportunities.
"
                    onClick={() => handleSelectRole('user')}
                />
                <RoleCard
                    icon={<RecruiterIcon />}
                    title="Recruiter"
                    description="I want to search for candidates and post job listings."
                    onClick={() => handleSelectRole('company')}
                />
            </div>
        </div>
    );
}
