'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';

const NewCompanyLayout = ({ children }: { children: React.ReactNode }) => {
    return <AuthGuard errorMessage="Please log in to create a company">{children}</AuthGuard>;
};

export default NewCompanyLayout;
