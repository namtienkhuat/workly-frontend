export interface FeelingResponse {
    postId: string;
    commentId: string;
    authorId: string;
    type: FeelingType;
}

export enum FeelingType {
    POST = 'POST',
    COMMENT = 'COMMENT',
}
