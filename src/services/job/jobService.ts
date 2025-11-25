import { apiPaths } from "@/configs/route";
import { Job } from "@/models/jobModel";
import { delData, getData, getPaging, postData } from "@/utils/api";
import { PagingResponse, ResponseData } from "@/utils/models/ResponseType";
import { InsertOneResult } from "mongodb";


export default {
    async getCompanyJobPaging(params: any): Promise<PagingResponse<Job>> {
        return getPaging({ url: apiPaths.getJobByCompanyId, params: params });
    },
    async addJob(addJob: any): Promise<ResponseData<InsertOneResult>> {
        return postData({
            url: apiPaths.createJob,
            data: addJob,
        });
    },
    async deleteJob(jobId: string, companyId: string): Promise<any> {
        return delData({
            url: apiPaths.deleteJob,
            data: { jobId, companyId }
        });
    },
    async getJobCompanyDetail(jobId: string, companyId: string): Promise<ResponseData<Job>> {
        return getData({
            url: apiPaths.getCompanyJobDetail,
            params: { jobId, companyId }
        })
    },
    async updateJob(updateJob: any): Promise<any> {
        return postData({
            url: apiPaths.updateCompanyJob,
            data: updateJob
        })
    }
}