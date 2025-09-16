'use client';

import { DropdownMenuTrigger ,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
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
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

// Local components
import Loader from './Loader';
import AdminPanel from './AdminPanel';
import MuteButton from './MuteButton';
import EndCallButton from './EndCallButton';
import { SuperchatPanel } from './superchat/superchat-panel';
import { SendSuperchatModal } from './superchat/send-superchat-modal';
import { PollsManager } from './poll/polls-manager';
import { ActivePoll } from './poll/active-poll';
import CustomGridLayout from './CustomGridLayout';
import CallControls from './CallControls';
import { BackgroundSelector } from './BackgroundSelector';
import { useBackgroundProcessor } from '@/hooks/useBackgroundProcessor';

// Move constants outside component to prevent recreation
const BROADCAST_PLATFORMS = [
  {
    id: 'youtube',
    name: 'YouTube',
    defaultUrl: process.env.NEXT_PUBLIC_YOUTUBE_STREAM_URL || '',
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
  type: 'none' | 'blur' | 'image'
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
  const [activePanel, setActivePanel] = useState<
    'none' | 'participants' | 'chat' | 'superchat' | 'polls' | 'activePoll'
  >('none');
  const [showSendSuperchat, setShowSendSuperchat] = useState(false);
  const [messageText, setMessageText] = useState('');
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
  const { youtubeStreamUrl, youtubeStreamKey } = useMemo(
    () => ({
      youtubeStreamUrl: process.env.NEXT_PUBLIC_YOUTUBE_STREAM_URL || '',
      youtubeStreamKey: process.env.NEXT_PUBLIC_YOUTUBE_STREAM_KEY || '',
    }),
    [],
  );

  const [streamUrl, setStreamUrl] = useState(youtubeStreamUrl);
  const [streamKey, setStreamKey] = useState(youtubeStreamKey);
  const [messages, setMessages] = useState<
    { id: string; text: string; sender: string }[]
  >([]);
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
        ? errorMessages[errorMessage]
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
          prev.filter((name) => name !== platformName),
        );
      } catch (error: any) {
        console.error('Error stopping broadcast:', error);
        setBroadcastError(`Failed to stop ${platformName} broadcast.`);
      }
    },
    [call],
  );

  // Optimized message sending
  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || !call?.id) return;

      const { error } = await supabase.from('messages').insert([
        {
          call_id: call.id,
          text: messageText,
          sender: userData?.fullName || 'Anonymous',
        },
      ]);

      if (error) console.error('Error sending message:', error);
      else setMessageText('');
    },
    [call?.id, userData?.fullName],
  );

  // Optimized panel toggle
  const togglePanel = useCallback(
    (
      panelName: 'participants' | 'chat' | 'superchat' | 'polls' | 'activePoll',
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

  // Optimized success handler
  const handleSuperchatSuccess = useCallback(() => {
    setShowSendSuperchat(false);
    setActivePanel('superchat');
  }, []);

  // Memoized layout component
  const CallLayout = useMemo(() => {
    const layouts = {
      grid: <CustomGridLayout />,
      'speaker-left': <SpeakerLayout participantsBarPosition="left" />,
      'speaker-right': <SpeakerLayout participantsBarPosition="right" />,
    };
    return layouts[layout] || layouts['speaker-left'];
  }, [layout]);

  // Chat Messages Management with optimization
  useEffect(() => {
    if (!activePanel || activePanel !== 'chat' || !call?.id) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('call_id', call.id)
        .order('created_at', { ascending: true });

      if (error) console.error('Error fetching messages:', error);
      else {
        setMessages(
          data.map((msg) => ({
            id: msg.id,
            text: msg.text,
            sender: msg.sender,
          })),
        );
      }
    };

    fetchMessages();

    const subscription = supabase
      .channel(`messages:${call.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: payload.new.id,
              text: payload.new.text,
              sender: payload.new.sender,
            },
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [activePanel, call?.id]);

  // Auto-scroll chat effect
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
          { event: 'INSERT', schema: 'public', table: 'messages' },
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

  // Active polls check with optimization
  useEffect(() => {
    if (!call?.id) return;

    const checkForActivePolls = async () => {
      try {
        const { data, error } = await supabase
          .from('polls')
          .select('*')
          .eq('call_id', call.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0 && !isAdmin) {
          setActivePanel('activePoll');
          toast({
            title: 'New Poll',
            description: 'A new poll is available!',
          });
        }
      } catch (err) {
        console.error('Error checking for active polls:', err);
      }
    };

    checkForActivePolls();

    const subscription = supabase
      .channel(`new-polls-${call.id}`)
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
            setActivePanel('activePoll');
            toast({
              title: 'New Poll',
              description: 'A new poll is available!',
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [call?.id, isAdmin, toast]);

  // Memoized broadcast control component
  const BroadcastControl = useMemo(
    () => (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger
            onMouseEnter={() => handleButtonHover('broadcast', true)}
            onMouseLeave={() => handleButtonHover('broadcast', false)}
            className="flex size-11 items-center justify-center rounded-full border border-gray-700/50 bg-gray-800/80 shadow-md transition-all duration-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <div className="relative">
              <Cast className="size-5 text-white" />
              {buttonHoverStates.broadcast && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-90">
                  Broadcast
                </span>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="center"
            className="w-48 rounded-lg border-gray-700 bg-gray-800 text-white shadow-xl animate-in fade-in-80 zoom-in-95"
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
                className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm hover:bg-gray-700/70 focus:bg-gray-700 focus:outline-none"
              >
                <div className="flex w-full items-center justify-between">
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
                    {activeBroadcasts.includes(platform.id) ? 'LIVE' : 'OFF'}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Broadcast Form Modal */}
        {showBroadcastForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="relative bottom-20 w-full max-w-md rounded-lg border border-gray-700/30 bg-[#243341] p-6 shadow-2xl">
              <button
                onClick={() => setShowBroadcastForm(false)}
                className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <X size={20} />
              </button>

              <h3 className="mb-4 text-xl font-bold text-white">
                Start{' '}
                {BROADCAST_PLATFORMS.find((p) => p.id === selectedPlatform)
                  ?.name || selectedPlatform}{' '}
                Broadcast
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white">
                    Stream URL
                  </label>
                  <input
                    type="text"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="rtmp://..."
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/80"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-white">
                    Stream Key
                  </label>
                  <input
                    type="password"
                    value={streamKey}
                    onChange={(e) => setStreamKey(e.target.value)}
                    placeholder="Enter stream key..."
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/80"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Your stream key is kept secure and never stored.
                  </p>
                </div>

                {broadcastError && (
                  <div className="flex items-center rounded-lg bg-red-500/20 p-3">
                    <AlertCircle size={16} className="mr-2 text-red-400" />
                    <span className="text-sm text-red-200">
                      {broadcastError}
                    </span>
                  </div>
                )}

                <div className="mt-6 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowBroadcastForm(false)}
                    className="rounded-lg border border-gray-600 bg-transparent text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={startBroadcast}
                    className="rounded-lg bg-red-500 text-white shadow-md transition-all duration-200 hover:bg-red-600"
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

  return videoClient && call ? (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <section className="relative flex size-full flex-col">
          <div className="relative flex size-full items-center justify-center">
            <div
              className={cn(
                'flex transition-all duration-300 ease-in-out size-full',
                {
                  'max-w-[1000px]': activePanel === 'none',
                  'max-w-[800px]': activePanel !== 'none',
                },
              )}
            >
              {CallLayout}
            </div>

            {/* Participants panel */}
            {activePanel === 'participants' && (
              <div className="fixed right-0 top-0 z-[100] flex h-full w-[300px] flex-col overflow-hidden rounded-l-lg bg-[#19232d]/95 p-4 backdrop-blur-md sm:w-[350px]">
                <CallParticipantsList onClose={() => setActivePanel('none')} />
              </div>
            )}

            {/* Chat Panel */}
            {activePanel === 'chat' && (
              <div className="fixed right-0 top-0 z-[100] flex h-full w-[300px] flex-col overflow-hidden rounded-l-lg bg-[#19232d]/95 p-4 backdrop-blur-md transition-all duration-300 ease-in-out sm:w-[350px]">
                <div className="flex h-full flex-col">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Chat</h3>
                    <button
                      className="rounded-full p-2 transition hover:bg-gray-700/50"
                      onClick={() => setActivePanel('none')}
                    >
                      <X className="size-5 text-white" />
                    </button>
                  </div>
                  <div className="custom-scrollbar-hidden flex-1 space-y-2 overflow-auto pr-1">
                    {messages.map((msg, index) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'p-2.5 rounded-lg backdrop-blur-sm transition-all duration-300',
                          index === messages.length - 1 && unreadMessages === 0
                            ? 'bg-blue-500/20 animate-pulse'
                            : 'bg-gray-700/50',
                        )}
                      >
                        <span className="font-semibold text-yellow-300">
                          {msg.sender}:
                        </span>
                        <span className="ml-2 text-white">{msg.text}</span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="w-full rounded-full border border-gray-700/50 bg-gray-800/70 p-3 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/70"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            sendMessage(messageText);
                          }
                        }}
                      />
                      <button
                        onClick={() => sendMessage(messageText)}
                        disabled={!messageText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 p-1.5 text-white transition-all duration-200 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m22 2-7 20-4-9-9-4Z" />
                          <path d="M22 2 11 13" />
                        </svg>
                      </button>
                    </div>
                    <Button
                      onClick={() => {
                        setShowSendSuperchat(true);
                        setActivePanel('none');
                      }}
                      className="rounded-full bg-gradient-to-r from-amber-500 to-amber-700 py-2.5 shadow-md transition-all duration-300 hover:from-amber-600 hover:to-amber-800 hover:shadow-lg"
                      size="sm"
                    >
                      <Crown size={14} className="mr-1.5" /> Send Superchat
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Superchat Panel */}
            {activePanel === 'superchat' && call?.id && (
              <div className="mobile-panel fixed right-0 top-0 z-[100] flex size-full flex-col sm:w-[350px] md:w-[380px] md:rounded-l-lg">
                <SuperchatPanel
                  callId={call.id}
                  userId={userData?.id || ''}
                  isAdmin={isAdmin}
                  onClose={() => setActivePanel('none')}
                />
              </div>
            )}

            {/* Polls Panel */}
            {activePanel === 'polls' && call?.id && (
              <div className="mobile-panel fixed right-0 top-0 z-[100] flex size-full flex-col sm:w-[350px] md:w-[380px] md:rounded-l-lg">
                <PollsManager
                  callId={call.id}
                  userId={userData?.id || ''}
                  isAdmin={isAdmin}
                  onClose={() => setActivePanel('none')}
                />
              </div>
            )}

            {/* Active Poll Panel */}
            {activePanel === 'activePoll' && call?.id && (
              <div className="mobile-panel fixed right-0 top-0 z-[100] flex size-full flex-col sm:w-[350px] md:w-[380px] md:rounded-l-lg">
                <ActivePoll
                  callId={call.id}
                  userId={userData?.id || ''}
                  onClose={() => setActivePanel('none')}
                />
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div
            className={`
              fixed bottom-0 w-full px-4 pb-4
              transition-opacity duration-300
              ${
                showControls
                  ? 'pointer-events-auto opacity-100'
                  : 'pointer-events-none opacity-0'
              }
                  `}
          >
            <div className="mx-auto flex max-w-max flex-wrap items-center justify-center gap-2 rounded-lg border border-gray-700/30 bg-[#19232d]/90 p-3 shadow-lg backdrop-blur-md transition sm:gap-4">
              <div className="flex items-center gap-2">
                <CallControls onLeave={() => router.push('/')} />
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <AdminPanel />
                  {BroadcastControl}
                  <div className="mx-1 h-8 w-px bg-gray-700/50"></div>
                </div>
              )}

              {/* Layout Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  onMouseEnter={() => handleButtonHover('layout', true)}
                  onMouseLeave={() => handleButtonHover('layout', false)}
                  className="flex size-11 items-center justify-center rounded-full border border-gray-700/50 bg-gray-800/80 shadow-md transition-all duration-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <div className="relative">
                    <LayoutList className="size-5 text-white" />
                    {buttonHoverStates.layout && (
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-90">
                        Layout
                      </span>
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="center"
                  className="w-40 rounded-lg border-gray-700 bg-gray-800 text-white shadow-xl animate-in fade-in-80 zoom-in-95"
                >
                  {[
                    { name: "Grid", value: "grid", icon: <LayoutList className="mr-2 size-4" /> },
                    { name: "Speaker Left", value: "speaker-left", icon: <LayoutList className="mr-2 size-4" /> },
                    { name: "Speaker Right", value: "speaker-right", icon: <LayoutList className="mr-2 size-4" /> },
                  ].map(({ name, value, icon }) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => setLayout(value as CallLayoutType)}
                      className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm hover:bg-gray-700/70 focus:bg-gray-700 focus:outline-none"
                    >
                      {icon}
                      {name}
                      {layout === value && <span className="ml-2 size-2 rounded-full bg-blue-500"></span>}
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
                className="relative flex size-11 items-center justify-center rounded-full border border-gray-700/50 bg-gray-800/80 shadow-md transition-all duration-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <div className="relative">
                  <MessageSquare className="size-5 text-white" />
                  {unreadMessages > 0 && (
                    <span className="absolute -right-1 -top-1 flex size-5 animate-pulse items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                  {buttonHoverStates.chat && (
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-90">
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
                  className="flex size-11 items-center justify-center rounded-full border border-gray-700/50 bg-gray-800/80 shadow-md transition-all duration-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <div className="relative">
                    <MoreVertical className="size-5 text-white" />
                    {buttonHoverStates.menu && (
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-90">
                        More
                      </span>
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="end"
                  className="w-56 rounded-lg border-gray-700 bg-gray-800 p-1 text-white shadow-xl animate-in fade-in-80 zoom-in-95"
                >
                  <DropdownMenuItem
                    onClick={() => togglePanel('participants')}
                    className="group flex cursor-pointer items-center rounded-md px-3 py-2.5 text-sm hover:bg-gray-700/70 focus:bg-gray-700 focus:outline-none"
                  >
                    <Users className="mr-2 size-4 text-gray-400 transition-colors group-hover:text-white" />
                    <span>Participants</span>
                    {activePanel === 'participants' && (
                      <span className="ml-auto size-2 rounded-full bg-blue-500"></span>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowBackgroundSelector(true)}
                    className="group flex cursor-pointer items-center rounded-md px-3 py-2.5 text-sm hover:bg-gray-700/70 focus:bg-gray-700 focus:outline-none"
                    disabled={isProcessingBackground}
                  >
                    <ImageIcon className="mr-2 size-4 text-purple-400 transition-colors group-hover:text-purple-300" />
                    <span>Background</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {selectedBackground.name}
                      {isProcessingBackground && " (Processing...)"}
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => togglePanel('superchat')}
                    className="group flex cursor-pointer items-center rounded-md px-3 py-2.5 text-sm hover:bg-gray-700/70 focus:bg-gray-700 focus:outline-none"
                  >
                    <Crown className="mr-2 size-4 text-amber-500 transition-colors group-hover:text-amber-400" />
                    <span>Superchat</span>
                    {activePanel === 'superchat' && (
                      <span className="ml-auto size-2 rounded-full bg-blue-500"></span>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      togglePanel(isAdmin ? 'polls' : 'activePoll')
                    }
                    className="group flex cursor-pointer items-center rounded-md px-3 py-2.5 text-sm hover:bg-gray-700/70 focus:bg-gray-700 focus:outline-none"
                  >
                    <BarChart2 className="mr-2 size-4 text-gray-400 transition-colors group-hover:text-white" />
                    <span>Polls</span>
                    {(activePanel === 'polls' ||
                      activePanel === 'activePoll') && (
                      <span className="ml-auto size-2 rounded-full bg-blue-500"></span>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 border-t border-gray-700" />

                  <DropdownMenuItem className="group flex cursor-pointer items-center rounded-md px-3 py-2.5 text-sm hover:bg-gray-700/70 focus:bg-gray-700 focus:outline-none">
                    <Settings className="mr-2 size-4 text-gray-400 transition-colors group-hover:text-white" />
                    <span className="flex items-center">
                      <span>Statistics</span>
                      <CallStatsButton />
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Send Superchat Modal */}
          {showSendSuperchat && call?.id && (
            <SendSuperchatModal
              callId={call.id}
              senderName={userData?.fullName || 'Anonymous'}
              userId={userData?.id || ''}
              onClose={() => setShowSendSuperchat(false)}
              onSuccess={handleSuperchatSuccess}
            />
          )}

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
