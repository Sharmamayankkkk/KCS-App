'use client';

import { useState } from 'react';
import { useCall } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';
import { PhoneOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleOpenConfirm = () => {
    setConfirmOpen(true);
  };

  const endCall = async () => {
    if (call) {
      await call.endCall();
    }
    router.push('/');
  };

  return (
    <>
      <div>
        <h4 style={{ color: '#E0DBD8', fontWeight: '500', fontSize: '0.875rem', marginBottom: '12px' }}>Call Management</h4>
        <Button
          onClick={handleOpenConfirm}
          style={{
            width: '100%',
            backgroundColor: '#A41F13', // Primary Action/Danger Color
            color: '#FAF5F1', // Primary Text
            borderRadius: '8px', // Slightly less rounded than full circle
            padding: '12px 16px', // Larger padding
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(164, 31, 19, 0.5)', // Enhanced shadow
            transition: 'all 0.2s',
            fontSize: '1rem',
          }}
        >
          <PhoneOff style={{ height: '20px', width: '20px' }} />
          <span>End Call for Everyone</span>
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          style={{
            maxWidth: '448px',
            backgroundColor: '#292F36', // Primary Background
            color: '#FAF5F1', // Primary Text
            border: '1px solid #8F7A6E', // Secondary Border
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: '#A41F13', fontWeight: '700', fontSize: '1.5rem' }}>End Call for Everyone?</DialogTitle>
            <DialogDescription style={{ color: '#E0DBD8', marginTop: '8px' }}>
              This will end the call for all participants. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              style={{
                flex: 1,
                borderColor: '#8F7A6E', // Secondary Border
                color: '#E0DBD8', // Secondary Text
                backgroundColor: 'transparent',
                fontWeight: '600',
                padding: '10px 16px',
                borderRadius: '8px',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={endCall}
              style={{
                flex: 1,
                backgroundColor: '#A41F13', // Primary Action/Danger Color
                color: '#FAF5F1',
                fontWeight: '600',
                padding: '10px 16px',
                borderRadius: '8px',
              }}
            >
              Confirm End Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};