'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Briefcase, User, Settings, MapPin, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData, getDataWithStatus } from '@/hooks/useQueryData';
import { useEffect } from 'react';
import { UserProfile } from '@/types/global';
import { paths } from '@/configs/route';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils/helpers';

const LeftSideBarHome = () => {
    const router = useRouter();

    const { isAuthenticated } = useAuth();
    const { data: meData, isLoading } = useData(
        ['/me?include=location,follow', {}],
        getDataWithStatus,
        isAuthenticated // Only fetch when authenticated
    );

    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (meData?.data) {
            setUser({
                ...meData.data.user,
                location: meData.data.relationships?.location,
                followersCount: meData.data.relationships?.followersCount || 0,
                followingCount: meData.data.relationships?.followingCount || 0,
            });
        } else if (!isAuthenticated) {
            // Clear user state when not authenticated
            setUser(null);
        }
    }, [meData, isAuthenticated]);

    if (isLoading) {
        return <div></div>;
    }

    // NOT LOGGED IN
    if (!isAuthenticated || !user) {
        return (
            <div className="space-y-6">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg">Welcome to Workly</h3>
                                <p className="text-sm text-muted-foreground">
                                    Join our community to connect with professionals and discover
                                    opportunities
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-primary" />
                                <span>Discover job opportunities</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                <span>Build your professional network</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>Connect with companies</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 pt-2 border-t">
                            <Button asChild className="w-full">
                                <Link href={paths.signin}>
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Sign In
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link href={paths.signup}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Create Account
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* User Profile Card */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{user.name}</h3>
                            {user.headline && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {user.headline}
                                </p>
                            )}
                            {user.location && (
                                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>{user.location.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div className="text-center cursor-pointer hover:opacity-70 transition-opacity">
                            <div className="text-lg font-semibold">
                                {user.followersCount?.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">Followers</div>
                        </div>
                        <div className="text-center cursor-pointer hover:opacity-70 transition-opacity">
                            <div className="text-lg font-semibold">
                                {user.followingCount?.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">Following</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="pb-2">
                <CardHeader className="py-2 pt-4">
                    <h3 className="text-base font-semibold">Quick Links</h3>
                </CardHeader>
                <CardContent className="px-0 pb-2">
                    {[
                        {
                            label: 'My Profile',
                            icon: User,
                            href: `/profile/${user.userId}`,
                        },
                        {
                            label: 'My Applied Jobs',
                            icon: Briefcase,
                            href: '/my-applications',
                        },
                        {
                            label: 'Settings',
                            icon: Settings,
                            href: '/settings',
                        },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className={cn(
                                'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
                                'hover:bg-accent'
                            )}
                            onClick={() => {
                                router.push(item.href);
                            }}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export default LeftSideBarHome;
