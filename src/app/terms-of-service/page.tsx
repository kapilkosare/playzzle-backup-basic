'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export default function TermsOfServicePage() {
  const [lastUpdatedDate, setLastUpdatedDate] = useState('');

  useEffect(() => {
    setLastUpdatedDate(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            <strong>Last Updated:</strong> {lastUpdatedDate}
          </p>
          <p>
            Welcome to Piczzle! By using our application, you agree to these Terms of Service. Please read them carefully.
          </p>
          <h2 className="text-xl font-semibold text-foreground pt-4">1. User-Uploaded Content</h2>
          <p>
            Our service allows you to upload your own images to create puzzles. You are solely responsible for the content you upload.
          </p>
          <p>
            By uploading an image, you represent and warrant that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You are the creator and owner of the image, or you have the necessary licenses, rights, consents, and permissions to use and to authorize us to use your image in the manner contemplated by the service.</li>
            <li>Your image does not and will not infringe, violate, or misappropriate any third-party right, including any copyright, trademark, patent, trade secret, moral right, privacy right, right of publicity, or any other intellectual property or proprietary right.</li>
            <li>Your image does not contain any content that is defamatory, libelous, obscene, pornographic, harassing, threatening, or otherwise unlawful.</li>
          </ul>
          <h2 className="text-xl font-semibold text-foreground pt-4">2. License Grant to Us</h2>
          <p>
            By uploading an image, you grant Piczzle a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of (such as puzzle pieces), and display the image solely in connection with the service provided by the application and for the purpose of generating a puzzle for you. This license is only for the purpose of operating and providing the service. We do not claim ownership of your content. The license ends when you close your session.
          </p>
          <h2 className="text-xl font-semibold text-foreground pt-4">3. Disclaimer</h2>
          <p>
            Piczzle is a tool provided for entertainment purposes. We are not responsible for the content uploaded by users. We reserve the right to remove any content that we believe violates these terms, but we are not obligated to do so.
          </p>
          <h2 className="text-xl font-semibold text-foreground pt-4">4. Changes to Terms</h2>
          <p>
            We may modify these terms at any time. We will notify you of any changes by posting the new Terms of Service on this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
