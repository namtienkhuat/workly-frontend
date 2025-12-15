'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import CommonService from '../../services/common/commonService';
import { CreatePostDTO, PostVisibilityType, UpdatePostDTO } from '@/models/profileModel';
import { apiPaths } from '@/configs/route';
import ProfileService from '@/services/profile/profileService';
import { toast } from 'sonner';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials, getMediaUrl, getMimeType } from '@/utils/helpers';
import StringUtil from '@/utils/StringUtil';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, ImageIcon, VideoIcon, Globe, Lock, Users, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import RichTextEditor from './RichTextEditor';

type PreviewFile = {
    url: string;
    type: string;
    file: File;
    isOriginal?: boolean;
    originalUrl?: string;
    originalType?: string;
};
export default function UploadPostModal({
    reload,
    type,
    authorId,
    isOpen,
    setIsOpen,
    status,
    setStatus,
    editPost,
}: {
    reload: any;
    type: string;
    authorId: string;
    isOpen: any;
    setIsOpen: any;
    status?: string;
    setStatus?: any;
    editPost?: any;
}) {
    const [previews, setPreviews] = useState<PreviewFile[]>([]);
    const [progress, setProgress] = useState(0);
    const [newFiles, setNewFiles] = useState<PreviewFile[]>([]);
    const [deletedFiles, setDeletedFiles] = useState<PreviewFile[]>([]);
    const [editorContent, setEditorContent] = useState<string>('');

    const { isLoading: isLoadingAuth, user: currentUser } = useAuth();

    const [mode, setMode] = useState<PostVisibilityType>(PostVisibilityType.PUBLIC);
    const formSchema = z.object({
        description: z.string().min(1, 'Description is required'),
        media: z.any(),
    });

    type FormData = z.infer<typeof formSchema>;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (status !== '' && editPost) {
            const content = editPost.content || '';
            reset({ description: content });
            setEditorContent(content);
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
                        originalType: mediaType,
                    };
                });

                setPreviews(previewsFromServer);
            }
            setMode(editPost.visibility);
        } else {
            reset({ description: '' });
            setEditorContent('');
            setPreviews([]);
            setMode(PostVisibilityType.PUBLIC);
        }
    }, [editPost, status, reset]);

    const handleClosePopup = () => {
        reload();
        reset({ description: '' });
        setEditorContent('');
        setPreviews([]);
        setProgress(0);
        setMode(PostVisibilityType.PUBLIC);
        setIsOpen(false);
        setStatus('');
        setNewFiles([]);
        setDeletedFiles([]);
    };

    const uploadFiles = async (files: FileList): Promise<any> => {
        try {
            const result = await CommonService.uploadFilesToServer(files, apiPaths.uploadFile, {
                onProgress: setProgress,
            });
            return result;
        } catch (error) {
            throw error;
        }
    };
    function filesArrayToFileList(files: PreviewFile[]): FileList {
        const dataTransfer = new DataTransfer();
        files.forEach((file) => dataTransfer.items.add(file.file));
        return dataTransfer.files;
    }
    const onSubmit = async (data: FormData) => {
        try {
            let finalMediaUrls = [];
            const content = editorContent || data.description || '';

            const textContent = content.replace(/<[^>]*>/g, '').trim();
            if (!textContent) {
                toast.error('Please enter some content');
                return;
            }

            if (status !== '' && editPost) {
                if (newFiles.length > 0) {
                    const files = filesArrayToFileList(newFiles);
                    finalMediaUrls = await uploadFiles(files);
                }

                const updatePostData: UpdatePostDTO = {
                    postId: editPost._id,
                    content: content,
                    media_url_add: finalMediaUrls,
                    media_url_delete: deletedFiles as any,
                    visibility: PostVisibilityType.PUBLIC,
                    author_type: type,
                    author_id: authorId,
                };

                await ProfileService.updatePost(updatePostData);
            }

            if (status === '' && !editPost) {
                if (previews.length > 0) {
                    const files = filesArrayToFileList(previews);
                    finalMediaUrls = await uploadFiles(files);
                }

                const postData: CreatePostDTO = {
                    content: content,
                    media_url: finalMediaUrls,
                    visibility: mode ? mode : PostVisibilityType.PUBLIC,
                    author_type: type,
                    author_id: authorId,
                };

                await ProfileService.addPost(postData);
            }

            handleClosePopup();
            toast.success('Successfully!');
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to save post. Please try again.';
            toast.error(errorMessage);
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
                isOriginal: false,
            }));

            setPreviews((prev) => [...prev, ...newPreviews]);
            if (status !== '' && editPost) {
                setNewFiles((prev) => [...prev, ...newPreviews]);
            }
        }
    };

    const handleModeChange = (value: string) => {
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
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const getVisibilityIcon = (mode: PostVisibilityType) => {
        switch (mode) {
            case PostVisibilityType.PUBLIC:
                return <Globe className="h-4 w-4" />;
            case PostVisibilityType.PRIVATE:
                return <Lock className="h-4 w-4" />;
            case PostVisibilityType.FOLLOWER:
                return <Users className="h-4 w-4" />;
            default:
                return <Globe className="h-4 w-4" />;
        }
    };

    return (
        <div className="mb-6">
            {/* Trigger Button */}
            <div
                className="relative flex items-center gap-4 p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => {
                    setIsOpen(true);
                    setStatus('');
                }}
            >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Animated pattern overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex items-center gap-4 w-full">
                    {/* Avatar with glow effect */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Avatar className="h-14 w-14 border-2 border-primary/30 group-hover:border-primary/60 transition-all duration-300 relative z-10 shadow-lg group-hover:shadow-primary/20 group-hover:scale-105">
                            {currentUser?.avatarUrl ? (
                                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {getInitials(currentUser?.name || 'U')}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Input area */}
                    <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                            What&apos;s on your mind?
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Share your thoughts, photos, or videos
                        </p>
                    </div>

                    {/* Action icons */}
                    <div className="flex gap-3 items-center">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
                        </div>
                        <div className="p-2.5 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                            <VideoIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                </div>
            </div>

            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) handleClosePopup();
                }}
            >
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            {status === '' ? 'Create New Post' : 'Edit Post'}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* User Info */}
                        <div className="flex items-center gap-3 pb-4 border-b">
                            <Avatar className="h-10 w-10">
                                {currentUser?.avatarUrl ? (
                                    <AvatarImage
                                        src={currentUser.avatarUrl}
                                        alt={currentUser.name}
                                    />
                                ) : null}
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {getInitials(currentUser?.name || 'U')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm">{currentUser?.name}</p>
                                {/* <Badge variant="secondary" className="text-xs mt-1 gap-1">
                                    {getVisibilityIcon(mode)}
                                    {mode}
                                </Badge> */}
                            </div>
                        </div>

                        {/* Rich Text Editor */}
                        <div className="space-y-2">
                            <RichTextEditor
                                content={editorContent}
                                onChange={(content) => {
                                    setEditorContent(content);
                                    setValue('description', content);
                                }}
                                placeholder="What's on your mind?"
                                error={errors.description?.message}
                            />
                        </div>

                        {/* Visibility Selector */}
                        {/* <div className="space-y-3">
                            <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                Post Visibility
                            </label>
                            <Select value={mode} onValueChange={handleModeChange}>
                                <SelectTrigger className="w-full h-11 border-2 border-input/50 bg-background hover:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                    <div className="flex items-center gap-2.5 w-full">
                                        <span className="flex-shrink-0">
                                            {getVisibilityIcon(mode)}
                                        </span>
                                        <SelectValue className="flex-1 text-left font-medium">
                                            {mode === PostVisibilityType.PUBLIC && 'Public'}
                                            {mode === PostVisibilityType.PRIVATE && 'Private'}
                                            {mode === PostVisibilityType.FOLLOWER && 'Followers'}
                                        </SelectValue>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="min-w-[320px] animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
                                    <SelectItem
                                        value={PostVisibilityType.PUBLIC}
                                        className="cursor-pointer py-3 px-4 hover:bg-accent/50 transition-all duration-200 focus:bg-accent rounded-md data-[highlighted]:bg-accent"
                                    >
                                        <div className="flex items-center gap-3 w-full pr-8">
                                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 transition-transform duration-200 group-hover:scale-110 flex-shrink-0">
                                                <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm text-foreground">
                                                    Public
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    Anyone can see this post
                                                </div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem
                                        value={PostVisibilityType.PRIVATE}
                                        className="cursor-pointer py-3 px-4 hover:bg-accent/50 transition-all duration-200 focus:bg-accent rounded-md data-[highlighted]:bg-accent"
                                    >
                                        <div className="flex items-center gap-3 w-full pr-8">
                                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 transition-transform duration-200 group-hover:scale-110 flex-shrink-0">
                                                <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm text-foreground">
                                                    Private
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    Only you can see this post
                                                </div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem
                                        value={PostVisibilityType.FOLLOWER}
                                        className="cursor-pointer py-3 px-4 hover:bg-accent/50 transition-all duration-200 focus:bg-accent rounded-md data-[highlighted]:bg-accent"
                                    >
                                        <div className="flex items-center gap-3 w-full pr-8">
                                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 transition-transform duration-200 group-hover:scale-110 flex-shrink-0">
                                                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm text-foreground">
                                                    Followers
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    Only your followers can see this
                                                </div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div> */}

                        {/* File Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                Media Files
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    {...register('media')}
                                    onChange={handleFileChange}
                                    disabled={isSubmitting}
                                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2.5 file:px-4 
                                                file:rounded-lg file:border-0 file:text-sm file:font-semibold 
                                                file:bg-primary/10 file:text-primary hover:file:bg-primary/20
                                                disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Upload Progress */}
                        {progress > 0 && progress < 100 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Uploading...</span>
                                    <span className="font-medium text-primary">{progress}%</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Preview Media */}
                        {previews.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {previews.length} file{previews.length > 1 ? 's' : ''} selected
                                </p>
                                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                                    {previews.map((file, index) => (
                                        <div
                                            key={index}
                                            className="relative group rounded-lg overflow-hidden border border-border bg-muted/30"
                                        >
                                            {file.type.startsWith('video/') ? (
                                                <video
                                                    src={file.url}
                                                    controls
                                                    className="w-full h-32 object-cover"
                                                    onError={(e) => {}}
                                                />
                                            ) : (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={file.url}
                                                    alt={`preview-${index}`}
                                                    className="w-full h-32 object-cover"
                                                    onError={(e) => {}}
                                                />
                                            )}
                                            {/* Remove button */}
                                            <button
                                                type="button"
                                                onClick={() => removePreview(index)}
                                                disabled={isSubmitting}
                                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-7 h-7 
                                                            flex items-center justify-center opacity-0 group-hover:opacity-100 
                                                            transition-all hover:bg-destructive/90 disabled:opacity-50 shadow-lg"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClosePopup}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="min-w-[100px]">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {progress > 0 && progress < 100
                                            ? `Uploading ${progress}%`
                                            : 'Posting...'}
                                    </>
                                ) : status === '' ? (
                                    'Post'
                                ) : (
                                    'Update'
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
