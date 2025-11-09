import { apiPaths } from "@/configs/routes";
import { PostResponse } from "@/models/profileModel";
import { getPaging } from "@/utils/api";
import { PagingResponse } from "@/utils/models/ResponseType";

export default {
    async getProfilePostPaging(params: any): Promise<PagingResponse<PostResponse>> {
		return getPaging({ url: apiPaths.getProfilePost, params: params });
	},
}