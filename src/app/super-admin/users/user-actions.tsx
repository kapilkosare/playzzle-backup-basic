'use client';

import { useState, useTransition } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, UserCog, UserX, UserCheck } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { deleteUser, toggleUserDisabled, toggleSuperAdmin } from './actions';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


type User = {
    uid: string;
    email?: string;
    displayName?: string;
    disabled: boolean;
    isSuperAdmin: boolean;
};

type UserActionsProps = {
    user: User;
};

export function UserActions({ user }: UserActionsProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteUser(user.uid);
            if (result.success) {
                toast({ title: "Success", description: result.message });
            } else {
                toast({ variant: "destructive", title: "Error", description: result.message });
            }
            setIsDeleteDialogOpen(false);
        });
    };
    
    const handleToggleDisabled = () => {
        startTransition(async () => {
            const result = await toggleUserDisabled(user.uid, !user.disabled);
             if (result.success) {
                toast({ title: "Success", description: result.message });
            } else {
                toast({ variant: "destructive", title: "Error", description: result.message });
            }
        });
    };

    const handleToggleSuperAdmin = () => {
         startTransition(async () => {
            const result = await toggleSuperAdmin(user.uid, !user.isSuperAdmin);
             if (result.success) {
                toast({ title: "Success", description: result.message });
            } else {
                toast({ variant: "destructive", title: "Error", description: result.message });
            }
            setIsRoleDialogOpen(false);
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => setIsRoleDialogOpen(true)}
                        disabled={isPending}
                    >
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>{user.isSuperAdmin ? 'Remove as Admin' : 'Make Super Admin'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleToggleDisabled}
                        disabled={isPending}
                    >
                        {user.disabled ? (
                             <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                <span>Enable User</span>
                            </>
                        ) : (
                             <>
                                <UserX className="mr-2 h-4 w-4" />
                                <span>Disable User</span>
                            </>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        disabled={isPending}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete User</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                             <span className="font-bold"> {user.displayName || user.email}</span> and all of their data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                            {isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            {/* Role Change Confirmation Dialog */}
            <AlertDialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to {user.isSuperAdmin ? 'remove Super Admin privileges from' : 'grant Super Admin privileges to'} 
                            <span className="font-bold"> {user.displayName || user.email}</span>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleToggleSuperAdmin} disabled={isPending}>
                            {isPending ? 'Updating...' : 'Confirm'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
