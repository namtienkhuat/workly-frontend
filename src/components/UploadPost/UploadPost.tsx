"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import CommonService from "../../services/common/commonService"
import { CreatePostDTO, PostVisibilityType } from "@/models/profileModel";
import { apiPaths } from "@/configs/routes";
import ProfileService from "@/services/profile/profileService";
import { toast } from "sonner";

type PreviewFile = {
    url: string;
    type: string;
    file: File;
};

type FormData = {
    description: string;
    media: FileList;
};

export default function UploadPostModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [previews, setPreviews] = useState<PreviewFile[]>([]);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [mode, setMode] = useState<PostVisibilityType>(PostVisibilityType.PUBLIC); // trạng thái mặc định

    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<FormData>();

    const uploadFiles = async (files: FileList): Promise<any> => {
        try {
            const result = await CommonService.uploadFilesToServer(files, apiPaths.uploadFile, {
                onProgress: setProgress,
                onUploadingChange: setUploading,
            })
            return result
        } catch (error) {
            console.error("Upload failed:", error);
            throw error;
        }
    };
    function filesArrayToFileList(files: PreviewFile[]): FileList {
        const dataTransfer = new DataTransfer();
        files.forEach(file => dataTransfer.items.add(file.file));
        return dataTransfer.files;
    }
    const onSubmit = async (data: FormData) => {
        try {
            let mediaUrls = [];
            // Step 1: Upload files if there are any
            if (previews.length > 0) {
                const files = filesArrayToFileList(previews);
                mediaUrls = await uploadFiles(files);
            }

            // Step 2: Create post with uploaded URLs
            const postData: CreatePostDTO = {
                content: data.description,
                media_url: mediaUrls.length > 0 ? mediaUrls : [],
                visibility: mode ? mode : PostVisibilityType.PUBLIC,
            };

            await ProfileService.addPost(postData);

            reset();
            setPreviews([]);
            setProgress(0);
            setIsOpen(false);
            toast.success('Successfully!');
        } catch (err) {
            console.error(err);
            toast.error("error");
            setProgress(0);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newPreviews = Array.from(files).map((file) => ({
                url: URL.createObjectURL(file),
                type: file.type,
                file: file, // Store the actual file object
            }));

            setPreviews((prev) => [...prev, ...newPreviews]);
        }
    };
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (
            value === PostVisibilityType.PUBLIC ||
            value === PostVisibilityType.PRIVATE ||
            value === PostVisibilityType.FOLLOWER
        ) {
            setMode(value);
        }
    };
    const removePreview = (index: number) => {
        setPreviews((prev) => {
            const newPreviews = [...prev];
            const url = newPreviews[index]?.url;

            if (url) {
                URL.revokeObjectURL(url); // chỉ gọi nếu url tồn tại
            }

            newPreviews.splice(index, 1);
            return newPreviews;
        });
    };

    return (
        <div className="text-center py-[50px]">
            {/* Nút mở modal */}
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
                Tạo bài viết
            </button>

            {/* Overlay + Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-xl p-6 relative animate-fade-in">
                        {/* Nút đóng */}
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setPreviews([]);
                                setProgress(0);
                            }}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                            disabled={isSubmitting}
                        >
                            ✕
                        </button>

                        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                            Tạo bài viết mới
                        </h2>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <textarea
                                {...register("description")}
                                placeholder="Bạn đang nghĩ gì?"
                                className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
                                rows={6}
                            />
                            <div className="max-w-sm mx-auto mt-6">
                                <label htmlFor="mode" className="block mb-2 text-sm font-medium text-gray-700">
                                    Chọn chế độ
                                </label>
                                <select
                                    id="mode"
                                    value={mode}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                                >
                                    <option value={PostVisibilityType.PUBLIC}>PUBLIC</option>
                                    <option value={PostVisibilityType.PRIVATE}>PRIVATE</option>
                                    <option value={PostVisibilityType.FOLLOWER}>FOLLOWER</option>
                                </select>

                                <p className="mt-4 text-sm text-gray-600">
                                    Bạn đã chọn: <span className="font-semibold text-blue-600">{mode}</span>
                                </p>
                            </div>

                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                {...register("media")}
                                onChange={handleFileChange}
                                disabled={isSubmitting}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                file:rounded-md file:border-0 file:text-sm file:font-semibold 
                file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
                disabled:opacity-50 disabled:cursor-not-allowed  "
                            />

                            {/* Upload Progress */}
                            {progress > 0 && progress < 100 && (
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            )}

                            {/* Preview ảnh & video */}
                            {previews.length > 0 && (
                                <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                                    {previews.map((file, index) => (
                                        <div key={index} className="relative group">
                                            {file.type.startsWith("video/") ? (
                                                <video
                                                    src={file.url}
                                                    controls
                                                    className="w-full max-h-64 rounded-md object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={file.url}
                                                    alt={`preview-${index}`}
                                                    className="w-full max-h-64 object-cover rounded-md"
                                                />
                                            )}
                                            {/* Remove button */}
                                            <button
                                                type="button"
                                                onClick={() => removePreview(index)}
                                                disabled={isSubmitting}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 
                        flex items-center justify-center opacity-0 group-hover:opacity-100 
                        transition-opacity hover:bg-red-600 disabled:opacity-50"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setPreviews([]);
                                        setProgress(0);
                                    }}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 
                  dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800
                  disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 
                  disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting
                                        ? progress > 0 && progress < 100
                                            ? `Đang tải lên... ${progress}%`
                                            : "Đang đăng..."
                                        : "Đăng bài"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}