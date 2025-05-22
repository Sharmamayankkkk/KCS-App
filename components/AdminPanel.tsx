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
          className="flex items-center justify-center p-2 transition-all bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95"
        >
          <ShieldAlert className="text-white size-5" />
        </button>

        {/* Admin Panel Dropdown */}
        {showAdminPanel && (
          <div className="absolute bottom-full mb-2 bg-black border border-gray-700 rounded-lg p-4 w-80 shadow-lg z-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium text-lg">Admin Panel</h3>
              <button
                onClick={() => setShowAdminPanel(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            
            {/* End Call Section */}
            <div className="mb-6">
              <h4 className="text-white font-medium text-sm mb-3">Call Management</h4>
              <Button 
                onClick={handleOpenConfirm} 
                className="w-full bg-red-600 hover:bg-red-700 transition-colors duration-300 rounded-full px-4 py-2 font-medium flex items-center justify-center gap-2 shadow-md"
                size="sm"
              >
                <PhoneOff className="h-4 w-4" />
                <span>End Call</span>
              </Button>
            </div>

            {/* Participant Controls Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-white font-medium text-sm">Participant Controls</h4>
                <button
                  onClick={() => setShowControls(!showControls)}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                >
                  {showControls ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showControls && (
                <div className="space-y-3 mb-3">
                  <div className="flex items-center justify-between py-1.5 px-2 rounded-md bg-gray-800/70">
                    <div className="flex items-center text-white">
                      <Mic className="mr-2 size-4" />
                      <span className="text-sm">Mute Audio</span>
                    </div>
                    <button
                      onClick={() => toggleControl('audio')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${controlOptions.audio ? 'bg-indigo-600' : 'bg-gray-600'}`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${controlOptions.audio ? 'translate-x-4' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-1.5 px-2 rounded-md bg-gray-800/70">
                    <div className="flex items-center text-white">
                      <Video className="mr-2 size-4" />
                      <span className="text-sm">Disable Video</span>
                    </div>
                    <button
                      onClick={() => toggleControl('video')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${controlOptions.video ? 'bg-indigo-600' : 'bg-gray-600'}`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${controlOptions.video ? 'translate-x-4' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                </div>
              )}
              
              <button
                onClick={muteAllExceptHost}
                disabled={isProcessing || !showControls}
                className="w-full py-1.5 px-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                <div className="mt-2 text-xs text-white bg-gray-800/80 px-2 py-1.5 rounded-md w-full text-center">
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
              className="border border-gray-300 hover:bg-gray-100 transition-colors"
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

export default AdminPanel;