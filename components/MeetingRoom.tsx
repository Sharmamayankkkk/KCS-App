'use client';

import { useState, useEffect } from 'react';
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
  Participant,
  useCalls,
} from '@stream-io/video-react-sdk';

import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useRouter } from 'next/navigation';
import { Users, LayoutList, MessageSquare, Maximize2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import MuteButton from './MuteButton';
import { cn } from '@/lib/utils';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBaPUlKg61MfCMUDvy0z5DqihLZhH-M96c",
  authDomain: "kcs-connect.firebaseapp.com",
  databaseURL: "https://kcs-connect-default-rtdb.firebaseio.com",
  projectId: "kcs-connect",
  storageBucket: "kcs-connect.firebasestorage.app",
  messagingSenderId: "304321967270",
  appId: "1:304321967270:web:7891d0dc83ffb94236b067",
  measurementId: "G-4ZDVDPY1C2"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right' | 'spotlight';

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
  const [isMobile, setIsMobile] = useState(false);
  const [spotlightParticipant, setSpotlightParticipant] = useState<string | null>(null);
  const { useCallCallingState, useParticipants, useScreenShareParticipants } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const screenShareParticipants = useScreenShareParticipants();

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-switch to spotlight mode when screen sharing starts
  useEffect(() => {
    if (screenShareParticipants.length > 0) {
      setLayout('spotlight');
      setSpotlightParticipant(screenShareParticipants[0].sessionId);
    } else if (layout === 'spotlight') {
      setLayout('speaker-left');
      setSpotlightParticipant(null);
    }
  }, [screenShareParticipants]);

  // Video Client initialization
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

  // Firebase Chat integration
  const [messages, setMessages] = useState<{ id: string; text: string; sender: string }[]>([]);
  const messagesRef = ref(database, `meeting-chat/${call?.id}`);

  useEffect(() => {
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.entries(data).map(([id, value]: any) => ({
          id,
          text: value.text,
          sender: value.sender,
        }));
        setMessages(messagesArray);
      }
    });

    return () => unsubscribe();
  }, [call]);

  const sendMessage = (messageText: string) => {
    if (!messageText.trim()) return;
    push(messagesRef, {
      id: userData?.id,
      text: messageText,
      sender: userData?.fullName || 'Anonymous',
      callId: call?.id,
      callCid: call?.cid
    });
    setMessageText("");
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  const isHost = call?.state.localParticipant?.roles?.includes('host');

  // Custom Spotlight Layout Component
  const SpotlightLayout = () => {
    const spotlightedParticipant = participants.find(p => p.sessionId === spotlightParticipant);
    const otherParticipants = participants.filter(p => p.sessionId !== spotlightParticipant);

    return (
      <div className="flex h-full w-full flex-col md:flex-row">
        {/* Spotlighted participant/screen share */}
        <div className="h-3/4 md:h-full md:w-3/4 relative">
          {spotlightedParticipant && (
            <div className="absolute inset-0 p-2">
              {spotlightedParticipant.screenShareTrack ? (
                <div className="h-full w-full bg-black">
                  <video 
                    ref={node => {
                      if (node) node.srcObject = spotlightedParticipant.screenShareTrack;
                    }}
                    autoPlay
                    playsInline
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <video
                  ref={node => {
                    if (node) node.srcObject = spotlightedParticipant.videoTrack;
                  }}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          )}
        </div>

        {/* Other participants */}
        <div className="h-1/4 md:h-full md:w-1/4 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2 p-2">
            {otherParticipants.map(participant => (
              <div 
                key={participant.sessionId}
                className="relative aspect-video cursor-pointer"
                onClick={() => setSpotlightParticipant(participant.sessionId)}
              >
                <video
                  ref={node => {
                    if (node) node.srcObject = participant.videoTrack;
                  }}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover rounded-lg"
                />
                <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                  {participant.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const CallLayout = () => {
    if (layout === 'spotlight') {
      return <SpotlightLayout />;
    }

    // Default to grid layout on mobile
    if (isMobile) {
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

  return (
    videoClient && call ? (
      <StreamVideo client={videoClient}>
        <StreamCall call={call}>
          <section className="relative h-screen w-full overflow-hidden bg-gray-900">
            {/* Main content area */}
            <div className="relative flex h-[calc(100vh-80px)] flex-col md:flex-row">
              {/* Video layout */}
              <div className={cn(
                'flex-grow transition-all duration-300',
                {
                  'w-full md:w-3/4': showChat || showParticipants,
                  'w-full': !showChat && !showParticipants
                }
              )}>
                <CallLayout />
              </div>

              {/* Sidebar */}
              <div className={cn(
                'fixed right-0 top-0 h-full w-full md:relative md:w-1/4 transition-transform duration-300',
                {
                  'translate-x-0': showChat || showParticipants,
                  'translate-x-full md:translate-x-0': !showChat && !showParticipants
                }
              )}>
                {showParticipants && (
                  <div className="h-full bg-[#19232d]">
                    <CallParticipantsList
                      onClose={() => setShowParticipants(false)}
                      onParticipantClick={(participant) => {
                        setLayout('spotlight');
                        setSpotlightParticipant(participant.sessionId);
                      }}
                    />
                  </div>
                )}

                {showChat && (
                  <div className="flex h-full flex-col bg-[#19232d] p-4">
                    <div className="flex-1 overflow-y-auto">
                      {messages.map((msg) => (
                        <div key={msg.id} className="mb-2 rounded bg-gray-700 p-2">
                          <strong>{msg.sender}:</strong> {msg.text}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <input
                        type="text"
                        className="w-full rounded bg-gray-800 p-2 text-white"
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage(messageText)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="fixed bottom-0 left-0 right-0 flex flex-wrap items-center justify-center gap-2 bg-[#19232d] p-4 md:gap-5">
              <CallControls onLeave={() => router.push('/')} />
              {isHost && <MuteButton />}

              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
                  <LayoutList size={20} className="text-white" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setLayout('grid')}>Grid</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLayout('speaker-left')}>Speaker Left</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLayout('speaker-right')}>Speaker Right</DropdownMenuItem>
                  {screenShareParticipants.length > 0 && (
                    <DropdownMenuItem onClick={() => {
                      setLayout('spotlight');
                      setSpotlightParticipant(screenShareParticipants[0].sessionId);
                    }}>
                      Spotlight Screen Share
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <CallStatsButton />
              
              <button
                className="rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]"
                onClick={() => {
                  setShowParticipants(!showParticipants);
                  setShowChat(false);
                }}
              >
                <Users size={20} />
              </button>
              
              <button
                className="rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]"
                onClick={() => {
                  setShowChat(!showChat);
                  setShowParticipants(false);
                }}
              >
                <MessageSquare size={20} />
              </button>
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
