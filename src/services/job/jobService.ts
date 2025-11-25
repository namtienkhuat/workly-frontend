import { apiPaths } from "@/configs/route";
import { Job } from "@/models/jobModel";
import { getPaging } from "@/utils/api";
import { PagingResponse } from "@/utils/models/ResponseType";


export default {
    async getCompanyJobPaging(params: any): Promise<PagingResponse<Job>> {
        return getPaging({ url: apiPaths.getJobByCompanyId, params: params });
    },
}