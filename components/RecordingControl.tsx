import { useState, useEffect } from 'react';
import { useCall, StreamCall } from '@stream-io/video-react-sdk';
import { Database } from 'lucide-react';

interface RecordingControlProps {
  isAdmin: boolean;
  userId: string;
}

const RecordingControl = ({ isAdmin, userId }: RecordingControlProps) => {
  const call = useCall();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingOwnerId, setRecordingOwnerId] = useState<string | null>(null);

  useEffect(() => {
    if (!call) return;

    // Listen to recording state changes
    const handleRecordingStarted = (event: any) => {
      setIsRecording(true);
      setRecordingOwnerId(event.creator_id || event.creatorId);
    };

    const handleRecordingStopped = () => {
      // Only clear recording state if this admin started the recording
      if (recordingOwnerId === userId) {
        setIsRecording(false);
        setRecordingOwnerId(null);
      }
    };

    call.on('recording.started', handleRecordingStarted);
    call.on('recording.stopped', handleRecordingStopped);

    // Check if recording is already in progress
    const getCurrentRecordingState = async () => {
      try {
        const recordingState = await call.getRecordingState();
        if (recordingState.isRecording) {
          setIsRecording(true);
          setRecordingOwnerId(recordingState.creator_id || recordingState.creatorId);
        }
      } catch (error) {
        console.error('Error getting recording state:', error);
      }
    };

    getCurrentRecordingState();

    return () => {
      call.off('recording.started', handleRecordingStarted);
      call.off('recording.stopped', handleRecordingStopped);
    };
  }, [call, userId]);

  const toggleRecording = async () => {
    if (!call) return;

    try {
      if (!isRecording) {
        await call.startRecording();
        setRecordingOwnerId(userId);
      } else if (recordingOwnerId === userId) {
        // Only allow stopping if this admin started the recording
        await call.stopRecording();
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
    }
  };

  // Only render for admins
  if (!isAdmin) return null;

  // Determine button state
  const isDisabled = isRecording && recordingOwnerId !== userId;
  const buttonClass = `cursor-pointer rounded-2xl px-4 py-2 ${
    isRecording 
      ? recordingOwnerId === userId 
        ? 'bg-red-600 hover:bg-red-700' 
        : 'bg-gray-600 cursor-not-allowed'
      : 'bg-[#19232d] hover:bg-[#4c535b]'
  }`;

  return (
    <button
      className={buttonClass}
      onClick={toggleRecording}
      disabled={isDisabled}
      title={isDisabled ? 'Recording in progress by another admin' : 'Toggle recording'}
    >
      <Database className={isRecording ? 'animate-pulse' : ''} />
    </button>
  );
};

export default RecordingControl;
