'use client';

import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneOff } from 'lucide-react';

import { Button } from './ui/button';
// If you're using shadcn/ui, you might need to install the alert-dialog component
// Let's create our own simple dialog implementation using state instead
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!call)
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );

  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) return null;

  const handleOpenConfirm = () => {
    setConfirmOpen(true);
  };

  const endCall = async () => {
    await call.endCall();
    router.push('/');
  };

  return (
    <>
      <Button 
        onClick={handleOpenConfirm} 
        className="bg-red-600 hover:bg-red-700 transition-colors duration-300 rounded-full px-4 py-2 font-medium flex items-center gap-2 shadow-md"
        size="sm"
      >
        <PhoneOff className="h-4 w-4" />
        <span>End Call</span>
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">End Call for Everyone?</DialogTitle>
            <DialogDescription>
              This will end the call for all participants. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setConfirmOpen(false)}
              className="border border-border hover:bg-background transition-colors"
            >
              Cancel
            </Button>
            <Button 
              onClick={endCall}
              className="bg-red-600 hover:bg-red-700 transition-colors focus:ring-red-500"
            >
              End Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EndCallButton;