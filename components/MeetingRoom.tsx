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
import { Users, LayoutList, MessageSquare, X } from 'lucide-react';
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
          <section className="h-screen w-full overflow-hidden pt-4 relative">
            <div className="flex items-center justify-center relative size-full">
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
                        className="p-2 rounded hover:bg-gray-700/50 transition"
                        onClick={() => setShowChat(false)}
                      >
                        <X className="size-5 text-white" />
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-auto space-y-2 custom-scrollbar-hidden">
                      {messages.map((msg) => (
                        <div key={msg.id} 
                             className="p-2 rounded-lg bg-gray-700/50 backdrop-blur-sm">
                          <span className="text-yellow-1 font-semibold">
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
                      className="w-full p-2 mt-2 rounded-lg bg-gray-800/50 text-white
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

            <div className="fixed bottom-0 w-full pb-4 px-4">
              <div className="flex flex-wrap items-center justify-center gap-2 
                            sm:gap-4 bg-[#19232d]/80 backdrop-blur-md p-2 
                            rounded-lg mx-auto max-w-max">
                <CallControls onLeave={() => router.push('/')} />
                
                {isHost && (
                  <>
                    <MuteButton />
                    <EndCallButton />
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger className="p-2 rounded-lg hover:bg-gray-700/50 transition">
                    <LayoutList className="size-5 text-white" />
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
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition"
                  onClick={() => {
                    setShowParticipants(!showParticipants);
                    setShowChat(false);
                  }}
                >
                  <Users className="size-5 text-white hover:bg-gray-700/50" />
                </button>
                
                <button 
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition"
                  onClick={() => {
                    setShowChat(!showChat);
                    setShowParticipants(false);
                  }}
                >
                  <MessageSquare className="size-5 text-white" />
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
