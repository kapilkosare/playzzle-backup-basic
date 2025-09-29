
'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-center text-sm text-muted-foreground gap-x-2 gap-y-1">
          <p>&copy; {new Date().getFullYear()} Playzzle. All Rights Reserved.</p>
          <span className="hidden sm:inline mx-2">|</span>
          <Link href="/terms-of-service" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
           <span className="mx-2">|</span>
          <Link href="/privacy-policy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
           <span className="mx-2">|</span>
          <Link href="/shipping-policy" className="hover:text-primary transition-colors">
            Shipping Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
