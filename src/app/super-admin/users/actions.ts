'use server';

import { revalidatePath } from 'next/cache';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import { app } from '@/lib/firebase/admin-config';
import { getAuthenticatedUser } from '@/lib/firebase/server-auth';

const auth = getAuth(app);

async function verifyAdmin() {
    const user = await getAuthenticatedUser();
    if (!user || !user.customClaims?.superadmin) {
        throw new Error('Not authorized');
    }
}

export type SimpleUser = {
    uid: string;
    email?: string;
    displayName?: string;
    disabled: boolean;
    isSuperAdmin: boolean;
};

export type PaginatedUsers = {
    users: SimpleUser[];
    totalCount: number;
}

export async function getUsers(page = 1, limit = 10, searchQuery = ''): Promise<PaginatedUsers> {
    await verifyAdmin();
    try {
        // Firebase Admin SDK's listUsers is limited and doesn't support complex filtering or full-text search.
        // We fetch all users and filter/paginate in memory.
        // For very large user bases (e.g., >1000s), this could be slow. A more scalable solution would involve
        // syncing user data to a searchable database like Firestore or using a third-party service.
        const listUsersResult = await auth.listUsers();
        let allUsers = listUsersResult.users;

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            allUsers = allUsers.filter(user => 
                (user.displayName && user.displayName.toLowerCase().includes(lowercasedQuery)) ||
                (user.email && user.email.toLowerCase().includes(lowercasedQuery))
            );
        }
        
        const totalCount = allUsers.length;
        const startIndex = (page - 1) * limit;
        const paginatedUsers = allUsers.slice(startIndex, startIndex + limit);

        const users: SimpleUser[] = paginatedUsers.map((user: UserRecord) => ({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            disabled: user.disabled,
            isSuperAdmin: !!user.customClaims?.superadmin,
        }));
        
        return { users, totalCount };

    } catch (error) {
        console.error('Error fetching users:', error);
        return { users: [], totalCount: 0 };
    }
}

export async function deleteUser(uid: string) {
    await verifyAdmin();
    try {
        await auth.deleteUser(uid);
        revalidatePath('/super-admin/users');
        return { success: true, message: 'User deleted successfully.' };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, message: 'Failed to delete user.' };
    }
}

export async function toggleUserDisabled(uid: string, disabled: boolean) {
    await verifyAdmin();
    try {
        await auth.updateUser(uid, { disabled });
        revalidatePath('/super-admin/users');
        return { success: true, message: `User ${disabled ? 'disabled' : 'enabled'} successfully.` };
    } catch (error) {
        console.error('Error updating user state:', error);
        return { success: false, message: 'Failed to update user state.' };
    }
}

export async function toggleSuperAdmin(uid: string, isSuperAdmin: boolean) {
    await verifyAdmin();
    try {
        await auth.setCustomUserClaims(uid, { superadmin: isSuperAdmin });
        revalidatePath('/super-admin/users');
        return { success: true, message: `User role updated successfully.` };
    } catch (error) {
        console.error('Error setting custom claims:', error);
        return { success: false, message: 'Failed to update user role.' };
    }
}
