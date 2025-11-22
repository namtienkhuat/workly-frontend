import { apiPaths } from "@/configs/route";
import { FeelingResponse } from "@/models/likeModel";
import { getList, postData } from "@/utils/api";
import { ResponseData, ResponseList } from "@/utils/models/ResponseType";
import { InsertOneResult } from "mongodb";

export default {
    async likePost(postId: string): Promise<ResponseData<InsertOneResult>> {
        return postData({
            url: apiPaths.likePost,
            data: { postId }
        });
    },

    async unlikePost(postId: string): Promise<ResponseData<Boolean>> {
        return postData({
            url: apiPaths.unLikePost,
            data: { postId }
        });
    },

    async listLikePost(postId: string): Promise<ResponseList<FeelingResponse>> {
        return getList({
            url: apiPaths.listLikePost,
            params: { postId }
        })
    }
}