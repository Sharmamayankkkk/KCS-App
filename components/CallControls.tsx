import React, { useCallback, useState, useEffect } from 'react';
import {
  SpeakingWhileMutedNotification,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  CancelCallButton,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Settings, LayoutList, Image as ImageIcon, Smile, Share, Circle } from 'lucide-react';
import Image from 'next/image';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const LAYOUT_OPTIONS = [
  { name: 'Grid', value: 'grid', icon: LayoutList },
  { name: 'Speaker Left', value: 'speaker-left', icon: LayoutList },
  { name: 'Speaker Right', value: 'speaker-right', icon: LayoutList },
];

type CallControlsProps = {
  onLeave: () => void;
  setLayout?: (layout: CallLayoutType) => void;
  setShowBackgroundSelector?: (show: boolean) => void;
};

export const CallControls: React.FC<CallControlsProps> = ({ 
  onLeave, 
  setLayout, 
  setShowBackgroundSelector 
}) => {
  const call = useCall();
  const { 
    useIsCallRecordingInProgress, 
    useScreenShareState, 
    useHasOngoingScreenShare 
  } = useCallStateHooks();
  const isCallRecordingInProgress = useIsCallRecordingInProgress();
  const { screenShare, isMute: isScreenSharing } = useScreenShareState();
  const isSomeoneScreenSharing = useHasOngoingScreenShare();
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  useEffect(() => {
    if (!call) return;
    const eventHandlers = [
      call.on('call.recording_started', () => setIsAwaitingResponse(false)),
      call.on('call.recording_stopped', () => setIsAwaitingResponse(false)),
    ];
    return () => {
      eventHandlers.forEach((unsubscribe) => unsubscribe());
    };
  }, [call]);

  // ✅ FINAL: Filled in the recording logic
  const toggleRecording = useCallback(async () => {
    if (!call) return;
    try {
      setIsAwaitingResponse(true);
      if (isCallRecordingInProgress) {
        await call.stopRecording();
      } else {
        await call.startRecording();
      }
    } catch (e) {
      console.error(`Failed to toggle recording`, e);
    } finally {
      setIsAwaitingResponse(false);
    }
  }, [call, isCallRecordingInProgress]);

  // ✅ FINAL: Filled in the screen share logic
  const toggleScreenShare = useCallback(async () => {
    try {
      await screenShare.toggle();
    } catch (e) {
      console.error('Failed to toggle screen share', e);
    }
  }, [screenShare]);
  
  const sendReaction = useCallback(async (reaction: {
    type: string;
    emoji_code?: string;
    custom?: Record<string, string>;
  }) => {
    try {
      await call?.sendReaction(reaction);
    } catch (e) {
      console.error('Failed to send reaction', e);
    }
  }, [call]);

  return (
    <div className="flex items-center gap-2">
      <SpeakingWhileMutedNotification>
        <ToggleAudioPublishingButton />
      </SpeakingWhileMutedNotification>
      <ToggleVideoPublishingButton />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="icon" title="More Controls">
            <Settings />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="center" className="w-56">
          <DropdownMenuItem onClick={() => setShowBackgroundSelector?.(true)}>
            <ImageIcon className="mr-2 size-4" />
            <span>Change Background</span>
          </DropdownMenuItem>
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <LayoutList className="mr-2 size-4" />
              <span>Change Layout</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {LAYOUT_OPTIONS.map((option) => (
                <DropdownMenuItem 
                  key={option.name} 
                  onClick={() => setLayout?.(option.value as CallLayoutType)}
                >
                  <option.icon className="mr-2 size-4" />
                  {option.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={toggleRecording} 
            disabled={isAwaitingResponse || !call}
          >
            <Circle className="mr-2 size-4" fill={isCallRecordingInProgress ? "red" : "currentColor"} />
            <span>{isCallRecordingInProgress ? 'Stop Recording' : 'Record Call'}</span>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Smile className="mr-2 size-4" />
              <span>React</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
               <DropdownMenuItem onClick={() => sendReaction({ type: 'raised-hand', emoji_code: ':raise-hand:' })}>
                ✋ Raise Hand
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => sendReaction({ type: 'like', emoji_code: ':like:' })}>
                👍 Like
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => sendReaction({ type: 'fireworks', emoji_code: ':fireworks:' })}>
                🎉 Fireworks
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  const imageUrl = `${window.location.origin}/icons/KCS-Logo.png`;
                  sendReaction({ type: 'custom', custom: { 'image_url': imageUrl } });
                }}
              >
                <Image src="https://meet.krishnaconsciousnesssociety.com/icons/KCS.png" alt="KCS Logo" width={20} height={20} className="mr-2" />
                <span>KCS Reaction</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem 
            onClick={toggleScreenShare}
            disabled={!isScreenSharing && isSomeoneScreenSharing}
          >
            <Share className="mr-2 size-4" />
            <span>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CancelCallButton onLeave={onLeave} />
    </div>
  );
};

export default CallControls;
