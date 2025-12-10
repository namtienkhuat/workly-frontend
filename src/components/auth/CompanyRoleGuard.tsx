'use client';

import React, { use, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetCompanyAccess, useGetCompanyProfile } from '@/hooks/useQueryData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft, ShieldCheck, Crown, AlertCircle, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface CompanyRoleGuardProps {
    children: React.ReactNode;
    allowedRoles?: string[]; // Default: ['ADMIN', 'OWNER']
}

export const CompanyRoleGuard: React.FC<CompanyRoleGuardProps> = ({
    children,
    allowedRoles = ['ADMIN', 'OWNER'],
}) => {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const companyId = params?.id;

    const [hasAccess, setHasAccess] = React.useState(false);
    const { data: companyAccess, isLoading, error } = useGetCompanyAccess(companyId);

    useEffect(() => {
        if (companyAccess && companyAccess.data) {
            const access = companyAccess?.data?.isAccess;
            setHasAccess(access);
        }
    }, [companyAccess]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
                <Skeleton className="h-32 w-full rounded-lg" />
            </div>
        );
    }

    // Show error state if company not found or error
    if (error) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-6">
                <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-background via-background to-destructive/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/10 pointer-events-none" />
                    <CardContent className="relative flex flex-col items-center justify-center py-20 px-6">
                        {/* Animated Icon */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-destructive/20 rounded-full blur-2xl animate-pulse" />
                            <div className="relative bg-gradient-to-br from-destructive/10 to-destructive/5 p-5 rounded-2xl border border-destructive/20">
                                <AlertCircle className="h-12 w-12 text-destructive" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Company not found
                        </h3>
                        <p className="text-muted-foreground text-center mb-8 max-w-md leading-relaxed">
                            The company you are looking for does not exist or has been deleted. Please check
                            the URL or return to the company list.
                        </p>
                        <Button
                            onClick={() => router.push('/manage-companies')}
                            variant="outline"
                            className="gap-2 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to company list
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show access denied if user doesn't have required role
    if (!hasAccess) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-6">
                <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/10">
                    {/* Decorative gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5 pointer-events-none" />

                    <CardHeader className="relative pb-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {/* Animated Icon */}
                            <div className="relative flex-shrink-0">
                                <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
                                <div className="relative bg-gradient-to-br from-destructive/10 to-destructive/5 p-4 rounded-2xl border border-destructive/20 shadow-lg">
                                    <ShieldX className="h-8 w-8 text-destructive" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                                    Access Denied
                                </CardTitle>
                                <CardDescription className="text-base leading-relaxed">
                                    You do not have permission to manage this company. Only Owner and Admin can
                                    access and perform management operations.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="relative space-y-6">
                        {/* Required Roles Section */}
                        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-xl p-6 border border-primary/20 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <p className="font-semibold text-foreground">
                                    Required access:
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {allowedRoles.map((role) => (
                                    <Badge
                                        key={role}
                                        variant={role === 'OWNER' ? 'default' : 'secondary'}
                                        className="px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                    >
                                        {role === 'OWNER' ? (
                                            <>
                                                <Crown className="h-4 w-4 mr-1.5" />
                                                Owner
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="h-4 w-4 mr-1.5" />
                                                Admin
                                            </>
                                        )}
                                    </Badge>
                                ))}
                            </div>
                            {/* {userRole && (
                                <div className="mt-4 pt-4 border-t border-primary/20">
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <span>Vai trò hiện tại của bạn:</span>
                                        <Badge variant="outline" className="font-semibold">
                                            {userRole}
                                        </Badge>
                                    </p>
                                </div>
                            )} */}
                        </div>

                        {/* Information Section */}
                        <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-foreground">
                                        How to get access?
                                    </p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        If you need permission to manage this company, please contact the{' '}
                                        <span className="font-semibold text-foreground">Owner</span>{' '}
                                        of the company to be granted{' '}
                                        <span className="font-semibold text-foreground">Admin</span>
                                        {' '}permissions. The Owner can add you to the admin list through
                                        the Admins management page.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                                onClick={() => router.push('/manage-companies')}
                                variant="outline"
                                className="flex-1 h-12 border-2 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to company list
                            </Button>
                            <Button
                                onClick={() => router.push('/home')}
                                className="flex-1 h-12 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-semibold"
                            >
                                Go to home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // User has access, render children
    return <>{children}</>;
};
