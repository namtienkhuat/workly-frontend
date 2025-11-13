import React from 'react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import AvatarCropper from '@/components/AvatarCropper';
import { Loader2 } from 'lucide-react';

interface EditLogoDialogProps {
    open: boolean;
    initialImageUrl?: string;
    aspectRatio?: number;
    isSubmitting?: boolean;
    onCropComplete?: (blob: Blob) => void;
    onOpenChange: (open: boolean) => void;
}

const EditLogoDialog = ({
    open,
    onOpenChange,
    initialImageUrl,
    aspectRatio = 1,
    onCropComplete,
    isSubmitting,
}: EditLogoDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                        <AvatarCropper
                            initialImageUrl={initialImageUrl}
                            aspectRatio={aspectRatio}
                            onCropComplete={onCropComplete}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditLogoDialog;
