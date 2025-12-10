'use client';

import { Home, MessageCircle, Users, Briefcase, Settings, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { UnreadBadge } from '@/features/chat/components/ui';

const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: MessageCircle, label: 'Messages', path: '/chat', showBadge: true },
    { icon: Users, label: 'Network', path: '/network' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: User, label: 'Profile', path: '/profile/[id]' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Navigation() {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (path: string) => {
        return pathname?.startsWith(path);
    };

    return (
        <nav className="flex h-full w-80 flex-col border-r bg-white">
            <div className="border-b p-6">
                <h1 className="text-2xl font-bold text-blue-600">Workly</h1>
            </div>

            <div className="flex-1 p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <li key={item.path}>
                                <button
                                    onClick={() => router.push(item.path)}
                                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                                        active
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="relative inline-flex">
                                        <Icon className="h-5 w-5" />
                                        {item.showBadge && (
                                            <div className="absolute -right-3 -top-2  bg-red-500 px-1.5 rounded-lg ">
                                                <UnreadBadge />
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="border-t p-4">
                <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-sm text-gray-600">
                        Learn more about <strong>Job Opportunities</strong>
                    </p>
                    <button className="mt-2 text-sm font-semibold text-blue-600 hover:underline">
                        Learn more
                    </button>
                </div>
            </div>
        </nav>
    );
}
