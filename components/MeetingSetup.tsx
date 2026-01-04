'use client';
import { useEffect, useState, useCallback } from 'react';
import { VideoPreview, useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { Button } from './ui/button';
import { Card } from './ui/card';
import Alert from './Alert';
import { Check, Mic, MicOff, Video, VideoOff, Image, AlertTriangle, X, Sparkles, ChevronDown, Camera, Headphones, MonitorPlay } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BackgroundSelector } from './BackgroundSelector';
import { useBackgroundProcessor } from '@/hooks/useBackgroundProcessor';

interface BackgroundOption {
  id: string;
  name: string;
  type: 'none' | 'blur' | 'image';
  url?: string;
  preview?: string;
}

const DEFAULT_BACKGROUND: BackgroundOption = {
  id: 'none',
  name: 'No Background',
  type: 'none',
};

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived = callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();
  if (!call) {
    throw new Error('useStreamCall must be used within a StreamCall component.');
  }

  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(DEFAULT_BACKGROUND);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [isProcessingBackground, setIsProcessingBackground] = useState(false);
  const [showCameraDevices, setShowCameraDevices] = useState(false);
  const [showMicDevices, setShowMicDevices] = useState(false);
  
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  
  const { processFrame, cleanup } = useBackgroundProcessor();

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        
        setCameras(videoDevices);
        setMicrophones(audioDevices);
        
        if (videoDevices.length > 0 && !selectedCameraId) {
          setSelectedCameraId(videoDevices[0].deviceId);
        }
        if (audioDevices.length > 0 && !selectedMicId) {
          setSelectedMicId(audioDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error getting devices:', error);
      }
    };

    getDevices();
    
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, [selectedCameraId, selectedMicId]);

  useEffect(() => {
    try {
      const savedBackground = localStorage.getItem('meetingBackground');
      if (savedBackground) {
        const background = JSON.parse(savedBackground);
        setSelectedBackground(background);
      }
    } catch (error) {
      console.error('Error loading background from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    call.microphone.disable();
    call.camera.disable();
  }, [call]);
  
  useEffect(() => {
    const setupBackgroundProcessing = async () => {
      if (!isCameraEnabled) {
        cleanup();
        return;
      }

      try {
        setIsProcessingBackground(true);
        const { unregister } = call.camera.registerFilter((originalStream: MediaStream) => {
          const processedStreamPromise = processFrame(originalStream, selectedBackground);
          return {
            output: processedStreamPromise.then(stream => stream || originalStream),
            stop: () => cleanup()
          };
        });
        return unregister;
      } catch (error) {
        console.error('Error setting up background processing:', error);
      } finally {
        setIsProcessingBackground(false);
      }
    };

    const unregisterPromise = setupBackgroundProcessing();
    return () => {
      unregisterPromise?.then(unregister => unregister?.());
      cleanup();
    };
  }, [isCameraEnabled, selectedBackground, call.camera, processFrame, cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleBackgroundChange = useCallback((background: BackgroundOption) => {
    setSelectedBackground(background);
    setShowBackgroundSelector(false);
    try {
      localStorage.setItem('meetingBackground', JSON.stringify(background));
    } catch (error) {
      console.error('Error saving background to localStorage:', error);
    }
  }, []);

  const toggleMic = async () => {
    setIsMicEnabled((prev) => !prev);
    if (isMicEnabled) {
      call.microphone.disable();
    } else {
      if (selectedMicId) {
        await call.microphone.select(selectedMicId);
      }
      call.microphone.enable();
    }
  };

  const toggleCamera = async () => {
    setIsCameraEnabled((prev) => !prev);
    if (isCameraEnabled) {
      call.camera.disable();
    } else {
      if (selectedCameraId) {
        await call.camera.select(selectedCameraId);
      }
      call.camera.enable();
    }
  };

  const handleCameraChange = async (deviceId: string) => {
    setSelectedCameraId(deviceId);
    if (isCameraEnabled) {
      await call.camera.select(deviceId);
    }
  };

  const handleMicChange = async (deviceId: string) => {
    setSelectedMicId(deviceId);
    if (isMicEnabled) {
      await call.microphone.select(deviceId);
    }
  };

  const handleJoinMeeting = () => {
    setIsJoining(true);
    setCountdownValue(3);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isJoining && countdownValue !== null) {
      if (countdownValue > 0) {
        timer = setTimeout(() => {
          setCountdownValue(countdownValue - 1);
        }, 1000);
      } else {
        call.join();
        setIsSetupComplete(true);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isJoining, countdownValue, call, setIsSetupComplete]);

  if (callTimeNotArrived) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#FAF5F1] p-4">
        <Alert
          title={`Your Meeting has not started yet`}
          subtitle={`It is scheduled for ${callStartsAt?.toLocaleString()}`}
        />
      </div>
    );
  }

  if (callHasEnded) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#FAF5F1] p-4">
        <Alert title="The call has been ended by the host" icon={<AlertTriangle size={48} className="text-accent" />} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF5F1] flex flex-col items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-7xl lg:grid lg:grid-cols-5 lg:gap-8 items-start">
        <div className="lg:col-span-3 w-full flex flex-col items-center">
          <div className="text-center lg:text-left mb-4 sm:mb-6 md:mb-8 px-2 w-full">
              <h1
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#292F36] mb-2 sm:mb-3"
                  dangerouslySetInnerHTML={{ __html: 'Hare Krishna<br> Ready to join?' }}
              />
              <p className="text-[#8F7A6E] text-sm sm:text-base md:text-lg max-w-2xl mx-auto lg:mx-0">
                  Setup your devices for the meeting
              </p>
          </div>
          <Card className="w-full p-0 border-none bg-surface shadow-lg sm:shadow-xl rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="relative aspect-video lg:min-h-[400px] lg:h-[calc(100vh-400px)] bg-[#292F36] rounded-xl sm:rounded-2xl overflow-hidden border-4 border-white shadow-inner">
              <div
                className={cn(
                  'absolute inset-0 flex flex-col items-center justify-center z-10 bg-gradient-to-br from-[#292F36] to-[#292F36]/90 transition-opacity duration-300',
                  isCameraEnabled ? 'opacity-0 pointer-events-none' : 'opacity-100',
                )}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#8F7A6E]/20 flex items-center justify-center mb-3 sm:mb-4">
                  <VideoOff size={32} className="text-[#8F7A6E] sm:w-10 sm:h-10" />
                </div>
                <p className="text-[#FAF5F1] text-sm sm:text-base font-medium">Camera is off</p>
              </div>
              <VideoPreview className={cn('w-full h-full', !isCameraEnabled && 'opacity-0')} />
              
              {isCameraEnabled && (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-[#292F36]/80 backdrop-blur-sm rounded-full flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#A41F13] animate-pulse" />
                  <span className="text-white text-xs sm:text-sm font-medium">Live</span>
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 bg-surface flex items-center justify-center gap-2 sm:gap-3">
                <button
                    onClick={toggleMic}
                    className={cn(
                    'w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95',
                    isMicEnabled
                        ? 'bg-[#E0DBD8] text-[#292F36] hover:bg-[#8F7A6E]/30'
                        : 'bg-[#A41F13] text-white hover:bg-[#A41F13]/90'
                    )}
                >
                    {isMicEnabled ? <Mic size={20} className="sm:w-6 sm:h-6" /> : <MicOff size={20} className="sm:w-6 sm:h-6" />}
                </button>

                <button
                    onClick={toggleCamera}
                    className={cn(
                    'w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95',
                    isCameraEnabled
                        ? 'bg-[#E0DBD8] text-[#292F36] hover:bg-[#8F7A6E]/30'
                        : 'bg-[#A41F13] text-white hover:bg-[#A41F13]/90'
                    )}
                >
                    {isCameraEnabled ? <Video size={20} className="sm:w-6 sm:h-6" /> : <VideoOff size={20} className="sm:w-6 sm:h-6" />}
                </button>

                <button
                    onClick={() => setShowBackgroundSelector(true)}
                    disabled={isProcessingBackground}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#E0DBD8] text-[#292F36] hover:bg-[#8F7A6E]/30 flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50"
                >
                    <Image size={20} className="sm:w-6 sm:h-6" />
                </button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 w-full space-y-4 sm:space-y-5 md:space-y-6 mt-4 lg:mt-0">
          <Card className="p-4 sm:p-5 border-none bg-surface shadow-lg rounded-xl sm:rounded-2xl">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                isCameraEnabled ? "bg-[#292F36]" : "bg-[#A41F13]"
              )}>
                <Camera className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[#292F36] font-bold text-base sm:text-lg">Camera</h3>
                <p className="text-[#8F7A6E] text-xs sm:text-sm truncate">
                  {isCameraEnabled ? 'Ready to use' : 'Currently disabled'}
                </p>
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <button
                onClick={() => setShowCameraDevices(!showCameraDevices)}
                className="w-full flex items-center justify-between p-3 bg-[#FAF5F1] hover:bg-[#E0DBD8] rounded-lg transition-all duration-200"
              >
                <span className="text-[#292F36] text-sm font-medium truncate">
                  {cameras.find(c => c.deviceId === selectedCameraId)?.label || 'Select camera'}
                </span>
                <ChevronDown className={cn(
                  "text-[#8F7A6E] flex-shrink-0 transition-transform duration-200 w-5 h-5",
                  showCameraDevices && "rotate-180"
                )} />
              </button>
              
              {showCameraDevices && cameras.length > 0 && (
                <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                  {cameras.map((camera) => (
                    <button
                      key={camera.deviceId}
                      onClick={() => {
                        handleCameraChange(camera.deviceId);
                        setShowCameraDevices(false);
                      }}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all duration-200 text-sm",
                        selectedCameraId === camera.deviceId
                          ? "bg-[#292F36] text-white"
                          : "bg-[#FAF5F1] text-[#292F36] hover:bg-[#E0DBD8]"
                      )}
                    >
                      {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={toggleCamera}
              className={cn(
                'w-full h-10 sm:h-11 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200',
                isCameraEnabled
                  ? 'bg-[#E0DBD8] hover:bg-[#8F7A6E] text-[#292F36] hover:text-white'
                  : 'bg-[#292F36] hover:bg-[#292F36]/90 text-white'
              )}
            >
              {isCameraEnabled ? 'Turn Off' : 'Turn On'}
            </Button>
          </Card>

          <Card className="p-4 sm:p-5 border-none bg-surface shadow-lg rounded-xl sm:rounded-2xl">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                isMicEnabled ? "bg-[#292F36]" : "bg-[#A41F13]"
              )}>
                <Headphones className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[#292F36] font-bold text-base sm:text-lg">Microphone</h3>
                <p className="text-[#8F7A6E] text-xs sm:text-sm truncate">
                  {isMicEnabled ? 'Ready to use' : 'Currently disabled'}
                </p>
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <button
                onClick={() => setShowMicDevices(!showMicDevices)}
                className="w-full flex items-center justify-between p-3 bg-[#FAF5F1] hover:bg-[#E0DBD8] rounded-lg transition-all duration-200"
              >
                <span className="text-[#292F36] text-sm font-medium truncate">
                  {microphones.find(m => m.deviceId === selectedMicId)?.label || 'Select microphone'}
                </span>
                <ChevronDown className={cn(
                  "text-[#8F7A6E] flex-shrink-0 transition-transform duration-200 w-5 h-5",
                  showMicDevices && "rotate-180"
                )} />
              </button>
              
              {showMicDevices && microphones.length > 0 && (
                <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                  {microphones.map((mic) => (
                    <button
                      key={mic.deviceId}
                      onClick={() => {
                        handleMicChange(mic.deviceId);
                        setShowMicDevices(false);
                      }}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all duration-200 text-sm",
                        selectedMicId === mic.deviceId
                          ? "bg-[#292F36] text-white"
                          : "bg-[#FAF5F1] text-[#292F36] hover:bg-[#E0DBD8]"
                      )}
                    >
                      {mic.label || `Microphone ${microphones.indexOf(mic) + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={toggleMic}
              className={cn(
                'w-full h-10 sm:h-11 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200',
                isMicEnabled
                  ? 'bg-[#E0DBD8] hover:bg-[#8F7A6E] text-[#292F36] hover:text-white'
                  : 'bg-[#292F36] hover:bg-[#292F36]/90 text-white'
              )}
            >
              {isMicEnabled ? 'Turn Off' : 'Turn On'}
            </Button>
          </Card>

          <Card className="p-4 sm:p-5 border-none bg-surface shadow-lg rounded-xl sm:rounded-2xl">
            <button
              onClick={() => setShowBackgroundSelector(true)}
              disabled={isProcessingBackground}
              className="w-full flex items-center justify-between hover:bg-background p-3 rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#8F7A6E] flex items-center justify-center flex-shrink-0">
                  <MonitorPlay className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[#292F36] font-semibold text-sm sm:text-base">Background</p>
                  <p className="text-[#8F7A6E] text-xs sm:text-sm truncate">
                    {isProcessingBackground ? 'Processing...' : selectedBackground.name}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 px-4 py-2 bg-[#E0DBD8] rounded-lg text-[#292F36] text-sm font-medium">
                Change
              </div>
            </button>
          </Card>

          <Card className="p-4 sm:p-5 md:p-6 border-none bg-gradient-to-br from-[#A41F13] to-[#A41F13]/90 shadow-lg sm:shadow-xl rounded-xl sm:rounded-2xl">
            {isJoining ? (
              <div className="text-center py-3 sm:py-4">
                <div className="mb-3 sm:mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface/20 backdrop-blur-sm">
                    <span className="text-4xl sm:text-5xl font-bold text-white">{countdownValue}</span>
                  </div>
                </div>
                <p className="text-white/90 text-base sm:text-lg font-medium">Joining meeting...</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <Button
                  onClick={handleJoinMeeting}
                  className="w-full h-12 sm:h-14 bg-surface hover:bg-background text-accent font-bold text-base sm:text-lg rounded-lg sm:rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3"
                >
                  <Check size={20} strokeWidth={3} className="sm:w-6 sm:h-6" />
                  Join Meeting Now
                </Button>
                <p className="text-white/70 text-xs sm:text-sm text-center leading-relaxed px-2">
                  By joining, you agree to our terms of service and privacy policy
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 text-center px-2">
          <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 bg-surface rounded-full shadow-sm">
            <Sparkles className="text-accent w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <p className="text-[#8F7A6E] text-xs sm:text-sm">
              <span className="font-semibold">Tip:</span> Test before important meetings
            </p>
          </div>
      </div>

      {showBackgroundSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#292F36]/60 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={() => setShowBackgroundSelector(false)}
              className="sticky top-0 right-0 float-right mb-2 sm:mb-3 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface/10 hover:bg-surface/20 flex items-center justify-center text-white transition-all duration-200 z-10"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
            <div className="clear-both">
              <BackgroundSelector
                selectedBackground={selectedBackground}
                onBackgroundChange={handleBackgroundChange}
                onClose={() => setShowBackgroundSelector(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingSetup;