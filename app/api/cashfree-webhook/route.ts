import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

// Verify Cashfree webhook signature
function verifyWebhookSignature(payload: any, signature: string) {
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  if (!secretKey) return false;

  const computedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(JSON.stringify(payload))
    .digest('hex');

  return computedSignature === signature;
}

export async function POST(request: Request) {
  try {
    // Get the signature from headers
    const signature = request.headers.get('x-webhook-signature');

    if (!signature) {
      return NextResponse.json(
        { message: 'Missing signature' },
        { status: 400 },
      );
    }

    // Parse the webhook payload
    const payload = await request.json();

    // Verify the signature
    const isValid = verifyWebhookSignature(payload, signature);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 },
      );
    }

    // Process the webhook based on event type
    const { event, data } = payload;

    if (event === 'ORDER_PAID' || event === 'PAYMENT_SUCCESS') {
      // Update the superchat payment status
      const { error } = await supabase
        .from('superchats')
        .update({ payment_status: 'completed' })
        .eq('order_reference', data.order.order_id);

      if (error) {
        console.error('Error updating superchat payment status:', error);
        return NextResponse.json(
          { message: 'Database error' },
          { status: 500 },
        );
      }
    } else if (event === 'PAYMENT_FAILED' || event === 'ORDER_FAILED') {
      // Update the superchat payment status
      const { error } = await supabase
        .from('superchats')
        .update({ payment_status: 'failed' })
        .eq('order_reference', data.order.order_id);

      if (error) {
        console.error('Error updating superchat payment status:', error);
        return NextResponse.json(
          { message: 'Database error' },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { message: 'Webhook processing error: ' + error.message },
      { status: 500 },
    );
  }
}
