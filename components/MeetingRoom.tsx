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

import { Chat, Channel, Window, MessageList, MessageInput } from 'stream-chat-react';
import { StreamChat } from 'stream-chat';
import "@stream-io/video-react-sdk/dist/css/styles.css";
import 'stream-chat-react/dist/css/v2/index.css';

import { useRouter } from 'next/navigation';
import { Users, LayoutList, MessageSquare, X } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import MuteButton from './MuteButton';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

interface MeetingRoomProps {
  apiKey: string;
  userToken: string;
  userData: any;
}

const MeetingRoom = ({ apiKey, userToken, userData }: MeetingRoomProps) => {
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [activePanel, setActivePanel] = useState<'chat' | 'participants' | null>(null);
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();

  /** ✅ Step 1: Initialize Chat & Video Clients */
  const chatClient = useRef<StreamChat | null>(null);
  const videoClient = useRef<StreamVideoClient | null>(null);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!apiKey || !userToken || !userData) return;

    const client = StreamChat.getInstance(apiKey);
    client.connectUser(userData, userToken);
    chatClient.current = client;

    return () => {
      client.disconnectUser();
      chatClient.current = null;
    };
  }, [apiKey, userToken, userData]);

  useEffect(() => {
    if (!apiKey || !userToken || !userData) return;

    const _client = new StreamVideoClient({
      apiKey,
      user: userData,
      token: userToken,
    });
    videoClient.current = _client;

    return () => {
      _client.disconnectUser();
      videoClient.current = null;
    };
  }, [apiKey, userToken, userData]);

  useEffect(() => {
    if (!chatClient.current || !userData?.id) return;

    const initChat = async () => {
      try {
        const newChannel = chatClient.current.channel('meeting', 'default-channel', {
          name: 'Meeting Chat',
          members: [userData.id],
        });

        await newChannel.watch();
        setChannel(newChannel);
      } catch (error) {
        console.error('Chat Initialization Failed:', error);
      }
    };

    initChat();
  }, [userData]);

  if (callingState !== CallingState.JOINED) return <Loader />;

  const isHost = call?.state.localParticipant?.roles?.includes('host');

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
    chatClient.current && videoClient.current && call ? (
      <Chat client={chatClient.current} theme="messaging dark">
        <StreamVideo client={videoClient.current}>
          <StreamCall call={call}>
            <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
              <div className="relative flex size-full items-center justify-center">
                <div className={cn('flex size-full max-w-[1000px] items-center', {
                  'max-w-[800px]': activePanel !== null,
                })}>
                  <CallLayout />
                </div>

                {/* ✅ Floating Panels (Chat & Participants) */}
                {activePanel === 'participants' && (
                  <div className="absolute top-10 right-10 h-[500px] w-80 bg-[#1c1f2e] rounded-lg p-4 shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-center text-white mb-2">
                      <span>Participants</span>
                      <X className="cursor-pointer" onClick={() => setActivePanel(null)} />
                    </div>
                    <CallParticipantsList />
                  </div>
                )}

                {activePanel === 'chat' && (
                  <div className="absolute top-10 right-10 h-[500px] w-80 bg-[#19232d] rounded-lg p-4 shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-center text-white mb-2">
                      <span>Meeting Chat</span>
                      <X className="cursor-pointer" onClick={() => setActivePanel(null)} />
                    </div>
                    {channel ? (
                      <Channel channel={channel}>
                        <Window>
                          <MessageList />
                          <MessageInput />
                        </Window>
                      </Channel>
                    ) : (
                      <p className="text-center">Hare Krishna, This feature will roll out soon,  Hari Bol!</p>
                    )}
                  </div>
                )}
              </div>

              {/* ✅ Step 7: Controls */}
              <div className="fixed bottom-0 flex flex-wrap w-full items-center justify-center gap-5">
                <CallControls onLeave={() => router.push(`/`)} />
                {isHost && <MuteButton />}

                <DropdownMenu>
                  <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
                    <LayoutList size={20} className="text-white" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
                    {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
                      <DropdownMenuItem key={index} onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}>
                        {item}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <CallStatsButton />
                <button onClick={() => setActivePanel(activePanel === 'participants' ? null : 'participants')}
                        className="rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
                  <Users className="text-white" />
                </button>
                <button onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
                        className="rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
                  <MessageSquare className="text-white" />
                </button>
              </div>
            </section>
          </StreamCall>
        </StreamVideo>
      </Chat>
    ) : (
      <Loader />
    )
  );
};

export default MeetingRoom;
