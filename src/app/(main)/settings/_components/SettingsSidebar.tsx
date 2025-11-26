'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, Palette, Globe, Shield, Bell, UserX, Download, Mail, Settings } from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    label: string;
    description?: string;
}

const navItems: NavItem[] = [
    {
        name: 'account',
        href: '/settings/account',
        icon: User,
        label: 'Account',
        description: 'Password and account management',
    },
    {
        name: 'appearance',
        href: '/settings/appearance',
        icon: Palette,
        label: 'Appearance',
        description: 'Theme and display preferences',
    },
    // {
    //     name: 'language',
    //     href: '/settings/language',
    //     icon: Globe,
    //     label: 'Language & Region',
    //     description: 'Language, timezone, and format',
    // },
    // {
    //     name: 'privacy',
    //     href: '/settings/privacy',
    //     icon: Shield,
    //     label: 'Privacy & Security',
    //     description: 'Profile visibility and security',
    // },
    // {
    //     name: 'notifications',
    //     href: '/settings/notifications',
    //     icon: Bell,
    //     label: 'Notifications',
    //     description: 'Email and push notifications',
    // },
    // {
    //     name: 'blocked-users',
    //     href: '/settings/blocked-users',
    //     icon: UserX,
    //     label: 'Blocked Users',
    //     description: 'Manage blocked accounts',
    // },
    // {
    //     name: 'data-privacy',
    //     href: '/settings/data-privacy',
    //     icon: Download,
    //     label: 'Data & Privacy',
    //     description: 'Download and manage your data',
    // },
    // {
    //     name: 'email-preferences',
    //     href: '/settings/email-preferences',
    //     icon: Mail,
    //     label: 'Email Preferences',
    //     description: 'Newsletter and promotional emails',
    // },
];

export const SettingsSidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-20">
                <div className="flex items-center gap-2 mb-6 px-2">
                    <Settings className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold">Settings</h1>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-accent group',
                                    isActive
                                        ? 'bg-accent text-primary font-medium'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'h-5 w-5 mt-0.5 flex-shrink-0',
                                        isActive ? 'text-primary' : 'text-muted-foreground'
                                    )}
                                />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium">{item.label}</span>
                                    {item.description && (
                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                            {item.description}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
};
