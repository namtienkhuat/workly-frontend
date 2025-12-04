'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AuthRequiredModal } from './AuthRequiredModal';

interface RouteProtectionProps {
    children: React.ReactNode;
    restrictedRoutes?: string[];
    publicRoutes?: string[];
}

// Default restricted routes that require authentication
const DEFAULT_RESTRICTED_ROUTES = ['/chat', '/settings', '/manage-companies', '/profile'];
const DEFAULT_PUBLIC_ROUTES = ['/home', '/jobs', '/my-network'];

export const RouteProtection: React.FC<RouteProtectionProps> = ({
    children,
    restrictedRoutes = DEFAULT_RESTRICTED_ROUTES,
    publicRoutes = DEFAULT_PUBLIC_ROUTES,
}) => {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    // Get feature name based on route
    const getFeatureName = (route: string): string => {
        if (route.startsWith('/chat')) return 'tin nhắn';
        if (route.startsWith('/settings')) return 'cài đặt';
        if (route.startsWith('/manage-companies') || route.startsWith('/manage-company')) return 'quản lý công ty';
        if (route.startsWith('/profile')) return 'hồ sơ cá nhân';
        return 'tính năng này';
    };

    // Check if current route is restricted
    const isRestrictedRoute = (route: string): boolean => {
        return restrictedRoutes.some((restricted) => route.startsWith(restricted));
    };

    // Check if current route is public
    const isPublicRoute = (route: string): boolean => {
        return publicRoutes.some((publicRoute) => route.startsWith(publicRoute));
    };

    useEffect(() => {
        // Don't check during loading or if already checked
        if (isLoading || !pathname) {
            return;
        }

        // Allow auth pages
        if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
            setHasChecked(true);
            return;
        }

        // If authenticated, allow all routes
        if (isAuthenticated) {
            setHasChecked(true);
            setAuthModalOpen(false);
            return;
        }

        // If not authenticated and trying to access restricted route
        if (!isAuthenticated && isRestrictedRoute(pathname)) {
            setAuthModalOpen(true);
            setHasChecked(true);
        } else {
            setHasChecked(true);
        }
    }, [pathname, isAuthenticated, isLoading]);

    // Handle modal close - redirect to home if on restricted route
    const handleModalClose = (open: boolean) => {
        setAuthModalOpen(open);
        if (!open && !isAuthenticated && pathname && isRestrictedRoute(pathname)) {
            // Redirect to home when modal is closed
            router.push('/home');
        }
    };

    // If route is restricted and user is not authenticated, show modal
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

