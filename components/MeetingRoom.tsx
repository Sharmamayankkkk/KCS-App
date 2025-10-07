'use client';

import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { useRouter } from 'next/navigation';
import {
  Users,
  LayoutList,
  MessageSquare,
  X,
  Cast,
  Crown,
  BarChart2,
  AlertCircle,
  MoreVertical,
  Settings,
  Image as ImageIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
// Local components
import Loader from './Loader';
import AdminPanel from './AdminPanel';
// REMOVED: import { SuperchatPanel } from './superchat/superchat-panel';
// REMOVED: import { SendSuperchatModal } from './superchat/send-superchat-modal';

import CustomGridLayout from './CustomGridLayout';
import CallControls from './CallControls';
import { BackgroundSelector } from './BackgroundSelector';
import { useBackgroundProcessor } from '@/hooks/useBackgroundProcessor';

// STEP 1: Update Imports
import PollsPanel from './PollsPanel';
// ADDED: import ChatPanel
import ChatPanel from './ChatPanel';

// REMOVED: import { PollsManager } from './poll/polls-manager';
// REMOVED: import { ActivePoll } from './poll/active-poll';
// Move constants outside component to prevent recreation
const BROADCAST_PLATFORMS = [
  {
    id: 'youtube',
    name: 'YouTube',
    defaultUrl: process.env.NEXT_PUBLIC_YOUTUBE_STREAM_URL ||
'',
    defaultKey: process.env.NEXT_PUBLIC_YOUTUBE_STREAM_KEY || '',
    icon: 'youtube',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    defaultUrl: '',
    defaultKey: '',
    icon: 'facebook',
  },
];
const LAYOUT_OPTIONS = [
  { name: 'Grid', value: 'grid', icon: <LayoutList className="mr-2 size-4" /> },
  {
    name: 'Speaker Left',
    value: 'speaker-left',
    icon: <LayoutList className="mr-2 size-4" />,
  },
  {
    name: 'Speaker Right',
    value: 'speaker-right',
    icon: <LayoutList className="mr-2 size-4" />,
  },
];
type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

interface BackgroundOption {
  id: string
  name: string
  type: 'none' |
'blur' | 'image'
  url?: string
  preview?: string
}

const DEFAULT_BACKGROUND: BackgroundOption = {
  id: 'none',
  name: 'No Background',
  type: 'none',
}

interface MeetingRoomProps {
  apiKey: string;
userToken: string;
  userData: {
    id: string;
    fullName?: string;
    primaryEmailAddress?: {
      emailAddress: string;
};
    [key: string]: any;
  };
}

const MeetingRoom = ({ apiKey, userToken, userData }: MeetingRoomProps) => {
  const router = useRouter();
const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  
  // 1. Simplify activePanel State (Removed 'superchat')
  const [activePanel, setActivePanel] = useState<
    'none' | 'participants' | 'chat'
  >('none');
  
  // STEP 2.2: Add New State for the Polls Panel
  const [showPollsPanel, setShowPollsPanel] = useState(false);
const [hasNewPoll, setHasNewPoll] = useState(false);

  // REMOVED: const [showSendSuperchat, setShowSendSuperchat] = useState(false);
  // REMOVED: const [messageText, setMessageText] = useState('');
const { useCallCallingState } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();
  const chatEndRef = useRef<HTMLDivElement | null>(null);
const [activeBroadcasts, setActiveBroadcasts] = useState<string[]>([]);
  const [broadcastError, setBroadcastError] = useState<string>('');
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
const [unreadMessages, setUnreadMessages] = useState(0);
  const [buttonHoverStates, setButtonHoverStates] = useState<
    Record<string, boolean>
  >({});
const [showControls, setShowControls] = useState(true);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
// Background processing state
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(DEFAULT_BACKGROUND);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [isProcessingBackground, setIsProcessingBackground] = useState(false);
const { processFrame, cleanup } = useBackgroundProcessor();

  // Load background from localStorage on mount
  useEffect(() => {
    try {
      const savedBackground = localStorage.getItem('meetingBackground')
      if (savedBackground) {
        const background = JSON.parse(savedBackground)
        setSelectedBackground(background)
      }
    } catch (error) {
      console.error('Error loading background from localStorage:', error)
    }
  }, [])

  // Memoize environment variables
  const { youtubeStreamUrl, youtubeStreamKey 
} = useMemo(
    () => ({
      youtubeStreamUrl: process.env.NEXT_PUBLIC_YOUTUBE_STREAM_URL || '',
      youtubeStreamKey: process.env.NEXT_PUBLIC_YOUTUBE_STREAM_KEY || '',
    }),
    [],
  );
const [streamUrl, setStreamUrl] = useState(youtubeStreamUrl);
  const [streamKey, setStreamKey] = useState(youtubeStreamKey);
// REMOVED: const [messages, setMessages] = useState< { id: string; text: string; sender: string }[] >([]);
const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(
    null,
  );

  const { toast } = useToast();
// Memoize admin check
  const isAdmin = useMemo(() => {
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim());
    const userEmail = userData?.primaryEmailAddress?.emailAddress || '';
    return adminEmails.includes(userEmail);
  }, [userData?.primaryEmailAddress?.emailAddress]);
// Optimize controls visibility with useCallback
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShowControls(false), 3000);
  }, []);
// Controls visibility effect
  useEffect(() => {
    const events = ['mousemove', 'click', 'touchstart'];
    events.forEach((event) =>
      document.addEventListener(event, resetControlsTimer),
    );
    resetControlsTimer();

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, resetControlsTimer),
      );
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [resetControlsTimer]);
// Video Client Initialization with cleanup
  useEffect(() => {
    if (!apiKey || !userToken || !userData) return;

    const _client = new StreamVideoClient({
      apiKey,
      user: userData,
      token: userToken,
    });
    setVideoClient(_client);

    return () => {
      _client.disconnectUser();
      setVideoClient(null);
    };
  }, [apiKey, userToken, userData]);
// Background processing effect
  useEffect(() => {
    if (!call) return;

    const setupBackgroundProcessing = async () => {
      try {
        setIsProcessingBackground(true);

        // Register the background filter
        const { unregister } = call.camera.registerFilter((originalStream: MediaStream) => {
          // Process the stream with selected background
          const processedStreamPromise = processFrame(originalStream, selectedBackground);
    
      return {
            output: processedStreamPromise.then(stream => stream || originalStream),
            stop: () => cleanup()
          };
        });

        // Store the unregister function for cleanup
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
  }, [call, selectedBackground, processFrame, cleanup]);

  // Background change handler
  const handleBackgroundChange = useCallback((background: BackgroundOption) => {
    setSelectedBackground(background);
    // Save to localStorage for persistence
    try {
      localStorage.setItem('meetingBackground', JSON.stringify(background));
    } catch (error) {
      console.error('Error saving background to localStorage:', error);
    }
  }, []);
// Memoized broadcast functions
  const startBroadcast = useCallback(async () => {
    if (!streamUrl || !streamKey || !selectedPlatform) {
      toast({
        description: 'Please fill in all the broadcast details.',
        type: 'destructive',
      });
      return;
    }

    try {
      setBroadcastError('');

      if (!call) {
        throw new Error('Call object is not available');
      }

      await call.startRTMPBroadcasts({
        broadcasts: [
          {
            name: selectedPlatform,
            stream_url: streamUrl,
            stream_key: streamKey,
          },
        ],
      });

     
  toast({
        title: 'Broadcast Started',
        description: `${selectedPlatform} broadcast started successfully!`,
      });
      setActiveBroadcasts((prev) => [...prev, selectedPlatform]);
      setShowBroadcastForm(false);
      setSelectedPlatform('');
    } catch (error: any) {
      console.error('Error starting broadcast:', error);
      const errorMessages: Record<string, string> = {
        'Invalid stream key': 'Invalid stream key. Please check your details.',
        Unauthorized: 'Authorization error. Please check your permissions.',
      };
const errorMessage = Object.keys(errorMessages).find((key) =>
        error.message?.includes(key),
      );
const description = errorMessage
        ?
errorMessages[errorMessage]
        : `Failed to start ${selectedPlatform} broadcast: ${error.message}`;
toast({
        title: 'Error',
        description,
        type: 'destructive',
      });
}
  }, [streamUrl, streamKey, selectedPlatform, call, toast]);

  const stopBroadcast = useCallback(
    async (platformName: string) => {
      try {
        if (!call) {
          setBroadcastError('Call object is not available.');
          return;
        }

        await call.stopRTMPBroadcast(platformName);
        setActiveBroadcasts((prev) =>
          prev.filter((name) => name !== 
platformName),
        );
      } catch (error: any) {
        console.error('Error stopping broadcast:', error);
        setBroadcastError(`Failed to stop ${platformName} broadcast.`);
      }
    },
    [call],
  );
// REMOVED: sendMessage function

  // 3. Update the `togglePanel` Function (Removed 'superchat' from types)
  const togglePanel = useCallback(
    (
      panelName: 'participants' | 'chat',
    ) => {
      setActivePanel((current) => (current === panelName ? 'none' : panelName));
    },
    [],
  );
// Optimized button hover handler
  const handleButtonHover = useCallback(
    (buttonId: string, isHovering: boolean) => {
      setButtonHoverStates((prev) => ({
        ...prev,
        [buttonId]: isHovering,
      }));
    },
    [],
  );
// REMOVED: handleSuperchatSuccess

// Memoized layout component
  const CallLayout = useMemo(() => {
    const layouts = {
      grid: <CustomGridLayout />,
      'speaker-left': <SpeakerLayout participantsBarPosition="left" />,
      'speaker-right': <SpeakerLayout participantsBarPosition="right" />,
    };
    return layouts[layout] || layouts['speaker-left'];
  }, [layout]);
// REMOVED: Chat Messages Management useEffect
// REMOVED: Auto-scroll chat effect
// Broadcast status check with optimization
  useEffect(() => {
    if (!call) return;

    const checkBroadcastStatus = async () => {
      try {
        const resp = await call.get();
        const isBroadcasting = resp.call.egress.broadcasting;
        if (isBroadcasting) {
          setActiveBroadcasts((prev) => [...prev]);
        } else {
          setActiveBroadcasts([]);
   
      }
      } catch (error) {
        console.error('Error checking broadcast status:', error);
      }
    };

    checkBroadcastStatus();
  }, [call]);
// Unread messages tracking with optimization
  useEffect(() => {
    if (activePanel !== 'chat') {
      const handleNewMessage = () => {
        setUnreadMessages((prev) => prev + 1);
      };

      const subscription = supabase
        .channel(`unread-messages:${call?.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
  
         handleNewMessage,
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    } else {
      setUnreadMessages(0);
    }
  }, [activePanel, call?.id]);
// STEP 3: Update Real-time Poll Notifications
  // REPLACE THE ENTIRE OLD useEffect BLOCK WITH THIS NEW ONE
  // New poll notification handler
  useEffect(() => {
    if (!call?.id || showPollsPanel) return;

    const subscription = supabase
      .channel(`new-poll-notification-${call.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
       
    table: 'polls',
          filter: `call_id=eq.${call.id}`,
        },
        () => {
          if (!isAdmin) {
            setHasNewPoll(true);
            toast({
              title: 'A new poll has started!',
            
   description: 'Open the polls panel to cast your vote.',
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [call?.id, isAdmin, showPollsPanel, toast]);
// Memoized broadcast control component
  const BroadcastControl = useMemo(
    () => (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger
            onMouseEnter={() => handleButtonHover('broadcast', true)}
            onMouseLeave={() => handleButtonHover('broadcast', false)}
            className="size-11 rounded-full transition-all duration-200 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500/40 focus:outline-none flex items-center justify-center bg-gray-800/80 border border-gray-700/50 shadow-md"
     
      >
            <div className="relative">
              <Cast className="text-white size-5" />
              {buttonHoverStates['broadcast'] && (
                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-90">
                  Broadcast
  
               </span>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="center"
            className="bg-gray-800 border-gray-700 text-white rounded-lg 
shadow-xl animate-in fade-in-80 zoom-in-95 w-48"
          >
            {BROADCAST_PLATFORMS.map((platform) => (
              <DropdownMenuItem
                key={platform.id}
                onClick={() => {
                  if (activeBroadcasts.includes(platform.id)) {
    
stopBroadcast(platform.id);
} else {
                    setSelectedPlatform(platform.id);
setStreamUrl(platform.defaultUrl);
                    setStreamKey(platform.defaultKey);
                    setShowBroadcastForm(true);
                  }
                }}
                className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-700/70 rounded-md focus:bg-gray-700 focus:outline-none"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center">
  
                   <Cast className="mr-2 size-4" />
                    {platform.name}
                  </span>
                  <span
                    className={cn(
   
                   'text-xs font-medium px-1.5 py-0.5 rounded-md',
                      activeBroadcasts.includes(platform.id)
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-gray-700 text-gray-300',
   
                  )}
                  >
                    {activeBroadcasts.includes(platform.id) ?
'LIVE' : 'OFF'}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Broadcast Form Modal */}
        
{showBroadcastForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="w-full p-6 rounded-lg bg-[#243341] max-w-md relative bottom-20 shadow-2xl border border-gray-700/30">
              <button
                onClick={() => setShowBroadcastForm(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-full p-1"
 
              >
                <X size={20} />
              </button>

              <h3 className="mb-4 text-xl font-bold text-white">
                Start{' '}
                {BROADCAST_PLATFORMS.find((p) => p.id === 
selectedPlatform)
                  ?.name || selectedPlatform}{' '}
                Broadcast
              </h3>

              <div className="space-y-4">
                <div>
                  
<label className="block mb-1 text-sm font-medium text-white">
                    Stream URL
                  </label>
                  <input
                    type="text"
                  
   value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="rtmp://..."
                    className="w-full p-2.5 text-white rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/80 border border-gray-700"
                  />
         
        </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-white">
                    Stream Key
                  </label>
               
    <input
                    type="password"
                    value={streamKey}
                    onChange={(e) => setStreamKey(e.target.value)}
                    placeholder="Enter stream key..."
             
        className="w-full p-2.5 text-white rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/80 border border-gray-700"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Your stream key is kept secure and never stored.
</p>
                </div>

                {broadcastError && (
                  <div className="p-3 rounded-lg bg-red-500/20 flex items-center">
                    <AlertCircle size={16} className="text-red-400 mr-2" />
                   
  <span className="text-red-200 text-sm">
                      {broadcastError}
                    </span>
                  </div>
                )}

                <div className="flex justify-end mt-6 space-x-2">
 
                  <Button
                    variant="outline"
                    onClick={() => setShowBroadcastForm(false)}
                    className="bg-transparent border border-gray-600 hover:bg-gray-700 text-white rounded-lg"
                
   >
                    Cancel
                  </Button>
                  <Button
                    onClick={startBroadcast}
                    className="bg-red-500 hover:bg-red-600 
text-white rounded-lg shadow-md transition-all duration-200"
                  >
                    Start Broadcast
                  </Button>
                </div>
              </div>
         
    </div>
          </div>
        )}
      </>
    ),
    [
      handleButtonHover,
      buttonHoverStates,
      activeBroadcasts,
      stopBroadcast,
      selectedPlatform,
      streamUrl,
      streamKey,
      showBroadcastForm,
      broadcastError,
      startBroadcast,
    ],
 
  );

  if (callingState !== CallingState.JOINED) return <Loader />;

  return videoClient && call ?
(
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <section className="relative w-full h-full flex flex-col">
          <div className="relative flex items-center justify-center size-full">
            <div
              // STEP 4.1: Update Main Layout Resizing
              className={cn(
              
'flex transition-all duration-300 ease-in-out size-full',
                {
                  'max-w-[calc(100%-350px)]': activePanel !== 'none' || showPollsPanel,
                },
              )}
            >
             
{CallLayout}
            </div>

            {/* Participants panel */}
            {activePanel === 'participants' && (
              <div className="fixed top-0 right-0 p-4 bg-[#19232d]/95 backdrop-blur-md rounded-l-lg w-[300px] sm:w-[350px] h-full z-[100] overflow-hidden flex flex-col">
                <CallParticipantsList onClose={() => setActivePanel('none')} />
        
       </div>
            )}

            {/* REPLACED: Old Chat Panel JSX with new ChatPanel component */}
            {activePanel === 'chat' && call?.id && (
              <ChatPanel
                callId={call.id}
                userId={userData.id}
                isAdmin={isAdmin}
                onClose={() => setActivePanel('none')}
              />
            )}

            {/* REMOVED: Superchat Panel JSX Block */}
            
         
    {/* STEP 4.2 & 4.3: Replace Old Poll Components and Add New PollsPanel */}
            {/* REMOVED: Old PollsManager JSX */}
            {/* REMOVED: Old ActivePoll JSX */}

            {showPollsPanel && call?.id && (
              <PollsPanel
                callId={call.id}
    
             userId={userData.id}
                isAdmin={isAdmin}
                onClose={() => setShowPollsPanel(false)}
              />
            )}
          </div>

          {/* Bottom Controls */}
     
      <div
            className={`
              fixed bottom-0 w-full px-4 pb-4
              transition-opacity duration-300
              ${
                showControls
                  ?
'opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none'
              }
                  `}
          >
            <div className="flex flex-wrap items-center justify-center gap-2 p-3 mx-auto transition rounded-lg sm:gap-4 bg-[#19232d]/90 backdrop-blur-md max-w-max shadow-lg border border-gray-700/30">
         
      <div className="flex items-center gap-2">
                <CallControls onLeave={() => router.push('/')} />
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <AdminPanel />
    
               {BroadcastControl}
                  <div className="h-8 w-px bg-gray-700/50 mx-1"></div>
                </div>
              )}

              {/* Layout Dropdown */}
              <DropdownMenu>
   
              <DropdownMenuTrigger
                  onMouseEnter={() => handleButtonHover('layout', true)}
                  onMouseLeave={() => handleButtonHover('layout', false)}
                  className="size-11 rounded-full transition-all duration-200 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500/40 focus:outline-none flex items-center justify-center bg-gray-800/80 border border-gray-700/50 shadow-md"
             
    >
                  <div className="relative">
                    <LayoutList className="text-white size-5" />
                    {buttonHoverStates['layout'] && (
                      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 
rounded whitespace-nowrap opacity-90">
                        Layout
                      </span>
                    )}
                  </div>
              
   </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="center"
                  className="bg-gray-800 border-gray-700 text-white rounded-lg shadow-xl animate-in fade-in-80 zoom-in-95 w-40"
                >
    
               {[
                    { name: "Grid", value: "grid", icon: <LayoutList className="mr-2 size-4" /> },
                    { name: "Speaker Left", value: "speaker-left", icon: <LayoutList className="mr-2 size-4" /> },
                    { name: "Speaker Right", value: 
"speaker-right", icon: <LayoutList className="mr-2 size-4" /> },
                  ].map(({ name, value, icon }) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => setLayout(value as CallLayoutType)}
  
                     className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-700/70 rounded-md focus:bg-gray-700 focus:outline-none"
                    >
                      {icon}
                      {name}
       
                {layout === value && <span className="ml-2 h-2 w-2 rounded-full bg-blue-500"></span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
        
       {/* Chat Button with notification indicator */}
              <button
                onMouseEnter={() => handleButtonHover("chat", true)}
                onMouseLeave={() => handleButtonHover("chat", false)}
                onClick={() => {
                  
togglePanel("chat")
                  setUnreadMessages(0) // Reset unread count when opening chat
                }}
                className="size-11 rounded-full transition-all duration-200 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500/40 focus:outline-none flex items-center justify-center bg-gray-800/80 border border-gray-700/50 shadow-md relative"
              >
              
   <div className="relative">
                  <MessageSquare className="text-white size-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center animate-pulse">
                      
{unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                  {buttonHoverStates["chat"] && (
                    <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-90">
   
                   Chat
                    </span>
                  )}
                </div>
              </button>

             
  {/* Main Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  onMouseEnter={() => handleButtonHover("menu", true)}
                  onMouseLeave={() => handleButtonHover("menu", false)}
                  className="size-11 rounded-full transition-all duration-200 hover:bg-gray-700 
focus:ring-2 focus:ring-blue-500/40 focus:outline-none flex items-center justify-center bg-gray-800/80 border border-gray-700/50 shadow-md"
                >
                  <div className="relative">
                    <MoreVertical className="text-white size-5" />
                    {buttonHoverStates["menu"] && (
           
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-90">
                        More
                      </span>
                    )}
          
         </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="end"
                  className="bg-gray-800 border-gray-700 text-white rounded-lg shadow-xl animate-in 
fade-in-80 zoom-in-95 w-56 p-1"
                >
                  <DropdownMenuItem
                    onClick={() => togglePanel('participants')}
                    className="flex items-center px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-700/70 rounded-md focus:bg-gray-700 focus:outline-none group"
           
        >
                    <Users className="mr-2 size-4 text-gray-400 group-hover:text-white transition-colors" />
                    <span>Participants</span>
                    {activePanel === 'participants' && (
                      <span 
className="ml-auto h-2 w-2 rounded-full bg-blue-500"></span>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowBackgroundSelector(true)}
                  
   className="flex items-center px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-700/70 rounded-md focus:bg-gray-700 focus:outline-none group"
                    disabled={isProcessingBackground}
                  >
                    <ImageIcon className="mr-2 size-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    <span>Background</span>
    
                 <span className="ml-auto text-xs text-gray-400">
                      {selectedBackground.name}
                      {isProcessingBackground && " (Processing...)"}
                    </span>
              
     </DropdownMenuItem>

                  {/* REMOVED: Superchat DropdownMenuItem */}

                  {/* STEP 5: Update the Polls Button */}
                  <DropdownMenuItem
                    onClick={() => {
        
               setShowPollsPanel(true);
                      setHasNewPoll(false);
}}
                    className="flex items-center px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-700/70 rounded-md focus:bg-gray-700 focus:outline-none group"
                  >
                    <BarChart2 className="mr-2 size-4 text-gray-400 group-hover:text-white transition-colors" />
                    <span className="relative">
     
                   Polls
                      {hasNewPoll && (
                        <span className="absolute -top-1 -right-3 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                      )}
    
                 </span>
                    {showPollsPanel && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-blue-500"></span>
                    )}
               
    </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 border-t border-gray-700" />

                  <DropdownMenuItem className="flex items-center px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-700/70 rounded-md focus:bg-gray-700 focus:outline-none group">
                    <Settings className="mr-2 size-4 text-gray-400 group-hover:text-white transition-colors" />
                    
<span className="flex items-center">
                      <span>Statistics</span>
                      <CallStatsButton />
                    </span>
                  </DropdownMenuItem>
               
  </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* REMOVED: Send Superchat Modal JSX Block */}

          {/* Background Selector Modal */}
          {showBackgroundSelector && (
            <BackgroundSelector
          
    selectedBackground={selectedBackground}
              onBackgroundChange={handleBackgroundChange}
              onClose={() => setShowBackgroundSelector(false)}
            />
          )}
        </section>
      </StreamCall>
    </StreamVideo>
  ) : (
    <Loader />
  );
};
export default MeetingRoom;

