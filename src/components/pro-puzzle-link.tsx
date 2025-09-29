
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from './ui/button';
import { Star } from 'lucide-react';

type PuzzleImage = {
  src: string;
  category: string;
  filename: string;
  isPro: boolean;
};

type ProPuzzleLinkProps = {
  image: PuzzleImage;
  isSuperAdmin: boolean;
  children: React.ReactNode;
};

export default function ProPuzzleLink({ image, isSuperAdmin, children }: ProPuzzleLinkProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (image.isPro && !isSuperAdmin) {
      e.preventDefault();
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <Link
        href={`/play/${image.category}/${encodeURIComponent(image.filename)}`}
        onClick={handleClick}
      >
        {children}
      </Link>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <Star className="text-amber-400" />
                Pro Puzzle
            </AlertDialogTitle>
            <AlertDialogDescription>
              This is a premium puzzle exclusive for our pro members. Please upgrade your membership to play.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* We can add a link to the membership page here in the future */}
            {/* <AlertDialogAction asChild>
                <Link href="/membership">Upgrade to Pro</Link>
            </AlertDialogAction> */}
            <AlertDialogAction onClick={() => setIsDialogOpen(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
