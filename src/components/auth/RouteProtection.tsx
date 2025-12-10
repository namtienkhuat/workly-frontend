'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AuthRequiredModal } from './AuthRequiredModal';

interface RouteProtectionProps {
    children: React.ReactNode;
    restrictedRoutes?: string[];
}

const DEFAULT_RESTRICTED_ROUTES = ['/chat', '/settings', '/manage-companies', '/profile/edit'];

export const RouteProtection: React.FC<RouteProtectionProps> = ({
    children,
    restrictedRoutes = DEFAULT_RESTRICTED_ROUTES,
}) => {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const [authModalOpen, setAuthModalOpen] = useState(false);

    const getFeatureName = (route: string): string => {
        if (route.startsWith('/chat')) return 'messaging';
        if (route.startsWith('/settings')) return 'settings';
        if (route.startsWith('/manage-companies') || route.startsWith('/manage-company'))
            return 'company management';
        if (route.startsWith('/profile/edit')) return 'profile editing';
        if (route.startsWith('/profile')) return 'profile';
        return 'this feature';
    };

    const isRestrictedRoute = (route: string): boolean => {
        if (route.startsWith('/profile')) {
            const profileIdPattern = /^\/profile\/[^\/]+$/;
            if (profileIdPattern.test(route)) {
                return false;
            }
            return true;
        }

        return restrictedRoutes.some((restricted) => route.startsWith(restricted));
    };

    useEffect(() => {
        if (isLoading || !pathname) {
            return;
        }

        if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
            return;
        }

        if (isAuthenticated) {
            setAuthModalOpen(false);
            return;
        }

        if (!isAuthenticated && isRestrictedRoute(pathname)) {
            setAuthModalOpen(true);
        }
    }, [pathname, isAuthenticated, isLoading]);

    const handleModalClose = (open: boolean) => {
        setAuthModalOpen(open);
        if (!open && !isAuthenticated && pathname && isRestrictedRoute(pathname)) {
            router.push('/home');
        }
    };

    if (!isLoading && !isAuthenticated && pathname && isRestrictedRoute(pathname)) {
        return (
            <>
                {children}
                <AuthRequiredModal
                    open={authModalOpen}
                    onOpenChange={handleModalClose}
                    featureName={getFeatureName(pathname)}
                />
            </>
        );
    }

    return <>{children}</>;
};
