import { apiPaths } from "@/configs/route";
import { Candidate, Job } from "@/models/jobModel";
import { delData, getData, getPaging, postData } from "@/utils/api";
import { PagingResponse, ResponseData, ResponseList } from "@/utils/models/ResponseType";
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
    },
    async getJobByStatus(active: number, page: number, size: number, companyId: string): Promise<PagingResponse<Job>> {
        return getPaging({
            url: apiPaths.getJobByStatus,
            params: { active, page, size, companyId }
        })
    },
    async applyJob(applyJob: any): Promise<ResponseData<InsertOneResult>> {
        return postData({
            url: apiPaths.applyJob,
            data: applyJob
        })
    },
    async getCandidateByStatus({ status, jobId, page, size }: { status: string, jobId: string, page: number, size: number }): Promise<PagingResponse<Candidate>> {
        return getPaging({
            url: apiPaths.getCandidateByStatus,
            params: { status, jobId, page, size }
        })
    },
    async feedBackCandidate({ status, jobId, userId }: { status: string, jobId: string, userId: string }): Promise<ResponseData<Boolean>> {
        return postData({
            url: apiPaths.feedBackCandidate,
            data: { status, jobId, userId }
        })
    }
}