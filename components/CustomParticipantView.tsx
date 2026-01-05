'use client';

import { useMemo } from 'react';
import { 
  ParticipantView as StreamParticipantView,
  StreamVideoParticipant,
  useCallStateHooks
} from '@stream-io/video-react-sdk';
import { Mic, MicOff, Pin, Signal, SignalHigh, SignalMedium, SignalLow } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomParticipantViewProps {
  participant: StreamVideoParticipant;
  className?: string;
  showConnectionQuality?: boolean;
  showAudioLevel?: boolean;
  isPinned?: boolean;
  onPin?: () => void;
}

export const CustomParticipantView = ({
  participant,
  className,
  showConnectionQuality = true,
  showAudioLevel = true,
  isPinned = false,
  onPin,
}: CustomParticipantViewProps) => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  // Get participant state
  const isAudioMuted = !participant.publishedTracks.includes('audio');
  const isVideoMuted = !participant.publishedTracks.includes('video');
  const isScreenSharing = participant.publishedTracks.includes('screenShare');
  const isDominantSpeaker = participant.isDominantSpeaker;
  const isLocalParticipant = participant.isLocalParticipant;
  
  // Connection quality (would be better to get from actual stream stats)
  const connectionQuality = useMemo(() => {
    // This is a placeholder - in production, you'd use actual connection stats
    // from the Stream SDK
    return 'good'; // 'excellent' | 'good' | 'poor' | 'bad'
  }, [participant]);

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Signal className="size-3 text-green-500" />;
      case 'good':
        return <SignalHigh className="size-3 text-yellow-500" />;
      case 'poor':
        return <SignalMedium className="size-3 text-orange-500" />;
      case 'bad':
        return <SignalLow className="size-3 text-red-500" />;
      default:
        return <Signal className="size-3 text-gray-500" />;
    }
  };

  const participantName = participant.name || participant.userId || 'Guest';

  return (
    <div
      className={cn(
        'relative group rounded-lg overflow-hidden bg-gray-900',
        isDominantSpeaker && 'ring-2 ring-blue-500 ring-offset-2',
        isPinned && 'ring-2 ring-yellow-500 ring-offset-2',
        className
      )}
    >
      {/* Stream's ParticipantView component */}
      <StreamParticipantView
        participant={participant}
        ParticipantViewUI={null}
        muteAudio={isAudioMuted}
      />

      {/* Custom overlay */}
      <div className="pointer-events-none absolute inset-0">
        {/* Top bar with participant info */}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-1.5 sm:p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <span className="max-w-[100px] sm:max-w-[150px] truncate text-xs sm:text-sm font-medium text-white">
                {participantName}
                {isLocalParticipant && ' (You)'}
              </span>
              
              {/* Connection quality indicator */}
              {showConnectionQuality && (
                <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                  {getConnectionIcon()}
                </div>
              )}
            </div>

            {/* Pin button */}
            {onPin && (
              <button
                onClick={onPin}
                className="pointer-events-auto rounded p-0.5 sm:p-1 transition-colors hover:bg-white/20 flex-shrink-0"
              >
                <Pin className={cn('size-3 sm:size-4', isPinned ? 'text-yellow-400 fill-yellow-400' : 'text-white')} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom bar with audio/video status */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 sm:p-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio status */}
            <div
              className={cn(
                'flex items-center justify-center size-5 sm:size-6 rounded-full flex-shrink-0',
                isAudioMuted ? 'bg-red-500' : 'bg-green-500'
              )}
            >
              {isAudioMuted ? (
                <MicOff className="size-2.5 sm:size-3 text-white" />
              ) : (
                <Mic className="size-2.5 sm:size-3 text-white" />
              )}
            </div>

            {/* Audio level indicator */}
            {showAudioLevel && !isAudioMuted && (
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-600 min-w-0">
                <div
                  className={cn(
                    'h-full bg-green-500 transition-all duration-150',
                    isDominantSpeaker ? 'w-full' : 'w-0'
                  )}
                />
              </div>
            )}

            {/* Screen sharing indicator */}
            {isScreenSharing && (
              <div className="rounded bg-blue-500 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs text-white flex-shrink-0">
                Sharing
              </div>
            )}
          </div>
        </div>

        {/* Dominant speaker glow effect */}
        {isDominantSpeaker && (
          <div className="pointer-events-none absolute inset-0 animate-pulse rounded-lg border-2 border-blue-400" />
        )}

        {/* Video muted overlay */}
        {isVideoMuted && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center px-2">
              <div className="mx-auto mb-1.5 sm:mb-2 flex size-12 sm:size-16 items-center justify-center rounded-full bg-gray-700">
                <span className="text-lg sm:text-2xl font-bold text-white">
                  {participantName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-white truncate block max-w-full">{participantName}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
