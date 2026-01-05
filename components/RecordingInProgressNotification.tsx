'use client';

import { useCallStateHooks } from '@stream-io/video-react-sdk';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const RecordingInProgressNotification = () => {
  const { useIsCallRecordingInProgress } = useCallStateHooks();
  const isRecording = useIsCallRecordingInProgress();

  if (!isRecording) return null;

  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 duration-300 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-white shadow-lg">
        <Circle className="size-3 animate-pulse fill-white" />
        <span className="text-sm font-medium">Recording in Progress</span>
      </div>
    </div>
  );
};

export default RecordingInProgressNotification;
