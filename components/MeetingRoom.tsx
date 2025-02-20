Old code:
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

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []; 
  const hostId = userData?.primaryEmailAddress.emailAddress;
  const isHost = adminEmails.includes(hostId); 


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
            <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
              <div className="relative flex size-full items-center justify-center">
                <div
                  className={cn('flex size-full max-w-[1000px] items-center', {
                    'max-w-[800px]': showChat || showParticipants,
                  })}
                >
                  <CallLayout />
                </div>

                {showParticipants && !showChat && (
                  <div className="h-[calc(100vh-86px)] w-80 ml-2">
                    <CallParticipantsList onClose={() => setShowParticipants(false)} />
                  </div>
                )}

                {showChat && !showParticipants && (
                  <div className="h-[calc(100vh-86px)] w-80 ml-2 bg-[#19232d] rounded-lg overflow-hidden">
                    {channel ? (
                      <Channel channel={channel}>
                        <Window>
                          <MessageList />
                          <MessageInput />
                        </Window>
                      </Channel>
                    ) : (
                      <div className="flex flex-col h-full items-center justify-center p-8 ">
                        <p className='text-yellow-400 text-center font-mono'>Hare Krishna Everyone</p>
                        <p className='font-thin text-sm text-center '>Our chat system is currently being improved for a better experience.</p>
                        <p className='font-thin text-sm text-center  '> Thank you for your patience and support!😊</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="fixed bottom-0 flex flex-wrap w-full items-center justify-center gap-5">
                <CallControls onLeave={() => router.push(`/`)} />

                {isHost && (
                  <>
                    <MuteButton />
                    <EndCallButton />
                  </>
                )}

                <DropdownMenu>
                  <div className="flex items-center">
                    <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
                      <LayoutList size={20} className="text-white" />
                    </DropdownMenuTrigger>
                  </div>
                  <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
                    {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
                      <div key={index}>
                        <DropdownMenuItem
                          onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
                        >
                          {item}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="border-dark-1" />
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
                  <Users className="text-white" />
                </button>
                <button
                  onClick={() => {
                    setShowChat((prev) => !prev);
                    setShowParticipants(false);
                  }}
                  className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]"
                >
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
