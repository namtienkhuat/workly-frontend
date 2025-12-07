'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';
import { paths } from '@/configs/route';

interface AuthRequiredModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    featureName?: string;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
    open,
    onOpenChange,
    featureName = 'tính năng này',
}) => {
    const router = useRouter();

    const handleSignIn = () => {
        onOpenChange(false);
        router.push(paths.signin);
    };

    const handleSignUp = () => {
        onOpenChange(false);
        router.push(paths.signup);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 border-0 bg-gradient-to-br from-white via-white to-primary/5 dark:from-background dark:via-background dark:to-primary/10">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />

                <div className="relative p-8 space-y-6">
                    {/* Icon and Animation */}
                    {/* <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                            <div className="relative bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                                <Sparkles className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </div> */}

                    <DialogHeader className="space-y-3 text-center">
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Log in to continue
                        </DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground leading-relaxed">
                            You need to sign in or create an account to use .
                        </DialogDescription>
                    </DialogHeader>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            onClick={handleSignIn}
                            className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <LogIn className="mr-2 h-5 w-5" />
                            Sign in
                        </Button>
                        <Button
                            onClick={handleSignUp}
                            variant="outline"
                            className="flex-1 h-12 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <UserPlus className="mr-2 h-5 w-5" />
                            Create account
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
