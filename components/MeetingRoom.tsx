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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Loader from '@/components/Loader';
import MuteButton from '@/components/MuteButton';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

interface MeetingRoomProps {
  apiKey: string;
  userToken: string;
  userData: {
    id: string;
    name?: string;
    image?: string;
  };
}

const validateToken = (token: string): { isValid: boolean; payload: any; error?: string } => {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return { isValid: false, payload: null, error: 'Invalid token format: Token must have three parts' };
    }

    const payload = JSON.parse(atob(tokenParts[1]));
    if (!payload.user_id) {
      return { isValid: false, payload, error: 'Token missing user_id in payload' };
    }

    return { isValid: true, payload };
  } catch (err) {
    return { isValid: false, payload: null, error: `Token validation failed: ${err}` };
  }
};

const createStreamChatClient = (apiKey: string) => {
  return StreamChat.getInstance(apiKey);
};

const createStreamVideoClient = (apiKey: string, userData: any, userToken: string) => {
  const user = {
    id: userData.id,
    name: userData.name || userData.id,
    image: userData.image,
  };

  return new StreamVideoClient({
    apiKey,
    user,
    token: userToken,
  });
};

const getChannelId = (userId: string) => {
  return `meeting-room-${userId}-${Date.now()}`;
};

const MeetingRoom = ({ apiKey, userToken, userData }: MeetingRoomProps) => {
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const callingState = useCallCallingState();

  // Enhanced token validation
  useEffect(() => {
    const validateConfig = async () => {
      if (!apiKey || !userToken || !userData?.id) {
        setError('Missing required configuration');
        console.error('Configuration error:', { apiKey: !!apiKey, userToken: !!userToken, userId: userData?.id });
        return;
      }

      const { isValid, payload, error: validationError } = validateToken(userToken);
      
      if (!isValid) {
        setError(validationError || 'Token validation failed');
        console.error('Token validation failed:', validationError, { providedUserId: userData.id });
        return;
      }

      if (payload.user_id !== userData.id) {
        const errorMsg = `Token user_id (${payload.user_id}) does not match provided user ID (${userData.id})`;
        setError(errorMsg);
        console.error(errorMsg);
        return;
      }

      // Additional token expiration check
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && currentTime > payload.exp) {
        setError('Token has expired');
        console.error('Token expired at:', new Date(payload.exp * 1000));
        return;
      }

      console.log('Token validation successful', {
        userId: payload.user_id,
        expires: payload.exp ? new Date(payload.exp * 1000) : 'No expiration'
      });
    };

    validateConfig();
  }, [apiKey, userToken, userData]);

  // Initialize Chat Client
  useEffect(() => {
    let client: StreamChat | null = null;

    const initChat = async () => {
      try {
        if (!apiKey || !userToken || !userData?.id) {
          throw new Error('Missing required configuration');
        }

        client = createStreamChatClient(apiKey);
        await client.connectUser(userData, userToken);
        console.log('Chat client connected successfully');
        setChatClient(client);

        const channelId = getChannelId(userData.id);
        const newChannel = client.channel('messaging', channelId, {
          name: 'Meeting Chat',
          members: [userData.id],
          created_by_id: userData.id,
        });

        await newChannel.watch();
        setChannel(newChannel);
        console.log('Channel initialized successfully');
      } catch (err) {
        console.error('Chat initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize chat');
      } finally {
        setIsLoading(false);
      }
    };

    initChat();

    return () => {
      const disconnectChat = async () => {
        if (client) {
          await client.disconnectUser();
          console.log('Chat client disconnected');
          setChatClient(null);
          setChannel(null);
        }
      };
      
      disconnectChat();
    };
  }, [apiKey, userToken, userData]);

  // Initialize Video Client
  useEffect(() => {
    let client: StreamVideoClient | null = null;

    const initVideo = async () => {
      try {
        if (!apiKey || !userToken || !userData) {
          throw new Error('Missing required video configuration');
        }

        client = createStreamVideoClient(apiKey, userData, userToken);
        setVideoClient(client);
        console.log('Video client initialized successfully');
      } catch (err) {
        console.error('Video initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize video');
      }
    };

    initVideo();

    return () => {
      const disconnectVideo = async () => {
        if (client) {
          await client.disconnectUser();
          console.log('Video client disconnected');
          setVideoClient(null);
        }
      };
      
      disconnectVideo();
    };
  }, [apiKey, userToken, userData]);

  // Enhanced error display component
  const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <div className="max-w-md rounded-lg bg-red-600 p-6 text-white">
        <h2 className="mb-2 text-xl font-bold">Error</h2>
        <p className="mb-4">{message}</p>
        <div className="flex gap-2">
          <button 
            onClick={() => window.location.reload()}
            className="rounded bg-white px-4 py-2 text-red-600 hover:bg-gray-100"
          >
            Retry
          </button>
          <button 
            onClick={() => router.push('/')}
            className="rounded border border-white px-4 py-2 text-white hover:bg-red-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  if (error) return <ErrorDisplay message={error} />;
  if (isLoading || callingState !== CallingState.JOINED) return <Loader />;

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
    chatClient && videoClient && call ? (
      <Chat client={chatClient} theme="messaging dark">
        <StreamVideo client={videoClient}>
          <StreamCall call={call}>
            <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
              <div className="relative flex items-center justify-center size-full">
                <div
                  className={cn('flex items-center size-full max-w-[1000px]', {
                    'max-w-[800px]': showChat || showParticipants,
                  })}
                >
                  <CallLayout />
                </div>

                {showParticipants && !showChat && (
                  <div className="ml-2 h-[calc(100vh-86px)] w-80">
                    <CallParticipantsList onClose={() => setShowParticipants(false)} />
                  </div>
                )}

                {showChat && !showParticipants && channel && (
                  <div className="ml-2 h-[calc(100vh-86px)] w-80 overflow-hidden rounded-lg bg-[#19232d]">
                    <Channel channel={channel}>
                      <Window>
                        <MessageList />
                        <MessageInput focus />
                      </Window>
                    </Channel>
                  </div>
                )}
              </div>

              <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 pb-4">
                <CallControls onLeave={() => router.push('/')} />
                {isHost && <MuteButton />}

                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] cursor-pointer">
                    <LayoutList className="text-white" size={20} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-dark-1 border-dark-1 text-white">
                    {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item) => (
                      <DropdownMenuItem
                        key={item}
                        onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
                        className="cursor-pointer"
                      >
                        {item}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <CallStatsButton />

                <button
                  onClick={() => {
                    setShowParticipants((prev) => !prev);
                    setShowChat(false);
                  }}
                  className="rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] cursor-pointer"
                >
                  <Users className="text-white" size={20} />
                </button>

                <button
                  onClick={() => {
                    setShowChat((prev) => !prev);
                    setShowParticipants(false);
                  }}
                  className="rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] cursor-pointer"
                >
                  <MessageSquare className="text-white" size={20} />
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
