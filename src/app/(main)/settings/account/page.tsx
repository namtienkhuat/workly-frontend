'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { deleteMyAccount } from '@/services/apiServices';
import { Trash2, AlertTriangle, Shield, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TOKEN_KEY } from '@/constants';

const DeleteAccountSection = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const { success, message } = await deleteMyAccount();

            if (success) {
                // Clear React Query cache
                queryClient.setQueryData(['auth', 'me'], null);
                queryClient.removeQueries({ queryKey: ['auth', 'me'] });
                queryClient.clear(); // Clear all queries to prevent stale data

                // Clear all localStorage data related to authentication
                if (typeof window !== 'undefined') {
                    // Remove authentication token
                    localStorage.removeItem(TOKEN_KEY);

                    // Remove user info stored by chat store
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userType');

                    // Remove chat-related data
                    localStorage.removeItem('hiddenConversations');
                    localStorage.removeItem('clearedConversations');

                    // Clear all appearance settings keys that contain user-specific data
                    const keysToRemove: string[] = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (
                            key &&
                            (key.startsWith('appearance_settings_') || key.includes('workly_'))
                        ) {
                            keysToRemove.push(key);
                        }
                    }
                    keysToRemove.forEach((key) => localStorage.removeItem(key));
                }

                toast.success('Account deleted successfully.');
                // Redirect to home page and force refresh
                router.push('/home');
                router.refresh();
            } else {
                toast.error('Failed to delete account', {
                    description: message,
                });
            }
        } catch (error: any) {
            toast.error('Failed to delete account', {
                description: error?.message || 'An unexpected error occurred',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-2 border-red-500/50 shadow-lg bg-gradient-to-br from-red-50/50 to-white dark:from-red-950/10 dark:to-background">
            <CardHeader className="space-y-1 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-2xl text-red-600 flex items-center gap-2">
                            Delete Account
                            <XCircle className="h-5 w-5" />
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                            Permanently delete your account and all associated data. This action
                            cannot be undone.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                        <strong>Warning:</strong> This is a permanent action. Once you delete your
                        account, you will lose:
                    </AlertDescription>
                </Alert>
                <div className="space-y-2 pl-4 border-l-2 border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-red-600 mt-1">•</span>
                        <span>All your profile information and personal data</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-red-600 mt-1">•</span>
                        <span>All your posts, comments, and interactions</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-red-600 mt-1">•</span>
                        <span>All your connections and network relationships</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-red-600 mt-1">•</span>
                        <span>All your job applications and saved jobs</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-red-600 mt-1">•</span>
                        <span>All your messages and chat history</span>
                    </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-sm font-medium">Data Recovery</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                We cannot recover your data after deletion. Please make sure you
                                have exported any important information before proceeding.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 bg-red-50/50 dark:bg-red-950/10 pt-6">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            disabled={isLoading}
                            className="min-w-[160px] shadow-md hover:shadow-lg transition-shadow"
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete My Account
                                </>
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-red-200">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2 pt-2">
                                <p>
                                    This action is <strong>permanent</strong> and cannot be undone.
                                    All your data, posts, connections, and profile information will
                                    be deleted forever.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    If you&apos;re sure you want to proceed, please type{' '}
                                    <strong>&quot;DELETE&quot;</strong> to confirm.
                                </p>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="animate-spin mr-2">⏳</span>
                                        Deleting...
                                    </>
                                ) : (
                                    'Yes, delete my account'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
};

const AccountSettingsPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                        <Trash2 className="h-6 w-6 text-destructive" />
                    </div>
                    Account Settings
                </h2>
                <p className="text-muted-foreground mt-2">
                    Manage your account deletion. This is a dangerous zone - proceed with caution.
                </p>
            </div>

            <DeleteAccountSection />
        </div>
    );
};

export default AccountSettingsPage;
