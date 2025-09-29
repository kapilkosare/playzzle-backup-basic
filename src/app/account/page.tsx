
// src/app/account/page.tsx
import { getAuthenticatedUser } from '@/lib/firebase/server-auth';
import { redirect } from 'next/navigation';
import { AccountForm } from '@/components/account-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionHistory } from './transaction-history';
import { UnlockedPuzzles } from './unlocked-puzzles';
import { SubscriptionManager } from './subscription-details';
import { getFirestoreUser } from './actions';
import { Wishlist } from './wishlist';

export default async function AccountPage() {
    const user = await getAuthenticatedUser();
    if (!user) {
        redirect('/login');
    }
    
    // Fetch user data from Firestore to get first/last name if available
    const firestoreUser = await getFirestoreUser(user.uid);
    
    let firstName = firestoreUser?.firstName || '';
    let lastName = firestoreUser?.lastName || '';
    
    // Fallback to displayName if Firestore fields are not set
    if (!firstName && user.name) {
        const nameParts = user.name.trim().split(' ').filter(part => part.length > 0);
        firstName = nameParts[0] || '';
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    }
    
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
                <TabsList className="grid w-full max-w-2xl grid-cols-5">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="subscription">Subscription</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
                    <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>Update your personal information and manage your account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <AccountForm user={userProfile} type="profile" />
                            <hr/>
                            <AccountForm user={userProfile} type="password" />
                             <hr/>
                             <AccountForm user={userProfile} type="delete" />
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="subscription">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Subscription</CardTitle>
                            <CardDescription>View and manage your Pro membership details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <SubscriptionManager userId={user.uid} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="transactions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>A record of all your purchases.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <TransactionHistory userId={user.uid} />
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="unlocked">
                    <Card>
                        <CardHeader>
                            <CardTitle>Unlocked Puzzles</CardTitle>
                            <CardDescription>A gallery of all the pro puzzles you have purchased individually.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <UnlockedPuzzles userId={user.uid} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="wishlist">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Wishlist</CardTitle>
                            <CardDescription>A collection of puzzles you want to solve later.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Wishlist userId={user.uid} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
