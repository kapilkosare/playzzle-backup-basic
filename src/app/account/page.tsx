
// src/app/account/page.tsx
import { getAuthenticatedUser } from '@/lib/firebase/server-auth';
import { redirect } from 'next/navigation';
import { AccountForm } from '@/components/account-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AccountPage() {
    const user = await getAuthenticatedUser();
    if (!user) {
        redirect('/login');
    }
    
    const name = user.name || '';
    const nameParts = name.trim().split(' ').filter(part => part.length > 0);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    const userProfile = {
        uid: user.uid,
        email: user.email || '',
        firstName,
        lastName,
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">My Account</h1>
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="delete">Delete</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>Update your personal information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AccountForm user={userProfile} type="profile" />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="password">
                     <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your password here. Please enter your current password first.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AccountForm user={userProfile} type="password" />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="delete">
                     <Card>
                        <CardHeader>
                            <CardTitle>Delete Account</CardTitle>
                            <CardDescription>
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <AccountForm user={userProfile} type="delete" />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
