'use client';

import React, { useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

import { Loader2 } from 'lucide-react';
import AvatarCropper from './AvatarCropper';

interface EditImageDialogProps {
    open: boolean;
    initialImageUrl?: string;
    aspectRatio?: number;
    isSubmitting?: boolean;
    onCropComplete?: (blob: Blob) => void;
    onOpenChange: (open: boolean) => void;
}

const EditImageDialog = ({
    open,
    onOpenChange,
    initialImageUrl,
    aspectRatio = 1,
    onCropComplete,
    isSubmitting,
}: EditImageDialogProps) => {
    const [error, setError] = useState<string>('');

    const handleError = (errorMsg: string) => {
        setError(errorMsg);
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            // Clear error when dialog closes
            setError('');
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit image</DialogTitle>
                    <DialogDescription>Upload and crop your image.</DialogDescription>
                </DialogHeader>

                <div>
                    {isSubmitting ? (
                        <div className="flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {error && (
                                <div className="rounded-md bg-red-50 border border-red-200 p-3">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}
                            <AvatarCropper
                                initialImageUrl={initialImageUrl}
                                aspectRatio={aspectRatio}
                                onCropComplete={onCropComplete}
                                onError={handleError}
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditImageDialog;
