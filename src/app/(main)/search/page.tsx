'use client';

import CompanyInfo from '@/components/company/CompanyInfo';
import JobCard from '@/components/jobs/JobCard';
import PostCard from '@/components/posts/PostCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import UserInfo from '@/components/user/UserInfo';
import { Job } from '@/models/jobModel';
import { PostResponse } from '@/models/profileModel';
import searchService from '@/services/search/searchService';
import { CompanyProfile, UserProfile } from '@/types/global';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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

export default function SearchPage() {
    const searchParams = useSearchParams();
    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [companies, setCompanies] = useState<CompanyProfile[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [pagination, setPagination] = useState<any>()
    const [loading, setLoading] = useState(true);

    const router = useRouter()
    const query = searchParams.get('keyword');

    const handleSearch = (label: string) => {
        router.push(`/search/${label}?keyword=${encodeURIComponent(query as string)}`);
    };
    const SectionFooter = ({ count, label, route }: { count: number; label: string, route: string }) => {
        return (
            <div className="flex justify-center w-full pt-5">
                {!count || count <= 5 ? (
                    <div className="text-muted-foreground">No more {label} to load</div>
                ) : (
                    <button className="text-primary hover:underline cursor-pointer" onClick={() => { handleSearch(route) }}>
                        See all {label} Results
                    </button>
                )}
            </div>
        );
    };
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data } = await searchService.getGlobalSearch({ keyword: query });
                console.log(data);
                setJobs(data.jobs || []);
                setPosts(data.posts || []);
                setUsers(data.users || []);
                setCompanies(data.companies || []);
                setPagination(data.totalResults);
            } catch (error) {
                toast('Error fetching search results:');
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [query]);


    return (
        <div className="space-y-6">
            {loading && <div className="fixed inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>}
            <div >
                <div className="mt-10 mb-5 uppercase tracking-widest font-bold text-gray-900 text-xl border-b-2 border-gray-300 pb-2">
                    USERS
                </div>
                {users.length > 0 && (
                    <div className='p-5 '>
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
                {!loading && <SectionFooter count={pagination?.users} label="Users" route="user" />}

            </div>
            <div>
                <div className="mt-10 mb-5 uppercase tracking-widest font-bold text-gray-900 text-xl border-b-2 border-gray-300 pb-2">
                    COMPANIES
                </div>
                {companies.length > 0 && (
                    <div className='p-5 '>
                        <Card >
                            <CardContent className="px-0 pb-2">
                                {companies.map((company) => (
                                    <CompanyInfo
                                        key={company.companyId}
                                        companyId={company.companyId}
                                        name={company.name}
                                        description={company.industry?.name}
                                        avatarUrl={company.logoUrl}
                                        showHover
                                        onClick={() => router.push(`/company/${company.companyId}`)}
                                        actionButton={<FollowButton />}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}
                {!loading && <SectionFooter count={pagination?.companies} label="Companies" route="company" />}

            </div>
            <div>
                <div className="mt-10 mb-5 uppercase tracking-widest font-bold text-gray-900 text-xl border-b-2 border-gray-300 pb-2">
                    POSTS
                </div>
                {posts.length > 0 && (
                    <div className="flex flex-col gap-6 p-5 space-y-4">
                        {posts.map((post) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                reload={() => { }}
                                type={post.author_type}
                                authorId={post.author?.id || ''}
                                openPopupEdit={() => { }}
                                isFeed={true}
                            />
                        ))}
                    </div>
                )}
                {!loading && <SectionFooter count={pagination?.posts} label="Posts" route="post" />}
            </div>
            <div>
                <div className="mt-10 mb-5 uppercase tracking-widest font-bold text-gray-900 text-xl border-b-2 border-gray-300 pb-2">
                    JOBS
                </div>
                {jobs.length > 0 && (
                    <div className="flex flex-col gap-6 ">
                        <div
                            className="space-y-4 p-5"
                        >
                            {jobs.map((job) => (
                                <JobCard key={job._id} job={job} />
                            ))}
                        </div>
                    </div>
                )}
                {!loading && <SectionFooter count={pagination?.jobs} label="Jobs" route="jobs" />}
            </div>
        </div>
    );
}
