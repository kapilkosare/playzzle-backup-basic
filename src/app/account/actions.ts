
// src/app/account/actions.ts
'use server';

import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { app } from '@/lib/firebase/admin-config';
import { getAuthenticatedUser } from '@/lib/firebase/server-auth';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
});

export type ProfileFormState = {
    message: string;
    status: 'success' | 'error';
} | {
    message: null;
    status: null;
}

export async function updateProfile(
    prevState: ProfileFormState,
    formData: FormData
): Promise<ProfileFormState> {
    const user = await getAuthenticatedUser();
    if (!user) {
        return {
            message: 'You must be logged in to update your profile.',
            status: 'error',
        };
    }

    const validatedFields = profileFormSchema.safeParse({
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Invalid form data. Please check your entries.',
            status: 'error',
        };
    }
    
    const { firstName, lastName } = validatedFields.data;
    const displayName = `${firstName} ${lastName || ''}`.trim();

    try {
        const auth = getAuth(app);
        const db = getFirestore(app);

        // Update display name in Firebase Auth
        await auth.updateUser(user.uid, {
            displayName,
        });

        // Also save the name parts in Firestore for consistency,
        // which helps avoid issues with Google sign-in overwriting displayName.
        await db.collection('users').doc(user.uid).set({
            firstName,
            lastName: lastName || '',
        }, { merge: true });


        revalidatePath('/account');
        revalidatePath('/'); // To update the navbar

        return {
            message: 'Your profile has been updated successfully.',
            status: 'success',
        };
    } catch (error) {
        console.error('Error updating profile:', error);
        return {
            message: 'An unexpected error occurred. Please try again.',
            status: 'error',
        };
    }
}


type TransactionData = {
    paymentId: string;
    orderId: string;
    signature?: string;
    amount: number;
    currency: string;
    planId: string;
    puzzleId?: string;
    status: 'success' | 'failed';
    failureReason?: string;
}

export async function recordTransaction(data: TransactionData) {
    const user = await getAuthenticatedUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    const db = getFirestore(app);
    const batch = db.batch();

    // 1. Record the transaction
    const transactionRef = db.collection('transactions').doc();
    batch.set(transactionRef, {
        ...data,
        userId: user.uid,
        userEmail: user.email,
        createdAt: FieldValue.serverTimestamp(),
        creditUsed: false,
    });

    // 2. If it's a successful purchase, update user status or unlocked content
    if (data.status === 'success') {
        if (data.planId === 'single_puzzle' && data.puzzleId) {
            // This now represents a CREDIT purchase, not an immediate unlock.
            // The credit will be used later. The `useSinglePuzzleCredit` action will handle the unlocking.
        } else if (data.planId === 'monthly_pro' || data.planId === 'yearly_pro') {
            // Grant or extend a pro subscription
            const userRef = db.collection('users').doc(user.uid);
            const userDoc = await userRef.get();
            const userData = userDoc.data();
            
            const now = new Date();
            let newExpiryDate = new Date();
            
            // If user has an existing, non-expired subscription, extend it.
            const currentExpiry = userData?.proMembership?.expiresAt?.toDate();
            const startDate = currentExpiry && currentExpiry > now ? currentExpiry : now;

            if (data.planId === 'monthly_pro') {
                newExpiryDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
            } else if (data.planId === 'yearly_pro') {
                newExpiryDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1));
            }

            batch.set(userRef, { 
                proMembership: {
                    planId: data.planId,
                    startedAt: FieldValue.serverTimestamp(),
                    expiresAt: Timestamp.fromDate(newExpiryDate),
                    status: 'active'
                } 
            }, { merge: true });
        }
    }
    
    await batch.commit();
    revalidatePath('/account');
    revalidatePath('/membership');
    revalidatePath('/puzzles');
    revalidatePath('/category', 'layout');
}


export async function getUnlockedPuzzles(userId: string): Promise<string[]> {
    try {
        const db = getFirestore(app);
        const snapshot = await db.collection('unlockedPuzzles').where('userId', '==', userId).get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => doc.data().puzzleId as string);
    } catch (error) {
        console.error("Error fetching unlocked puzzles: ", error);
        return [];
    }
}

export type PuzzleDetails = {
    src: string;
    category: string;
    filename: string;
}

export async function getUnlockedPuzzleDetails(userId: string): Promise<PuzzleDetails[]> {
    const unlockedIds = await getUnlockedPuzzles(userId);
    if (unlockedIds.length === 0) {
        return [];
    }

    const puzzlesDir = path.join(process.cwd(), 'public', 'puzzles');
    const allPuzzles: PuzzleDetails[] = [];

     try {
        const dirents = await fs.readdir(puzzlesDir, { withFileTypes: true });
        const categories = dirents
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

        const unlockedSet = new Set(unlockedIds);

        for (const category of categories) {
            const categoryDir = path.join(puzzlesDir, category);
            const files = await fs.readdir(categoryDir);
            files.forEach((file) => {
                 if (unlockedSet.has(file)) {
                    allPuzzles.push({
                        src: `/puzzles/${category}/${file}`,
                        category,
                        filename: file,
                    });
                 }
            });
        }

        return allPuzzles;

    } catch (error) {
        console.error("Could not read puzzles directory:", error);
        return [];
    }
}

export type Transaction = {
  id: string;
  createdAt: string;
  expiry: string | null;
  [key: string]: any;
};

export type GetTransactionsResult = {
  transactions: Transaction[];
  error?: {
    code: string;
    message: string;
  };
};

export async function getTransactions(userId: string): Promise<GetTransactionsResult> {
    const db = getFirestore(app);
    try {
        const transactionsSnapshot = await db.collection('transactions').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
        
        if (transactionsSnapshot.empty) {
            return { transactions: [] };
        }

        const userDoc = await db.collection('users').doc(userId).get();
        const userProData = userDoc.exists ? userDoc.data()?.proMembership : null;
        
        const transactions = transactionsSnapshot.docs.map(doc => {
            const data = doc.data();
            let expiry = null;
            if ((data.planId === 'monthly_pro' || data.planId === 'yearly_pro') && userProData?.expiresAt) {
                expiry = (userProData.expiresAt as Timestamp).toDate().toISOString();
            }

            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
                expiry,
            } as Transaction;
        });
        
        return { transactions };

    } catch (error: any) {
        console.error("Error fetching transactions: ", error);
        // This is the specific error code for a missing index
        if (error.code === 9 || (error.code === 'FAILED_PRECONDITION' && error.message.includes('index'))) {
           return { 
                transactions: [], 
                error: {
                    code: 'FAILED_PRECONDITION', // Standardize the code
                    message: error.message // Pass the full message to get the creation URL
                }
            };
        }
        return { transactions: [], error: { code: 'UNKNOWN', message: 'An unexpected error occurred.'} };
    }
}


export async function getUserProStatus(userId: string): Promise<{ isPro: boolean }> {
    try {
        const db = getFirestore(app);
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return { isPro: false };
        }
        
        const userData = userDoc.data();
        const proMembership = userData?.proMembership;

        if (proMembership && (proMembership.status === 'active' || proMembership.status === 'cancelled')) {
            const expiryDate = proMembership.expiresAt.toDate();
            if (expiryDate > new Date()) {
                return { isPro: true };
            }
        }

        return { isPro: false };
    } catch (error) {
        console.error("Error fetching user pro status:", error);
        return { isPro: false };
    }
}

export type SubscriptionDetails = {
    planId: 'monthly_pro' | 'yearly_pro' | null;
    status: 'active' | 'expired' | 'none' | 'cancelled';
    startedAt: string | null;
    expiresAt: string | null;
    daysRemaining: number | null;
    userId?: string;
}

export async function getSubscriptionDetails(userId: string): Promise<SubscriptionDetails> {
    const db = getFirestore(app);
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists || !userDoc.data()?.proMembership) {
        return { planId: null, status: 'none', startedAt: null, expiresAt: null, daysRemaining: null };
    }

    const proMembership = userDoc.data()?.proMembership;
    
    // If status is 'cancelled', we still need to show details
    if (!proMembership.expiresAt) {
        // Fallback for cases where data might be inconsistent
        return { planId: proMembership.planId, status: proMembership.status, startedAt: null, expiresAt: null, daysRemaining: null };
    }

    const now = new Date();
    const expiryDate = proMembership.expiresAt.toDate();
    const startDate = proMembership.startedAt.toDate();
    const timeDiff = expiryDate.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    
    let status = proMembership.status;
    if (status === 'active' && now > expiryDate) {
        status = 'expired';
    }
    
    return {
        planId: proMembership.planId,
        status: status,
        startedAt: startDate.toISOString(),
        expiresAt: expiryDate.toISOString(),
        daysRemaining,
    };
}


export async function getSinglePuzzleCredit(userId: string): Promise<{ hasCredit: boolean, transactionId: string | null }> {
    try {
        const db = getFirestore(app);
        const query = db.collection('transactions')
            .where('userId', '==', userId)
            .where('planId', '==', 'single_puzzle')
            .where('status', '==', 'success')
            .where('creditUsed', '==', false)
            .limit(1);

        const snapshot = await query.get();
        if (snapshot.empty) {
            return { hasCredit: false, transactionId: null };
        }

        return { hasCredit: true, transactionId: snapshot.docs[0].id };
    } catch (error: any) {
        if (error.code === 9 || (error.code === 'FAILED_PRECONDITION' && error.message.includes('index'))) {
            console.warn("Firestore index for single puzzle credit query is missing.");
        } else {
            console.error("Error fetching single puzzle credit: ", error);
        }
        return { hasCredit: false, transactionId: null };
    }
}

export async function useSinglePuzzleCredit(transactionId: string, puzzleId: string, category: string): Promise<{ success: boolean, message: string }> {
    const user = await getAuthenticatedUser();
    if (!user) {
        return { success: false, message: 'You must be logged in.' };
    }

    const db = getFirestore(app);
    const batch = db.batch();

    const transactionRef = db.collection('transactions').doc(transactionId);
    batch.update(transactionRef, { creditUsed: true, usedForPuzzleId: puzzleId });

    const unlockedRef = db.collection('unlockedPuzzles').doc(`${user.uid}_${puzzleId}`);
    batch.set(unlockedRef, {
        userId: user.uid,
        puzzleId: puzzleId,
        unlockedAt: FieldValue.serverTimestamp()
    });

    try {
        await batch.commit();
        revalidatePath('/account');
        revalidatePath('/puzzles');
        revalidatePath(`/category/${category}`);

        return { success: true, message: 'Puzzle unlocked successfully.' };

    } catch (error) {
        console.error("Error using single puzzle credit:", error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function cancelSubscription(userId: string): Promise<{success: boolean, message: string}> {
    const user = await getAuthenticatedUser();
    if (!user || user.uid !== userId) {
        return { success: false, message: 'Not authorized.' };
    }

    const db = getFirestore(app);
    const userRef = db.collection('users').doc(userId);
    
    try {
        const userDoc = await userRef.get();
        if (!userDoc.exists || !userDoc.data()?.proMembership || userDoc.data()?.proMembership.status !== 'active') {
            return { success: false, message: 'No active subscription found to cancel.' };
        }
        
        await userRef.update({
            'proMembership.status': 'cancelled'
        });

        revalidatePath('/account');
        revalidatePath('/'); // Revalidate root to update nav bar pro status

        return { success: true, message: 'Your subscription has been cancelled. You will retain Pro access until the end of your billing period.' };

    } catch (error) {
        console.error("Error cancelling subscription:", error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

// New function to get user data from Firestore
export async function getFirestoreUser(uid: string) {
    try {
        const db = getFirestore(app);
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error("Error fetching Firestore user:", error);
        return null;
    }
}

// Wishlist Actions
export async function getWishlist(userId: string): Promise<string[]> {
    try {
        const db = getFirestore(app);
        const wishlistDoc = await db.collection('wishlists').doc(userId).get();
        if (wishlistDoc.exists) {
            return wishlistDoc.data()?.puzzles || [];
        }
        return [];
    } catch (error) {
        console.error("Error fetching wishlist: ", error);
        return [];
    }
}

export async function getWishlistDetails(userId: string): Promise<PuzzleDetails[]> {
    const wishlistIds = await getWishlist(userId);
    if (wishlistIds.length === 0) {
        return [];
    }
    
    const puzzlesDir = path.join(process.cwd(), 'public', 'puzzles');
    const allPuzzles: PuzzleDetails[] = [];

    try {
        const dirents = await fs.readdir(puzzlesDir, { withFileTypes: true });
        const categories = dirents
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

        const wishlistSet = new Set(wishlistIds);

        for (const category of categories) {
            const categoryDir = path.join(puzzlesDir, category);
            const files = await fs.readdir(categoryDir);
            files.forEach((file) => {
                if (wishlistSet.has(file)) {
                    allPuzzles.push({
                        src: `/puzzles/${category}/${file}`,
                        category,
                        filename: file,
                    });
                }
            });
        }

        return allPuzzles;

    } catch (error) {
        console.error("Could not read puzzles directory:", error);
        return [];
    }
}

export async function toggleWishlist(puzzleId: string): Promise<{ success: boolean; added: boolean; message: string }> {
    const user = await getAuthenticatedUser();
    if (!user) {
        return { success: false, added: false, message: "You must be logged in." };
    }

    const db = getFirestore(app);
    const wishlistRef = db.collection('wishlists').doc(user.uid);

    try {
        const doc = await wishlistRef.get();
        if (!doc.exists) {
            await wishlistRef.set({ puzzles: [puzzleId], userId: user.uid });
            revalidatePath('/', 'layout');
            return { success: true, added: true, message: "Added to wishlist." };
        } else {
            const puzzles = doc.data()?.puzzles || [];
            if (puzzles.includes(puzzleId)) {
                // Remove from wishlist
                await wishlistRef.update({ puzzles: FieldValue.arrayRemove(puzzleId) });
                 revalidatePath('/', 'layout');
                return { success: true, added: false, message: "Removed from wishlist." };
            } else {
                // Add to wishlist
                await wishlistRef.update({ puzzles: FieldValue.arrayUnion(puzzleId) });
                 revalidatePath('/', 'layout');
                return { success: true, added: true, message: "Added to wishlist." };
            }
        }
    } catch (error) {
        console.error("Error toggling wishlist:", error);
        return { success: false, added: false, message: "An unexpected error occurred." };
    }
}
