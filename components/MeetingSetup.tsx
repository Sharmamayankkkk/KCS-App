"use client"
import { useEffect, useState, useRef, useCallback } from "react"
import { DeviceSettings, VideoPreview, useCall, useCallStateHooks } from "@stream-io/video-react-sdk"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import Alert from "./Alert"
import { Check, Mic, MicOff, Monitor, Settings, Video, VideoOff, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { BackgroundSelector } from "./BackgroundSelector"
import { useBackgroundProcessor } from "@/hooks/useBackgroundProcessor"

interface BackgroundOption {
  id: string
  name: string
  type: 'none' | 'blur' | 'image'
  url?: string
  preview?: string
}

const DEFAULT_BACKGROUND: BackgroundOption = {
  id: 'none',
  name: 'No Background',
  type: 'none',
}

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void
}) => {
  // Call state hooks
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks()
  const callStartsAt = useCallStartsAt()
  const callEndedAt = useCallEndedAt()
  const callTimeNotArrived = callStartsAt && new Date(callStartsAt) > new Date()
  const callHasEnded = !!callEndedAt

  const call = useCall()
  if (!call) {
    throw new Error("useStreamCall must be used within a StreamCall component.")
  }

  // Device states
  const [isMicEnabled, setIsMicEnabled] = useState(false)
  const [isCameraEnabled, setIsCameraEnabled] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [countdownValue, setCountdownValue] = useState<number | null>(null)
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(DEFAULT_BACKGROUND)
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)
  const [isProcessingBackground, setIsProcessingBackground] = useState(false)
  
  const { processFrame, cleanup } = useBackgroundProcessor()

  //By default keep it off
  useEffect(() => {
      call.microphone.disable()
        call.camera.disable()
        }, [call])
  
  useEffect(() => {
    const setupBackgroundProcessing = async () => {
      if (!isCameraEnabled) {
        cleanup()
        return
      }

      try {
        setIsProcessingBackground(true)

        // Register the background filter
        const { unregister } = call.camera.registerFilter((originalStream: MediaStream) => {
          // Process the stream with selected background
          const processedStreamPromise = processFrame(originalStream, selectedBackground)
          return {
            output: processedStreamPromise.then(stream => stream || originalStream),
            stop: () => cleanup()
          }
        })

        // Store the unregister function for cleanup
        return unregister
      } catch (error) {
        console.error('Error setting up background processing:', error)
      } finally {
        setIsProcessingBackground(false)
      }
    }

    const unregisterPromise = setupBackgroundProcessing()

    return () => {
      unregisterPromise?.then(unregister => unregister?.())
      cleanup()
    }
  }, [isCameraEnabled, selectedBackground, call.camera, processFrame, cleanup])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  const handleBackgroundChange = useCallback((background: BackgroundOption) => {
    setSelectedBackground(background)
    setShowBackgroundSelector(false)
  }, [])

  // Handle device toggles
  const toggleMic = () => {
    setIsMicEnabled((prev) => !prev)
    if (isMicEnabled) {
      call.microphone.disable()
    } else {
      call.microphone.enable()
    }
  }

  const toggleCamera = () => {
    setIsCameraEnabled((prev) => !prev)
    if (isCameraEnabled) {
      call.camera.disable()
    } else {
      call.camera.enable()
    }
  }

  // Handle join meeting with countdown
  const handleJoinMeeting = () => {
    setIsJoining(true)
    setCountdownValue(3)
  }

  // Handle countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isJoining && countdownValue !== null) {
      if (countdownValue > 0) {
        timer = setTimeout(() => {
          setCountdownValue(countdownValue - 1)
        }, 1000)
      } else {
        // Join the call when countdown reaches 0
        call.join()
        setIsSetupComplete(true)
      }
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isJoining, countdownValue, call, setIsSetupComplete])

  // Ads script
  useEffect(() => {
    const script = document.createElement("script")
    script.async = true
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9082594150892887"
    script.crossOrigin = "anonymous"
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Conditional rendering for various states
  if (callTimeNotArrived) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <Alert
          title={`Your Meeting has not started yet`}
          subtitle={`It is scheduled for ${callStartsAt?.toLocaleString()}`}
        />
      </div>
    )
  }

  if (callHasEnded) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <Alert title="The call has been ended by the host" iconUrl="/icons/call-ended.svg" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <Card className="max-w-3xl w-full p-6 border-none bg-slate-800/70 backdrop-blur-lg shadow-xl rounded-xl">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="text-center mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Hare Krishna <br /> Ready to join?</h1>
            <p className="text-slate-300 max-w-md mx-auto">
              Check your audio and video settings before joining the meeting
            </p>
          </div>

          {/* Main content container */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Video preview */}
            <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-700/50 shadow-inner">
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center z-10 bg-black/70 transition-opacity duration-300",
                  isCameraEnabled ? "opacity-0 pointer-events-none" : "opacity-100",
                )}
              >
                <VideoOff size={48} className="text-slate-300/80" />
              </div>
              <VideoPreview className={cn("w-full h-full min-h-[280px]", !isCameraEnabled && "opacity-0")} />
            </div>

            {/* Controls */}
            <div className="flex-1 flex flex-col justify-between gap-4">
              {/* Device toggles */}
              <div className="grid grid-cols-1 gap-4">
                <h2 className="text-xl font-semibold text-white mb-2">Audio & Video</h2>

                <div className="flex flex-col space-y-4">
                  {/* Camera toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {isCameraEnabled ? (
                        <Video className="text-emerald-400" size={20} />
                      ) : (
                        <VideoOff className="text-slate-400" size={20} />
                      )}
                      <span className="text-white">Camera</span>
                    </div>
                    <Button
                      onClick={toggleCamera}
                      variant="secondary"
                      className={cn(
                        "h-9 px-4 transition-all duration-300",
                        isCameraEnabled
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-slate-600 hover:bg-slate-700 text-slate-300",
                      )}
                    >
                      {isCameraEnabled ? "On" : "Off"}
                    </Button>
                  </div>

                  {/* Microphone toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {isMicEnabled ? (
                        <Mic className="text-emerald-400" size={20} />
                      ) : (
                        <MicOff className="text-slate-400" size={20} />
                      )}
                      <span className="text-white">Microphone</span>
                    </div>
                    <Button
                      onClick={toggleMic}
                      variant="secondary"
                      className={cn(
                        "h-9 px-4 transition-all duration-300",
                        isMicEnabled
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-slate-600 hover:bg-slate-700 text-slate-300",
                      )}
                    >
                      {isMicEnabled ? "On" : "Off"}
                    </Button>
                  </div>

                  {/* Device settings button */}
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Settings className="text-blue-400" size={20} />
                      <span className="text-white">Device settings</span>
                    </div>
                    <Button
                      variant="secondary"
                      className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => setShowSettings(!showSettings)}
                    >
                      Configure
                    </Button>
                  </div>
                </div>

                {/* Device settings panel (conditionally rendered) */}
                {showSettings && (
                  <div className="mt-2 p-4 bg-slate-700/70 rounded-lg border border-slate-600/50 animate-fade-in">
                    <DeviceSettings />
                  </div>
                )}

                {/* Background Settings */}
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="text-purple-400" size={20} />
                    <div className="flex flex-col">
                      <span className="text-white">Background</span>
                      <span className="text-xs text-gray-400">
                        {selectedBackground.name}
                        {isProcessingBackground && " (Processing...)"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="h-9 px-4 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => setShowBackgroundSelector(true)}
                    disabled={isProcessingBackground}
                  >
                    {isProcessingBackground ? "Processing..." : "Change"}
                  </Button>
                </div>
              </div>

              {/* Share screen reminder 
              <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30 mt-2">
                <div className="flex items-center gap-2">
                  <Monitor size={18} className="text-slate-300" />
                  <p className="text-sm text-slate-300">You can share your screen after joining the meeting</p>
                </div>
              </div>  */}
            </div>
          </div>

          {/* Join button */}
          <div className="mt-4 flex flex-col items-center">
            {isJoining ? (
              <div className="text-center">
                <div className="mb-2 text-5xl font-bold text-white">{countdownValue}</div>
                <p className="text-slate-300">Joining meeting...</p>
              </div>
            ) : (
              <Button
                className="w-full sm:w-64 h-12 bg-green-600 hover:bg-green-700 text-white font-medium text-lg rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                onClick={handleJoinMeeting}
              >
                <Check size={18} />
                Join meeting
              </Button>
            )}

            <p className="text-xs text-slate-400 mt-4 text-center max-w-sm">
              By joining, you agree to our terms of service and privacy policy
            </p>
          </div>
        </div>
      </Card>

      {/* Background Selector Modal */}
      {showBackgroundSelector && (
        <BackgroundSelector
          selectedBackground={selectedBackground}
          onBackgroundChange={handleBackgroundChange}
          onClose={() => setShowBackgroundSelector(false)}
        />
      )}
    </div>
  )
}

export default MeetingSetup
