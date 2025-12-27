'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failure'>(
    'loading',
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const paymentStatus = searchParams.get('payment_status');

    console.log('Order ID:', orderId);
    console.log('Payment Status:', paymentStatus);

    if (!orderId) {
      setStatus('failure');
      setMessage('Invalid payment response. Missing order information.');
      return;
    }

    // In a real implementation, you would verify the payment status with your backend
    if (paymentStatus === 'SUCCESS') {
      setStatus('success');
      setMessage('Your payment was successful! Your Superchat has been sent.');
    } else {
      setStatus('failure');
      setMessage('Payment failed or was cancelled. Please try again.');
    }
  }, [searchParams]);

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: '#292F36' }}
    >
      <div
        className="w-full max-w-md rounded-lg p-8 shadow-lg"
        style={{ backgroundColor: '#FAF5F1' }}
      >
        {status === 'loading' && (
          <div className="text-center">
            <Loader2
              className="mx-auto mb-4 size-16 animate-spin"
              style={{ color: '#A41F13' }}
            />
            <h2 className="mb-2 text-xl font-bold" style={{ color: '#292F36' }}>
              Processing Payment
            </h2>
            <p style={{ color: '#8F7A6E' }}>
              Please wait while we verify your payment...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle
              className="mx-auto mb-4 size-16"
              style={{ color: '#8F7A6E' }}
            />
            <h2 className="mb-2 text-xl font-bold" style={{ color: '#292F36' }}>
              Payment Successful!
            </h2>
            <p className="mb-6" style={{ color: '#8F7A6E' }}>
              {message}
            </p>
            <Button
              onClick={() => router.push('/')}
              style={{ backgroundColor: '#8F7A6E', color: '#FAF5F1' }}
            >
              Return to Call
            </Button>
          </div>
        )}

        {status === 'failure' && (
          <div className="text-center">
            <XCircle
              className="mx-auto mb-4 size-16"
              style={{ color: '#A41F13' }}
            />
            <h2 className="mb-2 text-xl font-bold" style={{ color: '#292F36' }}>
              Payment Failed
            </h2>
            <p className="mb-6" style={{ color: '#8F7A6E' }}>
              {message}
            </p>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="mr-2"
              style={{ borderColor: '#A41F13', color: '#A41F13' }}
            >
              Return to Call
            </Button>
            <Button
              onClick={() => router.push('/')}
              style={{ backgroundColor: '#A41F13', color: '#FAF5F1' }}
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
