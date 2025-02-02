'use client';
import React from 'react';
import { useCall } from '@stream-io/video-react-sdk';

const MuteButton: React.FC = () => {
  const call = useCall(); // Get the current call instance

  const muteAllExceptHost = async () => {
    if (!call) return;

    const participants = call.state.participants;
    const localUserId = call.state.localParticipant?.userId;

    for (const [userId, participant] of Object.entries(participants)) {
      if (userId === localUserId) continue; // Skip the host (local user)

      try {
        // muteUser requires both userId and trackType parameters
        await call.muteUser(userId, 'audio');
      } catch (error) {
        console.error(`Failed to mute ${userId}:`, error);
      }
    }
  };

  return (
    <button
      onClick={muteAllExceptHost}
      className="px-4 py-2 bg-red-500 text-white rounded-lg"
    >
      Mute Everyone Except Host
    </button>
  );
};

export default MuteButton;
