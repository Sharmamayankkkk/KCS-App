'use client';

import { useCall } from '@stream-io/video-react-sdk';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { endCallForAllParticipants } from '@/actions/attendance.actions';
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

  const handleEndCall = async () => {
    if (!call) return;

    try {
      await endCallForAllParticipants(call.id);
      await call.endCall();
      router.push('/');
    } catch (error) {
      console.error('Failed to end the call for everyone:', error);
      alert('Error: Could not end the call for everyone.');
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setConfirmOpen(true)}
        style={{
          width: '100%',
          padding: '12px 24px',
          backgroundColor: '#A41F13',
          color: '#FAF5F1',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}
      >
        End Call for Everyone
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">End Call for Everyone?</DialogTitle>
            <DialogDescription>
              This action will end the meeting for all participants and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="border border-gray-300 transition-colors hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEndCall}
              className="bg-red-600 transition-colors hover:bg-red-700 focus:ring-red-500"
            >
              End Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};