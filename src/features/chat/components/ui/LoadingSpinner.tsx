'use client';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
};

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center">
                <div
                    className={`${sizeClasses[size]} mx-auto animate-spin rounded-full border-blue-500 border-t-transparent`}
                ></div>
                {message && <p className="mt-2 text-gray-600">{message}</p>}
            </div>
        </div>
    );
}

