import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Create a new company',
    description: 'Create a new company',
};

const NewCompanyLayout = ({ children }: { children: React.ReactNode }) => {
    return <div>{children}</div>;
};

export default NewCompanyLayout;
