'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  CallingState,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  useCall,
  useCallStateHooks,
  SpeakerLayout,
} from '@stream-io/video-react-sdk';
import { PanelRightOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { markAttendance, updateAttendanceOnLeave } from '@/actions/attendance.actions';

// Local components
import Loader from './Loader';
import { SendSuperchatModal } from './superchat/send-superchat-modal';
import CustomGridLayout from './CustomGridLayout';
import CallControls from './CallControls';
import { BackgroundSelector } from './BackgroundSelector';
import { useBackgroundProcessor } from '@/hooks/useBackgroundProcessor';
import { FlexibleSidePanel } from './FlexibleSidePanel';
import AdminControls from './AdminPanel/AdminControls';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

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

interface MeetingRoomProps {
  apiKey: string;
  userToken: string;
  userData: {
    id: string;
    fullName?: string | null;
    primaryEmailAddress?: { emailAddress: string } | null;
    [key: string]: any;
  };
}

const MeetingRoom = ({ apiKey, userToken, userData }: MeetingRoomProps) => {
  const router = useRouter();
  const { user } = useUser();
  const [layout, setLayout] = useState<CallLayoutType>('grid');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [showSendSuperchat, setShowSendSuperchat] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(DEFAULT_BACKGROUND);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { processFrame, cleanup } = useBackgroundProcessor();

  useEffect(() => {
    try {
      const savedBackground = localStorage.getItem('meetingBackground');
      if (savedBackground) {
        setSelectedBackground(JSON.parse(savedBackground));
      }
    } catch (error) {
      console.error('Error loading background from localStorage:', error);
    }
  }, []);

  const isAdmin = useMemo(() => {
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((email) => email.trim());
    const userEmail = userData?.primaryEmailAddress?.emailAddress || '';
    return adminEmails.includes(userEmail);
  }, [userData?.primaryEmailAddress?.emailAddress]);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    const events = ['mousemove', 'click', 'touchstart'];
    events.forEach((event) => document.addEventListener(event, resetControlsTimer));
    resetControlsTimer();
    return () => {
      events.forEach((event) => document.removeEventListener(event, resetControlsTimer));
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [resetControlsTimer]);

  useEffect(() => {
    const trackAttendance = async () => {
      if (call && userData?.id && callingState === CallingState.JOINED) {
        try {
          const username = userData.fullName || user?.fullName || 'Anonymous';
          const result = await markAttendance(call.id, userData.id, username, 'present');
          if (!result.success) {
            console.error('Failed to mark attendance:', result.error);
          }
        } catch (error) {
          console.error('Error marking attendance:', error);
        }
      }
    };
    trackAttendance();
  }, [call, user, userData, callingState]);

  useEffect(() => {
    return () => {
      if (call && userData?.id) {
        updateAttendanceOnLeave(call.id, userData.id).catch((error) => {
          console.error('Error updating attendance on leave:', error);
        });
      }
    };
  }, [call, userData?.id]);

  useEffect(() => {
    if (!apiKey || !userToken || !userData) return;
    const _client = new StreamVideoClient({ apiKey, user: userData, token: userToken });
    setVideoClient(_client);
    return () => {
      _client.disconnectUser();
      setVideoClient(null);
    };
  }, [apiKey, userToken, userData]);

  useEffect(() => {
    if (!call) return;
    const setupBackgroundProcessing = async () => {
      try {
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
      }
    };
    const unregisterPromise = setupBackgroundProcessing();
    return () => {
      unregisterPromise?.then(unregister => unregister?.());
      cleanup();
    };
  }, [call, selectedBackground, processFrame, cleanup]);

  const handleBackgroundChange = useCallback((background: BackgroundOption) => {
    setSelectedBackground(background);
    try {
      localStorage.setItem('meetingBackground', JSON.stringify(background));
    } catch (error) {
      console.error('Error saving background to localStorage:', error);
    }
  }, []);

  const CallLayout = useMemo(() => {
    const layouts = {
      grid: <CustomGridLayout />,
      'speaker-left': (
        <div className="hidden md:block w-full h-full">
          <SpeakerLayout participantsBarPosition="left" />
        </div>
      ),
      'speaker-right': (
        <div className="hidden md:block w-full h-full">
          <SpeakerLayout participantsBarPosition="right" />
        </div>
      ),
    };
    
    // On mobile, always use grid layout for speaker modes
    if (typeof window !== 'undefined' && window.innerWidth < 768 && (layout === 'speaker-left' || layout === 'speaker-right')) {
      return <CustomGridLayout />;
    }
    
    return layouts[layout] || layouts['grid'];
  }, [layout]);

  if (callingState !== CallingState.JOINED) return <Loader />;

  return videoClient && call ? (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <section className="relative w-full h-full flex flex-col bg-background">
          <div className="relative flex items-center justify-center size-full">
            <div className={cn('flex transition-all duration-300 ease-in-out size-full', { 'md:max-w-[calc(100%-350px)]': isSidePanelOpen })}>
              {CallLayout}
            </div>
            {isSidePanelOpen && call.id && userData.id && (
              <FlexibleSidePanel
                callId={call.id}
                userId={userData.id}
                isAdmin={isAdmin}
                senderName={userData?.fullName || 'Anonymous'}
                onClose={() => setIsSidePanelOpen(false)}
                setShowSendSuperchat={setShowSendSuperchat}
              />
            )}
          </div>
          <div className={cn(`fixed bottom-0 w-full px-4 pb-4 transition-opacity duration-300`, showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}>
            <div className="flex flex-wrap items-center justify-center gap-2 p-3 mx-auto transition rounded-2xl sm:gap-3 bg-background/80 backdrop-blur-md max-w-max shadow-lg border">
              <CallControls
                onLeave={() => router.push('/home')}
                setLayout={setLayout}
                setShowBackgroundSelector={setShowBackgroundSelector}
              />
              {isAdmin && (
                <>
                  <div className="h-8 w-px bg-border mx-1"></div>
                  <AdminControls />
                </>
              )}
              <div className="h-8 w-px bg-border mx-1"></div>
              <Button variant="default" size="icon" onClick={() => setIsSidePanelOpen(prev => !prev)} title="Toggle Panels">
                <PanelRightOpen />
              </Button>
            </div>
          </div>
          {showSendSuperchat && call?.id && (<SendSuperchatModal callId={call.id} senderName={userData?.fullName || 'Anonymous'} userId={userData?.id || ''} onClose={() => setShowSendSuperchat(false)} onSuccess={() => {}} />)}
          {showBackgroundSelector && (<BackgroundSelector selectedBackground={selectedBackground} onBackgroundChange={handleBackgroundChange} onClose={() => setShowBackgroundSelector(false)} />)}
        </section>
      </StreamCall>
    </StreamVideo>
  ) : (
    <Loader />
  );
};

export default MeetingRoom;
