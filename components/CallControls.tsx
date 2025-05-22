import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { OwnCapability } from '@stream-io/video-client';
import {
  Restricted,
  SpeakingWhileMutedNotification,
  RecordCallButton,
  ReactionsButton,
  ScreenShareButton,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  CancelCallButton,
} from '@stream-io/video-react-sdk';

type CallControlsProps = {
  onLeave: () => void;
};

export const CallControls: React.FC<CallControlsProps> = ({ onLeave }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | MouseEventInit | Event) => {
      if (
        dropdownRef.current &&
        !(event.target instanceof Node) ||
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside as EventListener);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener);
    };
  }, []);

  return (
    <div className="str-video__call-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Restricted requiredGrants={[OwnCapability.SEND_AUDIO]}>
        <SpeakingWhileMutedNotification>
          <ToggleAudioPublishingButton />
        </SpeakingWhileMutedNotification>
      </Restricted>

      <Restricted requiredGrants={[OwnCapability.SEND_VIDEO]}>
        <ToggleVideoPublishingButton />
      </Restricted>

      {/* Dropdown */}
      <div
        ref={dropdownRef}
        style={{ position: 'relative', display: 'inline-block' }}
      >
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          style={{
            backgroundColor: 'black',
            color: 'white',
            border: 'none',
            padding: '6px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '18px',
          }}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          &#9881; {/* gear icon */}
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '120%', // open upward
              right: 0,
              backgroundColor: 'black',
              color: 'white',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              zIndex: 1000,
              width: '180px',
            }}
          >
            <strong style={{ fontSize: '14px', marginBottom: '5px' }}>More Controls</strong>

            <Restricted requiredGrants={[OwnCapability.START_RECORD_CALL, OwnCapability.STOP_RECORD_CALL]}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RecordCallButton />
                <span style={{ fontSize: '13px' }}>Record</span>
              </div>
            </Restricted>

            <Restricted requiredGrants={[OwnCapability.CREATE_REACTION]}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ReactionsButton />
                <span style={{ fontSize: '13px' }}>React</span>
              </div>
            </Restricted>

            <Restricted requiredGrants={[OwnCapability.SCREENSHARE]}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ScreenShareButton />
                <span style={{ fontSize: '13px' }}>Share Screen</span>
              </div>
            </Restricted>
          </div>
        )}
      </div>

      <CancelCallButton onLeave={onLeave} />
    </div>
  );
};

export default CallControls;