'use client';

import { useState } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { Mic, Video } from 'lucide-react';

export const MuteButton = () => {
  const call = useCall();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants(); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [controlOptions, setControlOptions] = useState({
    audio: true,
    video: true,
  });
  const [showControls, setShowControls] = useState(false);

  const toggleControl = (type: 'audio' | 'video') => {
    setControlOptions((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const muteAllExceptHost = async () => {
    if (!call) {
      console.error('Call instance not found');
      return;
    }

    if (!controlOptions.audio && !controlOptions.video) {
      setStatusMessage('Please select at least one option');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Applying controls...');

    try {
      // In a production app, you'd verify the local user is the host/admin
      const localUserId = call.state.localParticipant?.userId;
      let controlledCount = 0;

      for (const participant of participants) {
        if (participant.userId === localUserId) continue; // Skip local user (host)
        if (controlOptions.audio) await call.muteUser(participant.userId, 'audio');
        if (controlOptions.video) await call.muteUser(participant.userId, 'video');
        controlledCount++;
      }

      setStatusMessage(`Applied to ${controlledCount} participant(s).`);
    } catch (error) {
      console.error('Error in control operation:', error);
      setStatusMessage('Failed to apply controls.');
    } finally {
      setTimeout(() => setStatusMessage(''), 3000);
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* Title and Toggle Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ color: '#E0DBD8', fontWeight: '500', fontSize: '0.875rem' }}>Participant Controls</h4>
        <button
          onClick={() => setShowControls(!showControls)}
          style={{ color: '#A41F13', fontSize: '0.875rem', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600' }}
        >
          {showControls ? 'Close' : 'Expand'}
        </button>
      </div>

      {showControls && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px', padding: '12px', backgroundColor: '#292F36', borderRadius: '8px', border: '1px solid #8F7A6E' }}>
          
          {/* Audio Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: '#FAF5F1' }}>
              <Mic style={{ marginRight: '10px', width: '18px', height: '18px', color: '#E0DBD8' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Mute Audio</span>
            </div>
            <button
              onClick={() => toggleControl('audio')}
              style={{ position: 'relative', display: 'inline-flex', height: '24px', width: '44px', alignItems: 'center', borderRadius: '9999px', backgroundColor: controlOptions.audio ? '#A41F13' : '#8F7A6E', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
            >
              <span
                style={{ display: 'inline-block', height: '20px', width: '20px', transform: controlOptions.audio ? 'translateX(20px)' : 'translateX(2px)', borderRadius: '9999px', backgroundColor: '#FAF5F1', transition: 'transform 0.2s ease-in-out', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}
              />
            </button>
          </div>

          {/* Video Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: '#FAF5F1' }}>
              <Video style={{ marginRight: '10px', width: '18px', height: '18px', color: '#E0DBD8' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Disable Video</span>
            </div>
            <button
              onClick={() => toggleControl('video')}
              style={{ position: 'relative', display: 'inline-flex', height: '24px', width: '44px', alignItems: 'center', borderRadius: '9999px', backgroundColor: controlOptions.video ? '#A41F13' : '#8F7A6E', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
            >
              <span
                style={{ display: 'inline-block', height: '20px', width: '20px', transform: controlOptions.video ? 'translateX(20px)' : 'translateX(2px)', borderRadius: '9999px', backgroundColor: '#FAF5F1', transition: 'transform 0.2s ease-in-out', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}
              />
            </button>
          </div>

           {/* Apply Button */}
           <button
              onClick={muteAllExceptHost}
              disabled={isProcessing}
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '10px 8px',
                backgroundColor: '#A41F13', // Primary Action Color
                color: '#FAF5F1',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                opacity: isProcessing ? 0.6 : 1,
                boxShadow: '0 4px 8px rgba(164, 31, 19, 0.4)',
                transition: 'background-color 0.2s, opacity 0.2s',
              }}
            >
              {isProcessing ? 'Processing...' : 'Apply to All'}
            </button>
        </div>
      )}

      {statusMessage && (
        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#FAF5F1', backgroundColor: '#8F7A6E', padding: '8px 10px', borderRadius: '8px', textAlign: 'center' }}>
          {statusMessage}
        </div>
      )}
    </div>
  );
};