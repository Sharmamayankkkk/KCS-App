"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence } from "framer-motion"
import { Crown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SuperchatMessage, type SuperchatMessageData as SuperchatMessageType } from "./superchat-message"
import { supabase } from "@/lib/supabaseClient"

interface SuperchatPanelProps {
  callId: string
  userId: string
  isAdmin?: boolean
  onClose: () => void
}

export const SuperchatPanel = ({ callId, userId, isAdmin = false, onClose }: SuperchatPanelProps) => {
  const [superchats, setSuperchats] = useState<SuperchatMessageType[]>([])
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch superchats
  useEffect(() => {
    const fetchSuperchats = async () => {
      const { data, error } = await supabase
        .from("superchats")
        .select("*")
        .eq("call_id", callId)
        .order("timestamp", { ascending: false })

      if (error) {
        console.error("Error fetching superchats:", error)
      } else {
        setSuperchats(
          data.map((item) => {
            const calculatedDuration = calculateDuration(item.amount)
            const messageTime = new Date(item.timestamp).getTime()
            const currentTime = new Date().getTime()
            const elapsedSeconds = Math.floor((currentTime - messageTime) / 1000)
            const remainingDuration = Math.max(0, calculatedDuration - elapsedSeconds)

            return {
              id: item.id,
              sender: item.sender_name,
              text: item.message,
              amount: item.amount,
              currency: item.currency || "INR",
              timestamp: item.timestamp,
              duration: remainingDuration, // Use remaining duration
              isPinned: item.is_pinned || false,
            }
          }),
        )
      }
    }

    fetchSuperchats()

    // Subscribe to new superchats
    const subscription = supabase
      .channel(`superchats:${callId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "superchats", filter: `call_id=eq.${callId}` },
        (payload) => {
          const newSuperchat = {
            id: payload.new.id,
            sender: payload.new.sender_name,
            text: payload.new.message,
            amount: payload.new.amount,
            currency: payload.new.currency || "INR",
            timestamp: payload.new.timestamp,
            duration: calculateDuration(payload.new.amount),
            isPinned: payload.new.is_pinned || false,
          }

          setSuperchats((current) => [newSuperchat, ...current])
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "superchats", filter: `call_id=eq.${callId}` },
        (payload) => {
          setSuperchats((current) =>
            current.map((superchat) =>
              superchat.id === payload.new.id
                ? {
                    ...superchat,
                    isPinned: payload.new.is_pinned || false,
                  }
                : superchat,
            ),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [callId])

  // Calculate duration based on amount (in seconds)
  const calculateDuration = (amount: number): number => {
    if (amount >= 1000) return 300 // 5 minutes = 300 seconds
    if (amount >= 500) return 180 // 3 minutes = 180 seconds
    if (amount >= 200) return 120 // 2 minutes = 120 seconds
    if (amount >= 100) return 60 // 1 minute = 60 seconds
    return 30 // 30 seconds
  }

  // Handle pin/unpin superchat
  const handlePinSuperchat = async (id: string) => {
    if (!isAdmin) return

    const superchatToUpdate = superchats.find((sc) => sc.id === id)
    if (!superchatToUpdate) return

    const newPinnedState = !superchatToUpdate.isPinned

    const { error } = await supabase.from("superchats").update({ is_pinned: newPinnedState }).eq("id", id)

    if (error) {
      console.error("Error updating superchat:", error)
    } else {
      setSuperchats((current) =>
        current.map((superchat) => (superchat.id === id ? { ...superchat, isPinned: newPinnedState } : superchat)),
      )
    }
  }

  // Filter superchats based on the toggle
  const filteredSuperchats = showPinnedOnly ? superchats.filter((msg) => msg.isPinned) : superchats

  return (
    <div className="flex h-full flex-col rounded-lg bg-[#19232d]/95 p-4 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Crown className="mr-2" size={20} style={{ color: '#A41F13' }} />
          <h3 className="text-lg font-semibold text-white">Superchats</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className={`rounded-full px-3 text-xs text-white transition-all duration-200 ${
              showPinnedOnly ? "border-gray-700/50" : "border-gray-700/50 bg-transparent"
            }`}
            style={showPinnedOnly ? { backgroundColor: 'rgba(164, 31, 19, 0.5)', borderColor: 'rgba(164, 31, 19, 0.5)' } : {}}
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
          >
            {showPinnedOnly ? "Show All" : "Pinned Only"}
          </Button>
          <button
            className="rounded-full p-1.5 text-white transition hover:bg-gray-700/50 hover:text-gray-300"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="custom-scrollbar-hidden flex-1 space-y-2 overflow-y-auto">
        <AnimatePresence>
          {filteredSuperchats.map((message) => (
            <SuperchatMessage key={message.id} message={message} onPin={handlePinSuperchat} isAdmin={isAdmin} />
          ))}
        </AnimatePresence>

        {filteredSuperchats.length === 0 && (
          <div className="py-8 text-center text-gray-400">
            {showPinnedOnly ? "No pinned superchats yet" : "No superchats yet"}
          </div>
        )}
      </div>
    </div>
  )
}
