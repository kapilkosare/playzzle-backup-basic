import { getAuthenticatedUser } from "@/lib/firebase/server-auth";
import { redirect } from "next/navigation";
import { getContactSubmissions } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { MessageActions } from "./message-actions";
import { format } from 'date-fns';
import { PaginationControls } from "@/components/pagination-controls";
import { Search } from "@/components/search";

type MessagesPageProps = {
    searchParams?: {
        page?: string;
        q?: string;
    }
};

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
    const user = await getAuthenticatedUser();
    if (!user || !user.customClaims?.superadmin) {
        redirect('/');
    }
    
    const page = Number(searchParams?.page ?? 1);
    const searchQuery = searchParams?.q ?? '';
    const limit = 10;
    const { messages, totalCount } = await getContactSubmissions(page, limit, searchQuery);
    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Contact Form Messages</h1>
             <Card>
                <CardHeader>
                    <CardTitle>Inbox</CardTitle>
                    <CardDescription>Messages submitted through the contact form.</CardDescription>
                    <div className="pt-4">
                        <Search placeholder="Search messages..." />
                    </div>
                </CardHeader>
                <CardContent>
                   {messages.length === 0 ? (
                     <p className="text-muted-foreground text-center py-8">
                        {searchQuery ? `No messages found for "${searchQuery}".` : "No messages yet."}
                    </p>
                   ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">From</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead className="hidden md:table-cell">Message</TableHead>
                                <TableHead className="hidden lg:table-cell w-[180px]">Received</TableHead>
                                <TableHead className="w-[80px]">Status</TableHead>
                                <TableHead className="text-right w-[50px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {messages.map((message) => (
                                <TableRow key={message.id} className={!message.read ? 'font-bold' : ''}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{message.firstName} {message.lastName}</span>
                                            <span className="text-xs text-muted-foreground font-normal">{message.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{message.subject}</TableCell>
                                    <TableCell className="hidden md:table-cell max-w-sm truncate font-normal">
                                        {message.message}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell font-normal">
                                        {format(new Date(message.createdAt), "PPP p")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={message.read ? "secondary" : "default"}>
                                            {message.read ? 'Read' : 'Unread'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <MessageActions message={message} />
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
