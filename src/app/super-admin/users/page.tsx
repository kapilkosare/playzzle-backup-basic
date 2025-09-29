
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./user-actions";
import { getUsers, UserFilter } from "./actions";
import { getAuthenticatedUser } from "@/lib/firebase/server-auth";
import { redirect } from "next/navigation";
import { PaginationControls } from "@/components/pagination-controls";
import { Search } from "@/components/search";
import { formatDistanceToNow } from 'date-fns';
import { Crown, ArrowLeft } from "lucide-react";
import { FilterControls } from "./filter-controls";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type UsersPageProps = {
    searchParams?: {
        page?: string;
        q?: string;
        filter?: UserFilter;
    }
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
    const user = await getAuthenticatedUser();
    if (!user || !user.customClaims?.superadmin) {
        redirect('/');
    }
    
    const page = Number(searchParams?.page ?? 1);
    const searchQuery = searchParams?.q ?? '';
    const filter = searchParams?.filter ?? 'all';
    const limit = 10;
    const { users, totalCount, counts } = await getUsers(page, limit, searchQuery, filter);
    const totalPages = Math.ceil(totalCount / limit);
    
    return (
        <div className="container mx-auto py-8 px-4">
            <Button asChild variant="outline" className="mb-4">
                <Link href="/super-admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
            <h1 className="text-3xl font-bold mb-8">User Management</h1>
             <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>A list of all registered users in your application.</CardDescription>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <div className="flex-grow">
                           <Search placeholder="Search by name or email..." />
                        </div>
                        <FilterControls counts={counts} />
                    </div>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            {searchQuery ? `No users found for "${searchQuery}".` : "No users found for this filter."}
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Display Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Membership</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.uid}>
                                        <TableCell className="font-medium">{user.displayName || 'N/A'}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.disabled ? "secondary" : "default"}>
                                                {user.disabled ? 'Disabled' : 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.isSuperAdmin ? (
                                                <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                                    <Crown className="h-3 w-3" />
                                                    <span>Super Admin</span>
                                                </Badge>
                                            ) : (
                                                'User'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.proTier ? (
                                                <div className="flex flex-col">
                                                   <Badge variant="default" className="capitalize w-fit">
                                                        {user.proTier.replace('_', ' ')}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        Expires in {formatDistanceToNow(new Date(user.proExpiry!))}
                                                    </span>
                                                </div>
                                            ) : (
                                                'Standard'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <UserActions user={user} />
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
