import { apiPaths } from "@/configs/route";
import { CreatePostDTO, PostResponse } from "@/models/profileModel";
import { getData, getPaging, postData } from "@/utils/api";
import { PagingResponse, ResponseData } from "@/utils/models/ResponseType";
import { InsertOneResult } from 'mongodb';

export default {
	async getApiStream(params: any): Promise<any> {
		return getData({ url: apiPaths.getVideo, params: params })
	},
	async deletePost(postId: string, type: string, authorId: string): Promise<any> {
		return postData({
			url: apiPaths.deletePost,
			data: { postId, author_type: type, author_id: authorId }
		});
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
	},

	async checkAccessCompany(companyId: string): Promise<any> {
		return getData({ url: `${apiPaths.checkAccessCompany}${companyId}/check-access` })
	}
}