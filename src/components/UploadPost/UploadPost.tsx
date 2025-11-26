"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CommonService from "../../services/common/commonService"
import { CreatePostDTO, PostVisibilityType, UpdatePostDTO } from "@/models/profileModel";
import { apiPaths } from "@/configs/route";
import ProfileService from "@/services/profile/profileService";
import { toast } from "sonner";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { getInitials, getMediaUrl, getMimeType } from "@/utils/helpers";
import StringUtil from "@/utils/StringUtil";

type PreviewFile = {
    url: string;
    type: string;
    file: File;
    isOriginal?: boolean;
    originalUrl?: string;
    originalType?: string;
};
export default function UploadPostModal({ reload, type, authorId, isOpen, setIsOpen, status, setStatus, editPost }:
    { reload: any, type: string, authorId: string, isOpen: any, setIsOpen: any, status?: string, setStatus?: any, editPost?: any }) {
    const [previews, setPreviews] = useState<PreviewFile[]>([]);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [newFiles, setNewFiles] = useState<PreviewFile[]>([]);
    const [deletedFiles, setDeletedFiles] = useState<PreviewFile[]>([]);


    const { isLoading: isLoadingAuth, user: currentUser } = useAuth();

    const [mode, setMode] = useState<PostVisibilityType>(PostVisibilityType.PUBLIC);
    const formSchema = z.object({
        description: z.string().min(1, "Description is required"),
        media: z.any()
    })
    useEffect(() => {
        if (status !== '' && editPost) {
            reset({ description: editPost.content });
            if (editPost.media_url && editPost.media_url.length > 0) {
                const previewsFromServer = editPost.media_url.map((media: any) => {
                    const fileUrl = media?.url || media;
                    const mediaType = media?.type;

                    return {
                        url: getMediaUrl(fileUrl, mediaType),
                        type: getMimeType(mediaType, fileUrl),
                        file: null,
                        isOriginal: true,
                        originalUrl: fileUrl,
                        originalType: mediaType
                    };
                });

                setPreviews(previewsFromServer);
            }
            setMode(editPost.visibility);
        } else {
            reset({ description: '' });
            setPreviews([]);
            setMode(PostVisibilityType.PUBLIC);
        }
    }, [editPost, status]);

    type FormData = z.infer<typeof formSchema>;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>(
        {
            resolver: zodResolver(formSchema),
        }
    );

    const handleClosePopup = () => {
        reload()
        reset({ description: '' });
        setPreviews([]);
        setProgress(0);
        setMode(PostVisibilityType.PUBLIC);
        setIsOpen(false);
        setStatus('');
        setNewFiles([]);
        setDeletedFiles([]);
    }

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
            let finalMediaUrls = [];

            if (status !== '' && editPost) {
                // MODE EDIT
                // Upload new files
                if (newFiles.length > 0) {
                    const files = filesArrayToFileList(newFiles);
                    finalMediaUrls = await uploadFiles(files);
                }

                const updatePostData: UpdatePostDTO = {
                    postId: editPost._id,
                    content: data.description,
                    media_url_add: finalMediaUrls,
                    media_url_delete: deletedFiles as any,
                    visibility: mode ? mode : PostVisibilityType.PUBLIC,
                    author_type: type,
                    author_id: authorId
                };

                await ProfileService.updatePost(updatePostData);
            }

            if (status === '' && !editPost) {
                // MODE ADD
                if (previews.length > 0) {
                    const files = filesArrayToFileList(previews);
                    finalMediaUrls = await uploadFiles(files);
                }

                const postData: CreatePostDTO = {
                    content: data.description,
                    media_url: finalMediaUrls,
                    visibility: mode ? mode : PostVisibilityType.PUBLIC,
                    author_type: type,
                    author_id: authorId
                };

                await ProfileService.addPost(postData);
            }

            handleClosePopup();
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
                file: file,
                isOriginal: false  // new File
            }));

            setPreviews((prev) => [...prev, ...newPreviews]);
            if (status !== '' && editPost) {
                setNewFiles((prev) => [...prev, ...newPreviews]);
            }
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
        const fileToRemove = previews[index];

        if (!fileToRemove) return;

        if (status !== '' && editPost) {
            if (fileToRemove.isOriginal && fileToRemove.originalUrl) {
                setDeletedFiles((prev) => {
                    const updated = [...prev, fileToRemove];
                    return updated;
                });
            }


            if (!fileToRemove.isOriginal) {
                setNewFiles((prevNew) => {
                    const indexInNewList = prevNew.findIndex(
                        (item) => item.file === fileToRemove.file
                    );
                    if (indexInNewList === -1) return prevNew;
                    const newFilePreviews = [...prevNew];
                    newFilePreviews.splice(indexInNewList, 1);
                    return newFilePreviews;
                });
            }
        }

        if (fileToRemove.url && !fileToRemove.isOriginal) {
            URL.revokeObjectURL(fileToRemove.url);
        }

        setPreviews((prev) => {
            const newPreviews = [...prev];
            newPreviews.splice(index, 1);
            return newPreviews;
        });
    };
    if (isLoadingAuth) {
        return <div>loading....</div>
    }
    return (
        <div className="text-center py-[50px]">
            <div className="flex">
                <div className=" mr-5">
                    {currentUser!!.avatarUrl ? (
                        <Image
                            src={currentUser!!.avatarUrl}
                            alt={currentUser!!.name}
                            loading="lazy"
                            width={15}
                            height={15}
                            className="object-cover"
                        />
                    ) : (
                        <Avatar className="h-[50px] w-[50px] rounded-full border-muted text-2xl" style={{ backgroundColor: StringUtil.getRandomColor() }}
                        >
                            <AvatarFallback className="text-2xl bg-white">
                                {getInitials(currentUser!!.name)}
                            </AvatarFallback>
                        </Avatar>
                    )}</div>
                <button
                    onClick={() => { setIsOpen(true); setStatus('') }}
                    className="bg-[#DCDCDC] font-bold text-white text-left px-4 py-2 w-full border border-[#D3D3D3] rounded-lg hover:bg-[#D3D3D3] transition"
                >
                    What are you thinking?
                </button>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-xl p-6 relative animate-fade-in">
                        <button
                            onClick={handleClosePopup}
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
                            {errors.description && (
                                <p className="text-red-500 text-sm">{errors.description.message}</p>
                            )}
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
                                                    onError={(e) => {
                                                        console.error('Video load ERROR:', file.url);
                                                        console.error('Error details:', e);
                                                    }}
                                                />
                                            ) : (
                                                <img
                                                    src={file.url}
                                                    alt={`preview-${index}`}
                                                    className="w-full max-h-64 object-cover rounded-md"
                                                    onError={(e) => {
                                                        console.error('Image load ERROR:', file.url);
                                                        console.error('Error details:', e);
                                                    }}
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
                                    onClick={handleClosePopup}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 
                                                dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800
                                                disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
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
                                        : status === '' ? "Add" : "Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}