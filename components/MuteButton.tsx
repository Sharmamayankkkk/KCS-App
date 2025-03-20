'use client';
import React, { useState } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';

const MuteButton: React.FC = () => {
  const call = useCall(); // Get the current call instance
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [isMuting, setIsMuting] = useState(false);
  const [muteStatus, setMuteStatus] = useState('');

  const muteAllExceptHost = async () => {
    if (!call) {
      console.error('Call instance not found');
      return;
    }
    
    setIsMuting(true);
    setMuteStatus('Muting participants...');

    try {
      const localUserId = call.state.localParticipant?.userId;
      
      console.log('Host ID:', localUserId);
      console.log('Total participants:', Object.keys(participants).length);
      
      let mutedCount = 0;
      let errorCount = 0;
      
      // Create an array of promises for all the mute operations
      for (const participant of Object.values(participants)) {
        // Skip the host (local user)
        if (participant.userId === localUserId) {
          console.log('Skipping host:', participant.userId);
          continue;
        }
        
        try {
          console.log('Attempting to mute:', participant.userId);
          // The actual mute operation
          await call.muteUser(participant.userId, 'audio');
          mutedCount++;
          console.log('Successfully muted:', participant.userId);
        } catch (error) {
          errorCount++;
          console.error(`Failed to mute ${participant.userId}:`, error);
        }
      }
      
      setMuteStatus(`Muted ${mutedCount} participants. Errors: ${errorCount}`);
      setTimeout(() => setMuteStatus(''), 3000); // Clear status after 3 seconds
      
    } catch (error) {
      console.error('Error in mute operation:', error);
      setMuteStatus('Failed to mute participants');
      setTimeout(() => setMuteStatus(''), 3000);
    } finally {
      setIsMuting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={muteAllExceptHost}
        className="bg-red-500 px-4 py-2 rounded-lg text-white disabled:bg-red-300"
        disabled={isMuting}
      >
        {isMuting ? 'Muting...' : 'Mute Everyone Except Host'}
      </button>
      {muteStatus && (
        <div className="text-xs mt-1 text-white bg-gray-800 px-2 py-1 rounded">
          {muteStatus}
        </div>
      )}
    </div>
  );
};

export default MuteButton;
