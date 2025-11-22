import { FeelingResponse } from "./likeModel";
import { AuthorData } from "./profileModel";

export interface Comment {
    parentId?: string;
    authorId: string;
    content: string;
    mediaFile?: string;
    createdAt: Date;
}
export interface CommentResponse {
    id: string;
    authorId: string;
    content: string;
    mediaFile?: string;
    replyCount: number;
    parentId: string | null;
    author: AuthorData;
    createdAt: string;
}
export interface CreateCommentDTO {
    postId: string;
    parentId?: string | null; //null -> root comment
    content: string;
    mediaFile?: string;
}

export interface Follower {
    userId: string;
    name: string;
    username: string;
    avatarUrl?: string;
    headline?: string;
    followedAt?: string;
}