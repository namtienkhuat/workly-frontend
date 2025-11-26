'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Search, Plus, Users, Calendar, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyCompanies } from '@/hooks/useQueryData';
import { CompanyProfile } from '@/types/global';

const CompanyCardSkeleton = () => (
    <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
            <div className="flex items-start gap-4">
                <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function ManageCompaniesPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const { data: companiesData, isLoading } = useGetMyCompanies();

    const companies: CompanyProfile[] = companiesData?.data?.companies || [];

    const filteredCompanies = useMemo(() => {
        if (!searchQuery.trim()) return companies;

        const query = searchQuery.toLowerCase();
        return companies.filter(
            (company) =>
                company.name?.toLowerCase().includes(query) ||
                company.industry?.name?.toLowerCase().includes(query)
        );
    }, [companies, searchQuery]);

    console.log('✅ Filtered companies:', filteredCompanies.length);

    const handleCreateCompany = () => {
        router.push('/company/new');
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Companies</h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý và điều hành các công ty của bạn
                    </p>
                </div>
                <Button onClick={handleCreateCompany} size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Tạo công ty mới
                </Button>
            </div>

            {/* Search Bar */}
            {companies.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm công ty theo tên hoặc ngành nghề..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Companies List */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <CompanyCardSkeleton key={i} />
                    ))}
                </div>
            ) : companies.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="rounded-full bg-muted p-6 mb-4">
                            <Building2 className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Chưa có công ty nào</h3>
                        <p className="text-muted-foreground text-center mb-6 max-w-md">
                            Bạn chưa quản lý công ty nào. Tạo công ty đầu tiên của bạn để bắt đầu!
                        </p>
                        <Button onClick={handleCreateCompany} size="lg" className="gap-2">
                            <Plus className="h-5 w-5" />
                            Tạo công ty đầu tiên
                        </Button>
                    </CardContent>
                </Card>
            ) : filteredCompanies.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Không tìm thấy công ty nào</h3>
                        <p className="text-muted-foreground">Thử tìm kiếm với từ khóa khác</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Tìm thấy {filteredCompanies.length} công ty
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {filteredCompanies.map((company) => (
                            <Card
                                key={company.companyId}
                                className="hover:shadow-md transition-all hover:border-primary/50 cursor-pointer group"
                                onClick={() => router.push(`/manage-company/${company.companyId}`)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Company Logo */}
                                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {company.logoUrl ? (
                                                <img
                                                    src={company.logoUrl}
                                                    alt={company.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Building2 className="h-8 w-8 text-primary" />
                                            )}
                                        </div>

                                        {/* Company Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors truncate">
                                                        {company.name}
                                                    </h3>
                                                    {company.role && (
                                                        <Badge
                                                            variant={
                                                                company.role === 'OWNER'
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            className="text-xs flex-shrink-0"
                                                        >
                                                            {company.role === 'OWNER'
                                                                ? '👑 Owner'
                                                                : '⚙️ Admin'}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                            </div>

                                            <div className="space-y-2">
                                                <Badge variant="secondary" className="font-normal">
                                                    {company.industry?.name || 'N/A'}
                                                </Badge>

                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        <span>{company.size || 'N/A'}</span>
                                                    </div>
                                                    {company.foundedYear && (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>
                                                                Thành lập {company.foundedYear}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {company.followersCount !== undefined && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {company.followersCount} người theo dõi
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
