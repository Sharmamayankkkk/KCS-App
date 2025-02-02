'use client';
import { useState, useEffect } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';
import { Users, LayoutList, MessageSquare } from 'lucide-react';
import { Chat, Channel, ChannelHeader, MessageList, MessageInput } from 'stream-chat-react';
import { StreamChat } from 'stream-chat';

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

const MeetingRoom = () => {
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) return <Loader />;

  const isHost = call?.state.localParticipant?.roles?.includes('host');

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

  const chatClient = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY);
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    const setupChannel = async () => {
      await chatClient.connectUser(
        {
          id: 'user-id',
          name: 'User Name',
          image: 'https://getstream.io/random_png/?id=user-id',
        },
        chatClient.devToken('user-id')
      );

      const channel = chatClient.channel('messaging', 'video-chat', {
        name: 'Video Chat',
      });
      await channel.watch();

      setChannel(channel);
    };

    setupChannel();

    return () => {
      chatClient.disconnectUser();
    };
  }, [chatClient]);

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className={cn('flex size-full max-w-[1000px] items-center', {
          'max-w-[800px]': showChat || showParticipants
        })}>
          <CallLayout />
        </div>
        {/* Participants List */}
        <div
          className={cn('h-[calc(100vh-86px)] hidden w-80 ml-2', {
            'block': showParticipants && !showChat,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
        {/* Chat Panel */}
        <div
          className={cn('h-[calc(100vh-86px)] hidden w-80 ml-2 bg-[#19232d] rounded-lg overflow-hidden', {
            'block': showChat && !showParticipants,
          })}
        >
          {channel && (
            <Chat client={chatClient} theme="messaging light">
              <Channel channel={channel}>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Channel>
            </Chat>
          )}
        </div>
      </div>
      {/* Controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls onLeave={() => router.push(`/`)} />
        
        {isHost && <MuteButton />}

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
                  onClick={() =>
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1" />
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
  );
};

export default MeetingRoom;
