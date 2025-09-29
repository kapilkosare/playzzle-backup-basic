
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Navigation from '@/components/navigation';
import { ThemeProvider } from '@/components/theme-provider';
import Footer from '@/components/footer';
import { Inter } from 'next/font/google';
import { getAuthenticatedUser } from '@/lib/firebase/server-auth';
import { getUserProStatus } from '@/app/account/actions';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Piczzle',
  description: 'Create and solve puzzles from your favorite images.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthenticatedUser();
  let isPro = false;
  const isSuperAdmin = !!user?.customClaims?.superadmin;

  if (user) {
    isPro = (await getUserProStatus(user.uid)).isPro;
  }

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-sans antialiased h-full`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col h-full">
            <Navigation user={user} isPro={isPro} isSuperAdmin={isSuperAdmin} />
            <main className="flex-grow bg-background">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
