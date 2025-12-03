import { FeelingResponse } from "./likeModel";

export enum AuthorType {
    USER = 'USER',
    COMPANY = 'COMPANY'
}

export enum PostVisibilityType {
    PRIVATE = 'PRIVATE',
    PUBLIC = 'PUBLIC',
    FOLLOWER = 'FOLLOWER',
}

export enum MediaType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO'
}

export interface MediaItem {
    url: string;
    type: MediaType;
}

export interface CreatePostDTO {
    author_id: string;
    author_type: string;
    content: string;
    media_url: MediaItem[];
    visibility: PostVisibilityType;
}
export interface UpdatePostDTO {
    postId: string;
    author_id: string;
    author_type: string;
    content: string;
    media_url_add: MediaItem[];
    media_url_delete: MediaItem[];
    visibility: PostVisibilityType;
}

export interface PostResponse {
    _id: string;
    content: string;
    media_url: MediaItem[];
    visibility: PostVisibilityType;
    author: AuthorData;
    author_type: AuthorType;
    author_id?: string;
    created_at: string;
    totalComments: number;
    totalLikes: FeelingResponse[];
}

export interface AuthorData {
    id: string;
    name: string;
    imageUrl?: string
    headline?: string;
}

export interface Follower {
    userId: string;
    name: string;
    username: string;
    avatarUrl?: string;
    headline?: string;
    followedAt?: string;
}