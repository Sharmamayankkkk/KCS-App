'use client';

import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneOff, Mic, Video, ShieldAlert } from 'lucide-react';

import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const AdminPanel = () => {
  const call = useCall();
  const router = useRouter();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // End Call Button States
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  // Mute Button States
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [controlOptions, setControlOptions] = useState({
    audio: true,
    video: true
  });
  const [showControls, setShowControls] = useState(false);

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

  // End Call Functions
  const handleOpenConfirm = () => {
    setConfirmOpen(true);
    setShowAdminPanel(false); // Close admin panel when opening dialog
  };

  const endCall = async () => {
    await call.endCall();
    router.push('/');
  };

  // Mute Functions
  const toggleControl = (type: 'audio' | 'video') => {
    setControlOptions(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const muteAllExceptHost = async () => {
    if (!call) {
      console.error('Call instance not found');
      return;
    }
    
    if (!controlOptions.audio && !controlOptions.video) {
      setStatusMessage('Please select at least one option to control');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }
    
    setIsProcessing(true);
    setStatusMessage('Controlling participants...');

    try {
      const localUserId = call.state.localParticipant?.userId;
      
      console.log('Host ID:', localUserId);
      console.log('Total participants:', Object.keys(participants).length);
      console.log('Controls:', controlOptions);
      
      let controlledCount = 0;
      let errorCount = 0;
      
      // Create an array of promises for all the mute operations
      for (const participant of Object.values(participants)) {
        // Skip the host (local user)
        if (participant.userId === localUserId) {
          console.log('Skipping host:', participant.userId);
          continue;
        }
        
        try {
          // Perform selected controls
          if (controlOptions.audio) {
            console.log('Attempting to mute audio:', participant.userId);
            await call.muteUser(participant.userId, 'audio');
          }
          
          if (controlOptions.video) {
            console.log('Attempting to disable video:', participant.userId);
            await call.muteUser(participant.userId, 'video');
          }
          
          controlledCount++;
          console.log('Successfully controlled:', participant.userId);
        } catch (error) {
          errorCount++;
          console.error(`Failed to control ${participant.userId}:`, error);
        }
      }
      
      const controlsApplied = [];
      if (controlOptions.audio) controlsApplied.push('audio');
      if (controlOptions.video) controlsApplied.push('video');
      
      setStatusMessage(`Applied to ${controlledCount} participants. Errors: ${errorCount}`);
      setTimeout(() => setStatusMessage(''), 3000); // Clear status after 3 seconds
      
    } catch (error) {
      console.error('Error in control operation:', error);
      setStatusMessage('Failed to control participants');
      setTimeout(() => setStatusMessage(''), 3000);
    } finally {
      setIsProcessing(false);
      setShowControls(false); // Hide controls after operation
    }
  };

  return (
    <>
      <div className="relative">
        {/* Main Admin Panel Button */}
        <button
          onClick={() => setShowAdminPanel(!showAdminPanel)}
          className="flex items-center justify-center rounded-lg bg-indigo-600 p-2 transition-all hover:bg-indigo-700 active:scale-95"
        >
          <ShieldAlert className="size-5 text-white" />
        </button>

        {/* Admin Panel Dropdown */}
        {showAdminPanel && (
          <div className="absolute bottom-full z-50 mb-2 w-80 rounded-lg border border-gray-700 bg-black p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Admin Panel</h3>
              <button
                onClick={() => setShowAdminPanel(false)}
                className="text-gray-400 transition-colors hover:text-white"
              >
                ×
              </button>
            </div>
            
            {/* End Call Section */}
            <div className="mb-6">
              <h4 className="mb-3 text-sm font-medium text-white">Call Management</h4>
              <Button 
                onClick={handleOpenConfirm} 
                className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 font-medium shadow-md transition-colors duration-300 hover:bg-red-700"
                size="sm"
              >
                <PhoneOff className="size-4" />
                <span>End Call</span>
              </Button>
            </div>

            {/* Participant Controls Section */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-medium text-white">Participant Controls</h4>
                <button
                  onClick={() => setShowControls(!showControls)}
                  className="text-sm text-indigo-400 transition-colors hover:text-indigo-300"
                >
                  {showControls ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showControls && (
                <div className="mb-3 space-y-3">
                  <div className="flex items-center justify-between rounded-md bg-gray-800/70 px-2 py-1.5">
                    <div className="flex items-center text-white">
                      <Mic className="mr-2 size-4" />
                      <span className="text-sm">Mute Audio</span>
                    </div>
                    <button
                      onClick={() => toggleControl('audio')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${controlOptions.audio ? 'bg-indigo-600' : 'bg-gray-600'}`}
                    >
                      <span
                        className={`inline-block size-3.5 rounded-full bg-white transition-transform${controlOptions.audio ? 'translate-x-4' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-md bg-gray-800/70 px-2 py-1.5">
                    <div className="flex items-center text-white">
                      <Video className="mr-2 size-4" />
                      <span className="text-sm">Disable Video</span>
                    </div>
                    <button
                      onClick={() => toggleControl('video')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${controlOptions.video ? 'bg-indigo-600' : 'bg-gray-600'}`}
                    >
                      <span
                        className={`inline-block size-3.5 rounded-full bg-white transition-transform${controlOptions.video ? 'translate-x-4' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                </div>
              )}
              
              <button
                onClick={muteAllExceptHost}
                disabled={isProcessing || !showControls}
                className="flex w-full items-center justify-center rounded-md bg-red-600 px-2 py-1.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
              >
                {isProcessing ? (
                  <>
                    <svg className="-ml-1 mr-2 size-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Apply to All Participants'
                )}
              </button>
              
              {statusMessage && (
                <div className="mt-2 w-full rounded-md bg-gray-800/80 px-2 py-1.5 text-center text-xs text-white">
                  {statusMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* End Call Confirmation Dialog */}
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
              className="border border-gray-300 transition-colors hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button 
              onClick={endCall}
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

export default AdminPanel;