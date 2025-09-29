
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, MessageSquare, Star } from "lucide-react";

export default function SuperAdminPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Super Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Users</CardTitle>
                        <CardDescription>View, edit, and manage all registered users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/super-admin/users">
                                <Users className="mr-2 h-4 w-4" />
                                Go to Users
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>View Messages</CardTitle>
                        <CardDescription>Read and manage messages from the contact form.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/super-admin/messages">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                View Messages
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Pro Interest List</CardTitle>
                        <CardDescription>View users interested in Piczzle Pro membership.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/super-admin/pro-users">
                                <Star className="mr-2 h-4 w-4" />
                                View Interest List
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Coming Soon</CardTitle>
                        <CardDescription>This is your control panel. More features are on the way!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Future features will include:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                            <li>User statistics (registrations, daily/monthly visits)</li>
                            <li>Managing "Pro" puzzle templates</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
