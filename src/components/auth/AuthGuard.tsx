'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { paths } from '@/configs/route';
import { Loader } from 'lucide-react';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    showLoadingSpinner?: boolean;
    redirectTo?: string;
    errorMessage?: string;
}

export const AuthGuard = ({
    children,
    requireAuth = true,
    showLoadingSpinner = true,
    redirectTo = paths.signin,
    errorMessage = 'Please log in to do this action',
}: AuthGuardProps) => {
    const { isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (requireAuth && !isLoading && !isAuthenticated) {
            toast.error(errorMessage);
            router.push(redirectTo);
        }
    }, [isLoading, isAuthenticated]);

    if (isLoading && showLoadingSpinner) {
        return (
            <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center">
                <Loader className="animate-spin text-primary size-10" />
            </div>
        );
    }

    // Only render children if authenticated (when requireAuth is true)
    if (requireAuth && !isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};
