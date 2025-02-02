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
import { StreamChat } from 'stream-chat';
import { Chat, Channel, Window, MessageList, MessageInput } from 'stream-chat-react';
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
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);

  const callingState = useCallCallingState();

  useEffect(() => {
    let cleanupRequired = false;

    const initChat = async () => {
      if (!call?.state.localParticipant?.userId) return;

      try {
        const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);
        
        await client.connectUser(
          {
            id: call.state.localParticipant.userId,
            name: call.state.localParticipant.name || 'Anonymous',
          },
          client.devToken(call.state.localParticipant.userId)
        );

        const newChannel = client.channel('meeting', call.id || 'default-channel', {
          name: 'Meeting Chat',
          members: [call.state.localParticipant.userId],
        });

        await newChannel.watch();

        if (!cleanupRequired) {
          setChatClient(client);
          setChannel(newChannel);
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    };

    initChat();

    return () => {
      cleanupRequired = true;
      if (chatClient) {
        chatClient.disconnectUser().then(() => {
          setChatClient(null);
          setChannel(null);
        });
      }
    };
  }, [call?.id, call?.state.localParticipant, chatClient]);

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
          {chatClient && channel ? (
            <Chat client={chatClient} theme="messaging dark">
              <Channel channel={channel}>
                <Window>
                  <MessageList />
                  <MessageInput />
                </Window>
              </Channel>
            </Chat>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p>Loading chat...</p>
            </div>
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
