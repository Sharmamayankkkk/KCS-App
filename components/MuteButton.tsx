import React from 'react';
import { useCall } from '@stream-io/video-react-sdk';

const MuteButton: React.FC = () => {
  const call = useCall();

  const muteAllParticipants = async () => {
    if (!call) return;

    const participants = call.state.participants;

    for (const [userId, participant] of Object.entries(participants)) {
      if (participant.isLocalParticipant) continue;

      try {
        await call.updateParticipant(userId, { audio: false }); // Corrected API method
      } catch (error) {
        console.error(`Failed to mute ${userId}:`, error);
      }
    }
  };

  return (
    <button
      onClick={muteAllParticipants}
      className="bg-red-500 px-4 py-2 rounded-lg text-white"
    >
      Mute Everyone
    </button>
  );
};

export default MuteButton;
