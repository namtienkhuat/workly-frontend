import { apiPaths } from "@/configs/route";
import { Job } from "@/models/jobModel";
import { PostResponse } from "@/models/profileModel";
import { CompanyProfile } from "@/types/global";
import { getPaging } from "@/utils/api";
import { PagingResponse } from "@/utils/models/ResponseType";

export default {
    async getGlobalSearch(params: any): Promise<any> {
        return getPaging({ url: apiPaths.getGlobalSearch, params: params });
    },

    async getJobSearchPaging(params: any): Promise<PagingResponse<Job>> {
        return getPaging({ url: apiPaths.getJobSearchPaging, params: params });
    },
    async getCompanySearchPaging(params: any): Promise<PagingResponse<CompanyProfile>> {
        return getPaging({ url: apiPaths.getCompanySearchPaging, params: params });
    },
    async getUserSearchPaging(params: any): Promise<PagingResponse<CompanyProfile>> {
        return getPaging({ url: apiPaths.getUserSearchPaging, params: params });
    },
    async getPostSearchPaging(params: any): Promise<PagingResponse<PostResponse>> {
        return getPaging({ url: apiPaths.getPostSearchPaging, params: params });
    },
}