'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CompanyProfilePage = () => {
    const companyProfile = {
        description:
            'Workly Technologies, a subsidiary of Workly Corporation, is a global technology and IT services provider headquartered in San Francisco, with USD 500 million in revenue (2024) and over 2,500 employees in 15 countries. The company champions complex business opportunities and challenges with its world-class services in Advanced Analytics, AI, Digital Platforms, Cloud, Hyperautomation, IoT, Low-code, and so on. It has partnered with over 500 clients worldwide, more than 50 of which are Fortune Global 500 companies in Aviation, Automotive, Banking, Financial Services and Insurance, Healthcare, Logistics, Manufacturing, Utilities, and more. For more information, please visit http://www.workly.example.',
        website: 'https://www.workly.example',
        verifiedDate: 'March 1, 2023',
        industry: { name: 'IT Services and IT Consulting' },
        size: '10,001+ employees',
        associatedMembers: '30,312 associated members',
        specialties: [
            'IT Outsourcing',
            'Technology',
            'Analytics',
            'IoT',
            'Mobility & Cloud Services',
            'Digitalization Services',
            'Digital Transformation',
            'Digital Solutions',
            'Digital Consulting',
        ],
    };

    return (
        <Card>
            <CardHeader className="py-0 pt-4">
                <CardTitle className="text-2xl">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-sm leading-6 text-gray-700">{companyProfile.description}</p>
                </div>

                <div className="">
                    <h3 className="text-lg font-semibold ">Website</h3>
                    <a
                        href={companyProfile.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        {companyProfile.website}
                    </a>
                </div>

                <div>
                    <h3 className="text-lg font-semibold ">Industry</h3>
                    <p className="text-sm text-gray-700">{companyProfile.industry.name}</p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold ">Company size</h3>
                    <p className="text-sm text-gray-700">{companyProfile.size}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default CompanyProfilePage;
