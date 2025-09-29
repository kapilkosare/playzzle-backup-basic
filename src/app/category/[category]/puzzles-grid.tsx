
'use client';

import React, { useState, useEffect } from 'react';
import PuzzleCard from '@/components/puzzle-card';
import type { AuthenticatedUser } from '@/lib/firebase/server-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

type PuzzleImage = {
  src: string;
  category: string;
  filename: string;
  isPro: boolean;
};

type PuzzlesGridProps = {
  category: string;
  isSuperAdmin: boolean;
  isProUser: boolean;
  unlockedPuzzleIds: string[];
  user: AuthenticatedUser | null;
  hasSinglePurchaseCredit: boolean;
  creditTransactionId: string | null;
  wishlist: string[];
};

function PuzzleGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="space-y-2">
                    <Skeleton className="h-[250px] w-full" />
                </div>
            ))}
        </div>
    );
}


export function PuzzlesGrid({ category, ...userProps }: PuzzlesGridProps) {
    const [puzzles, setPuzzles] = useState<PuzzleImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPuzzles = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/puzzles?category=${encodeURIComponent(category)}`);
                const data = await response.json();
                setPuzzles(data);
            } catch (error) {
                console.error("Failed to fetch puzzles:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPuzzles();
    }, [category]);
    
    if (isLoading) {
        return <PuzzleGridSkeleton />;
    }
    
    if (puzzles.length === 0) {
        return <p className="text-muted-foreground">No puzzles found in this category.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {puzzles.map((image) => (
                <PuzzleCard
                    key={image.filename}
                    image={image}
                    {...userProps}
                />
            ))}
        </div>
    );
}
