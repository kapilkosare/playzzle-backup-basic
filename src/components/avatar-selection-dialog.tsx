// src/components/avatar-selection-dialog.tsx
'use client';

import { useState, useEffect, useActionState } from 'react';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { updateAvatar, type FormState } from '@/app/account/actions';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import fs from 'fs';
import path from 'path';

type AvatarSelectionDialogProps = {
    children: React.ReactNode; // This will be the trigger
    currentAvatar: string;
    availableAvatars: string[];
};

const formSchema = z.object({
  avatar: z.string().min(1, 'Please select an avatar.'),
});

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Saving...' : 'Save Avatar'}
        </Button>
    )
}

export function AvatarSelectionDialog({ children, currentAvatar, availableAvatars }: AvatarSelectionDialogProps) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            avatar: currentAvatar,
        },
    });

    const initialState: FormState = { message: null, status: null };
    const [state, formAction] = useActionState(updateAvatar, initialState);

    useEffect(() => {
        if (state.status) {
            toast({
                title: state.status === 'success' ? 'Success!' : 'Error',
                description: state.message,
                variant: state.status === 'error' ? 'destructive' : 'default',
            });
            if (state.status === 'success') {
                setIsOpen(false);
            }
        }
    }, [state, toast]);
    
    useEffect(() => {
        form.setValue('avatar', currentAvatar);
    }, [currentAvatar, form]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Choose your Avatar</DialogTitle>
                    <DialogDescription>
                        Select a new avatar from the options below.
                    </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form action={formAction}>
                        <FormField
                            control={form.control}
                            name="avatar"
                            render={({ field }) => (
                                <FormItem>
                                     <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 py-4 max-h-[400px] overflow-y-auto"
                                        >
                                            {availableAvatars.map((avatarSrc) => (
                                                <FormItem key={avatarSrc} className="flex items-center justify-center">
                                                    <FormControl>
                                                        <RadioGroupItem value={avatarSrc} className="sr-only" />
                                                    </FormControl>
                                                    <FormLabel className={cn(
                                                        "rounded-full border-2 border-transparent cursor-pointer transition-all p-1",
                                                        "ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                        field.value === avatarSrc && "border-primary ring-2 ring-primary"
                                                    )}>
                                                        <div className="relative w-20 h-20">
                                                            <Image
                                                                src={avatarSrc}
                                                                alt={`Avatar option`}
                                                                fill
                                                                sizes="80px"
                                                                className="rounded-full object-cover"
                                                            />
                                                        </div>
                                                    </FormLabel>
                                                </FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                         {availableAvatars.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No avatars available. Add some images to the `public/avatars` folder.
                            </p>
                        )}
                        <DialogFooter className="mt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <SubmitButton />
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
