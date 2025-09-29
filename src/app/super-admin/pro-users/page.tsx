
import { getAuthenticatedUser } from "@/lib/firebase/server-auth";
import { redirect } from "next/navigation";
import { getInterestedUsers } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from 'date-fns';
import { PaginationControls } from "@/components/pagination-controls";
import { Search } from "@/components/search";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type ProUsersPageProps = {
    searchParams?: {
        page?: string;
        q?: string;
    }
};

export default async function ProUsersPage({ searchParams }: ProUsersPageProps) {
    const user = await getAuthenticatedUser();
    if (!user || !user.customClaims?.superadmin) {
        redirect('/');
    }
    
    const page = Number(searchParams?.page ?? 1);
    const searchQuery = searchParams?.q ?? '';
    const limit = 10;
    const { users, totalCount } = await getInterestedUsers(page, limit, searchQuery);
    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="container mx-auto py-8 px-4">
            <Button asChild variant="outline" className="mb-4">
                <Link href="/super-admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
            <h1 className="text-3xl font-bold mb-8">Pro Membership Interest List</h1>
             <Card>
                <CardHeader>
                    <CardTitle>Interested Users</CardTitle>
                    <CardDescription>Users who signed up to be notified about Piczzle Pro.</CardDescription>
                    <div className="pt-4">
                        <Search placeholder="Search by name or email..." />
                    </div>
                </CardHeader>
                <CardContent>
                   {users.length === 0 ? (
                     <p className="text-muted-foreground text-center py-8">
                        {searchQuery ? `No users found for "${searchQuery}".` : "No one has signed up yet."}
                    </p>
                   ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="hidden md:table-cell">Date Submitted</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((interestedUser) => (
                                <TableRow key={interestedUser.id}>
                                    <TableCell>{interestedUser.name}</TableCell>
                                    <TableCell>{interestedUser.email}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {format(new Date(interestedUser.createdAt), "PPP p")}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                   )}
                </CardContent>
                {totalPages > 1 && (
                    <CardFooter>
                        <PaginationControls
                            currentPage={page}
                            totalPages={totalPages}
                        />
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
