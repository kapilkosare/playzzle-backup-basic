
// src/app/account/actions.ts
'use server';

import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { app } from '@/lib/firebase/admin-config';
import { getAuthenticatedUser } from '@/lib/firebase/server-auth';
import { revalidatePath } from 'next/cache';

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
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
        console.error(validatedFields.error);
        return {
            message: 'Invalid form data. Please check your entries.',
            status: 'error',
        };
    }
    
    const { firstName, lastName } = validatedFields.data;
    const displayName = `${firstName} ${lastName}`.trim();

    try {
        // Fetch the full user record to preserve the photoURL
        const userRecord = await getAuth(app).getUser(user.uid);

        await getAuth(app).updateUser(user.uid, {
            displayName,
            photoURL: userRecord.photoURL || '', // Preserve existing photoURL
        });

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
