
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  const [lastUpdatedDate, setLastUpdatedDate] = useState('');

  useEffect(() => {
    // This will run only on the client, avoiding hydration mismatches.
    setLastUpdatedDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            <strong>Last Updated:</strong> {lastUpdatedDate || 'Loading...'}
          </p>
          <p>
            Welcome to Piczzle! These Terms of Service ("Terms") govern your use of our website and services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">1. Accounts</h2>
          <p>
            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">2. Subscriptions and Purchases</h2>
          <p>
            Some parts of the Service are billed on a subscription basis ("Subscription(s)") or as a one-time purchase. You will be billed in advance on a recurring and periodic basis for Subscriptions (e.g., monthly or yearly) or at the time of purchase for one-time credits.
          </p>
          <p>
            All payments are handled by our third-party payment processor, Razorpay. We do not store your payment card details.
          </p>
          <p>
            <strong>Cancellations:</strong> You may cancel your Subscription at any time through your account page. You will continue to have access to the Service through the end of your billing period.
          </p>
           <p>
            <strong>Refunds:</strong> All purchases are final and non-refundable. If you believe there has been an error in billing, please contact us through our <Link href="/contact" className="text-primary hover:underline">Contact Page</Link>. Refunds are processed on a case-by-case basis at our sole discretion.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">3. User-Uploaded Images</h2>
          <p>
            Our Service allows you to upload your own images to create puzzles for personal use. By uploading an image, you represent and warrant that you own the content or have the right to use it. You are solely responsible for the content you upload. You may not upload content that is illegal, offensive, or infringes on the rights of others. We reserve the right to remove content and/or terminate accounts for any violation.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">4. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Piczzle. Our puzzles, branding, and all related assets are protected by copyright and trademark laws.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">5. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">6. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms of Service on this page.
          </p>
           <h2 className="text-xl font-semibold text-foreground pt-4">7. Contact Us</h2>
           <p>
            If you have any questions about these Terms, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
           </p>
        </CardContent>
      </Card>
    </div>
  );
}
