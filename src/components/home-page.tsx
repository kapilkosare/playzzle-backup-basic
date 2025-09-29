
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from './ui/button';
import { ArrowRight, Star } from 'lucide-react';
import ProPuzzleLink from './pro-puzzle-link';

type PuzzleImage = {
  src: string;
  category: string;
  filename: string;
  isPro: boolean;
};

type HomePageProps = {
  imagesByCategory: Record<string, PuzzleImage[]>;
  isSuperAdmin: boolean;
};

const INITIAL_CATEGORIES = 5;
const LOAD_MORE_COUNT = 2;

export default function HomePage({ imagesByCategory, isSuperAdmin }: HomePageProps) {
  const allCategories = Object.keys(imagesByCategory);
  const [visibleCategories, setVisibleCategories] = useState(
    allCategories.slice(0, INITIAL_CATEGORIES)
  );

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop < document.documentElement.offsetHeight - 500) {
      return;
    }
    
    if (visibleCategories.length < allCategories.length) {
      const nextIndex = visibleCategories.length;
      const newCategories = allCategories.slice(nextIndex, nextIndex + LOAD_MORE_COUNT);
      setVisibleCategories(prev => [...prev, ...newCategories]);
    }
  }, [visibleCategories.length, allCategories]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (allCategories.length === 0) {
    return (
        <div className="container mx-auto py-8 px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Welcome to Playzzle!</h1>
            <p className="text-muted-foreground">No puzzles found. Create a `public/puzzles` directory, add category folders, and place your images inside to get started.</p>
        </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {allCategories.map((category) => (
                  <li key={category}>
                    <Button variant="ghost" className="w-full justify-start capitalize" asChild>
                      <Link href={`/category/${category}`}>{category}</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3 space-y-8">
          {visibleCategories.map((category) => (
            <div key={category} id={category} className="scroll-mt-20 relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold capitalize">{category}</h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/category/${category}`}>
                        View More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                </div>
              </div>
              <Carousel
                opts={{
                  align: 'start',
                  loop: imagesByCategory[category].length > 5,
                }}
                className="w-full"
              >
                
                <CarouselContent>
                  {imagesByCategory[category].slice(0, 7).map((image, index) => (
                    <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/5">
                      <div className="p-1">
                        <div className="group relative">
                           <Card className="overflow-hidden">
                            {image.isPro && (
                                <div className="absolute top-2 right-2 z-10 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                    PRO
                                </div>
                            )}
                            <CardContent className="p-0">
                                <ProPuzzleLink image={image} isSuperAdmin={isSuperAdmin}>
                                  <div className="aspect-[3/4] relative">
                                      <Image
                                      src={image.src}
                                      alt={`Puzzle ${index + 1}`}
                                      fill
                                      className="object-cover transition-all"
                                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                      data-ai-hint="puzzle landscape"
                                      />
                                      <div className="absolute inset-0 bg-black/20 pointer-events-none">
                                          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                              <defs>
                                                  <pattern id="puzzle-pattern-home" patternUnits="userSpaceOnUse" width="100" height="100">
                                                      <path d="M50 0 v20 a15 15 0 0 0 0 30 v20 a15 15 0 0 1 0 30 v20 M0 50 h20 a15 15 0 0 1 30 0 h20 a15 15 0 0 0 30 0 h20"
                                                          fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                                                  </pattern>
                                              </defs>
                                              <rect width="100%" height="100%" fill="url(#puzzle-pattern-home)" />
                                          </svg>
                                      </div>
                                  </div>
                                </ProPuzzleLink>
                            </CardContent>
                            </Card>
                             <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-auto max-h-[400px] z-20 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                                <div className="bg-white p-2 rounded-md shadow-lg border">
                                    <div className="relative aspect-auto w-full h-full">
                                    <Image
                                        src={image.src}
                                        alt={`Puzzle Preview ${index + 1}`}
                                        fill
                                        className="object-contain"
                                        sizes="30vw"
                                    />
                                    </div>
                                </div>
                            </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute top-1/2 -left-4 -translate-y-1/2" />
                <CarouselNext className="absolute top-1/2 -right-4 -translate-y-1/2" />
              </Carousel>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
