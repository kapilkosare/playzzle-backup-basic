
'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitInterestForm, type InterestFormState } from './actions';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
});

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Submitting...' : 'Notify Me'}
            <Send className="ml-2 h-4 w-4" />
        </Button>
    );
}

export function InterestForm() {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const initialState: InterestFormState = { message: null, status: null };
  const [state, formAction] = useActionState(submitInterestForm, initialState);

  useEffect(() => {
    if (state.status) {
        toast({
            title: state.status === 'success' ? 'Success!' : 'Error',
            description: state.message,
            variant: state.status === 'error' ? 'destructive' : 'default',
        });
        if (state.status === 'success') {
            form.reset();
        }
    }
  }, [state, toast, form]);

  return (
    <Card className="max-w-md mx-auto mt-12 border-primary border-2 shadow-lg">
        <CardHeader>
            <CardTitle>Be the First to Know!</CardTitle>
            <CardDescription>
                Enter your details below, and we'll send you an exclusive notification (and maybe a special offer!) when Piczzle Pro launches.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Form {...form}>
                <form
                    action={formAction}
                    className="grid gap-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                            <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <SubmitButton />
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
