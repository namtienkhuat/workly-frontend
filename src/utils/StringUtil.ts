import { BACKEND_URL } from "./models/Constants"

export default {
    generatePath(path: string): string {
        return BACKEND_URL + "posts" + path
    }
}