import { apiPaths } from "@/configs/route";
import { postData, getList, getData } from "@/utils/api";
import { ResponseData } from "@/utils/models/ResponseType";

export enum BookmarkType {
	POST = 'POST',
	JOB = 'JOB',
}

export interface BookmarkResponse {
	_id: string;
	userId: string;
	itemId: string;
	type: BookmarkType;
	createdAt: string;
}

export interface BookmarkStatusResponse {
	isBookmarked: boolean;
}

const bookmarkService = {
	async bookmarkItem(itemId: string, type: BookmarkType): Promise<ResponseData<BookmarkResponse>> {
		return postData({
			url: apiPaths.bookmarkItem,
			data: { itemId, type },
		});
	},

	async unbookmarkItem(itemId: string, type: BookmarkType): Promise<ResponseData<boolean>> {
		return postData({
			url: apiPaths.unbookmarkItem,
			data: { itemId, type },
		});
	},

	async getUserBookmarks(type?: BookmarkType): Promise<ResponseData<BookmarkResponse[]>> {
		const params = type ? { type } : {};
		return getList({
			url: apiPaths.getUserBookmarks,
			params,
		});
	},

	async getBookmarkStatus(itemId: string, type: BookmarkType): Promise<ResponseData<BookmarkStatusResponse>> {
		return getData({
			url: apiPaths.getBookmarkStatus,
			params: { itemId, type },
		});
	},
};

export default bookmarkService;

