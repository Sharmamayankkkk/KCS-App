import React, { useState, useRef, useEffect } from 'react';
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
import { MoreVertical, Circle, Smile, Monitor } from 'lucide-react';

type CallControlsProps = {
  onLeave: () => void;
};

export const CallControls: React.FC<CallControlsProps> = ({ onLeave }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-gray-700/50 bg-dark-1/80 p-4 shadow-2xl backdrop-blur-md">
      {/* Audio Control */}
      <Restricted requiredGrants={[OwnCapability.SEND_AUDIO]}>
        <SpeakingWhileMutedNotification>
          <div className="group relative">
            <ToggleAudioPublishingButton className="flex size-12 items-center justify-center rounded-xl border border-gray-600 bg-gray-800 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-700 hover:shadow-xl" />
          </div>
        </SpeakingWhileMutedNotification>
      </Restricted>

      {/* Video Control */}
      <Restricted requiredGrants={[OwnCapability.SEND_VIDEO]}>
        <div className="group relative">
          <ToggleVideoPublishingButton className="flex size-12 items-center justify-center rounded-xl border border-gray-600 bg-gray-800 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-700 hover:shadow-xl" />
        </div>
      </Restricted>

      {/* More Controls Dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex size-12 items-center justify-center rounded-xl border border-gray-600 bg-gray-800 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-700 hover:shadow-xl"
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          aria-label="More controls"
        >
          <MoreVertical size={20} />
        </button>

        {dropdownOpen && (
          <div className="absolute bottom-16 right-0 z-50 w-56 overflow-hidden rounded-xl border border-gray-700 bg-dark-1 shadow-2xl backdrop-blur-md">
            <div className="p-3">
              <h3 className="mb-3 text-sm font-medium text-gray-300">More Controls</h3>
              
              <div className="space-y-2">
                <Restricted requiredGrants={[OwnCapability.START_RECORD_CALL, OwnCapability.STOP_RECORD_CALL]}>
                  <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-800">
                    <div className="flex size-8 items-center justify-center">
                      <RecordCallButton />
                    </div>
                    <span className="flex items-center gap-2 text-sm text-white">
                      <Circle size={16} className="text-red-500" />
                      Record Meeting
                    </span>
                  </div>
                </Restricted>

                <Restricted requiredGrants={[OwnCapability.CREATE_REACTION]}>
                  <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-800">
                    <div className="flex size-8 items-center justify-center">
                      <ReactionsButton />
                    </div>
                    <span className="flex items-center gap-2 text-sm text-white">
                      <Smile size={16} className="text-yellow-500" />
                      Reactions
                    </span>
                  </div>
                </Restricted>

                <Restricted requiredGrants={[OwnCapability.SCREENSHARE]}>
                  <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-800">
                    <div className="flex size-8 items-center justify-center">
                      <ScreenShareButton />
                    </div>
                    <span className="flex items-center gap-2 text-sm text-white">
                      <Monitor size={16} className="text-blue-500" />
                      Share Screen
                    </span>
                  </div>
                </Restricted>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leave Call Button */}
      <div className="group relative">
        <CancelCallButton 
          onLeave={onLeave}
          className="flex size-12 items-center justify-center rounded-xl border border-red-500 bg-red-600 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-red-700 hover:shadow-xl"
        />
      </div>
    </div>
  );
};

export default CallControls;