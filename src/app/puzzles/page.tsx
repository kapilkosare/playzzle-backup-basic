
import HomePage from '@/components/home-page';
import { getAuthenticatedUser } from '@/lib/firebase/server-auth';
import { getUnlockedPuzzles, getUserProStatus, getSinglePuzzleCredit, getWishlist } from '../account/actions';
import { getCategories } from './actions';


export default async function PuzzlesPage() {
  const categories = await getCategories();
  const user = await getAuthenticatedUser();
  const isSuperAdmin = !!user?.customClaims?.superadmin;

  let isPro = false;
  let unlockedPuzzleIds: string[] = [];
  let singlePuzzleCredit: { hasCredit: boolean; transactionId: string | null } = { hasCredit: false, transactionId: null };
  let wishlist: string[] = [];

  if (user) {
    isPro = (await getUserProStatus(user.uid)).isPro;
    unlockedPuzzleIds = await getUnlockedPuzzles(user.uid);
    singlePuzzleCredit = await getSinglePuzzleCredit(user.uid);
    wishlist = await getWishlist(user.uid);
  }

  return (
    <HomePage 
        categories={categories} 
        isSuperAdmin={isSuperAdmin} 
        isProUser={isPro} 
        user={user} 
        unlockedPuzzleIds={unlockedPuzzleIds || []}
        hasSinglePurchaseCredit={singlePuzzleCredit.hasCredit}
        creditTransactionId={singlePuzzleCredit.transactionId}
        wishlist={wishlist}
    />
  );
}
