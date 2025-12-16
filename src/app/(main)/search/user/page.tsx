'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import searchService from '@/services/search/searchService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { UserProfile } from '@/types/global';
import { Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import UserInfo from '@/components/user/UserInfo';

const FollowButton = () => {
    const [isFollowing, setIsFollowing] = useState(false);

    const handleFollow = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFollowing(!isFollowing);
    };

    return (
        <Button
            size="sm"
            variant={isFollowing ? 'outline' : 'default'}
            className="h-8 px-3 text-xs"
            onClick={handleFollow}
        >
            {isFollowing ? 'Following' : 'Follow'}
        </Button>
    );
};

function UserSearchContent() {
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [users, setUsers] = useState<UserProfile[]>([]);

    const searchParams = useSearchParams();
    const router = useRouter();

    const keyword = searchParams.get('keyword') ?? '';
    const pageSize = 10;

    useEffect(() => {
        handleSearch(1);
    }, [keyword]);

    const handleSearch = async (pageNum: number) => {
        setIsLoading(true);
        try {
            const requestParams = {
                page: pageNum,
                size: pageSize,
                keyword: keyword,
            };

            const response = await searchService.getUserSearchPaging(requestParams);
            setUsers(response.data.users || []);
            setPage(pageNum);
            setTotalPages(response.data.pagination.totalPages);
            setTotalItems(response.data.pagination.totalItems || 0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error(err);
            setUsers([]);
        } finally {
            router.push(`?keyword=${keyword}&origin=USER_SEARCH_PAGE_JOB`);
            setIsLoading(false);
        }
    };

    const goToPage = (pageNum: number) => {
        if (pageNum >= 1 && pageNum <= totalPages && pageNum !== page) {
            handleSearch(pageNum);
        }
    };

    const renderPaginationItems = () => {
        const items = [];
        const maxVisible = 5;

        let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink
                        onClick={() => goToPage(1)}
                        isActive={page === 1}
                        className="cursor-pointer"
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) {
                items.push(
                    <PaginationItem key="ellipsis1">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        onClick={() => goToPage(i)}
                        isActive={page === i}
                        className="cursor-pointer"
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                items.push(
                    <PaginationItem key="ellipsis2">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }
            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        onClick={() => goToPage(totalPages)}
                        isActive={page === totalPages}
                        className="cursor-pointer"
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="min-h-screen bg-muted/30">
            {isLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm z-50">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading companies...</p>
                    </div>
                </div>
            )}

            {users.length > 0 && (
                <div className="p-5 ">
                    <Card>
                        <CardContent className="px-0 pb-2">
                            {users.map((user) => (
                                <UserInfo
                                    key={user.userId}
                                    userId={user.userId}
                                    name={user.name}
                                    headline={user.headline}
                                    avatarUrl={user.avatarUrl}
                                    showHover
                                    onClick={() => router.push(`/profile/${user.userId}`)}
                                    actionButton={<FollowButton />}
                                />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="hidden md:flex flex-1 justify-center">
                            <Pagination>
                                <PaginationContent className="gap-1">
                                    <PaginationItem>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => goToPage(1)}
                                            disabled={page === 1}
                                            className="h-9 w-9"
                                        >
                                            <ChevronsLeft className="h-4 w-4" />
                                        </Button>
                                    </PaginationItem>

                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => goToPage(page - 1)}
                                            className={
                                                page === 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : 'cursor-pointer'
                                            }
                                        />
                                    </PaginationItem>

                                    {/* Page Numbers */}
                                    {renderPaginationItems()}

                                    {/* Next */}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => goToPage(page + 1)}
                                            className={
                                                page === totalPages
                                                    ? 'pointer-events-none opacity-50'
                                                    : 'cursor-pointer'
                                            }
                                        />
                                    </PaginationItem>

                                    {/* Last Page */}
                                    <PaginationItem>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => goToPage(totalPages)}
                                            disabled={page === totalPages}
                                            className="h-9 w-9"
                                        >
                                            <ChevronsRight className="h-4 w-4" />
                                        </Button>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>

                        {/* Mobile Pagination */}
                        <div className="flex md:hidden flex-1 justify-between items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(page - 1)}
                                disabled={page === 1}
                                className="gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>

                            <span className="text-sm font-medium">
                                {page} / {totalPages}
                            </span>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(page + 1)}
                                disabled={page === totalPages}
                                className="gap-1"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Page Info */}
                    <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                            <span>Page</span>
                            <span className="font-semibold text-foreground">{page}</span>
                            <span>of</span>
                            <span className="font-semibold text-foreground">{totalPages}</span>
                        </div>
                    </div>
                </div>
            )}
            {isLoading && users.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                    <div className="text-center space-y-3">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <svg
                                className="w-8 h-8 text-muted-foreground"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                        <p className="text-xl font-semibold text-foreground">No User found</p>
                        <p className="text-muted-foreground max-w-md">
                            {keyword
                                ? `We couldn't find any companies matching "${keyword}". Try a different search term.`
                                : "Try adjusting your search to find what you're looking for."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CompanyJobSearch() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-muted/30 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                </div>
            }
        >
            <UserSearchContent />
        </Suspense>
    );
}
