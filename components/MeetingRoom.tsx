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
  StreamTheme,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';

import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useRouter } from 'next/navigation';
import { Users, LayoutList, MessageSquare, X, Monitor } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [messageText, setMessageText] = useState("");
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const { useScreenShareState } = useCallStateHooks();
  const { status: isScreenShareEnabled } = useScreenShareState();
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const [messages, setMessages] = useState<{ id: string; text: string; sender: string }[]>([]);

  useEffect(() => {
    if (!showChat) return;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('call_id', call?.id)
        .order('created_at', { ascending: true });
  
      if (error) console.error(error);
      else {
        setMessages(
          data.map((msg) => ({
            id: msg.id, 
            text: msg.text, 
            sender: msg.sender 
          }))
        );
      }
    };
  
    fetchMessages();
  
    const subscription = supabase
      .channel(`messages:${call?.id}`)
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
    if (!messageText.trim()) return;
  
    const { error } = await supabase.from('messages').insert([
      {
        call_id: call?.id,
        text: messageText,
        sender: userData?.fullName || 'Anonymous',
      },
    ]);
  
    if (error) console.error(error);
    else setMessageText("");
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []; 
  const hostId = userData?.primaryEmailAddress?.emailAddress;
  const isHost = adminEmails.includes(hostId); 

  const CallLayout = () => {
    if (isScreenShareEnabled && layout !== 'grid') {
      return <PaginatedGridLayout />;
    }
    
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  const handleSidebar = (panel: 'chat' | 'participants') => {
    if (panel === 'chat') {
      setShowChat(!showChat);
      if (isMobile) setShowParticipants(false);
    } else {
      setShowParticipants(!showParticipants);
      if (isMobile) setShowChat(false);
    }
  };

  return (
    videoClient && call ? (
      <StreamVideo client={videoClient}>
        <StreamTheme>
          <StreamCall call={call}>
            <section className="relative h-screen w-full overflow-hidden pt-2 md:pt-4 text-white">
              <div className="relative flex size-full items-center justify-center">
                <div 
                  className={cn(
                    'flex size-full transition-all duration-300 ease-in-out',
                    {
                      'max-w-[1000px]': !showChat && !showParticipants,
                      'max-w-[calc(100%-320px)]': (showChat || showParticipants) && !isMobile,
                      'max-w-full': (showChat || showParticipants) && isMobile
                    }
                  )}
                >
                  <CallLayout />
                </div>

                {showParticipants && (
                  <div 
                    className={cn(
                      "h-[calc(100vh-100px)] transition-transform duration-300 ease-in-out",
                      isMobile ? 
                        "fixed top-0 right-0 w-full max-w-[320px] z-[10000] h-full" : 
                        "w-80 ml-2 relative"
                    )}
                  >
                    <div className="h-full bg-dark-1 rounded-lg overflow-hidden p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Participants</h3>
                        <button
                          className="p-2 rounded-full bg-dark-3 hover:bg-dark-4 text-white"
                          onClick={() => setShowParticipants(false)}
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <CallParticipantsList onClose={() => setShowParticipants(false)} />
                    </div>
                  </div>
                )}

                {showChat && (
                  <div 
                    className={cn(
                      "h-[calc(100vh-100px)] transition-transform duration-300 ease-in-out",
                      isMobile ? 
                        "fixed top-0 right-0 w-full max-w-[320px] z-[10000] h-full" : 
                        "w-80 ml-2 relative"
                    )}
                  >
                    <div className="h-full bg-dark-1 rounded-lg overflow-hidden p-4 flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Chat</h3>
                        <button
                          className="p-2 rounded-full bg-dark-3 hover:bg-dark-4 text-white"
                          onClick={() => setShowChat(false)}
                        >
                          <X size={20} />
                        </button>
                      </div>
                      
                      <div className="flex-1 overflow-auto custom-scrollbar-hidden mb-2">
                        {messages.length === 0 ? (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            No messages yet
                          </div>
                        ) : (
                          messages.map((msg) => (
                            <div key={msg.id} className="p-2 mb-2 rounded bg-dark-3">
                              <strong className="text-yellow-1">{msg.sender}:</strong> {msg.text}
                            </div>
                          ))
                        )}
                        <div ref={chatEndRef} />
                      </div>
                      
                      <div className="mt-auto">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Type a message..."
                            className="p-3 w-full rounded-full bg-dark-3 text-white pr-12"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                sendMessage(messageText);
                              }
                            }}
                          />
                          <button 
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-blue-1 text-white"
                            onClick={() => sendMessage(messageText)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="fixed bottom-0 w-full flex-center pb-2 md:pb-4 z-50">
                <div className={cn(
                  "flex flex-wrap items-center justify-center gap-2 md:gap-4 px-3 py-2 md:py-3 rounded-3xl bg-dark-1 bg-opacity-80 glassmorphism2",
                  {'max-w-full overflow-x-auto': isMobile}
                )}>
                  <div className="fixed bottom-0 flex flex-wrap w-full items-center justify-center gap-5">
                    <CallControls onLeave={() => router.push('/')} />
                    {isHost && (
                      <>
                        <MuteButton />
                        <EndCallButton />
                      </>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger className="cursor-pointer rounded-full bg-dark-3 p-2 md:p-3 hover:bg-dark-4 focus:outline-none">
                        <LayoutList size={isMobile ? 18 : 22} className="text-white" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center">
                        <DropdownMenuItem onClick={() => setLayout('grid')}>
                          Grid View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLayout('speaker-left')}>
                          Speaker View (Right Sidebar)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLayout('speaker-right')}>
                          Speaker View (Left Sidebar)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <button 
                      className={cn(
                        "cursor-pointer rounded-full p-2 md:p-3 focus:outline-none",
                        showParticipants ? "bg-blue-1" : "bg-dark-3 hover:bg-dark-4"
                      )} 
                      onClick={() => handleSidebar('participants')}
                    >
                      <Users size={isMobile ? 18 : 22} />
                    </button>
                    
                    <button 
                      className={cn(
                        "cursor-pointer rounded-full p-2 md:p-3 focus:outline-none",
                        showChat ? "bg-blue-1" : "bg-dark-3 hover:bg-dark-4"
                      )} 
                      onClick={() => handleSidebar('chat')}
                    >
                      <MessageSquare size={isMobile ? 18 : 22} />
                    </button>
                    
                    <CallStatsButton />
                  </div>
                </div>
              </div>
              
              {isScreenShareEnabled && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-1 text-white px-4 py-2 rounded-full flex items-center gap-2 z-50">
                  <Monitor size={16} />
                  <span className="text-sm">Screen sharing active</span>
                </div>
              )}
            </section>
          </StreamCall>
        </StreamTheme>
      </StreamVideo>
    ) : (
      <Loader />
    )
  );
};

export default MeetingRoom;
