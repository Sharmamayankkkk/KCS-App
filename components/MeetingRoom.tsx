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
  Crown,
  BarChart2,
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
import AdminControls from './AdminPanel/AdminControls';
import { SuperchatPanel } from './superchat/superchat-panel';
import { SendSuperchatModal } from './superchat/send-superchat-modal';
import CustomGridLayout from './CustomGridLayout';
import CallControls from './CallControls';
import { BackgroundSelector } from './BackgroundSelector';
import { useBackgroundProcessor } from '@/hooks/useBackgroundProcessor';
import PollsPanel from './PollsPanel';

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
    'none' | 'participants' | 'chat' | 'superchat'
  >('none');
  
  const [showPollsPanel, setShowPollsPanel] = useState(false);
  const [hasNewPoll, setHasNewPoll] = useState(false);

  const [showSendSuperchat, setShowSendSuperchat] = useState(false);
  const [messageText, setMessageText] = useState('');
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [buttonHoverStates, setButtonHoverStates] = useState<
    Record<string, boolean>
  >({});
  const [showControls, setShowControls] = useState(true);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(DEFAULT_BACKGROUND);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [isProcessingBackground, setIsProcessingBackground] = useState(false);
  const { processFrame, cleanup } = useBackgroundProcessor();

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

  const [messages, setMessages] = useState<
    { id: string; text: string; sender: string }[]
  >([]);
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(
    null,
  );

  const { toast } = useToast();

  const isAdmin = useMemo(() => {
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim());
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

  useEffect(() => {
    if (!call) return;

    const setupBackgroundProcessing = async () => {
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
  }, [call, selectedBackground, processFrame, cleanup]);

  const handleBackgroundChange = useCallback((background: BackgroundOption) => {
    setSelectedBackground(background);
    try {
      localStorage.setItem('meetingBackground', JSON.stringify(background));
    } catch (error) {
      console.error('Error saving background to localStorage:', error);
    }
  }, []);

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || !call?.id) return;

      const { error } = await supabase.from('chat_messages').insert([
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

  const togglePanel = useCallback(
    (
      panelName: 'participants' | 'chat' | 'superchat',
    ) => {
      setActivePanel((current) => (current === panelName ? 'none' : panelName));
    },
    [],
  );

  const handleButtonHover = useCallback(
    (buttonId: string, isHovering: boolean) => {
      setButtonHoverStates((prev) => ({
        ...prev,
        [buttonId]: isHovering,
      }));
    },
    [],
  );

  const handleSuperchatSuccess = useCallback(() => {
    setShowSendSuperchat(false);
    setActivePanel('superchat');
  }, []);

  const CallLayout = useMemo(() => {
    const layouts = {
      grid: <CustomGridLayout />,
      'speaker-left': <SpeakerLayout participantsBarPosition="left" />,
      'speaker-right': <SpeakerLayout participantsBarPosition="right" />,
    };
    return layouts[layout] || layouts['speaker-left'];
  }, [layout]);

  useEffect(() => {
    if (!activePanel || activePanel !== 'chat' || !call?.id) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
      .from('chat_messages')
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
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
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

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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


  if (callingState !== CallingState.JOINED) return <Loader />;

  return videoClient && call ? (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <section className="relative w-full h-full flex flex-col">
          <div className="relative flex items-center justify-center size-full">
            <div
              className={cn(
                'flex transition-all duration-300 ease-in-out size-full',
                {
                  'max-w-[calc(100%-350px)]': activePanel !== 'none' || showPollsPanel,
                },
              )}
            >
              {CallLayout}
            </div>

            {activePanel === 'participants' && (
              <div className="fixed top-0 right-0 p-4 bg-[#19232d]/95 backdrop-blur-md rounded-l-lg w-[300px] sm:w-[350px] h-full z-[100] overflow-hidden flex flex-col">
                <CallParticipantsList onClose={() => setActivePanel('none')} />
              </div>
            )}

            {activePanel === 'chat' && (
              <div className="fixed top-0 right-0 p-4 transition-all duration-300 ease-in-out bg-[#19232d]/95 backdrop-blur-md rounded-l-lg w-[300px] sm:w-[350px] h-full z-[100] overflow-hidden flex flex-col">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-white">Chat</h3>
                    <button
                      className="p-2 transition rounded-full hover:bg-gray-700/50"
                      onClick={() => setActivePanel('none')}
                    >
                      <X className="text-white size-5" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-2 overflow-auto custom-scrollbar-hidden pr-1">
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
                        className="w-full p-3 pr-12 text-white rounded-full bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-blue-500/70 border border-gray-700/50"
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
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-full p-1.5 transition-all duration-200"
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
                      className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 rounded-full py-2.5 shadow-md transition-all duration-300 hover:shadow-lg"
                      size="sm"
                    >
                      <Crown size={14} className="mr-1.5" /> Send Superchat
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activePanel === 'superchat' && call?.id && (
              <div className="fixed top-0 right-0 w-[300px] sm:w-[350px] h-full z-[100] overflow-hidden flex flex-col bg-[#19232d]/95 backdrop-blur-md rounded-l-lg">
                <SuperchatPanel
                  callId={call.id}
                  userId={userData?.id || ''}
                  isAdmin={isAdmin}
                  onClose={() => setActivePanel('none')}
                />
              </div>
            )}
            
            {showPollsPanel && call?.id && (
              <PollsPanel
                callId={call.id}
                userId={userData.id}
                isAdmin={isAdmin}
                onClose={() => setShowPollsPanel(false)}
              />
            )}
          </div>

          <div
            className={`
              fixed bottom-0 w-full px-4 pb-4
              transition-opacity duration-300
              ${
                showControls
                  ? 'opacity-100 pointer-events-auto'
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
                  <AdminControls />
                  <div className="h-8 w-px bg-gray-700/50 mx-1"></div>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger
                  onMouseEnter={() => handleButtonHover('layout', true)}
                  onMouseLeave={() => handleButtonHover('layout', false)}
                  className="size-11 rounded-full transition-all duration-200 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500/40 focus:outline-none flex items-center justify-center bg-gray-800/80 border border-gray-700/50 shadow-md"
                >
                  <div className="relative">
                    <LayoutList className="text-white size-5" />
                    {buttonHoverStates['layout'] && (
                      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-90">
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
                    { name: "Speaker Right", value: "speaker-right", icon: <LayoutList className="mr-2 size-4" /> },
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
              <button
                onMouseEnter={() => handleButtonHover("chat", true)}
                onMouseLeave={() => handleButtonHover("chat", false)}
                onClick={() => {
                  togglePanel("chat")
                  setUnreadMessages(0) 
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

              <DropdownMenu>
                <DropdownMenuTrigger
                  onMouseEnter={() => handleButtonHover("menu", true)}
                  onMouseLeave={() => handleButtonHover("menu", false)}
                  className="size-11 rounded-full transition-all duration-200 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500/40 focus:outline-none flex items-center justify-center bg-gray-800/80 border border-gray-700/50 shadow-md"
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
                  className="bg-gray-800 border-gray-700 text-white rounded-lg shadow-xl animate-in fade-in-80 zoom-in-95 w-56 p-1"
                >
                  <DropdownMenuItem
                    onClick={() => togglePanel('participants')}
                    className="flex items-center px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-700/70 rounded-md focus:bg-gray-700 focus:outline-none group"
                  >
                    <Users className="mr-2 size-4 text-gray-400 group-hover:text-white transition-colors" />
                    <span>Participants</span>
                    {activePanel === 'participants' && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-blue-500"></span>
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

                  <DropdownMenuItem
                    onClick={() => togglePanel('superchat')}
                    className="flex items-center px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-700/70 rounded-md focus:bg-gray-700 focus:outline-none group"
                  >
                    <Crown className="mr-2 size-4 text-amber-500 group-hover:text-amber-400 transition-colors" />
                    <span>Superchat</span>
                    {activePanel === 'superchat' && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-blue-500"></span>
                    )}
                  </DropdownMenuItem>

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

          {showSendSuperchat && call?.id && (
            <SendSuperchatModal
              callId={call.id}
              senderName={userData?.fullName || 'Anonymous'}
              userId={userData?.id || ''}
              onClose={() => setShowSendSuperchat(false)}
              onSuccess={handleSuperchatSuccess}
            />
          )}

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