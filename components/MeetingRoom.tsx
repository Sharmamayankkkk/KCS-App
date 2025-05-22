"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useEffect, useRef } from "react"
import {
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
import {
  Users,
  LayoutList,
  MessageSquare,
  X,
  Cast,
  Crown,
  BarChart2,
  AlertCircle,
  MoreVertical,
  Settings,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"

// Local components
import Loader from "./Loader"
import AdminPanel from "./AdminPanel"
import MuteButton from "./MuteButton"
import EndCallButton from "./EndCallButton"
import { SuperchatPanel } from "./superchat/superchat-panel"
import { SendSuperchatModal } from "./superchat/send-superchat-modal"
import { PollsManager } from "./poll/polls-manager"
import { ActivePoll } from "./poll/active-poll"
import CustomGridLayout from './CustomGridLayout'
import CallControls from './CallControls'

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
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [buttonHoverStates, setButtonHoverStates] = useState<Record<string, boolean>>({})
  const [showControls, setShowControls] = useState(true)
  const hideTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const resetTimer = () => {
      setShowControls(true)
      if (hideTimeout.current) clearTimeout(hideTimeout.current)
      hideTimeout.current = setTimeout(() => setShowControls(false), 3000)
    }
    document.addEventListener("mousemove", resetTimer)
    document.addEventListener("click", resetTimer)
    document.addEventListener("touchstart", resetTimer)
    resetTimer()
    return () => {
      document.removeEventListener("mousemove", resetTimer)
      document.removeEventListener("click", resetTimer)
      document.removeEventListener("touchstart", resetTimer)
      if (hideTimeout.current) clearTimeout(hideTimeout.current)
    }
  }, [])


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

      // RTMP‐specific stop
      await call.stopRTMPBroadcast(platformName)

      // Remove from active list
      setActiveBroadcasts((prev) => prev.filter((name) => name !== platformName))
    } catch (error: any) {
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
      case 'grid': return <CustomGridLayout />;
      case 'speaker-left': return <SpeakerLayout participantsBarPosition="left" />;
      case 'speaker-right': return <SpeakerLayout participantsBarPosition="right" />;

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

  // Handle button hover states
  const handleButtonHover = (buttonId: string, isHovering: boolean) => {
    setButtonHoverStates((prev) => ({
      ...prev,
      [buttonId]: isHovering,
    }))
  }

  // Track unread messages when chat panel is closed
  useEffect(() => {
    if (activePanel !== "chat") {
      const handleNewMessage = () => {
        setUnreadMessages((prev) => prev + 1)
      }

      const subscription = supabase
        .channel(`unread-messages:${call?.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, handleNewMessage)
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    } else {
      // Reset unread count when chat panel is opened
      setUnreadMessages(0)
    }
  }, [activePanel, call?.id])

  // Add Broadcast Control Button in admin controls
  const BroadcastControl = () => (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          onMouseEnter={() => handleButtonHover("broadcast", true)}
          onMouseLeave={() => handleButtonHover("broadcast", false)}
          className="size-11 rounded-full transition-all duration-200 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500/40 focus:outline-none flex items-center justify-center bg-gray-800/80 border border-gray-700/50 shadow-md"
        >
          <div className="relative">
            <Cast className="text-white size-5" />
            {buttonHoverStates["broadcast"] && (
              <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-90">
                Broadcast
              </span>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="center"
          className="bg-gray-800 border-gray-700 text-white rounded-lg shadow-xl animate-in fade-in-80 zoom-in-95 w-48"
        >
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
              className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-700/70 rounded-md focus:bg-gray-700 focus:outline-none"
            >
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center">
                  <Cast className="mr-2 size-4" />
                  {platform.name}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium px-1.5 py-0.5 rounded-md",
                    activeBroadcasts.includes(platform.id) ? "bg-red-500/20 text-red-300" : "bg-gray-700 text-gray-300",
                  )}
                >
                  {activeBroadcasts.includes(platform.id) ? "LIVE" : "OFF"}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Broadcast Form Modal */}
      {showBroadcastForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full p-6 rounded-lg bg-[#243341] max-w-md relative bottom-20 shadow-2xl border border-gray-700/30">
            <button
              onClick={() => setShowBroadcastForm(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-full p-1"
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
                  className="w-full p-2.5 text-white rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/80 border border-gray-700"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-white">Stream Key</label>
                <input
                  type="password"
                  value={streamKey}
                  onChange={(e) => setStreamKey(e.target.value)}
                  placeholder="Enter stream key..."
                  className="w-full p-2.5 text-white rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/80 border border-gray-700"
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
                <Button
                  variant="outline"
                  onClick={() => setShowBroadcastForm(false)}
                  className="bg-transparent border border-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={startBroadcast}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition-all duration-200"
                >
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
        <section className="relative w-full h-full flex flex-col">
          <div className="relative flex items-center justify-center size-full">
            <div
              className={cn("flex transition-all duration-300 ease-in-out size-full", {
                "max-w-[1000px]": activePanel === "none",
                "max-w-[800px]": activePanel !== "none",
              })}
            >
              <CallLayout />
            </div>

            {/* Participants panel */}
            {activePanel === "participants" && (
              <div className="fixed top-0 right-0 p-4 bg-[#19232d]/95 backdrop-blur-md rounded-l-lg w-[300px] sm:w-[350px] h-full z-[100] overflow-hidden flex flex-col">
                <CallParticipantsList onClose={() => setActivePanel("none")} />
              </div>
            )}

            {/* Chat Panel */}
            {activePanel === "chat" && (
              <div className="fixed top-0 right-0 p-4 transition-all duration-300 ease-in-out bg-[#19232d]/95 backdrop-blur-md rounded-l-lg w-[300px] sm:w-[350px] h-full z-[100] overflow-hidden flex flex-col">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-white">Chat</h3>
                    <button
                      className="p-2 transition rounded-full hover:bg-gray-700/50"
                      onClick={() => setActivePanel("none")}
                    >
                      <X className="text-white size-5" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-2 overflow-auto custom-scrollbar-hidden pr-1">
                    {messages.map((msg, index) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "p-2.5 rounded-lg backdrop-blur-sm transition-all duration-300",
                          index === messages.length - 1 && unreadMessages === 0
                            ? "bg-blue-500/20 animate-pulse"
                            : "bg-gray-700/50",
                        )}
                      >
                        <span className="font-semibold text-yellow-300">{msg.sender}:</span>
                        <span className="ml-2 text-white">{msg.text}</span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="w-full p-3 pr-12 text-white rounded-full bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-blue-500/70 border border-gray-700/50"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            sendMessage(messageText)
                          }
                        }}
                      />
                      <button
                        onClick={() => sendMessage(messageText)}
                        disabled={!messageText.trim()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-full p-1.5 transition-all duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m22 2-7 20-4-9-9-4Z" />
                          <path d="M22 2 11 13" />
                        </svg>
                      </button>
                    </div>
                    <Button
                      onClick={() => setShowSendSuperchat(true)}
                      className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 rounded-full py-2.5 shadow-md transition-all duration-300 hover:shadow-lg"
                      size="sm"
                    >
                      <Crown size={14} className="mr-1.5" /> Send Superchat
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Superchat Panel */}
            {activePanel === "superchat" && call?.id && (
              <div className="fixed top-0 right-0 w-[300px] sm:w-[350px] h-full z-[100] overflow-hidden flex flex-col bg-[#19232d]/95 backdrop-blur-md rounded-l-lg">
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
              <div className="fixed top-0 right-0 w-[300px] sm:w-[350px] h-full z-[100] overflow-hidden flex flex-col bg-[#19232d]/95 backdrop-blur-md rounded-l-lg">
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
          <div
            className={`
               fixed bottom-0 w-full px-4 pb-4
               transition-opacity duration-300
               ${showControls
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"}
              `}
          >
            <div className="flex flex-wrap items-center justify-center gap-2 p-3 mx-auto transition rounded-lg sm:gap-4 bg-[#19232d]/90 backdrop-blur-md max-w-max shadow-lg border border-gray-700/30">
              {/* Standard Call Controls with custom styling */}
              <div className="flex items-center gap-2">
                <CallControls onLeave={() => ('/')} />
              </div>

              {/* <div className="h-8 w-px bg-gray-700/50 mx-1"></div> */}

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <AdminPanel />
                  <BroadcastControl />
                  <div className="h-8 w-px bg-gray-700/50 mx-1"></div>
                </div>
              )}

              {/* Layout Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  onMouseEnter={() => handleButtonHover("layout", true)}
                  onMouseLeave={() => handleButtonHover("layout", false)}
                  className="size-11 rounded-full transition-all duration-200 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500/40 focus:outline-none flex items-center justify-center bg-gray-800/80 border border-gray-700/50 shadow-md"
                >
                  <div className="relative">
                    <LayoutList className="text-white size-5" />
                    {buttonHoverStates["layout"] && (
                      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-90">
                        Layout
                      </span>
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="center"
                  className="bg-gray-800 border-gray-700 text-white rounded-lg shadow-xl animate-in fade-in-80 zoom-in-95 w-40"
                >
                  {[
                    { name: "Grid", value: "grid", icon: <LayoutList className="mr-2 size-4" /> },
                    { name: "Speaker Left", value: "speaker-left", icon: <LayoutList className="mr-2 size-4" /> },
                    { name: "Speaker Right", value: "speaker-right", icon: <LayoutList className="mr-2 size-4" /> },
                  ].map(({ name, value, icon }) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => setLayout(value as CallLayoutType)}
                      className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-700/70 rounded-md focus:bg-gray-700 focus:outline-none"
                    >
                      {icon}
                      {name}
                      {layout === value && <span className="ml-2 h-2 w-2 rounded-full bg-blue-500"></span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Chat Button with notification indicator */}
              <button
                onMouseEnter={() => handleButtonHover("chat", true)}
                onMouseLeave={() => handleButtonHover("chat", false)}
                onClick={() => {
                  togglePanel("chat")
                  setUnreadMessages(0) // Reset unread count when opening chat
                }}
                className="size-11 rounded-full transition-all duration-200 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500/40 focus:outline-none flex items-center justify-center bg-gray-800/80 border border-gray-700/50 shadow-md relative"
              >
                <div className="relative">
                  <MessageSquare className="text-white size-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center animate-pulse">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                  {buttonHoverStates["chat"] && (
                    <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-90">
                      Chat
                    </span>
                  )}
                </div>
              </button>

              {/* Main Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  onMouseEnter={() => handleButtonHover("menu", true)}
                  onMouseLeave={() => handleButtonHover("menu", false)}
                  className="size-11 rounded-full transition-all duration-200 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500/40 focus:outline-none flex items-center justify-center bg-gray-800/80 border border-gray-700/50 shadow-md"
                >
                  <div className="relative">
                    <MoreVertical className="text-white size-5" />
                    {buttonHoverStates["menu"] && (
                      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-90">
                        More
                      </span>
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="end"
                  className="bg-gray-800 border-gray-700 text-white rounded-lg shadow-xl animate-in fade-in-80 zoom-in-95 w-56 p-1"
                >
                  <DropdownMenuItem
                    onClick={() => togglePanel("participants")}
                    className="flex items-center px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-700/70 rounded-md focus:bg-gray-700 focus:outline-none group"
                  >
                    <Users className="mr-2 size-4 text-gray-400 group-hover:text-white transition-colors" />
                    <span>Participants</span>
                    {activePanel === "participants" && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-blue-500"></span>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => togglePanel("superchat")}
                    className="flex items-center px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-700/70 rounded-md focus:bg-gray-700 focus:outline-none group"
                  >
                    <Crown className="mr-2 size-4 text-amber-500 group-hover:text-amber-400 transition-colors" />
                    <span>Superchat</span>
                    {activePanel === "superchat" && <span className="ml-auto h-2 w-2 rounded-full bg-blue-500"></span>}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => togglePanel(isAdmin ? "polls" : "activePoll")}
                    className="flex items-center px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-700/70 rounded-md focus:bg-gray-700 focus:outline-none group"
                  >
                    <BarChart2 className="mr-2 size-4 text-gray-400 group-hover:text-white transition-colors" />
                    <span>Polls</span>
                    {(activePanel === "polls" || activePanel === "activePoll") && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-blue-500"></span>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 border-t border-gray-700" />

                  <DropdownMenuItem className="flex items-center px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-700/70 rounded-md focus:bg-gray-700 focus:outline-none group">
                    <Settings className="mr-2 size-4 text-gray-400 group-hover:text-white transition-colors" />
                    <span className="flex items-center">
                      <span>Statistics</span>
                      <CallStatsButton />
                    </span>
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
  )
}
export default MeetingRoom;
