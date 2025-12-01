import { postForm, postFormList } from "@/utils/api";
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

        if (!files.length) return [];

        const formData = new FormData();
        for (const file of Array.from(files)) {
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
    async uploadCVToServer<T = any>(
        files: FileList,
        url: string,
        options: UploadOptions = {}
    ): Promise<T> {
        if (!files.length) return null as any;

        const formData = new FormData();

        for (const file of Array.from(files)) {
            if (file.type === 'application/pdf' ||
                file.type === 'application/msword' ||
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                formData.append("cv", file);
            } else {
                console.warn("File not support:", file.name);
            }
        }

        options.onUploadingChange?.(true);

        try {
            const res = await postForm<FormData, T>({
                url,
                data: formData,
                onUploadProgress: (e: AxiosProgressEvent) => {
                    if (e.total && e.total > 0) {
                        const percentage = Math.round((e.loaded / e.total) * 100);
                        options.onProgress?.(percentage);
                    }
                },
            });

            return res.results as T;
        } finally {
            options.onProgress?.(0);
            options.onUploadingChange?.(false);
        }
    },
};