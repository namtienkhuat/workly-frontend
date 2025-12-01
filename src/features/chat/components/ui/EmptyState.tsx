'use client';

import { MessageSquareOff, Search } from 'lucide-react';

interface EmptyStateProps {
    message: string;
    icon?: React.ReactNode;
    subtitle?: string;
}

export function EmptyState({ message, icon, subtitle }: EmptyStateProps) {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center p-8 max-w-sm animate-in fade-in duration-500">
                {/* Icon with gradient background */}
                <div className="mb-6 flex justify-center">
                    <div className="relative">
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-2xl animate-pulse" />
                        
                        {/* Icon container */}
                        <div className="relative rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 border border-primary/10 shadow-lg">
                            {icon || (
                                message.includes('tìm thấy') ? (
                                    <Search className="h-12 w-12 text-primary/60" />
                                ) : (
                                    <MessageSquareOff className="h-12 w-12 text-primary/60" />
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Message */}
                <h3 className="text-base font-semibold text-foreground/80 mb-2">
                    {message}
                </h3>
                
                {subtitle && (
                    <p className="text-sm text-muted-foreground">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}

