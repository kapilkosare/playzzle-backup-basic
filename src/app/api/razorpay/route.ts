
// src/app/api/razorpay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getAuthenticatedUser } from '@/lib/firebase/server-auth';

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('Razorpay API keys are not set in the environment variables.');
    return NextResponse.json({ error: 'Server configuration error: Razorpay API keys are missing.' }, { status: 500 });
  }
  
  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    
    const { amount, planId, puzzleId } = await request.json();

    if (!amount || !planId) {
      return NextResponse.json({ error: 'Amount and Plan ID are required' }, { status: 400 });
    }

    const options = {
      amount, // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: `rcpt_${user.uid.slice(0, 8)}_${Date.now()}`, // Shortened receipt
      notes: {
        userId: user.uid,
        userEmail: user.email,
        planId: planId,
        puzzleId: puzzleId || 'N/A',
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    // Send back a more specific error message to the client
    const errorMessage = error?.error?.description || 'Failed to create Razorpay order. Please check server logs and API keys.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
