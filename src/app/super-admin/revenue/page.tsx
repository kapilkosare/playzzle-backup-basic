
import { getAuthenticatedUser } from "@/lib/firebase/server-auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Calendar, BarChart, AlertTriangle, Crown } from "lucide-react";
import { getRevenueStats } from './actions';
import { getUsers } from '../users/actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResetButton } from "./reset-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function formatPrice(priceInPaise: number) {
    return `₹${(priceInPaise / 100).toFixed(2)}`;
}

export default async function RevenuePage() {
    const user = await getAuthenticatedUser();
    if (!user || !user.customClaims?.superadmin) {
        redirect('/');
    }
    
    // Fetch all users to calculate stats correctly
    const { users } = await getUsers(1, 10000); // Fetch a large number to get all users
    const revenueStats = await getRevenueStats();

    const proUsers = users.filter(u => u.proTier);
    const superAdmins = users.filter(u => u.isSuperAdmin);
    const freeUsers = users.length - proUsers.length;
    
    const monthlyPro = proUsers.filter(u => u.proTier === 'monthly_pro').length;
    const yearlyPro = proUsers.filter(u => u.proTier === 'yearly_pro').length;

    return (
        <div className="container mx-auto py-8 px-4">
             <div className="flex justify-between items-start mb-4">
                <Button asChild variant="outline">
                    <Link href="/super-admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
                {user.email === 'kapil.webfoxtech@gmail.com' && <ResetButton />}
            </div>

            <h1 className="text-3xl font-bold mb-8">Revenue & User Statistics</h1>
            
            {revenueStats.error && (
                <Alert variant="destructive" className="mb-8">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Database Index Required</AlertTitle>
                    <AlertDescription>
                        The revenue query needs a database index to work correctly. Please visit the following URL to create it, then refresh this page.
                        <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 text-xs break-all">{revenueStats.error.message}</code>
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(revenueStats.total)}</div>
                        <p className="text-xs text-muted-foreground">
                           from {revenueStats.count} transactions
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(revenueStats.last30Days)}</div>
                         <p className="text-xs text-muted-foreground">
                           from {revenueStats.last30DaysCount} transactions
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last 365 Days</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(revenueStats.last365Days)}</div>
                         <p className="text-xs text-muted-foreground">
                           from {revenueStats.last365DaysCount} transactions
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{proUsers.length}</div>
                         <p className="text-xs text-muted-foreground">
                           {monthlyPro} Monthly / {yearlyPro} Yearly
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Free Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{freeUsers}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
                        <Crown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{superAdmins.length}</div>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>How are these calculated?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p><strong>Revenue:</strong> Calculated from all successful transactions in the `transactions` collection.</p>
                    <p><strong>Total Users:</strong> The total number of accounts registered via Firebase Authentication.</p>
                    <p><strong>Pro Users:</strong> Users with an active, non-expired subscription in the `users` collection.</p>
                    <p><strong>Free Users:</strong> The count of Total Users minus the count of Pro Users.</p>
                    <p><strong>Super Admins:</strong> Users with the 'superadmin' custom claim set in Firebase Authentication.</p>
                </CardContent>
            </Card>
        </div>
    );
}
