'use client';

interface EmptyStateProps {
    message: string;
    icon?: React.ReactNode;
}

export function EmptyState({ message, icon }: EmptyStateProps) {
    return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center p-8">
                {icon && <div className="mb-3 flex justify-center">{icon}</div>}
                <p className="text-sm">{message}</p>
            </div>
        </div>
    );
}

