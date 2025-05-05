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
import { Users, LayoutList, MessageSquare, X, Cast, Crown, BarChart2, AlertCircle, MoreVertical} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"

// Local components
import Loader from "./Loader"
import MuteButton from "./MuteButton"
import EndCallButton from "./EndCallButton"
import { SuperchatPanel } from "./superchat/superchat-panel"
import { SendSuperchatModal } from "./superchat/send-superchat-modal"
import { PollsManager } from "./poll/polls-manager"
import { ActivePoll } from "./poll/active-poll"

// Broadcast platform configuration with more details
const BROADCAST_PLATFORMS = [
  {
    id: "youtube",
    name: "YouTube",
    defaultUrl: process.env.NEXT_PUBLIC_YOUTUBE_STREAM_URL || "",
    defaultKey: process.env.NEXT_PUBLIC_YOUTUBE_STREAM_KEY || "",
    icon: "youtube",
  },
  {
    id: "facebook",
    name: "Facebook",
    defaultUrl: "",
    defaultKey: "",
    icon: "facebook",
  },
]

type CallLayoutType = "grid" | "speaker-left" | "speaker-right"

interface MeetingRoomProps {
  apiKey: string
  userToken: string
  userData: {
    id: string
    fullName?: string
    primaryEmailAddress?: {
      emailAddress: string
    }
    [key: string]: any
  }
}

const MeetingRoom = ({ apiKey, userToken, userData }: MeetingRoomProps) => {
  const router = useRouter()
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left")
  const [activePanel, setActivePanel] = useState<
    "none" | "participants" | "chat" | "superchat" | "polls" | "activePoll"
  >("none")
  const [showSendSuperchat, setShowSendSuperchat] = useState(false)
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
  const youtubeStreamUrl = process.env.NEXT_PUBLIC_YOUTUBE_STREAM_URL || ""
  const youtubeStreamKey = process.env.NEXT_PUBLIC_YOUTUBE_STREAM_KEY || ""

  // Modify the state initialization of `streamUrl` and `streamKey` to use the environment variables
  const [streamUrl, setStreamUrl] = useState(youtubeStreamUrl)
  const [streamKey, setStreamKey] = useState(youtubeStreamKey)

  const { toast } = useToast()

  // Start RTMP broadcast
  const startBroadcast = async () => {
    if (!streamUrl || !streamKey || !selectedPlatform) {
      toast({ description: "Please fill in all the broadcast details.", type: "destructive" })
      return
    }

    try {
      setBroadcastError("")

      if (!call) {
        throw new Error("Call object is not available")
      }

      // Start the RTMP stream
      await call.startRTMPBroadcasts({
        broadcasts: [
          {
            name: selectedPlatform,
            stream_url: streamUrl,
            stream_key: streamKey,
          },
        ],
      })

      toast({
        title: "Broadcast Started",
        description: `${selectedPlatform} broadcast started successfully!`,
      })
      setActiveBroadcasts((prev) => [...prev, selectedPlatform])
      setShowBroadcastForm(false)

      // Reset form fields but keep the defaults for next time
      setSelectedPlatform("")
    } catch (error: any) {
      console.error("Error starting broadcast:", error)

      if (error.message?.includes("Invalid stream key")) {
        toast({
          title: "Error",
          description: "Invalid stream key. Please check your details.",
          type: "destructive",
        })
      } else if (error.message?.includes("Unauthorized")) {
        toast({
          title: "Error",
          description: "Authorization error. Please check your permissions.",
          type: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to start ${selectedPlatform} broadcast: ${error.message}`,
          type: "destructive",
        })
      }
    }
  }

  // Stop RTMP broadcast
  const stopBroadcast = async (platformName: string) => {
    try {
      if (!call) {
        setBroadcastError("Call object is not available.")
        return
      }

      if (!activeBroadcasts.includes(platformName)) {
        setBroadcastError(`No active broadcast found for ${platformName}.`)
        return
      }

      setBroadcastError("")

      // Check if stopLive() is available in the SDK
      if (typeof call.stopLive !== "function") {
        setBroadcastError("Stop live function is not available in this SDK version.")
        return
      }

      await call.stopLive()

      setActiveBroadcasts((prev) => prev.filter((name) => name !== platformName))

      console.log(`${platformName} broadcast stopped successfully.`)
    } catch (error) {
      console.error("Error stopping broadcast:", error)
      setBroadcastError(`Failed to stop ${platformName} broadcast.`)
    }
  }

  // Check broadcast status
  useEffect(() => {
    if (!call) return

    const checkBroadcastStatus = async () => {
      const resp = await call.get()
      const isBroadcasting = resp.call.egress.broadcasting
      if (isBroadcasting) {
        setActiveBroadcasts((prev) => [...prev])
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
    if (!activePanel || activePanel !== "chat" || !call?.id) return

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
  }, [activePanel, call?.id])

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

  // Improved admin check
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map((email) => email.trim())
  const userEmail = userData?.primaryEmailAddress?.emailAddress || ""
  const isAdmin = adminEmails.includes(userEmail)

  // Handle superchat success
  const handleSuperchatSuccess = () => {
    setShowSendSuperchat(false)
    setActivePanel("superchat")
  }

  // Replace the individual panel toggle functions with a single togglePanel function
  const togglePanel = (panelName: "participants" | "chat" | "superchat" | "polls" | "activePoll") => {
    setActivePanel((current) => (current === panelName ? "none" : panelName))
  }

  // Add Broadcast Control Button in admin controls
  const BroadcastControl = () => (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 rounded-lg transition hover:bg-gray-700/50">
          <Cast className="text-white size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {BROADCAST_PLATFORMS.map((platform) => (
            <DropdownMenuItem
              key={platform.id}
              onClick={() => {
                if (activeBroadcasts.includes(platform.id)) {
                  stopBroadcast(platform.id)
                } else {
                  setSelectedPlatform(platform.id)
                  // Set default values from platform config
                  setStreamUrl(platform.defaultUrl)
                  setStreamKey(platform.defaultKey)
                  setShowBroadcastForm(true)
                }
              }}
            >
              {activeBroadcasts.includes(platform.id)
                ? `Stop ${platform.name} Broadcast`
                : `Start ${platform.name} Broadcast`}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Broadcast Form Modal */}
      {showBroadcastForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full p-6 rounded-lg bg-[#243341] max-w-md relative">
            <button
              onClick={() => setShowBroadcastForm(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <h3 className="mb-4 text-xl font-bold text-white">
              Start {BROADCAST_PLATFORMS.find((p) => p.id === selectedPlatform)?.name || selectedPlatform} Broadcast
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-white">Stream URL</label>
                <input
                  type="text"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="rtmp://..."
                  className="w-full p-2 text-white rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-white">Stream Key</label>
                <input
                  type="password"
                  value={streamKey}
                  onChange={(e) => setStreamKey(e.target.value)}
                  placeholder="Enter stream key..."
                  className="w-full p-2 text-white rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-400">Your stream key is kept secure and never stored.</p>
              </div>

              {broadcastError && (
                <div className="p-3 rounded-lg bg-red-500/20 flex items-center">
                  <AlertCircle size={16} className="text-red-400 mr-2" />
                  <span className="text-red-200 text-sm">{broadcastError}</span>
                </div>
              )}

              <div className="flex justify-end mt-6 space-x-2">
                <Button variant="outline" onClick={() => setShowBroadcastForm(false)}>
                  Cancel
                </Button>
                <Button onClick={startBroadcast} className="bg-red-500 hover:bg-red-600 text-white">
                  Start Broadcast
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )

  // Check for active polls when component mounts
  useEffect(() => {
    if (!call?.id) return

    const checkForActivePolls = async () => {
      try {
        const { data, error } = await supabase
          .from("polls")
          .select("*")
          .eq("call_id", call.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)

        if (error) throw error

        if (data && data.length > 0 && !isAdmin) {
          // If there's an active poll and user is not admin, show the active poll panel
          setActivePanel("activePoll")
          toast({
            title: "New Poll",
            description: "A new poll is available!",
          })
        }
      } catch (err) {
        console.error("Error checking for active polls:", err)
      }
    }

    checkForActivePolls()

    // Subscribe to new polls
    const subscription = supabase
      .channel(`new-polls-${call.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "polls", filter: `call_id=eq.${call.id}` },
        () => {
          if (!isAdmin) {
            setActivePanel("activePoll")
            toast({
              title: "New Poll",
              description: "A new poll is available!",
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [call?.id, isAdmin, toast])

  if (callingState !== CallingState.JOINED) return <Loader />

  // Update the JSX to use the activePanel state
  return videoClient && call ? (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <section className="relative w-full h-screen pt-4 overflow-hidden">
          <div className="relative flex items-center justify-center size-full">
            <div
              className={cn("flex transition-all duration-300 ease-in-out size-full", {
                "max-w-[1000px]": activePanel === "none",
                "max-w-[800px]": activePanel !== "none",
              })}
            >
              <CallLayout />
            </div>
  
            {/* Participants Panel */}
            {activePanel === "participants" && (
              <div className="fixed right-0 p-4 transition-all duration-300 ease-in-out bg-[#19232d]/95 backdrop-blur-md rounded-lg md:relative w-[300px] sm:w-[350px] h-[calc(100vh-100px)] md:h-[calc(100vh-86px)] z-[100] md:z-auto overflow-hidden">
                <CallParticipantsList onClose={() => setActivePanel("none")} />
              </div>
            )}
  
            {/* Chat Panel */}
            {activePanel === "chat" && (
              <div className="fixed right-0 p-4 transition-all duration-300 ease-in-out bg-[#19232d]/95 backdrop-blur-md rounded-lg md:relative w-[300px] sm:w-[350px] h-[calc(100vh-100px)] md:h-[calc(100vh-86px)] z-[100] md:z-10 overflow-hidden">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-white">Chat</h3>
                    <button
                      className="p-2 transition rounded hover:bg-gray-700/50"
                      onClick={() => setActivePanel("none")}
                    >
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
                  <div className="mt-2 flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="w-full p-2 text-white rounded-lg bg-gray-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          sendMessage(messageText)
                        }
                      }}
                    />
                    <Button
                      onClick={() => setShowSendSuperchat(true)}
                      className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
                      size="sm"
                    >
                      <Crown size={14} className="mr-1" /> Send Superchat
                    </Button>
                  </div>
                </div>
              </div>
            )}
  
            {/* Superchat Panel */}
            {activePanel === "superchat" && call?.id && (
              <div className="fixed right-0 transition-all duration-300 ease-in-out md:relative w-[300px] sm:w-[350px] h-[calc(100vh-100px)] md:h-[calc(100vh-86px)] z-[100] md:z-10 overflow-hidden">
                <SuperchatPanel
                  callId={call.id}
                  userId={userData?.id || ""}
                  isAdmin={isAdmin}
                  onClose={() => setActivePanel("none")}
                />
              </div>
            )}
  
            {/* Polls Manager */}
            {activePanel === "polls" && call?.id && (
              <div className="fixed right-0 transition-all duration-300 ease-in-out md:relative w-[300px] sm:w-[350px] h-[calc(100vh-100px)] md:h-[calc(100vh-86px)] z-[100] md:z-10 overflow-hidden">
                <PollsManager
                  callId={call.id}
                  userId={userData?.id || ""}
                  isAdmin={isAdmin}
                  onClose={() => setActivePanel("none")}
                />
              </div>
            )}
  
            {/* Active Poll */}
            {activePanel === "activePoll" && call?.id && (
              <div className="fixed right-0 transition-all duration-300 ease-in-out md:relative w-[300px] sm:w-[350px] h-[calc(100vh-100px)] md:h-[calc(100vh-86px)] z-[100] md:z-10 overflow-hidden">
                <ActivePoll callId={call.id} userId={userData?.id || ""} onClose={() => setActivePanel("none")} />
              </div>
            )}
          </div>
  
          {/* Bottom Controls */}
          <div className="fixed bottom-0 w-full px-4 pb-4">
            <div className="flex flex-wrap items-center justify-center gap-2 p-2 mx-auto transition rounded-lg sm:gap-4 bg-[#19232d]/80 backdrop-blur-md max-w-max">
              <CallControls onLeave={() => router.push("/")} />
  
              {isAdmin && (
                <>
                  <MuteButton />
                  <EndCallButton />
                  <BroadcastControl />
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
              <button onClick={() => togglePanel("chat")}>
                <MessageSquare className="mr-2 size-5 text-white" /> 
              </button>
  
              {/* 🔽 New Three Dots Dropdown for Panels */}
              <DropdownMenu>
                <DropdownMenuTrigger className="p-2 transition rounded-lg hover:bg-gray-700/50">
                  <MoreVertical className="text-white size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="text-white bg-gray-800 p-2  hover:bg-gray-900">
                  <DropdownMenuItem onClick={() => togglePanel("participants")}>
                    <Users className="mr-2 size-4" /> Participants
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => togglePanel("superchat")}>
                    <Crown className="mr-2 size-4" /> Superchat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => togglePanel(isAdmin ? "polls" : "activePoll")}>
                    <BarChart2 className="mr-2 size-4" /> Polls
                  </DropdownMenuItem>
                  <DropdownMenuItem >
                      <CallStatsButton />Statistics
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
  
          {/* Send Superchat Modal */}
          {showSendSuperchat && call?.id && (
            <SendSuperchatModal
              callId={call.id}
              senderName={userData?.fullName || "Anonymous"}
              userId={userData?.id || ""}
              onClose={() => setShowSendSuperchat(false)}
              onSuccess={handleSuperchatSuccess}
            />
          )}
        </section>
      </StreamCall>
    </StreamVideo>
  ) : (
    <Loader />
  );
  

}

export default MeetingRoom;
