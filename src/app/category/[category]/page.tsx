
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import ProPuzzleLink from '@/components/pro-puzzle-link';
import { getAuthenticatedUser } from '@/lib/firebase/server-auth';

type PuzzleImage = {
  src: string;
  category: string;
  filename: string;
  isPro: boolean;
};

const getPuzzlesForCategory = (category: string): PuzzleImage[] => {
  const decodedCategory = decodeURIComponent(category);
  const categoryDir = path.join(process.cwd(), 'public', 'puzzles', decodedCategory);
  
  try {
    if (!fs.statSync(categoryDir).isDirectory()) {
        return [];
    }

    const imageFiles = fs.readdirSync(categoryDir).filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );
    
    return imageFiles.map((file) => ({
      src: `/puzzles/${decodedCategory}/${file}`,
      category: decodedCategory,
      filename: file,
      isPro: file.toLowerCase().includes('_pro'),
    }));
  } catch (error) {
    return [];
  }
};

type CategoryPageProps = {
    params: {
        category: string;
    }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { category } = params;
    const images = getPuzzlesForCategory(category);
    const user = await getAuthenticatedUser();
    const isSuperAdmin = !!user?.customClaims?.superadmin;

    if (images.length === 0) {
        notFound();
    }

    const decodedCategory = decodeURIComponent(category);

  return (
    <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 capitalize">{decodedCategory}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image, index) => (
                 <Card key={index} className="overflow-hidden relative group">
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
                                className="object-cover transition-transform group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                data-ai-hint="puzzle nature"
                                />
                                <div className="absolute inset-0 bg-black/20 pointer-events-none">
                                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <pattern id="puzzle-pattern-category" patternUnits="userSpaceOnUse" width="100" height="100">
                                                <path d="M50 0 v20 a15 15 0 0 0 0 30 v20 a15 15 0 0 1 0 30 v20 M0 50 h20 a15 15 0 0 1 30 0 h20 a15 15 0 0 0 30 0 h20"
                                                    fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill="url(#puzzle-pattern-category)" />
                                    </svg>
                                </div>
                            </div>
                        </ProPuzzleLink>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}
