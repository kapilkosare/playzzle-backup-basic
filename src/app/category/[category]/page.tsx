
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import ProPuzzleLink from '@/components/pro-puzzle-link';
import { getAuthenticatedUser } from '@/lib/firebase/server-auth';
import { getUnlockedPuzzles, getUserProStatus, getSinglePuzzleCredit, getWishlist } from '@/app/account/actions';
import PuzzleCard from '@/components/puzzle-card';
import { PuzzlesGrid } from './puzzles-grid';


type CategoryPageProps = {
    params: {
        category: string;
    }
}

function formatCategoryName(name: string) {
    return name.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { category } = params;
    const decodedCategory = decodeURIComponent(category);
    
    // Server-side check if category exists to show notFound() if needed.
    const categoryDir = path.join(process.cwd(), 'public', 'puzzles', decodedCategory);
    if (!fs.existsSync(categoryDir) || !fs.statSync(categoryDir).isDirectory()) {
        notFound();
    }
    
    const user = await getAuthenticatedUser();
    const isSuperAdmin = !!user?.customClaims?.superadmin;

    let isPro = false;
    let unlockedPuzzleIds: string[] = [];
    let singlePuzzleCredit: { hasCredit: boolean; transactionId: string | null } = { hasCredit: false, transactionId: null };
    let wishlist: string[] = [];
    
    if(user) {
        isPro = (await getUserProStatus(user.uid)).isPro;
        unlockedPuzzleIds = await getUnlockedPuzzles(user.uid);
        singlePuzzleCredit = await getSinglePuzzleCredit(user.uid);
        wishlist = await getWishlist(user.uid);
    }
    
    // Pass all server-fetched data to the client component
    const userProps = {
        user,
        isSuperAdmin,
        isProUser: isPro,
        unlockedPuzzleIds,
        hasSinglePurchaseCredit: singlePuzzleCredit.hasCredit,
        creditTransactionId: singlePuzzleCredit.transactionId,
        wishlist,
    };

  return (
    <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 capitalize">{formatCategoryName(decodedCategory)}</h1>
        <PuzzlesGrid category={decodedCategory} {...userProps} />
    </div>
  );
}
