import { postFormList } from "@/utils/api";
import { AxiosProgressEvent } from "axios";

interface UploadOptions {
    onProgress?: (percentage: number) => void;
    onUploadingChange?: (isUploading: boolean) => void;
}


export default {
    async uploadFilesToServer<T = any>(
        files: FileList,
        url: string,
        options: UploadOptions = {}
    ): Promise<T[]> {
        console.log("abc", files);

        if (!files.length) return [];

        const formData = new FormData();
        for (const file of Array.from(files)) {
            // Kiểm tra kiểu MIME
            if (file.type.startsWith("image/")) {
                formData.append("image", file);
            } else if (file.type.startsWith("video/")) {
                formData.append("video", file);
            } else {
                console.warn("File không hỗ trợ:", file.name);
            }
        }

        options.onUploadingChange?.(true);

        try {
            const res = await postFormList<any, T>({
                url,
                data: formData,
                onUploadProgress: (e: AxiosProgressEvent) => {
                    if (e.total && e.total > 0) {
                        const percentage = Math.round((e.loaded / e.total) * 100);
                        options.onProgress?.(percentage);
                    }
                },
            });

            return res.results ?? [];
        } finally {
            options.onProgress?.(0);
            options.onUploadingChange?.(false);
        }
    },
};