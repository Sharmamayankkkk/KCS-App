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
} from '@stream-io/video-react-sdk';

import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useRouter } from 'next/navigation';
import { Users, LayoutList, MessageSquare } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import MuteButton from './MuteButton';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue } from 'firebase/database';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

interface MeetingRoomProps {
  apiKey: string;
  userToken: string;
  userData: any;
}

const firebaseConfig = {
  apiKey: "AIzaSyCUndUCNm1k6Yg3lVXOqae9Lu_Eh2QAnq0",
  authDomain: "kcs-meet.firebaseapp.com",
  databaseURL: "https://kcs-meet-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kcs-meet",
  storageBucket: "kcs-meet.firebasestorage.app",
  messagingSenderId: "340199647912",
  appId: "1:340199647912:web:e0912f146f434b5446f09d",
  measurementId: "G-TFNR2R0SEF"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const MeetingRoom = ({ apiKey, userToken, userData }: MeetingRoomProps) => {
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();

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

  const [messages, setMessages] = useState<{ id: string; text: string; sender: string }[]>([]);
  const messagesRef = ref(database, `meeting-chat/${call?.cid}`);

  useEffect(() => {
    if (!call?.cid) return;

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageArray = Object.entries(data).map(([id, value]: any) => ({
          id,
          text: value.text,
          sender: value.sender
        }));
        setMessages(messageArray);
      }
    });

    return () => unsubscribe();
  }, [call?.cid]);

  const sendMessage = (messageText: string) => {
    if (!messageText.trim() || !call?.cid) return;
    push(messagesRef, {
      text: messageText,
      sender: userData?.fullName || 'Anonymous',
      timestamp: Date.now()
    });
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
  const hostId = userData?.primaryEmailAddress.emailAddress;
  const isHost = adminEmails.includes(hostId);

  const CallLayout = () => {
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
          <section className="relative h-screen w-full overflow-hidden">
            <div className="flex h-full">
              <div className={cn('flex-1 transition-all duration-300', {
                'mr-80': showChat || showParticipants
              })}>
                <CallLayout />
              </div>

              {showParticipants && !showChat && (
                <div className="fixed right-0 top-0 h-full w-80 bg-black">
                  <CallParticipantsList onClose={() => setShowParticipants(false)} />
                </div>
              )}

              {showChat && !showParticipants && (
                <div className="fixed right-0 top-0 h-full w-80 bg-black">
                  <div className="flex flex-col h-full">
                    <div className="p-4 flex justify-between items-center border-b border-gray-800">
                      <h3 className="text-lg font-semibold">Chat</h3>
                      <button
                        onClick={() => setShowChat(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className="rounded-lg p-3 border border-gray-800"
                        >
                          <div className="font-semibold text-sm">{msg.sender}</div>
                          <div className="mt-1">{msg.text}</div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-800">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-4 p-4">
              <CallControls onLeave={() => router.push(`/`)} />

              {isHost && (
                <>
                  <MuteButton />
                  <EndCallButton />
                </>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer rounded-lg px-4 py-2">
                  <LayoutList size={20} />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
                    <div key={index}>
                      <DropdownMenuItem
                        onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
                      >
                        {item}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <CallStatsButton />

              <button
                onClick={() => {
                  setShowParticipants((prev) => !prev);
                  setShowChat(false);
                }}
                className="rounded-lg px-4 py-2"
              >
                <Users />
              </button>

              <button
                onClick={() => {
                  setShowChat((prev) => !prev);
                  setShowParticipants(false);
                }}
                className="rounded-lg px-4 py-2"
              >
                <MessageSquare />
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
