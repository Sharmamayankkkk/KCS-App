"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence } from "framer-motion"
import { Crown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SuperchatMessage, type SuperchatMessage as SuperchatMessageType } from "./superchat-message"
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
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-700/50 bg-dark-1/95 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700/50 bg-dark-1/60 p-4">
        <div className="flex items-center gap-2">
          <Crown className="text-yellow-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Superchats</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`h-7 rounded-full px-3 text-xs transition-all duration-200 ${
              showPinnedOnly 
                ? "border-yellow-700/50 bg-yellow-800/50 text-yellow-200" 
                : "border-gray-700/50 bg-transparent text-gray-300 hover:bg-gray-700/50"
            }`}
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
          >
            {showPinnedOnly ? "Show All" : "Pinned Only"}
          </Button>
          
          <button
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-700/50 hover:text-red-400"
            onClick={onClose}
            aria-label="Close superchats panel"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div ref={containerRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        <AnimatePresence>
          {filteredSuperchats.map((message) => (
            <SuperchatMessage key={message.id} message={message} onPin={handlePinSuperchat} isAdmin={isAdmin} />
          ))}
        </AnimatePresence>

        {filteredSuperchats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Crown size={48} className="mb-4 text-gray-600" />
            <div className="text-gray-400">
              {showPinnedOnly ? (
                <>
                  <p className="mb-2 text-lg font-medium">No pinned superchats yet</p>
                  <p className="text-sm">Pin important messages to highlight them for everyone</p>
                </>
              ) : (
                <>
                  <p className="mb-2 text-lg font-medium">No superchats yet</p>
                  <p className="text-sm">Superchats will appear here when participants send highlighted messages</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
