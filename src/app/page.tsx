
import { Button } from '@/components/ui/button';
import { getAuthenticatedUser } from '@/lib/firebase/server-auth';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { LogoIcon } from '@/components/icons/logo';
import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

type PuzzleImage = {
  src: string;
  category: string;
  filename: string;
};

// Function to get a few random puzzles to display on the home page
const getRandomPuzzles = (count: number): PuzzleImage[] => {
    const puzzlesDir = path.join(process.cwd(), 'public', 'puzzles');
    const allPuzzles: PuzzleImage[] = [];

    try {
        const categories = fs.readdirSync(puzzlesDir).filter((file) =>
            fs.statSync(path.join(puzzlesDir, file)).isDirectory()
        );

        categories.forEach((category) => {
            const categoryDir = path.join(puzzlesDir, category);
            const imageFiles = fs.readdirSync(categoryDir).filter(file =>
                /\.(jpg|jpeg|png|webp)$/i.test(file) && !file.toLowerCase().includes('_pro')
            );
            imageFiles.forEach((file) => {
                allPuzzles.push({
                    src: `/puzzles/${category}/${file}`,
                    category,
                    filename: file,
                });
            });
        });

        // Shuffle the array and pick the first 'count' items
        const shuffled = allPuzzles.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);

    } catch (error) {
        console.error("Could not read puzzles directory:", error);
        return [];
    }
};


export default async function WelcomePage() {
    const user = await getAuthenticatedUser();
    const randomPuzzles = getRandomPuzzles(6);

    // Define positions for the cards
    const cardPositions = [
        // Left side
        { top: '15%', left: '5%', rotation: '-8deg', duration: '12s' },
        { bottom: '10%', left: '7%', rotation: '10deg', duration: '10s', delay: '2s'},
        { top: '30%', left: '20%', rotation: '3deg', duration: '14s', delay: '4s' },
        // Right side
        { top: '15%', right: '10%', rotation: '5deg', duration: '15s', delay: '1s' },
        { bottom: '10%', right: '20%', rotation: '-3deg', duration: '18s', delay: '3s' },
        { top: '55%', right: '5%', rotation: '8deg', duration: '16s', delay: '5s' },
    ];


    return (
        <div className="dotted-background relative flex flex-col items-center justify-center text-center py-24 px-4 h-full overflow-hidden">
            {/* Background animated puzzle cards */}
            <div className="absolute inset-0 w-full h-full z-0">
                {randomPuzzles.map((puzzle, index) => (
                    <div
                        key={puzzle.src}
                        className="absolute hidden md:block"
                        style={{
                            ...cardPositions[index % cardPositions.length],
                            animation: `float ${cardPositions[index % cardPositions.length].duration} ease-in-out infinite`,
                            animationDelay: cardPositions[index % cardPositions.length].delay,
                        }}
                    >
                        <Link href={`/play/${puzzle.category}/${encodeURIComponent(puzzle.filename)}`}>
                            <Card className="overflow-hidden shadow-2xl hover:scale-110 transition-transform duration-300">
                                <CardContent className="p-0">
                                     <div className="relative" style={{ width: '150px', height: '200px' }}>
                                        <Image
                                            src={puzzle.src}
                                            alt={`Puzzle thumbnail ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="150px"
                                        />
                                        <div className="absolute inset-0 bg-black/20 pointer-events-none">
                                            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                                <defs>
                                                    <pattern id="puzzle-pattern-welcome" patternUnits="userSpaceOnUse" width="100" height="100">
                                                        <path d="M50 0 v20 a15 15 0 0 0 0 30 v20 a15 15 0 0 1 0 30 v20 M0 50 h20 a15 15 0 0 1 30 0 h20 a15 15 0 0 0 30 0 h20"
                                                            fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                                                    </pattern>
                                                </defs>
                                                <rect width="100%" height="100%" fill="url(#puzzle-pattern-welcome)" />
                                            </svg>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                ))}
            </div>


            <div className="relative z-10 bg-background/50 backdrop-blur-sm p-8 rounded-lg">
                <div className="mb-8">
                    <LogoIcon className="w-24 h-24 mx-auto text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Playzzle!</h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                    The ultimate destination to create and solve beautiful jigsaw puzzles from any image.
                    Challenge your mind, relax, and have fun.
                </p>
                <div>
                    {user ? (
                        <Button asChild size="lg">
                            <Link href="/puzzles">
                                Explore Puzzles <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg">
                                <Link href="/login">
                                    Get Started <ArrowRight className="ml-2" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href="/signup">
                                    Sign Up
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
