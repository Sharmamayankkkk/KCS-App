'use client';

import { useState, useEffect } from 'react';
import {
  CallControls,
  CallParticipantsList,
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
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();

  const callingState = useCallCallingState();

  /** Step 1: Initialize Chat Client */
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  useEffect(() => {
    if (!apiKey || !userToken || !userData) return;

    const client = StreamChat.getInstance(apiKey);
    client.connectUser(userData, userToken);
    setChatClient(client);

    return () => {
      client.disconnectUser();
      setChatClient(null);
    };
  }, [apiKey, userToken, userData]);

  /** Step 2: Initialize Video Client */
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

  /** Step 3: Setup Chat Channel */
  const [channel, setChannel] = useState<any>(null);
  useEffect(() => {
    if (!chatClient || !userData?.id) return;

    const initChat = async () => {
      try {
        const newChannel = chatClient.channel('meeting', 'default-channel', {
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
  }, [chatClient, userData]);

  if (callingState !== CallingState.JOINED) return <Loader />;

  const isHost = call?.state.localParticipant?.roles?.includes('host');

  /** Step 4: Handle Call Layout */
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
    chatClient && videoClient && call ? (
      <Chat client={chatClient} theme="messaging dark">
        <StreamVideo client={videoClient}>
          <StreamCall call={call}>
            <section className="relative h-screen w-full overflow-hidden text-white">
              {/* Main content area */}
              <div className="absolute top-0 left-0 right-0 bottom-16"> {/* Adjusted to leave space for controls */}
                <div className="relative flex h-full items-center justify-center">
                  <div
                    className={cn('flex h-full max-w-[1000px] items-center', {
                      'max-w-[800px]': showChat || showParticipants,
                    })}
                  >
                    <CallLayout />
                  </div>

                  {showParticipants && !showChat && (
                    <div className="h-full w-80 ml-2">
                      <CallParticipantsList onClose={() => setShowParticipants(false)} />
                    </div>
                  )}

                  {showChat && !showParticipants && (
                    <div className="h-full w-80 ml-2 bg-[#19232d] rounded-lg overflow-hidden">
                      {channel ? (
                        <Channel channel={channel}>
                          <Window>
                            <MessageList />
                            <MessageInput />
                          </Window>
                        </Channel>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <p>Loading chat...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Controls area */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#19232d]/80 flex items-center justify-center space-x-4 px-4">
                <CallControls onLeave={() => router.push(`/`)} />
                
                <MuteButton />
                <EndCallButton />

                <DropdownMenu>
                  <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
                    <LayoutList size={20} className="text-white" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
                    {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
                      <div key={index}>
                        <DropdownMenuItem
                          onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
                        >
                          {item}
                        </DropdownMenuItem>
                        {index < 2 && <DropdownMenuSeparator className="border-dark-1" />}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  onClick={() => {
                    setShowParticipants((prev) => !prev);
                    setShowChat(false);
                  }}
                  className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]"
                >
                  <Users size={20} className="text-white" />
                </button>

                <button
                  onClick={() => {
                    setShowChat((prev) => !prev);
                    setShowParticipants(false);
                  }}
                  className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]"
                >
                  <MessageSquare size={20} className="text-white" />
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
