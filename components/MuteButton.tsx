'use client';
import React, { useState } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';

const MuteButton: React.FC = () => {
  const call = useCall(); // Get the current call instance
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [controlOptions, setControlOptions] = useState({
    audio: true,
    video: true
  });

  const toggleControl = (type) => {
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
      
      setStatusMessage(`Controlled ${controlsApplied.join(' & ')} for ${controlledCount} participants. Errors: ${errorCount}`);
      setTimeout(() => setStatusMessage(''), 3000); // Clear status after 3 seconds
      
    } catch (error) {
      console.error('Error in control operation:', error);
      setStatusMessage('Failed to control participants');
      setTimeout(() => setStatusMessage(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-2 mb-2">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={controlOptions.audio}
            onChange={() => toggleControl('audio')}
            className="mr-1"
          />
          <span className="text-sm">Audio</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={controlOptions.video}
            onChange={() => toggleControl('video')}
            className="mr-1"
          />
          <span className="text-sm">Video</span>
        </label>
      </div>
      <button
        onClick={muteAllExceptHost}
        className="bg-red-500 px-4 py-2 rounded-lg text-white disabled:bg-red-300"
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Control All Except Host'}
      </button>
      {statusMessage && (
        <div className="text-xs mt-1 text-white bg-gray-800 px-2 py-1 rounded">
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default MuteButton;
