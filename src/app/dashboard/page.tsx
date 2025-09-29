// src/app/dashboard/page.tsx
import { getAuthenticatedUser } from "@/lib/firebase/server-auth";
import { redirect } from "next/navigation";
import { getUserStats } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Tag, Timer, BarChart, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { GameHistoryEvent } from "@/lib/types";

function formatTime(totalSeconds: number): string {
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes < 60) return `${minutes}m ${seconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
}

export default async function DashboardPage() {
    const user = await getAuthenticatedUser();
    if (!user) {
        redirect('/login');
    }

    const stats = await getUserStats();

    if (!stats) {
        return (
            <div className="container mx-auto py-8 px-4 text-center">
                <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
                <p className="text-muted-foreground">Could not load your stats. Please try again later.</p>
            </div>
        )
    }
    
    const sortedFastestTimes = Object.values(stats.fastestTimes).sort((a,b) => {
        if (a.gameType < b.gameType) return -1;
        if (a.gameType > b.gameType) return 1;
        return a.difficulty - b.difficulty;
    });

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

            {stats.totalGamesPlayed === 0 ? (
                <div className="text-center py-16">
                     <p className="text-lg text-muted-foreground">You haven't played any games yet. Go solve some puzzles!</p>
                </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Games Played</CardTitle>
                        <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalGamesPlayed}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Most Played Category</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{stats.mostPlayedCategory}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Playtime</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatTime(stats.totalPlaytime.overall)}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Playtime Breakdown</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                       <div className="text-sm">
                           <p><strong>Slide:</strong> {formatTime(stats.totalPlaytime.slide)}</p>
                           <p><strong>Jigsaw:</strong> {formatTime(stats.totalPlaytime.jigsaw)}</p>
                       </div>
                    </CardContent>
                </Card>
            </div>
            )}


            {sortedFastestTimes.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Timer /> Personal Bests
                        </CardTitle>
                        <CardDescription>Your fastest completion times for each game type and difficulty.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Game Type</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                    <TableHead>Fastest Time</TableHead>
                                    <TableHead>Moves</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedFastestTimes.map((game, index) => (
                                     <TableRow key={index}>
                                        <TableCell className="capitalize">{game.gameType}</TableCell>
                                        <TableCell>{game.difficulty} x {game.difficulty}</TableCell>
                                        <TableCell>{formatTime(game.timeInSeconds)}</TableCell>
                                        <TableCell>{game.moves}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
