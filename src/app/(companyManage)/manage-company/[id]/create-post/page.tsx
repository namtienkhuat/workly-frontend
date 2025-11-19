'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/utils/api';
import z from 'zod';

const createPostSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

const CreatePostPage = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreatePostFormData>({
        resolver: zodResolver(createPostSchema),
    });

    const onSubmit = async (formData: CreatePostFormData) => {
        setIsLoading(true);

        try {
            const { data } = await api.post(`/companies/${id}/posts`, { post: formData });
            toast.success('Post created successfully!');
            reset();
            router.push(`/manage-company/${id}`);
        } catch (error: any) {
            toast.error('Failed to create post', {
                description: error.response?.data?.message || 'Unknown error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Create Post</CardTitle>
                <CardDescription>Share updates and news about your company</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <Field className="gap-2">
                        <FieldLabel>
                            Title <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input placeholder="Post title" {...register('title')} />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={errors.title ? [errors.title] : undefined}
                        />
                    </Field>

                    <Field className="gap-2">
                        <FieldLabel>
                            Content <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Textarea
                            placeholder="Write your post content here..."
                            rows={10}
                            {...register('content')}
                        />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={errors.content ? [errors.content] : undefined}
                        />
                    </Field>

                    <Field className="gap-2">
                        <FieldLabel>Image URL (optional)</FieldLabel>
                        <Input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            {...register('imageUrl')}
                        />
                        <FieldError
                            className="mt-1 text-xs"
                            errors={errors.imageUrl ? [errors.imageUrl] : undefined}
                        />
                    </Field>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Publishing...' : 'Publish Post'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default CreatePostPage;
