import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';
import { STORAGE_URL } from './StringUtil';

export const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    return 'http://localhost:3000';
};

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
};

export const getMediaUrl = (filename: string, type: 'IMAGE' | 'VIDEO'): string => {
    const folder = type === 'VIDEO' ? 'videos' : 'images';
    return `${STORAGE_URL}/uploads/${folder}/${filename}`;
};
export const getCVUrl = (fileName: string): string => {
    console.log(`${STORAGE_URL}${fileName}`);

    return `${STORAGE_URL}${fileName}`;

}
export const getMimeType = (type: 'IMAGE' | 'VIDEO', filename: string): string => {
    if (type === 'VIDEO') {
        // Video MIME types
        if (filename.includes('.webm')) return 'video/webm';
        if (filename.includes('.mov')) return 'video/quicktime';
        if (filename.includes('.avi')) return 'video/x-msvideo';
        if (filename.includes('.mkv')) return 'video/x-matroska';
        return 'video/mp4'; // default
    } else {
        // Image MIME types
        if (filename.includes('.png')) return 'image/png';
        if (filename.includes('.gif')) return 'image/gif';
        if (filename.includes('.webp')) return 'image/webp';
        if (filename.includes('.svg')) return 'image/svg+xml';
        if (filename.includes('.bmp')) return 'image/bmp';
        return 'image/jpeg'; // default
    }
};
