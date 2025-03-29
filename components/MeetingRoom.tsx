'use client';

import { useState, useEffect, useRef } from 'react';
import {
  CallControls,
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
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useRouter } from 'next/navigation';
import { Users, LayoutList, MessageSquare, X, Cast } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import MuteButton from './MuteButton';
import { cn } from '@/lib/utils';
import EndCallButton from './EndCallButton';
import { supabase } from '@/lib/supabaseClient';

interface BroadcastPlatform {
  name: string;
  streamUrl: string;
  streamKey: string;
}

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

interface MeetingRoomProps {
  apiKey: string;
  userToken: string;
  userData: any;
}

const MeetingRoom = ({ apiKey, userToken, userData }: MeetingRoomProps) => {
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messageText, setMessageText] = useState("");
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  
  // Broadcast States
  const [broadcastPlatforms, setBroadcastPlatforms] = useState<{[key: string]: BroadcastPlatform}>({});
  const [activeBroadcasts, setActiveBroadcasts] = useState<string[]>([]);
  const [broadcastError, setBroadcastError] = useState<string>('');
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [newBroadcast, setNewBroadcast] = useState({
    name: '',
    streamUrl: '',
    streamKey: ''
  });

  // Add new broadcast platform
  const addBroadcastPlatform = () => {
    if (!newBroadcast.name || !newBroadcast.streamUrl || !newBroadcast.streamKey) {
      setBroadcastError('All fields are required');
      return;
    }
    
    setBroadcastPlatforms(prev => ({
      ...prev,
      [newBroadcast.name]: newBroadcast
    }));
    
    setNewBroadcast({ name: '', streamUrl: '', streamKey: '' });
    setShowBroadcastForm(false);
  };

  // Start RTMP broadcast
  const startBroadcast = async (platform: BroadcastPlatform) => {
    try {
      setBroadcastError('');
      await call?.goLive({
        start_rtmp: true,
        rtmp: {
          stream_url: platform.streamUrl,
          stream_key: platform.streamKey,
        },
      });
      setActiveBroadcasts(prev => [...prev, platform.name]);
    } catch (error) {
      console.error('Error starting broadcast:', error);
      setBroadcastError(`Failed to start ${platform.name} broadcast`);
    }
  };

  // Stop RTMP broadcast
  const stopBroadcast = async (platformName: string) => {
    try {
      setBroadcastError('');
      await call?.stopLive({
        stop_rtmp: true,
      });
      setActiveBroadcasts(prev => prev.filter(name => name !== platformName));
    } catch (error) {
      console.error('Error stopping broadcast:', error);
      setBroadcastError(`Failed to stop ${platformName} broadcast`);
    }
  };

  // Check broadcast status
  useEffect(() => {
    if (!call) return;

    const checkBroadcastStatus = async () => {
      const resp = await call.get();
      const rtmpBroadcasts = resp.call.egress.rtmps;
      setActiveBroadcasts(rtmpBroadcasts.map(broadcast => broadcast.name));
    };

    checkBroadcastStatus();
  }, [call]);

  // Video Client Initialization
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);

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

  // Chat Messages Management
  const [messages, setMessages] = useState<{ id: string; text: string; sender: string }[]>([]);

  useEffect(() => {
    if (!showChat || !call?.id) return;
    
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('call_id', call.id)
        .order('created_at', { ascending: true });
  
      if (error) console.error('Error fetching messages:', error);
      else {
        setMessages(data.map((msg) => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender
        })));
      }
    };

    fetchMessages();
  
    const subscription = supabase
      .channel(`messages:${call.id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, {
            id: payload.new.id,
            text: payload.new.text,
            sender: payload.new.sender,
          }]);
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [showChat, call?.id]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !call?.id) return;
  
    const { error } = await supabase.from('messages').insert([{
      call_id: call.id,
      text: messageText,
      sender: userData?.fullName || 'Anonymous',
    }]);
  
    if (error) console.error('Error sending message:', error);
    else setMessageText("");
  };

  // Broadcast Control Component
  const BroadcastControl = () => (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="p-2 rounded-lg transition hover:bg-gray-700/50"
        disabled={!!broadcastError}
      >
        <Cast className="text-white size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setShowBroadcastForm(true)}>
          Add New Platform
        </DropdownMenuItem>
        {Object.values(broadcastPlatforms).map(platform => (
          <DropdownMenuItem
            key={platform.name}
            onClick={() => {
              if (!activeBroadcasts.includes(platform.name)) {
                startBroadcast(platform);
              } else {
                stopBroadcast(platform.name);
              }
            }}
          >
            {activeBroadcasts.includes(platform.name) 
              ? `Stop ${platform.name} Broadcast` 
              : `Start ${platform.name} Broadcast`}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Layout Component
  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout groupSize={9} pageArrowsVisible={true} />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
  const hostId = userData?.primaryEmailAddress?.emailAddress;
  const isHost = adminEmails.includes(hostId);

  return (
    videoClient && call ? (
      <StreamVideo client={videoClient}>
        <StreamCall call={call}>
          <section className="relative w-full h-screen overflow-hidden pt-4">
            <div className="relative flex items-center justify-center size-full">
              <div className={cn(
                'flex size-full transition-all duration-300 ease-in-out',
                {
                  'max-w-[1000px]': !showChat && !showParticipants,
                  'max-w-[800px]': showChat || showParticipants
                }
              )}>
                <CallLayout />
              </div>

              {showParticipants && !showChat && (
                <div className="fixed md:relative right-0 w-[300px] sm:w-[350px] 
                              h-[calc(100vh-100px)] md:h-[calc(100vh-86px)]
                              bg-[#19232d]/95 backdrop-blur-md rounded-lg 
                              p-4 overflow-hidden z-[100] md:z-auto
                              transition-all duration-300 ease-in-out">
                  <CallParticipantsList onClose={() => setShowParticipants(false)} />
                </div>
              )}

              {showChat && !showParticipants && (
                <div className="fixed md:relative right-0 w-[300px] sm:w-[350px]
                              h-[calc(100vh-100px)] md:h-[calc(100vh-86px)]
                              bg-[#19232d]/95 backdrop-blur-md rounded-lg
                              p-4 overflow-hidden z-[100] md:z-10
                              transition-all duration-300 ease-in-out">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-end mb-2">
                      <button
                        className="p-2 rounded transition hover:bg-gray-700/50"
                        onClick={() => setShowChat(false)}
                      >
                        <X className="text-white size-5" />
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-auto space-y-2 custom-scrollbar-hidden">
                      {messages.map((msg) => (
                        <div key={msg.id} 
                             className="p-2 rounded-lg backdrop-blur-sm bg-gray-700/50">
                          <span className="font-semibold text-yellow-1">
                            {msg.sender}:
                          </span>
                          <span className="ml-2 text-white">{msg.text}</span>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="w-full p-2 mt-2 rounded-lg text-white bg-gray-800/50
                               backdrop-blur-sm focus:outline-none 
                               focus:ring-2 focus:ring-blue-500"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage(messageText);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Broadcast Form Modal */}
            {showBroadcastForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="w-[400px] p-6 rounded-lg bg-[#19232d]">
                  <h3 className="mb-4 text-white">Add Broadcast Platform</h3>
                  <input
                    type="text"
                    placeholder="Platform Name"
                    className="w-full p-2 mb-2 rounded text-white bg-gray-800"
                    value={newBroadcast.name}
                    onChange={(e) => setNewBroadcast(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                  />
                  <input
                    type="text"
                    placeholder="Stream URL"
                    className="w-full p-2 mb-2 rounded text-white bg-gray-800"
                    value={newBroadcast.streamUrl}
                    onChange={(e) => setNewBroadcast(prev => ({
                      ...prev,
                      streamUrl: e.target.value
                    }))}
                  />
                  <input
                    type="text"
                    placeholder="Stream Key"
                    className="w-full p-2 mb-4 rounded text-white bg-gray-800"
                    value={newBroadcast.streamKey}
                    onChange={(e) => setNewBroadcast(prev => ({
                      ...prev,
                      streamKey: e.target.value
                    }))}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      className="px-4 py-2 rounded bg-gray-700 text-white"
                      onClick={() => setShowBroadcastForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 rounded bg-blue-600 text-white"
                      onClick={addBroadcastPlatform}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="fixed bottom-0 w-full pb-4 px-4">
              <div className="flex flex-wrap items-center justify-center gap-2 
                            sm:gap-4 p-2 rounded-lg bg-[#19232d]/80 backdrop-blur-md mx-auto max-w-max">
                <CallControls onLeave={() => router.push('/')} />
                
                {isHost && (
                  <>
                    <MuteButton />
                    <EndCallButton />
                    <BroadcastControl />
                    {broadcastError && (
                      <span className="text-sm text-red-500">{broadcastError}</span>
                    )}
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger className="p-2 rounded-lg transition hover:bg-gray-700/50">
                    <LayoutList className="text-white size-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item) => (
                      <DropdownMenuItem 
                        key={item} 
                        onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
                      >
                        {item}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <CallStatsButton />
                
                <button 
                  className="p-2 rounded-lg transition hover:bg-gray-700/50"
                  onClick={() => {
                    setShowParticipants(!showParticipants);
                    setShowChat(false);
                  }}
                >
                  <Users className="text-white size-5 hover:bg-gray-700/50" />
                </button>
                
                <button 
                  className="p-2 rounded-lg transition hover:bg-gray-700/50"
                  onClick={() => {
                    setShowChat(!showChat);
                    setShowParticipants(false);
                  }}
                >
                  <MessageSquare className="text-white size-5" />
                </button>
              </div>
            </div>
          </section>
        </StreamCall>
      </StreamVideo>
    ) : (
      <Loader />
    )
  );
};

export default MeetingRoom;
