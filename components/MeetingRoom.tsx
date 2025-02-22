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

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue } from 'firebase/database';
import EndCallButton from './EndCallButton';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

interface MeetingRoomProps {
  apiKey: string;
  userToken: string;
  userData: any;
}

// ✅ Firebase Configuration (SECURE THIS)
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

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

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

  /** ✅ Step 1: Initialize Video Client */
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

  /** ✅ Step 2: Firebase Chat State */
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

    return () => unsubscribe(); // ✅ Unsubscribe properly
  }, [call]);

  /** ✅ Step 3: Send Message to Firebase */
  const sendMessage = (messageText: string) => {
    if (!messageText.trim()) return;
    push(messagesRef, {
      id: userData?.id,
      text: messageText,
      sender: userData?.fullName || 'Anonymous',
      callId: call?.id,
      callCid: call?.cid
    });
    setMessageText(""); // Clear the input field
  };

  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showChat, messages]);

  if (callingState !== CallingState.JOINED) return <Loader />;

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []; 
  const hostId = userData?.primaryEmailAddress.emailAddress;
  const isHost = adminEmails.includes(hostId); 


  /** ✅ Step 4: Handle Call Layout */
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
          <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
            <div className="relative flex size-full items-center justify-center">
              <div className={cn('flex size-full max-w-[1000px] *** ', { 'max-w-[800px]': showChat || showParticipants })}>
                <CallLayout />
              </div>

              {/* ✅ Participants List */}
              {showParticipants && !showChat && (
                <div className="h-[calc(100vh-100px)] md:h-[calc(100vh-86px)] md:relative absolute w-80 sm:w-full ml-2 bg-[#19232d] rounded-lg overflow-hidden p-4 z-[10000] md:z-auto">
                  <CallParticipantsList onClose={() => setShowParticipants(false)} />
                </div>
              )}

              {/* ✅ Chat Panel with Firebase */}
              {showChat && !showParticipants && (
                <div className="h-[calc(100vh-100px)] md:h-[calc(100vh-100px)] md:relative absolute max-w-full w-80 sm:w-full ml-2 bg-[#19232d] rounded-lg overflow-hidden p-4 z-[10000] md:z-auto scrollbar-none">
                  <div className="h-full flex flex-col scrollbar-none">
                    <div className="close-button w-full flex justify-end items-center mb-2 scrollbar-none">
                      <button
                        className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
                        onClick={() => { setShowChat(!showChat); setShowParticipants(false); }}>
                        <X size={20} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-auto custom-scrollbar-hidden">
                      {{messages.map((msg) => (
                        <div key={msg.id} className="p-2 mb-1 rounded bg-gray-700">
                          <strong className="text-yellow-1">{msg.sender}:</strong> {msg.text}
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="p-2 mt-2 w-full rounded bg-gray-800 text-white"
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

            {/* ✅ Controls */}
            <div className="fixed bottom-0 flex flex-wrap w-full items-center justify-center gap-5">
              <CallControls onLeave={() => router.push('/')} />
              {isHost && (
                  <>
                    <MuteButton />
                    <EndCallButton />
                  </>
                )}


              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
                  <LayoutList size={20} className="text-white" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item) => (
                    <DropdownMenuItem key={item} onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}>
                      {item}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <CallStatsButton />
              <button className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]" onClick={() => { setShowParticipants(!showParticipants); setShowChat(false); }}>
                <Users />
              </button>
              <button className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]" onClick={() => { setShowChat(!showChat); setShowParticipants(false); }}>
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
