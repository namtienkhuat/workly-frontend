'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Search,
    Home,
    Users,
    Briefcase,
    MessageCircle,
    Building2,
    User,
    Settings,
    LogIn,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { UnreadBadge } from '@/features/chat/components/ui/UnreadBadge';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    label: string;
    requiresAuth?: boolean;
    featureName?: string;
    hideWhenNotAuthenticated?: boolean; // Hide completely when not authenticated (instead of showing popup)
}

export const Header = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const { user, isAuthenticated } = useAuth();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [restrictedFeature, setRestrictedFeature] = useState<string>('');

    // Define which routes require authentication
    const restrictedRoutes = ['/chat', '/settings', '/manage-companies', '/profile'];
    const publicRoutes = ['/home', '/jobs', '/my-network'];

    const allNavItems: NavItem[] = useMemo(
        () => [
            {
                name: 'home',
                href: '/home',
                icon: Home,
                label: 'Home',
                requiresAuth: false,
            },
            // {
            //     name: 'network',
            //     href: '/my-network',
            //     icon: Users,
            //     label: 'Network',
            // },
            {
                name: 'jobs',
                href: '/jobs',
                icon: Briefcase,
                label: 'Jobs',
                requiresAuth: false,
            },
            {
                name: 'messaging',
                href: '/chat',
                icon: MessageCircle,
                label: 'Messages',
                requiresAuth: true,
                featureName: 'tin nhắn',
            },
            {
                name: 'companies',
                href: '/manage-companies',
                icon: Building2,
                label: 'Companies',
                requiresAuth: true,
                featureName: 'quản lý công ty',
            },
            {
                name: 'me',
                href: user?.userId ? `/profile/${user.userId}` : '/profile',
                icon: User,
                label: 'Me',
                requiresAuth: true,
                featureName: 'hồ sơ cá nhân',
                hideWhenNotAuthenticated: true, // Hide completely when not authenticated
            },
            {
                name: 'settings',
                href: '/settings',
                icon: Settings,
                label: 'Settings',
                requiresAuth: true,
                featureName: 'cài đặt',
                hideWhenNotAuthenticated: true, // Hide completely when not authenticated
            },
        ],
        [user?.userId]
    );

    // Filter nav items based on authentication
    // Hide tabs that have hideWhenNotAuthenticated=true when not authenticated
    // Show tabs that only require auth (show popup on click) when not authenticated
    const navItems: NavItem[] = useMemo(() => {
        if (isAuthenticated) {
            // When authenticated, show all items
            return allNavItems;
        }
        // When not authenticated, filter out items that should be hidden completely
        return allNavItems.filter((item) => !item.hideWhenNotAuthenticated);
    }, [isAuthenticated, allNavItems]);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
        // If not authenticated and trying to access restricted route
        if (!isAuthenticated && item.requiresAuth) {
            e.preventDefault();
            setRestrictedFeature(item.featureName || item.label.toLowerCase());
            setAuthModalOpen(true);
        }
    };

    const isActive = (item: NavItem) => {
        if (item.name === 'me') {
            // For profile, check if we're on:
            // 1. Any profile page with the current user's ID (/profile/{userId})
            // 2. Profile edit pages (/profile/edit/*)
            return (
                (pathname?.startsWith('/profile') && pathname?.includes(user?.userId || '')) ||
                pathname?.startsWith('/profile/edit')
            );
        }
        if (item.name === 'companies') {
            // For companies, check:
            // 1. /manage-companies - company list page
            // 2. /manage-company/{id} - company management pages
            // 3. /company/new - create new company page
            return (
                pathname?.startsWith('/manage-companies') ||
                pathname?.startsWith('/manage-company/') ||
                pathname?.startsWith('/company/new')
            );
        }
        return pathname?.startsWith(item.href);
    };

    return (
        <header className="sticky top-0 z-50 border-b bg-white dark:bg-background shadow-sm">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between gap-2 md:gap-4 px-3 md:px-4 py-2">
                    {/* Logo */}
                    <Link
                        href="/home"
                        className="flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                W
                            </div>
                        </div>
                    </Link>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-xs md:max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-9 bg-muted/50 dark:bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/20 hover:bg-muted dark:hover:bg-muted/40 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex items-center gap-0.5 md:gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item);

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={(e) => handleNavClick(e, item)}
                                    className={cn(
                                        'relative flex flex-col items-center justify-center gap-0.5 md:gap-1 px-1.5 md:px-3 py-2 rounded-md transition-all hover:bg-accent min-w-[50px] md:min-w-[65px]',
                                        active
                                            ? 'text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'h-5 w-5 md:h-6 md:w-6 transition-all',
                                            active && 'stroke-primary stroke-[2.5]'
                                        )}
                                        strokeWidth={active ? 2.5 : 2}
                                    />
                                    {item.name === 'messaging' && isAuthenticated && (
                                        <UnreadBadge className="absolute top-1.5 right-2 bg-red-500 px-1.5" />
                                    )}
                                    <span className="text-[10px] md:text-xs font-medium leading-tight">
                                        {item.label}
                                    </span>
                                    {active && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />
                                    )}
                                </Link>
                            );
                        })}

                        {/* Sign In/Sign Up Button - Only show when not authenticated */}
                        {!isAuthenticated && (
                            <Link
                                href="/signin"
                                className={cn(
                                    'relative flex flex-col items-center justify-center gap-0.5 md:gap-1 px-1.5 md:px-3 py-2 rounded-md transition-all hover:bg-accent min-w-[50px] md:min-w-[65px]',
                                    pathname?.startsWith('/signin') ||
                                        pathname?.startsWith('/signup')
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <LogIn
                                    className={cn(
                                        'h-5 w-5 md:h-6 md:w-6 transition-all',
                                        (pathname?.startsWith('/signin') ||
                                            pathname?.startsWith('/signup')) &&
                                            'stroke-primary stroke-[2.5]'
                                    )}
                                    strokeWidth={
                                        pathname?.startsWith('/signin') ||
                                        pathname?.startsWith('/signup')
                                            ? 2.5
                                            : 2
                                    }
                                />
                                <span className="text-[10px] md:text-xs font-medium leading-tight">
                                    Sign In
                                </span>
                                {(pathname?.startsWith('/signin') ||
                                    pathname?.startsWith('/signup')) && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />
                                )}
                            </Link>
                        )}
                    </nav>

                    {/* Auth Required Modal */}
                    <AuthRequiredModal
                        open={authModalOpen}
                        onOpenChange={setAuthModalOpen}
                        featureName={restrictedFeature}
                    />
                </div>
            </div>
        </header>
    );
};
