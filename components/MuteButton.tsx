'use client';
import React, { useState, useEffect } from 'react';
import { useCall } from '@stream-io/video-react-sdk';

const MuteButton: React.FC = () => {
  const call = useCall();
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!call) return;

    // Check if the current user is the host
    const localUserId = call.state.localParticipant?.userId;
    const hostId = call.state.createdBy?.id;
    setIsHost(localUserId === hostId);
  }, [call]);

  const muteAllExceptHost = async () => {
    if (!call || !isHost) return;

    const participants = call.state.participants;
    const localUserId = call.state.localParticipant?.userId;

    for (const [userId] of Object.entries(participants)) {
      if (userId === localUserId) continue; // Skip the host

      try {
        await call.muteUser(userId, 'audio');
        console.log(`Muted ${userId}`);
      } catch (error) {
        console.error(`Failed to mute ${userId}:`, error);
      }
    }
  };

  return (
    <>
      {isHost && (
        <button
          onClick={muteAllExceptHost}
          className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] text-white"
        >
          Mute All
        </button>
      )}
    </>
  );
};

export default MuteButton;
