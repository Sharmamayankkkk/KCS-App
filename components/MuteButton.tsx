'use client';
import React, { useState } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { Mic, Video, ShieldAlert } from 'lucide-react';

const MuteButton = () => {
  const call = useCall(); // Get the current call instance
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [controlOptions, setControlOptions] = useState({
    audio: true,
    video: true
  });
  const [showControls, setShowControls] = useState(false);

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
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="flex items-center justify-center rounded-lg bg-indigo-600 p-2 transition-all hover:bg-indigo-700 active:scale-95"
      >
        <ShieldAlert className="size-5 text-white" />
      </button>

      {/* Expanded Controls Panel */}
      {showControls && (
        <div className="absolute bottom-full z-50 mb-2 w-64 rounded-lg border border-gray-700 bg-gray-900/95 p-3 shadow-lg backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Participant Controls</h3>
          </div>
          
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
          
          <button
            onClick={muteAllExceptHost}
            disabled={isProcessing}
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
      )}
    </div>
  );
};

export default MuteButton;