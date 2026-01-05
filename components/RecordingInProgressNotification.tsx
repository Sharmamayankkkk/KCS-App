'use client';

import { useCallStateHooks } from '@stream-io/video-react-sdk';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const RecordingInProgressNotification = () => {
  const { useIsCallRecordingInProgress } = useCallStateHooks();
  const isRecording = useIsCallRecordingInProgress();

  if (!isRecording) return null;

  return (
    <div className="fixed left-1/2 top-2 sm:top-4 z-50 -translate-x-1/2 duration-300 animate-in fade-in slide-in-from-top-2 px-2">
      <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-red-600 px-3 sm:px-4 py-1.5 sm:py-2 text-white shadow-lg">
        <Circle className="size-2 sm:size-3 animate-pulse fill-white flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Recording in Progress</span>
      </div>
    </div>
  );
};

export default RecordingInProgressNotification;
