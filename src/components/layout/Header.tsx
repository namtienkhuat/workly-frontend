'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Search,
    Home,
    Users,
    Briefcase,
    MessageCircle,
    Building2,
    User,
    Settings,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { UnreadBadge } from '@/features/chat/components/ui/UnreadBadge';

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    label: string;
}

export const Header = () => {
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();

    const navItems: NavItem[] = useMemo(
        () => [
            {
                name: 'home',
                href: '/home',
                icon: Home,
                label: 'Home',
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
            },
            {
                name: 'messaging',
                href: '/chat',
                icon: MessageCircle,
                label: 'Messages',
            },
            {
                name: 'companies',
                href: '/manage-companies',
                icon: Building2,
                label: 'Companies',
            },
            {
                name: 'me',
                href: user?.userId ? `/profile/${user.userId}` : '/profile',
                icon: User,
                label: 'Me',
            },
            {
                name: 'settings',
                href: '/settings',
                icon: Settings,
                label: 'Settings',
            },
        ],
        [user?.userId]
    );

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
                                    {item.name === 'messaging' && (
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
                    </nav>
                </div>
            </div>
        </header>
    );
};
