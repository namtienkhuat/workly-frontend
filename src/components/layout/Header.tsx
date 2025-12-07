'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
    Search,
    Home,
    Briefcase,
    MessageCircle,
    Building2,
    User,
    Settings,
    LogIn,
    Edit,
    Shield,
    LogOut,
    UserPlus,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { UnreadBadge } from '@/features/chat/components/ui/UnreadBadge';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

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
    const { user, isAuthenticated } = useAuth();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [restrictedFeature, setRestrictedFeature] = useState<string>('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [input, setInput] = useState(searchParams.get('keyword') ?? '');

    useEffect(() => {
        setInput(searchParams.get('keyword') ?? '');
    }, [searchParams]);

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
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const query = encodeURIComponent(input);
                                    console.log("pathname", pathname);
                                    if (pathname.includes('search')) {
                                        router.replace(`${pathname}?keyword=${query}`);
                                    } else {
                                        router.push(`/search?keyword=${query}`);
                                    }
                                }}
                            >
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    type="text"
                                    placeholder="Company, User, Job, Post..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    className="pl-10 h-9 bg-muted/50 dark:bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/20 hover:bg-muted dark:hover:bg-muted/40 transition-colors"
                                />
                            </form>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex items-center gap-0.5 md:gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item);

                            // Special handling for "Me" item - show dropdown menu
                            if (item.name === 'me' && isAuthenticated) {
                                return (
                                    <MeDropdownMenu
                                        key={item.name}
                                        item={item}
                                        active={active}
                                        userId={user?.userId}
                                    />
                                );
                            }

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
                                        <UnreadBadge
                                            className="absolute top-1.5 right-2 bg-red-500 px-1.5"
                                            forPersonalUser={true}
                                        />
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

                        {/* Sign In/Sign Up Dropdown - Only show when not authenticated */}
                        {!isAuthenticated && <AuthDropdownMenu />}
                    </nav>

                    {/* Auth Required Modal */}
                    <AuthRequiredModal
                        open={authModalOpen}
                        onOpenChange={setAuthModalOpen}
                        featureName={restrictedFeature}
                    />
                </div>
            </div>
        </header >
    );
};

// Me Dropdown Menu Component
const MeDropdownMenu = ({
    item,
    active,
    userId,
}: {
    item: NavItem;
    active: boolean;
    userId?: string;
}) => {
    const router = useRouter();
    const { logout } = useAuth();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const profileHref = userId ? `/profile/${userId}` : '/profile';
    const editHref = '/profile/edit';
    const changePasswordHref = '/settings/change-password';

    const handleSignOut = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsSigningOut(true);
        try {
            await logout();
            toast.success('Signed out successfully');
            router.push('/home');
        } catch (error) {
            toast.error('Failed to sign out');
        } finally {
            setIsSigningOut(false);
        }
    };

    const Icon = item.icon;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        'relative flex flex-col items-center justify-center gap-0.5 md:gap-1 px-1.5 md:px-3 py-2 rounded-md transition-all hover:bg-accent min-w-[50px] md:min-w-[65px]',
                        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    <Icon
                        className={cn(
                            'h-5 w-5 md:h-6 md:w-6 transition-all',
                            active && 'stroke-primary stroke-[2.5]'
                        )}
                        strokeWidth={active ? 2.5 : 2}
                    />
                    <span className="text-[10px] md:text-xs font-medium leading-tight">
                        {item.label}
                    </span>
                    {active && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 shadow-lg border-2">
                {/* Section 1: Profile Actions */}
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Profile
                </DropdownMenuLabel>
                <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-md px-3 py-2.5 hover:bg-accent transition-colors focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                >
                    <Link href={profileHref} className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-sm">View Profile</div>
                            <div className="text-xs text-muted-foreground">
                                See your public profile
                            </div>
                        </div>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-md px-3 py-2.5 hover:bg-accent transition-colors focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                >
                    <Link href={editHref} className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-blue-500/10">
                            <Edit className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-sm">Edit Profile</div>
                            <div className="text-xs text-muted-foreground">
                                Update your information
                            </div>
                        </div>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2" />

                {/* Section 2: Security */}
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Security
                </DropdownMenuLabel>
                <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-md px-3 py-2.5 hover:bg-accent transition-colors focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                >
                    <Link href={changePasswordHref} className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-green-500/10">
                            <Shield className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-sm">Change Password</div>
                            <div className="text-xs text-muted-foreground">
                                Update your password
                            </div>
                        </div>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2" />

                {/* Section 3: Sign Out */}
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Account
                </DropdownMenuLabel>
                <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-md px-3 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                >
                    <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="flex items-center gap-3 w-full text-left"
                    >
                        <div className="p-1.5 rounded-md bg-red-500/10">
                            <LogOut className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-sm">
                                {isSigningOut ? 'Signing out...' : 'Sign Out'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Sign out from this device
                            </div>
                        </div>
                    </button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// Auth Dropdown Menu Component (for Sign In/Sign Up)
const AuthDropdownMenu = () => {
    const pathname = usePathname();
    const signInHref = '/signin';
    const signUpHref = '/signup';

    const isActive = pathname?.startsWith('/signin') || pathname?.startsWith('/signup');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        'relative flex flex-col items-center justify-center gap-0.5 md:gap-1 px-1.5 md:px-3 py-2 rounded-md transition-all hover:bg-accent min-w-[50px] md:min-w-[65px]',
                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    <User
                        className={cn(
                            'h-5 w-5 md:h-6 md:w-6 transition-all',
                            isActive && 'stroke-primary stroke-[2.5]'
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className="text-[10px] md:text-xs font-medium leading-tight">
                        Account
                    </span>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 shadow-lg border-2">
                {/* Section 1: Sign In */}
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Account Access
                </DropdownMenuLabel>
                <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-md px-3 py-2.5 hover:bg-primary/10 transition-colors focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                >
                    <Link href={signInHref} className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-primary/10">
                            <LogIn className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-sm">Sign In</div>
                            <div className="text-xs text-muted-foreground">
                                Access your existing account
                            </div>
                        </div>
                    </Link>
                </DropdownMenuItem>

                {/* Section 2: Sign Up */}
                <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-md px-3 py-2.5 hover:bg-blue-500/10 transition-colors focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                >
                    <Link href={signUpHref} className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-blue-500/10">
                            <UserPlus className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-sm">Sign Up</div>
                            <div className="text-xs text-muted-foreground">
                                Create a new account
                            </div>
                        </div>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
