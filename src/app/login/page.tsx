// src/app/login/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

const LoginForm = dynamic(() => import('./login-form'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                           <Skeleton className="h-4 w-12" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="grid gap-2">
                           <Skeleton className="h-4 w-16" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="grid gap-2">
                           <Skeleton className="h-4 w-24" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Skeleton className="w-full h-[1px]" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-transparent">
                                Or continue with
                            </span>
                        </div>
                    </div>
                     <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    ),
});

export default function LoginPage() {
  return <LoginForm />;
}
