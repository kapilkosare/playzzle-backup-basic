// src/app/api/puzzles/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type PuzzleImage = {
  src: string;
  category: string;
  filename: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!category) {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 });
  }

  try {
    const decodedCategory = decodeURIComponent(category);
    const categoryDir = path.join(process.cwd(), 'public', 'puzzles', decodedCategory);

    if (!fs.existsSync(categoryDir) || !fs.statSync(categoryDir).isDirectory()) {
      return NextResponse.json([]);
    }

    const imageFiles = fs.readdirSync(categoryDir).filter(file =>
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

    const images: PuzzleImage[] = imageFiles.map((file) => ({
      src: `/puzzles/${decodedCategory}/${file}`,
      category: decodedCategory,
      filename: file,
    }));
    
    return NextResponse.json(images);

  } catch (error) {
    console.error('API Error fetching puzzles:', error);
    return NextResponse.json({ error: 'Failed to fetch puzzles' }, { status: 500 });
  }
}
