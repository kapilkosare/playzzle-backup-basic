
// src/app/shipping-policy/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export default function ShippingPolicyPage() {
  const [lastUpdatedDate, setLastUpdatedDate] = useState('');

  useEffect(() => {
    // This will run only on the client, avoiding hydration mismatches.
    setLastUpdatedDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Shipping & Delivery Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            <strong>Last Updated:</strong> {lastUpdatedDate || 'Loading...'}
          </p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">Digital Product Delivery</h2>
          <p>
            All products and services sold on Piczzle are digital and delivered electronically. There are no physical goods to ship, and therefore, no shipping charges.
          </p>
          <p>
            Upon successful completion of your purchase, your digital goods will be available instantly:
          </p>
           <ul className="list-disc pl-6 space-y-2">
                <li>
                    <strong>Pro Memberships:</strong> Your account will be upgraded to "Pro" status immediately, granting you access to all Pro features and puzzles for the duration of your subscription period.
                </li>
                <li>
                    <strong>Single Puzzle Credits:</strong> A credit will be added to your account instantly. You can then use this credit to unlock any single "Pro" puzzle of your choice from the puzzle gallery. The puzzle will be permanently unlocked on your account.
                </li>
           </ul>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">Confirmation</h2>
          <p>
            You will receive a confirmation email from us and a payment confirmation from our payment processor, Razorpay, shortly after your transaction is complete. You can also view your transaction history and unlocked content in your account dashboard.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">Contact Us</h2>
          <p>
            If you experience any issues with accessing your digital purchase after payment, please contact us immediately through our Contact page, and we will be happy to assist you.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
