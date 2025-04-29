"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SuperchatMessage {
  id: string
  sender: string
  text: string
  amount: number
  timestamp: string
  currency: string
  duration: number // in seconds
  isPinned: boolean
}

interface SuperchatMessageProps {
  message: SuperchatMessage
  onPin?: (id: string) => void
  isAdmin?: boolean
}

const getColorByAmount = (amount: number): string => {
  if (amount >= 1000) return "bg-gradient-to-r from-red-500 to-red-700"
  if (amount >= 500) return "bg-gradient-to-r from-amber-500 to-amber-700"
  if (amount >= 200) return "bg-gradient-to-r from-emerald-500 to-emerald-700"
  if (amount >= 100) return "bg-gradient-to-r from-blue-500 to-blue-700"
  return "bg-gradient-to-r from-purple-500 to-purple-700"
}

export const SuperchatMessage = ({ message, onPin, isAdmin = false }: SuperchatMessageProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(message.duration)
  const [visible, setVisible] = useState<boolean>(true)

  // Check if message visibility and remaining time are stored in localStorage
  useEffect(() => {
    const storedMessage = localStorage.getItem(message.id)
    if (storedMessage) {
      const parsedMessage = JSON.parse(storedMessage)
      setVisible(parsedMessage.isVisible) // Set visibility from localStorage
      setTimeLeft(parsedMessage.timeLeft) // Set time left from localStorage
    }
  }, [message.id])

  // Timer logic
  useEffect(() => {
    if (!message.isPinned) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setVisible(false)
            localStorage.setItem(
              message.id,
              JSON.stringify({ isVisible: false, timeLeft: 0 })
            ) // Save message visibility and timeLeft to localStorage
            return 0
          }
          localStorage.setItem(
            message.id,
            JSON.stringify({ isVisible: true, timeLeft: prev - 1 })
          ) // Save the updated timeLeft to localStorage
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [message.isPinned, message.duration])

  // Don't render if not visible and not pinned
  if (!visible && !message.isPinned) return null

  const colorClass = getColorByAmount(message.amount)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn("relative rounded-lg overflow-hidden shadow-lg mb-3 border border-gray-700", colorClass)}
    >
      <div className="flex items-start p-3">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="font-bold text-white">{message.sender}</span>
            {message.isPinned && (
              <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full flex items-center">
                <Star size={12} className="mr-1" /> Pinned
              </span>
            )}
          </div>
          <p className="text-white text-sm">{message.text}</p>
        </div>
        <div className="text-white text-right">
          <div className="font-bold text-lg">
            {message.currency} {message.amount.toFixed(2)}
          </div>
          {!message.isPinned && <div className="text-xs opacity-75">{timeLeft}s</div>}
        </div>
      </div>

      {isAdmin && (
        <button
          onClick={() => onPin?.(message.id)}
          className="absolute bottom-1 right-1 text-white bg-gray-800/50 p-1 rounded-full hover:bg-gray-700/70"
        >
          <CheckCircle size={16} />
        </button>
      )}
    </motion.div>
  )
}
