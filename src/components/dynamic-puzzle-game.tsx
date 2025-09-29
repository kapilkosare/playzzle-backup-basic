
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff, Puzzle, TimerIcon, ArrowLeft, Smartphone } from 'lucide-react';
import PiczzleGame from '@/components/piczzle-game';
import JigsawGame from '@/components/jigsaw-game';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';

type PuzzleType = 'slide' | 'jigsaw';

type DynamicPuzzleGameProps = {
  imageSrc: string;
  slug: string;
  imageFilename: string;
};

export default function DynamicPuzzleGame({ imageSrc, slug, imageFilename }: DynamicPuzzleGameProps) {
  const [puzzleType, setPuzzleType] = useState<PuzzleType>('jigsaw');
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [gameStats, setGameStats] = useState({ moves: 0, time: '00:00' });
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-muted/20 dark:bg-transparent">
        <Smartphone className="w-20 h-20 mb-6 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Game Not Supported on Mobile</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          For the best experience, please play this puzzle game on a desktop or tablet device.
        </p>
        <Button asChild>
          <Link href="/puzzles">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Puzzles
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-muted/20 dark:bg-transparent">
      <div className="w-full mx-auto flex flex-col h-full">
        <Card className="bg-transparent border-0 shadow-none rounded-none">
            <CardHeader className="flex flex-row items-center justify-between p-4 w-full gap-4">
                <div className="flex items-center gap-4">
                     <Button variant="outline" size="icon" asChild>
                        <Link href="/puzzles">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="sr-only">Back to puzzles</span>
                        </Link>
                    </Button>
                    <div className="flex-shrink-0">
                        <CardTitle className="text-xl">Play Puzzle</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Select your game type</CardDescription>
                    </div>
                </div>
                <div className="flex-grow flex justify-center items-center gap-4 sm:gap-6">
                     <div className="flex items-center gap-2">
                        <Label htmlFor="puzzle-type" className="sr-only sm:not-sr-only text-sm">Game</Label>
                        <Select value={puzzleType} onValueChange={(value: PuzzleType) => setPuzzleType(value)}>
                            <SelectTrigger id="puzzle-type" className="w-auto sm:w-[140px] h-9">
                                <SelectValue placeholder="Select a puzzle type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="slide">Slide Puzzle</SelectItem>
                                <SelectItem value="jigsaw">Jigsaw</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-1.5">
                           <Puzzle className="w-4 h-4 text-muted-foreground" />
                           <span>Moves: {gameStats.moves}</span>
                        </div>
                         <div className="flex items-center gap-1.5">
                           <TimerIcon className="w-4 h-4 text-muted-foreground" />
                           <span>Time: {gameStats.time}</span>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0">
                     <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10"
                        onClick={() => setIsPreviewVisible(v => !v)}
                        >
                        {isPreviewVisible ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    </Button>
                </div>
            </CardHeader>
        </Card>

        <div className="w-full flex-grow flex flex-col">
            {puzzleType === 'slide' && imageSrc && (
                <PiczzleGame 
                    imageSrcFromHome={imageSrc} 
                    isPreviewVisibleFromHome={isPreviewVisible}
                    onStatsChange={setGameStats}
                    slug={slug}
                    imageFilename={imageFilename}
                />
            )}
            {puzzleType === 'jigsaw' && imageSrc && (
                <JigsawGame 
                    imageSrcFromHome={imageSrc} 
                    isPreviewVisibleFromHome={isPreviewVisible}
                    onStatsChange={setGameStats}
                    slug={slug}
                    imageFilename={imageFilename}
                />
            )}
        </div>
      </div>
    </div>
  );
}
