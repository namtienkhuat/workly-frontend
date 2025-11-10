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
    content: string;
    media_url: MediaItem[];
    visibility: PostVisibilityType;
}

export interface PostResponse {
    _id: string;
    content: string;
    media_url: MediaItem[];
    visibility: PostVisibilityType;
}