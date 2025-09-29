
// src/components/account-form.tsx
'use client';

import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';

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
} from "@/components/ui/alert-dialog"

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from '@/hooks/use-toast';
import { updateUserPassword, reauthenticate, deleteUserAccount, logout } from '@/lib/firebase/auth';
import { updateProfile } from '@/app/account/actions';
import { FirebaseError } from 'firebase/app';

type AccountFormProps = {
  user: {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  type: 'profile' | 'password' | 'delete';
};

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

const deleteFormSchema = z.object({
  currentPassword: z.string().min(1, "Please enter your password to confirm deletion."),
});

function SubmitButton({ isSubmitting, text, submittingText }: { isSubmitting: boolean; text: string; submittingText: string; }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || isSubmitting}>
      {pending || isSubmitting ? submittingText : text}
    </Button>
  );
}

export function AccountForm({ user, type }: AccountFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const formSchema = type === 'profile' ? profileFormSchema : type === 'password' ? passwordFormSchema : deleteFormSchema;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: type === 'profile' ? {
      firstName: user.firstName,
      lastName: user.lastName,
    } : {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { isSubmitting } = form.formState;

  const [state, formAction] = useActionState(updateProfile, { message: null, status: null });
  
  useEffect(() => {
    if (state.status) {
      toast({
        title: state.status === 'success' ? 'Success!' : 'Error',
        description: state.message,
        variant: state.status === 'error' ? 'destructive' : 'default',
      });
    }
  }, [state, toast]);
  
  useEffect(() => {
    if(type === 'profile'){
        form.reset({
            firstName: user.firstName,
            lastName: user.lastName,
        });
    }
  }, [user, form, type]);


  const handlePasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    try {
        await reauthenticate(values.currentPassword);
        await updateUserPassword(values.newPassword);
        toast({
            title: 'Success!',
            description: "Your password has been changed.",
        });
        form.reset();
    } catch (error) {
        console.error(error);
        let description = "Failed to change password. Please try again.";
        if (error instanceof FirebaseError && (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential')) {
            description = "The current password you entered is incorrect.";
        }
        toast({
            title: 'Error',
            description,
            variant: 'destructive',
        });
    }
  };
  
  const handleDeleteSubmit = async (values: z.infer<typeof deleteFormSchema>) => {
    try {
        await reauthenticate(values.currentPassword);
        await deleteUserAccount();
        toast({
            title: 'Account Deleted',
            description: "Your account has been permanently deleted.",
        });
        await logout();
        router.push('/');
        router.refresh();
    } catch (error) {
        console.error(error);
        let description = "An error occurred while deleting your account.";
        if (error instanceof FirebaseError && (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential')) {
            description = "The password you entered is incorrect.";
        }
        toast({
            title: 'Error',
            description,
            variant: 'destructive',
        });
    }
  };

  if (type === 'profile') {
    return (
        <Form {...form}>
            <form action={formAction} className="space-y-6 max-w-lg">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input value={user.email} readOnly disabled />
                </FormItem>
                
                <SubmitButton isSubmitting={isSubmitting} text="Save Changes" submittingText="Saving..." />
            </form>
        </Form>
    );
  }

  if (type === 'password') {
     return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handlePasswordSubmit)} className="space-y-4 max-w-md">
                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Changing...' : 'Change Password'}
                </Button>
            </form>
        </Form>
     )
  }

 if (type === 'delete') {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleDeleteSubmit)}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account. 
                                To confirm, please type your password below.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                             <FormField
                                control={form.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                            <Button type="submit" variant="destructive" disabled={isSubmitting}>
                                {isSubmitting ? 'Deleting...' : 'Delete My Account'}
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
  }

  return null;
}
