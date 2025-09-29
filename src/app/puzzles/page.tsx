
import HomePage from '@/components/home-page';
import { getAuthenticatedUser } from '@/lib/firebase/server-auth';
import fs from 'fs';
import path from 'path';

type PuzzleImage = {
  src: string;
  category: string;
  filename: string;
  isPro: boolean;
};

const getPuzzles = (): Record<string, PuzzleImage[]> => {
  const puzzlesDir = path.join(process.cwd(), 'public', 'puzzles');
  try {
    const categories = fs.readdirSync(puzzlesDir).filter((file) => 
      fs.statSync(path.join(puzzlesDir, file)).isDirectory()
    );

    const imagesByCategory: Record<string, PuzzleImage[]> = {};
    categories.forEach((category) => {
      const categoryDir = path.join(puzzlesDir, category);
      const imageFiles = fs.readdirSync(categoryDir).filter(file => 
        /\.(jpg|jpeg|png|webp)$/i.test(file)
      );
      imagesByCategory[category] = imageFiles.map((file) => ({
        src: `/puzzles/${category}/${file}`,
        category,
        filename: file,
        isPro: file.toLowerCase().includes('_pro'),
      }));
    });

    return imagesByCategory;
  } catch (error) {
    // If the directory doesn't exist, return empty
    return {};
  }
};


export default async function PuzzlesPage() {
  const imagesByCategory = getPuzzles();
  const user = await getAuthenticatedUser();
  const isSuperAdmin = !!user?.customClaims?.superadmin;
  return <HomePage imagesByCategory={imagesByCategory} isSuperAdmin={isSuperAdmin} />;
}
