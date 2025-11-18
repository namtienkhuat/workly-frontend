import { apiPaths } from "@/configs/route";
import { CommentResponse, CreateCommentDTO } from "@/models/commentModel";
import { getData, getList, postData } from "@/utils/api";
import { ResponseData, ResponseList } from "@/utils/models/ResponseType";
import { InsertOneResult } from "mongodb";

export default {
    async getAllComment(postId: string): Promise<ResponseList<CommentResponse>> {

        return getList({
            url: `${apiPaths.getAllComment}/${postId}`,
        });
    },

    async getCommentById(commentId: string): Promise<ResponseData<CommentResponse>> {
        return getData({
            url: `${apiPaths.getCommentById}/${commentId}`,
        });
    },

    async createComment(data: CreateCommentDTO): Promise<ResponseData<InsertOneResult>> {
        return postData({
            url: apiPaths.createComment,
            data: data,
        });
    }
}