'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '../ui/Button';

interface AvatarCropperProps {
    onCropComplete?: (croppedImageBlob: Blob) => void;
    initialImageUrl?: string;
    aspectRatio?: number;
    circularCrop?: boolean;
}

const AvatarCropper: React.FC<AvatarCropperProps> = ({
    onCropComplete,
    initialImageUrl,
    aspectRatio = 1,
    circularCrop,
}) => {
    const [imgSrc, setImgSrc] = useState<string>(initialImageUrl || '');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

    // Default circularCrop to true if aspectRatio is 1, otherwise false
    const isCircular = circularCrop !== undefined ? circularCrop : aspectRatio === 1;
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    setImgSrc(reader.result?.toString() || '');
                });
                reader.readAsDataURL(file);
            }
        }
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        const crop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                aspectRatio,
                naturalWidth,
                naturalHeight
            ),
            naturalWidth,
            naturalHeight
        );
        setCrop(crop);
    };

    const getCroppedImg = useCallback(
        (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
            const canvas = canvasRef.current;
            if (!canvas) {
                throw new Error('Canvas element not found');
            }

            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            const pixelRatio = window.devicePixelRatio;

            // Set canvas size to the actual crop size (in natural image pixels)
            const cropWidth = crop.width * scaleX;
            const cropHeight = crop.height * scaleY;

            canvas.width = cropWidth * pixelRatio;
            canvas.height = cropHeight * pixelRatio;

            ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            ctx.imageSmoothingQuality = 'high';

            const cropX = crop.x * scaleX;
            const cropY = crop.y * scaleY;

            // Apply circular crop mask if enabled
            if (isCircular) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(
                    cropWidth / 2,
                    cropHeight / 2,
                    Math.min(cropWidth, cropHeight) / 2,
                    0,
                    2 * Math.PI
                );
                ctx.clip();
            }

            ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

            if (isCircular) {
                ctx.restore();
            }

            return new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas is empty'));
                            return;
                        }
                        resolve(blob);
                    },
                    'image/png',
                    1
                );
            });
        },
        [isCircular]
    );

    const handleCropComplete = async () => {
        if (!completedCrop || !imgRef.current) {
            return;
        }

        try {
            const blob = await getCroppedImg(imgRef.current, completedCrop);
            if (onCropComplete) {
                onCropComplete(blob);
            }
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Hidden canvas for image processing */}
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex flex-col items-center gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onSelectFile}
                    className="hidden"
                    id="avatar-upload"
                />
                <Button asChild variant="outline">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                        {imgSrc ? 'Change Image' : 'Select Image'}
                    </label>
                </Button>

                {imgSrc && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspectRatio}
                                circularCrop={isCircular}
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop me"
                                    src={imgSrc}
                                    style={{ maxWidth: '100%', maxHeight: '400px' }}
                                    onLoad={onImageLoad}
                                    crossOrigin="anonymous"
                                />
                            </ReactCrop>
                        </div>

                        <Button onClick={handleCropComplete}>Apply Crop</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvatarCropper;
