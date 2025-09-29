
'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { app } from '@/lib/firebase/admin-config';
import { getAuthenticatedUser } from '@/lib/firebase/server-auth';

async function verifyAdmin() {
    const user = await getAuthenticatedUser();
    if (!user || !user.customClaims?.superadmin) {
        throw new Error('Not authorized');
    }
}

export type SiteSettings = {
    mobilePlayEnabled: boolean;
    offerEnabled: boolean;
    offerTitle: string;
    offerDescription: string;
    offerShopNowText: string;
};

export async function getSiteSettings(): Promise<SiteSettings> {
    try {
        const db = getFirestore(app);
        const settingsDoc = await db.collection('settings').doc('site').get();
        const data = settingsDoc.data();
        
        // Return settings with defaults for new fields
        return {
            mobilePlayEnabled: data?.mobilePlayEnabled ?? true,
            offerEnabled: data?.offerEnabled ?? false,
            offerTitle: data?.offerTitle ?? 'Limited Time Offer!',
            offerDescription: data?.offerDescription ?? 'Sign up now to get exclusive benefits.',
            offerShopNowText: data?.offerShopNowText ?? 'SHOP NOW',
        };
    } catch (error) {
        console.error("Error fetching site settings:", error);
        // Default on error
        return { 
            mobilePlayEnabled: true,
            offerEnabled: false,
            offerTitle: 'Limited Time Offer!',
            offerDescription: 'Sign up now to get exclusive benefits.',
            offerShopNowText: 'SHOP NOW',
        };
    }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<{ success: boolean; message: string }> {
    await verifyAdmin();
    
    try {
        const db = getFirestore(app);
        await db.collection('settings').doc('site').set(settings, { merge: true });

        // Revalidate all paths that might be affected
        revalidatePath('/', 'layout');
        revalidatePath('/puzzles');
        revalidatePath('/play', 'layout');
        revalidatePath('/slide-puzzle');
        revalidatePath('/move-puzzle');
        revalidatePath('/super-admin/settings');
        revalidatePath('/super-admin/offers');
        
        return {
            success: true,
            message: 'Settings updated successfully!',
        };

    } catch(error) {
        console.error("Error updating settings:", error);
        return {
            success: false,
            message: 'An unexpected error occurred.',
        };
    }
}
