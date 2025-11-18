'use client';

interface EmptyStateProps {
    message: string;
    icon?: React.ReactNode;
}

export function EmptyState({ message, icon }: EmptyStateProps) {
    return (
        <div className="flex h-full items-center justify-center text-gray-500">
            <div className="text-center">
                {icon && <div className="mb-2 flex justify-center">{icon}</div>}
                <p>{message}</p>
            </div>
        </div>
    );
}

