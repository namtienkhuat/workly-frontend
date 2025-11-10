import { apiPaths } from "@/configs/routes";
import { CreatePostDTO, PostResponse } from "@/models/profileModel";
import { getData, getPaging, postData } from "@/utils/api";
import { PagingResponse, ResponseData } from "@/utils/models/ResponseType";
import { InsertOneResult } from 'mongodb';

export default {
	async getApiStream(params: any): Promise<any> {
		return getData({ url: apiPaths.getVideo, params: params })
	},

	async addPost(add: CreatePostDTO): Promise<ResponseData<InsertOneResult>> {
		return postData({
			url: apiPaths.createPost,
			data: add,
		});
	},

	async getProfilePostPaging(params: any): Promise<PagingResponse<PostResponse>> {
		return getPaging({ url: apiPaths.getProfilePost, params: params });
	},

	async getTest(params: any): Promise<any> {
		return getData({ url: apiPaths.getTest, params: params })
	}
}