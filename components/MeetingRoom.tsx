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
import CreatePollModal from './CreatePollModal';
import ShowPollModal from './ShowPollModal';

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
  const [showPolls, setShowPolls] = useState(false);
  const [pollExists, setPollExists] = useState(false);
  const [modalType, setModalType] = useState(""); // "create" or "show"
  const [pollId, setPollId] = useState(null);

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
  // const messagesRef = ref(database, `meeting-chat/${call?.id}`);

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
    const fetchPolls = async () => {
      if (!call?.id) return; // Ensure call ID exists before querying

      const { data, error } = await supabase
        .from("polls")
        .select("id") // Selecting only the ID to check if any poll exists
        .eq("call_id", call.id)
        .limit(1); // We only need to check if at least one poll exists

      if (error) {
        console.error("Error fetching polls:", error);
        return;
      }

      if (data && data.length > 0) {
        setPollId(data[0].id);
        setPollExists(true);
      } else {
        setPollExists(false);
      }

      // If we have at least one poll, set showPolls to true
      setShowPolls(data.length > 0);
    };

    fetchPolls();

    const subscription = supabase
      .channel(`polls:${call?.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "polls" },
        (payload) => {
          setPollExists(true);
          setShowPolls(true);
          setPollId(payload.new.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [call?.id]); // Run when `call.id` changes

  useEffect(() => {
    const fetchPoll = async () => {
      const { data, error } = await supabase
        .from("polls")
        .select("id") // Selecting only the ID to check if any poll exists
        .eq("call_id", call?.id)
        .limit(1); // We only need to check if at least one poll exists

      if (error) {
        console.error("Error fetching poll:", error);
        return;
      }

      if (data && data.length > 0) {
        setPollId(data[0].id); // Updates pollId asynchronously
      }
    };

    fetchPoll();
  }, []); // Runs only once when the component mounts

  // useEffect to react when pollId changes
  useEffect(() => {
    if (pollId) {
      // Fetch votes or perform any other action that depends on pollId
    }
  }, [pollId]);

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
    else setMessageText(""); // Clear input
  };

  const handleCloseModal = () => {
    setShowPolls(false);
    setModalType(""); // Reset modalType to prevent it from reopening
  };

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

                      <div className="text-center">
                        {!pollExists ? (
                          isHost && ( // Only show "Create Poll" if the user is an admin
                            <button
                              onClick={() => {
                                setShowPolls(true);
                                setModalType("create");
                              }}
                              className="p-2 bg-blue-500 text-white rounded mb-2.5"
                            >
                              Create Poll
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => {
                              setShowPolls(true);
                              setModalType("show");
                            }}
                            className="p-2 bg-green-500 text-white rounded mb-2.5"
                          >
                            Show Poll
                          </button>
                        )}

                        {showPolls && modalType === "create" && <CreatePollModal userId={userData.id} callId={call?.id} onClose={handleCloseModal} />}
                        {showPolls && modalType === "show" && <ShowPollModal pollId={pollId ?? 0} userData={userData} onClose={handleCloseModal} />}
                      </div>

                      {messages.map((msg) => (
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
