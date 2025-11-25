'use client';

import PostCard from '@/components/posts/PostCard';
import { PostResponse, MediaType, PostVisibilityType } from '@/models/profileModel';
import { FeelingType } from '@/models/likeModel';

const createLikes = (postId: string, amount: number) =>
    Array.from({ length: amount }).map((_, index) => ({
        postId,
        commentId: '',
        authorId: `demo-${index + 1}`,
        type: FeelingType.POST,
    }));

const mockFeed: PostResponse[] = [
    {
        _id: 'demo-ava',
        content:
            'Moved the quick actions straight into the timeline so people always know what to do next. Looking for eyes on the empty state—does it still feel clear?',
        media_url: [
            {
                url: 'https://images.unsplash.com/photo-1522199794611-8e3563c112d7?w=1200',
                type: MediaType.IMAGE,
            },
            {
                url: 'https://images.unsplash.com/photo-1501556424050-d4816356b73e?w=1200',
                type: MediaType.IMAGE,
            },
            {
                url: 'https://images.unsplash.com/photo-1501556424050-d4816356b73e?w=1200',
                type: MediaType.VIDEO,
            },
        ],
        visibility: PostVisibilityType.PUBLIC,
        author: {
            userId: 'user-ava',
            name: 'Ava Stone',
            avatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200',
            headline: 'Software Engineer',
        },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        totalComments: 32,
        totalLikes: createLikes('demo-ava', 248),
    },
    {
        _id: 'demo-liam',
        content:
            'Hiring 3 senior frontend engineers this quarter. Stack: Next.js App Router, tRPC, Zustand, Playwright + Turborepo. Remote across APAC—drop portfolios in the thread.',
        media_url: [
            {
                url: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200',
                type: MediaType.IMAGE,
            },
        ],
        visibility: PostVisibilityType.PUBLIC,
        author: {
            userId: 'user-liam',
            name: 'Liam Xander',
            headline: 'Software Engineer',
        },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        totalComments: 88,
        totalLikes: createLikes('demo-liam', 512),
    },
    {
        _id: 'demo-maya',
        content:
            'Metrics after rolling out async standups: velocity up 17% and meetings per engineer below 6hrs/week. Dropping our template plus the Loom walkthrough.',
        media_url: [],
        visibility: PostVisibilityType.FOLLOWER,
        author: {
            userId: 'user-maya',
            name: 'Maya Benton',
            avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
            headline: 'Software Engineer',
        },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        totalComments: 21,
        totalLikes: createLikes('demo-maya', 189),
    },
];

export default function HomePage() {
    return (
        <section className="space-y-6">
            {mockFeed.map((post) => (
                <PostCard
                    key={post._id}
                    post={post}
                    reload={() => {}}
                    type="USER"
                    authorId={post.author.userId}
                />
            ))}
        </section>
    );
}
