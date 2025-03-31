"use client"

import { useState, useEffect, useRef } from "react"
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
} from "@stream-io/video-react-sdk"
import "@stream-io/video-react-sdk/dist/css/styles.css"
import { useRouter } from "next/navigation"
import { Users, LayoutList, MessageSquare, X, Cast } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import Loader from "./Loader"
import MuteButton from "./MuteButton"
import { cn } from "@/lib/utils"
import EndCallButton from "./EndCallButton"
import { supabase } from "@/lib/supabaseClient"

const defaultBroadcastPlatforms = [
  { name: "youtube", label: "YouTube" },
  { name: "facebook", label: "Facebook" },
]

type CallLayoutType = "grid" | "speaker-left" | "speaker-right"

interface MeetingRoomProps {
  apiKey: string
  userToken: string
  userData: any
}

const MeetingRoom = ({ apiKey, userToken, userData }: MeetingRoomProps) => {
  const router = useRouter()
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left")
  const [showParticipants, setShowParticipants] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [messageText, setMessageText] = useState("")
  const { useCallCallingState } = useCallStateHooks()
  const call = useCall()
  const callingState = useCallCallingState()
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const [activeBroadcasts, setActiveBroadcasts] = useState<string[]>([])
  const [broadcastError, setBroadcastError] = useState<string>("")
  const [showBroadcastForm, setShowBroadcastForm] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState("")

  // Add these lines around line 91-92
  const youtubeStreamUrl = process.env.NEXT_PUBLIC_YOUTUBE_STREAM_URL || "";
  const youtubeStreamKey = process.env.NEXT_PUBLIC_YOUTUBE_STREAM_KEY || "";

  // Modify the state initialization of `streamUrl` and `streamKey` to use the environment variables
  const [streamUrl, setStreamUrl] = useState(youtubeStreamUrl);
  const [streamKey, setStreamKey] = useState(youtubeStreamKey);

  // Start RTMP broadcast
  const startBroadcast = async () => {
    if (!streamUrl || !streamKey || !selectedPlatform) {
      setBroadcastError("Please fill in all the broadcast details.");
      return;
    }

    try {
      setBroadcastError("");

      if (!call) {
        console.error("Call object is not available");
        setBroadcastError("Call is not active. Please start a call first.");
        return;
      }

      console.log("Starting Live Broadcast for:", selectedPlatform);

      // Start the RTMP stream
      await call.startRTMPBroadcasts({
        broadcasts: [
          {
            name: selectedPlatform,
            stream_url: streamUrl,
            stream_key: streamKey,
          },
        ],
      });

      console.log("Broadcast started successfully!");
      setActiveBroadcasts((prev) => [...prev, selectedPlatform]);
      setShowBroadcastForm(false);

      // Reset form fields
      setSelectedPlatform("");
      setStreamUrl("");
      setStreamKey("");
    } catch (error: any) {
      console.error("Error starting broadcast:", error);
      
      if (error.message?.includes("Invalid stream key")) {
        setBroadcastError("Invalid stream key. Please check your details.");
      } else if (error.message?.includes("Unauthorized")) {
        setBroadcastError("Authorization error. Please check your permissions.");
      } else {
        setBroadcastError(`Failed to start ${selectedPlatform} broadcast.`);
      }
    }
  };


  // Stop RTMP broadcast
  const stopBroadcast = async (platformName: string) => {
    try {
      if (!call) {
        setBroadcastError("Call object is not available.");
        return;
      }
  
      if (!activeBroadcasts.includes(platformName)) {
        setBroadcastError(`No active broadcast found for ${platformName}.`);
        return;
      }
  
      setBroadcastError("");
      
      // Check if stopLive() is available in the SDK
      if (typeof call.stopLive !== "function") {
        setBroadcastError("Stop live function is not available in this SDK version.");
        return;
      }
  
      await call.stopLive();
  
      setActiveBroadcasts((prev) => prev.filter((name) => name !== platformName));
  
      console.log(`${platformName} broadcast stopped successfully.`);
    } catch (error) {
      console.error("Error stopping broadcast:", error);
      setBroadcastError(`Failed to stop ${platformName} broadcast.`);
    }
  };
  
 
  // Check broadcast status
  useEffect(() => {
    if (!call) return

    const checkBroadcastStatus = async () => {
      const resp = await call.get()
      const isBroadcasting = resp.call.egress.broadcasting
      if (isBroadcasting) {
        setActiveBroadcasts(prev => [...prev])
      } else {
        setActiveBroadcasts([])
      }
    }

    checkBroadcastStatus()
  }, [call])

  // Video Client Initialization
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null)

  useEffect(() => {
    if (!apiKey || !userToken || !userData) return

    const _client = new StreamVideoClient({
      apiKey,
      user: userData,
      token: userToken,
    })
    setVideoClient(_client)

    return () => {
      _client.disconnectUser()
      setVideoClient(null)
    }
  }, [apiKey, userToken, userData])

  // Chat Messages Management
  const [messages, setMessages] = useState<{ id: string; text: string; sender: string }[]>([])

  useEffect(() => {
    if (!showChat || !call?.id) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("call_id", call.id)
        .order("created_at", { ascending: true })

      if (error) console.error("Error fetching messages:", error)
      else {
        setMessages(
          data.map((msg) => ({
            id: msg.id,
            text: msg.text,
            sender: msg.sender,
          })),
        )
      }
    }

    fetchMessages()

    const subscription = supabase
      .channel(`messages:${call.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: payload.new.id,
            text: payload.new.text,
            sender: payload.new.sender,
          },
        ])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [showChat, call?.id])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !call?.id) return

    const { error } = await supabase.from("messages").insert([
      {
        call_id: call.id,
        text: messageText,
        sender: userData?.fullName || "Anonymous",
      },
    ])

    if (error) console.error("Error sending message:", error)
    else setMessageText("")
  }

  // Layout Component
  const CallLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout groupSize={9} pageArrowsVisible={true} />
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />
      default:
        return <SpeakerLayout participantsBarPosition="right" />
    }
  }

  // Add Broadcast Control Button in admin controls
  const BroadcastControl = () => (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 rounded-lg transition hover:bg-gray-700/50" disabled={!!broadcastError}>
          <Cast className="text-white size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {defaultBroadcastPlatforms.map((platform) => (
            <DropdownMenuItem
              key={platform.name}
              onClick={() => {
                if (activeBroadcasts.includes(platform.name)) {
                  stopBroadcast(platform.name)
                } else {
                  setSelectedPlatform(platform.name)
                  setShowBroadcastForm(true)
                }
              }}
            >
              {activeBroadcasts.includes(platform.name)
                ? `Stop ${platform.label} Broadcast`
                : `Start ${platform.label} Broadcast`}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Broadcast Form Modal */}
      {showBroadcastForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 shadow-xl border border-spacing-1">
          <div className="w-full p-6 rounded-lg bg-[#243341] max-w-md absolute bottom-4">
            <h3 className="mb-4 text-xl font-bold text-white">
              Start {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Broadcast
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-red-500">Stream URL</label>
                <input
                  type="text"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="rtmp://..."
                  className="w-full p-2 text-white rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-red-500">Stream Key</label>
                <input
                  type="text"
                  value={streamKey}
                  onChange={(e) => setStreamKey(e.target.value)}
                  placeholder="Enter stream key..."
                  className="w-full p-2 text-white rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end mt-6 space-x-2">
                <button
                  onClick={() => setShowBroadcastForm(false)}
                  className="px-4 py-2 transition rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={startBroadcast}
                  className="px-4 py-2 transition text-white rounded-lg bg-red-400 hover:bg-red-500"
                >
                  Start Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )

  if (callingState !== CallingState.JOINED) return <Loader />

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || []
  const hostId = userData?.primaryEmailAddress?.emailAddress
  const isHost = adminEmails.includes(hostId)

  return videoClient && call ? (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <section className="relative w-full h-screen pt-4 overflow-hidden">
          <div className="relative flex items-center justify-center size-full">
            <div
              className={cn("flex transition-all duration-300 ease-in-out size-full", {
                "max-w-[1000px]": !showChat && !showParticipants,
                "max-w-[800px]": showChat || showParticipants,
              })}
            >
              <CallLayout />
            </div>

            {showParticipants && !showChat && (
              <div
                className="fixed right-0 p-4 transition-all duration-300 ease-in-out bg-[#19232d]/95 backdrop-blur-md rounded-lg md:relative w-[300px] sm:w-[350px] h-[calc(100vh-100px)] md:h-[calc(100vh-86px)] z-[100] md:z-auto overflow-hidden"
              >
                <CallParticipantsList onClose={() => setShowParticipants(false)} />
              </div>
            )}

            {showChat && !showParticipants && (
              <div
                className="fixed right-0 p-4 transition-all duration-300 ease-in-out bg-[#19232d]/95 backdrop-blur-md rounded-lg md:relative w-[300px] sm:w-[350px] h-[calc(100vh-100px)] md:h-[calc(100vh-86px)] z-[100] md:z-10 overflow-hidden"
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-end mb-2">
                    <button className="p-2 transition rounded hover:bg-gray-700/50" onClick={() => setShowChat(false)}>
                      <X className="text-white size-5" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-2 overflow-auto custom-scrollbar-hidden">
                    {messages.map((msg) => (
                      <div key={msg.id} className="p-2 rounded-lg bg-gray-700/50 backdrop-blur-sm">
                        <span className="font-semibold text-yellow-1">{msg.sender}:</span>
                        <span className="ml-2 text-white">{msg.text}</span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="w-full p-2 mt-2 text-white rounded-lg bg-gray-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendMessage(messageText)
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="fixed bottom-0 w-full px-4 pb-4">
            <div
              className="flex flex-wrap items-center justify-center gap-2 p-2 mx-auto transition rounded-lg sm:gap-4 bg-[#19232d]/80 backdrop-blur-md max-w-max"
            >
              <CallControls onLeave={() => router.push("/")} />

              {isHost && (
                <>
                  <MuteButton />
                  <EndCallButton />
                  <BroadcastControl />
                  {broadcastError && <span className="text-sm text-red-500">{broadcastError}</span>}
                </>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger className="p-2 transition rounded-lg hover:bg-gray-700/50">
                  <LayoutList className="text-white size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {["Grid", "Speaker-Left", "Speaker-Right"].map((item) => (
                    <DropdownMenuItem key={item} onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}>
                      {item}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <CallStatsButton />

              <button
                className="p-2 transition rounded-lg hover:bg-gray-700/50"
                onClick={() => {
                  setShowParticipants(!showParticipants)
                  setShowChat(false)
                }}
              >
                <Users className="text-white size-5 hover:bg-gray-700/50" />
              </button>

              <button
                className="p-2 transition rounded-lg hover:bg-gray-700/50"
                onClick={() => {
                  setShowChat(!showChat)
                  setShowParticipants(false)
                }}
              >
                <MessageSquare className="text-white size-5" />
              </button>
            </div>
          </div>
        </section>
      </StreamCall>
    </StreamVideo>
  ) : (
    <Loader />
  )
}

export default MeetingRoom;
