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
import { MoreVertical, Mic, MicOff, Video, VideoOff, Monitor, Circle, Smile, PhoneOff } from 'lucide-react';

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
    <div className="flex items-center justify-center gap-3 p-4 bg-dark-1/80 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-2xl">
      {/* Audio Control */}
      <Restricted requiredGrants={[OwnCapability.SEND_AUDIO]}>
        <SpeakingWhileMutedNotification>
          <div className="relative group">
            <ToggleAudioPublishingButton className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105" />
          </div>
        </SpeakingWhileMutedNotification>
      </Restricted>

      {/* Video Control */}
      <Restricted requiredGrants={[OwnCapability.SEND_VIDEO]}>
        <div className="relative group">
          <ToggleVideoPublishingButton className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105" />
        </div>
      </Restricted>

      {/* More Controls Dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-white"
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          aria-label="More controls"
        >
          <MoreVertical size={20} />
        </button>

        {dropdownOpen && (
          <div className="absolute bottom-16 right-0 w-56 bg-dark-1 border border-gray-700 rounded-xl shadow-2xl backdrop-blur-md z-50 overflow-hidden">
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-300 mb-3">More Controls</h3>
              
              <div className="space-y-2">
                <Restricted requiredGrants={[OwnCapability.START_RECORD_CALL, OwnCapability.STOP_RECORD_CALL]}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-center w-8 h-8">
                      <RecordCallButton />
                    </div>
                    <span className="text-sm text-white flex items-center gap-2">
                      <Circle size={16} className="text-red-500" />
                      Record Meeting
                    </span>
                  </div>
                </Restricted>

                <Restricted requiredGrants={[OwnCapability.CREATE_REACTION]}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-center w-8 h-8">
                      <ReactionsButton />
                    </div>
                    <span className="text-sm text-white flex items-center gap-2">
                      <Smile size={16} className="text-yellow-500" />
                      Reactions
                    </span>
                  </div>
                </Restricted>

                <Restricted requiredGrants={[OwnCapability.SCREENSHARE]}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-center w-8 h-8">
                      <ScreenShareButton />
                    </div>
                    <span className="text-sm text-white flex items-center gap-2">
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
      <div className="relative group">
        <CancelCallButton 
          onLeave={onLeave}
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-600 hover:bg-red-700 border border-red-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        />
      </div>
    </div>
  );
};

export default CallControls;