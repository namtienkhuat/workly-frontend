'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { useGetCompanyAdmins, useGetCompanyProfile } from '@/hooks/useQueryData';
import { UserPlus, Trash2, Shield, Mail, User, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addCompanyAdmin, removeCompanyAdmin } from '@/services/apiServices';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Admin {
    userId: string;
    name: string;
    email: string;
    username: string;
    avatarUrl?: string;
    role: string;
}

const AdminsPage = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data: adminsData, isLoading, refetch } = useGetCompanyAdmins(id);
    const { data: companyProfileData } = useGetCompanyProfile(id);

    const admins: Admin[] = adminsData?.data?.admins || [];
    const currentUserRole = companyProfileData?.data?.company?.role;
    const isOwner = currentUserRole === 'OWNER';

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
    const [addMethod, setAddMethod] = useState<'email' | 'userId'>('email');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminUserId, setNewAdminUserId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddAdmin = async () => {
        const value = addMethod === 'email' ? newAdminEmail.trim() : newAdminUserId.trim();

        if (!value) {
            toast.error(`Please enter ${addMethod === 'email' ? 'an email' : 'a User ID'}`);
            return;
        }

        setIsSubmitting(true);
        const payload = addMethod === 'email' ? { email: value } : { userId: value };

        const result = await addCompanyAdmin(id, payload);
        setIsSubmitting(false);

        if (result.success) {
            toast.success('Admin added successfully!', {
                description: result.message,
            });
            setIsAddDialogOpen(false);
            setNewAdminEmail('');
            setNewAdminUserId('');
            refetch();
        } else {
            toast.error('Failed to add admin', {
                description: result.message,
            });
        }
    };

    const handleRemoveAdmin = async () => {
        if (!selectedAdmin) return;

        setIsSubmitting(true);
        const result = await removeCompanyAdmin(id, selectedAdmin.userId);
        setIsSubmitting(false);

        if (result.success) {
            toast.success('Admin removed successfully!', {
                description: result.message,
            });
            setIsRemoveDialogOpen(false);
            setSelectedAdmin(null);
            refetch();
        } else {
            toast.error('Failed to remove admin', {
                description: result.message,
            });
        }
    };

    const openRemoveDialog = (admin: Admin) => {
        setSelectedAdmin(admin);
        setIsRemoveDialogOpen(true);
    };

    const handleAdminClick = (userId: string) => {
        router.push(`/profile/${userId}`);
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-9 w-24" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Shield className="h-6 w-6 text-primary" />
                                Company Admins
                            </CardTitle>
                            <CardDescription className="mt-2">
                                Manage administrators who can edit company information and manage
                                content
                                {currentUserRole && (
                                    <span className="block mt-1 text-xs">
                                        Your role: <strong>{currentUserRole}</strong>
                                        {!isOwner && ' (You can add admins but cannot remove them)'}
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Add Admin
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {admins.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No admins yet</p>
                            <p className="text-sm mt-1">
                                Add your first admin to start managing the company
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {admins.map((admin, index) => (
                                <div
                                    key={admin.userId || `admin-${index}`}
                                    onClick={() => handleAdminClick(admin.userId)}
                                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                                >
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={admin.avatarUrl} alt={admin.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                            {admin.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase()
                                                .slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-base truncate">
                                                {admin.name}
                                            </h3>
                                            {admin.role === 'OWNER' ? (
                                                <Badge
                                                    variant="default"
                                                    className="text-xs bg-blue-600 hover:bg-blue-700"
                                                >
                                                    👑 Owner
                                                </Badge>
                                            ) : admin.role === 'ADMIN' ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs gap-1"
                                                >
                                                    <ShieldCheck className="h-3 w-3" />
                                                    Admin
                                                </Badge>
                                            ) : null}
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                <span className="truncate">{admin.email}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                <span className="truncate">@{admin.username}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {isOwner && admin.role !== 'OWNER' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openRemoveDialog(admin);
                                            }}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Admin Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Admin</DialogTitle>
                        <DialogDescription>
                            Add a user as an admin to manage company information and content.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-3">
                            <Label>Add by</Label>
                            <RadioGroup
                                value={addMethod}
                                onValueChange={(value) => setAddMethod(value as 'email' | 'userId')}
                                className="flex gap-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="email" id="email" />
                                    <Label htmlFor="email" className="font-normal cursor-pointer">
                                        Email
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="userId" id="userId-option" />
                                    <Label
                                        htmlFor="userId-option"
                                        className="font-normal cursor-pointer"
                                    >
                                        User ID
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {addMethod === 'email' ? (
                            <div className="space-y-2">
                                <Label htmlFor="email-input">Email Address</Label>
                                <Input
                                    id="email-input"
                                    type="email"
                                    placeholder="Enter email address..."
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddAdmin();
                                        }
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the email address of the user you want to add
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="userId-input">User ID</Label>
                                <Input
                                    id="userId-input"
                                    placeholder="Enter user ID..."
                                    value={newAdminUserId}
                                    onChange={(e) => setNewAdminUserId(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddAdmin();
                                        }
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">
                                    You can find a user&apos;s ID on their profile page
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsAddDialogOpen(false);
                                setNewAdminEmail('');
                                setNewAdminUserId('');
                            }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddAdmin} disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Admin'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Admin Confirmation Dialog */}
            <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Admin Access</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove <strong>{selectedAdmin?.name}</strong>{' '}
                            as an admin? They will no longer be able to manage company information
                            and content.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveAdmin}
                            disabled={isSubmitting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isSubmitting ? 'Removing...' : 'Remove Admin'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default AdminsPage;
