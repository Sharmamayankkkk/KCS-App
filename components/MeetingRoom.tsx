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
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import MuteButton from './MuteButton';
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
    const [showSidebar, setShowSidebar] = useState<'participants' | 'chat' | null>(null);
    const { useCallCallingState } = useCallStateHooks();
    const call = useCall();
    const callingState = useCallCallingState();


    const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);

    useEffect(() => {
        if (!apiKey || !userToken || !userData) return;

        const _client = new StreamVideoClient({ apiKey, user: userData, token: userToken });
        setVideoClient(_client);

        return () => {
            _client.disconnectUser();
            setVideoClient(null);
        };
    }, [apiKey, userToken, userData]);


    const [messages, setMessages] = useState<{ id: string; text: string; sender: string }[]>([]);
    const messagesRef = ref(database, `meeting-chat/${call?.cid}`);

    useEffect(() => {
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setMessages(
                    Object.entries(data).map(([id, value]: any) => ({ id, text: value.text, sender: value.sender }))
                );
            }
        });

        return () => unsubscribe();
    }, [call?.cid]);


    const sendMessage = (messageText: string) => {
        if (!messageText.trim()) return;
        push(messagesRef, { text: messageText, sender: userData?.fullName || 'Anonymous' });
    };

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

    return videoClient && call ? (
        <StreamVideo client={videoClient}>
            <StreamCall call={call}>
                <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
                    <div className="relative flex flex-col h-full items-center justify-center px-4 md:px-0">
                        <div
                            className={cn(
                                'flex flex-col flex-grow max-w-full md:max-w-[1000px] transition-all duration-300',
                                {
                                    'md:max-w-[800px]': showSidebar,
                                }
                            )}
                        >
                            <CallLayout />
                        </div>


                        {showSidebar && (
                            <div className="absolute md:fixed top-0 right-0 z-50 h-full md:h-[calc(100vh-86px)] w-full md:w-80 bg-[#19232d] rounded-lg shadow-lg overflow-hidden transition-all duration-300">
                                {showSidebar === 'chat' && (
                                    <button
                                        className="absolute top-2 right-2 text-white bg-gray-800 p-2 rounded-full hover:bg-gray-700"
                                        onClick={() => setShowSidebar(null)}
                                    >
                                        ✕
                                    </button>
                                )}

                                {showSidebar === 'participants' && <CallParticipantsList onClose={() => setShowSidebar(null)} />}
                                {showSidebar === 'chat' && (
                                    <div className="flex flex-col h-full p-4">
                                        <div className="flex-1 overflow-auto space-y-2">
                                            {messages.map((msg) => (
                                                <div key={msg.id} className="p-2 bg-gray-700 rounded">
                                                    <strong>{msg.sender}:</strong> {msg.text}
                                                </div>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            className="p-2 mt-2 w-full rounded bg-gray-800 text-white"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    sendMessage(e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>


                    <div className="fixed bottom-0 w-full flex flex-wrap justify-center items-center gap-3 p-3 bg-black bg-opacity-50 overflow-auto">
                        <CallControls onLeave={() => router.push('/')} />
                        {isHost && (
                            <div className="hidden md:block">
                                <MuteButton />
                            </div>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="cursor-pointer rounded-xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
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
                        <button onClick={() => setShowSidebar('participants')} className="cursor-pointer bg-[#19232d] px-4 py-2">
                            <Users className="text-white" />
                        </button>
                        <button onClick={() => setShowSidebar('chat')} className="cursor-pointer bg-[#19232d] px-4 py-2">
                            <MessageSquare className="text-white" />
                        </button>
                    </div>
                </section>
            </StreamCall>
        </StreamVideo>
    ) : (
        <Loader />
    );
};

export default MeetingRoom;
