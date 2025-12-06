import { apiPaths } from "@/configs/route";
import { getPaging } from "@/utils/api";

export default {
    async getGlobalSearch(params: any): Promise<any> {
        return getPaging({ url: apiPaths.getGlobalSearch, params: params });
    },
}