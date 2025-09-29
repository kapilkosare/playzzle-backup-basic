// src/app/dashboard/actions.ts
'use server';

import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { app } from '@/lib/firebase/admin-config';
import { getAuthenticatedUser } from '@/lib/firebase/server-auth';
import type { GameHistoryEvent } from '@/lib/types';

// This function will be called from the game components when a puzzle is solved.
export async function recordGameCompletion(event: Omit<GameHistoryEvent, 'uid' | 'completedAt'>): Promise<{ success: boolean }> {
    const user = await getAuthenticatedUser();
    if (!user) {
        // Don't throw an error, just fail silently if user is not logged in.
        return { success: false };
    }

    try {
        const db = getFirestore(app);
        const historyRef = db.collection('gameHistory');
        
        const historyEvent: GameHistoryEvent = {
            ...event,
            uid: user.uid,
            completedAt: Timestamp.now(),
        };

        await historyRef.add(historyEvent);

        return { success: true };

    } catch (error) {
        console.error("Error recording game completion:", error);
        return { success: false };
    }
}

export async function getUserStats() {
    const user = await getAuthenticatedUser();
    if (!user) {
        return null;
    }

    try {
        const db = getFirestore(app);
        const historyQuery = db.collection('gameHistory').where('uid', '==', user.uid);
        const snapshot = await historyQuery.get();

        if (snapshot.empty) {
            return {
                totalGamesPlayed: 0,
                mostPlayedCategory: 'N/A',
                fastestTimes: {},
                totalPlaytime: {
                    slide: 0,
                    jigsaw: 0,
                    overall: 0,
                }
            };
        }

        const gameHistory = snapshot.docs.map(doc => doc.data() as Omit<GameHistoryEvent, 'completedAt'>);
        
        // Calculate stats
        const totalGamesPlayed = gameHistory.length;

        const categoryCounts = gameHistory.reduce((acc, game) => {
            acc[game.category] = (acc[game.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const mostPlayedCategory = Object.keys(categoryCounts).length > 0
            ? Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0]
            : 'N/A';
        
        const fastestTimes = gameHistory.reduce((acc, game) => {
            const key = `${game.gameType}-${game.difficulty}`;
            if (!acc[key] || game.timeInSeconds < acc[key].timeInSeconds) {
                acc[key] = game;
            }
            return acc;
        }, {} as Record<string, GameHistoryEvent>);
        
        const totalPlaytime = gameHistory.reduce((acc, game) => {
            if (game.gameType === 'slide') {
                acc.slide += game.timeInSeconds;
            } else if (game.gameType === 'jigsaw') {
                acc.jigsaw += game.timeInSeconds;
            }
            acc.overall += game.timeInSeconds;
            return acc;
        }, { slide: 0, jigsaw: 0, overall: 0 });

        return {
            totalGamesPlayed,
            mostPlayedCategory,
            fastestTimes,
            totalPlaytime,
        };

    } catch (error) {
        console.error("Error fetching user stats:", error);
        return null;
    }
}
