"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, X, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

interface SendSuperchatModalProps {
  callId: string
  senderName: string
  userId: string
  onClose: () => void
  onSuccess: () => void
}

// Predefined amount tiers
const AMOUNT_TIERS = [
  { value: 20, label: "₹20", color: "bg-purple-500", duration: "30s" },
  { value: 100, label: "₹100", color: "bg-blue-500", duration: "1m" },
  { value: 200, label: "₹200", color: "bg-emerald-500", duration: "2m" },
  { value: 500, label: "₹500", color: "bg-amber-500", duration: "3m" },
  { value: 1000, label: "₹1000", color: "bg-red-500", duration: "5m" },
]

export const SendSuperchatModal = ({ callId, senderName, userId, onClose, onSuccess }: SendSuperchatModalProps) => {
  const [message, setMessage] = useState("")
  const [selectedAmount, setSelectedAmount] = useState(AMOUNT_TIERS[0].value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "failed">("pending")

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
  }

  const selectedTier = AMOUNT_TIERS.find((tier) => tier.value === selectedAmount) || AMOUNT_TIERS[0]

  const initiateCashfreePayment = async () => {
    setLoading(true)
    setError("")

    try {
      // Generate a unique order ID
      const orderId = `SC-${callId.substring(0, 8)}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

      // 1. Create payment order on your backend
      const response = await fetch("/api/create-cashfree-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: selectedAmount,
          userId,
          callId,
          orderId,
          currency: "INR",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create payment order")
      }

      const orderData = await response.json()

      // In production, integrate with Cashfree's SDK
      // This is where you would initialize the Cashfree SDK and show the payment form
      // For example:
      //
      // if (typeof window.Cashfree !== 'undefined') {
      //   const cashfree = new window.Cashfree(orderData.order_token);
      //   cashfree.redirect();
      // }

      // For development purposes, we'll simulate the payment flow
      setPaymentStatus("processing")

      // Simulate payment processing
      setTimeout(() => {
        // Record successful payment
        createSuperchatEntry(orderData.cf_order_id)
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Payment initialization failed")
      setLoading(false)
      setPaymentStatus("failed")
    }
  }

  const createSuperchatEntry = async (orderReference: string) => {
    try {
      const { error: dbError } = await supabase.from("superchats").insert([
        {
          call_id: callId,
          sender_id: userId,
          sender_name: senderName,
          message: message,
          amount: selectedAmount,
          currency: "INR",
          timestamp: new Date().toISOString(),
          is_pinned: false,
          order_reference: orderReference, // Store the order reference for reconciliation
        },
      ])

      if (dbError) throw dbError

      setPaymentStatus("success")
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err) {
      console.error("Error creating superchat entry:", err)
      setPaymentStatus("failed")
      setError("Failed to save your superchat. Please try again.")
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (message.trim() === "") {
      setError("Please enter a message")
      return
    }

    initiateCashfreePayment()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full p-6 rounded-lg bg-[#243341] max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition"
          disabled={loading}
        >
          <X size={20} />
        </button>

        <h3 className="mb-6 text-xl font-bold text-white">Send a Superchat</h3>

        {paymentStatus === "pending" && (
          <>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-white">Your Message (max 200 chars)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                className="w-full p-3 text-white rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message here..."
                rows={3}
                maxLength={200}
                disabled={loading}
              />
              <div className="text-right text-xs text-gray-400">{message.length}/200</div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-white">Select Amount</label>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {AMOUNT_TIERS.map((tier) => (
                  <button
                    key={tier.value}
                    onClick={() => handleAmountSelect(tier.value)}
                    className={`p-2 rounded-lg text-center transition ${
                      selectedAmount === tier.value
                        ? `${tier.color} text-white ring-2 ring-white ring-opacity-70`
                        : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    }`}
                    disabled={loading}
                  >
                    <div className="font-semibold">{tier.label}</div>
                    <div className="text-xs">{tier.duration}</div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-300">Duration:</span>
                <span className="text-sm font-semibold text-white">{selectedTier.duration} highlight</span>
              </div>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-lg bg-red-500/20 text-red-200 flex items-center">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button className={selectedTier.color} onClick={handleSubmit} disabled={loading || message.trim() === ""}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" /> Processing...
                  </>
                ) : (
                  `Send ₹${selectedAmount}`
                )}
              </Button>
            </div>
          </>
        )}

        {paymentStatus === "processing" && (
          <div className="py-8 text-center">
            <Loader2 size={40} className="mx-auto mb-4 animate-spin text-blue-400" />
            <h4 className="text-lg font-semibold text-white mb-2">Processing Payment</h4>
            <p className="text-gray-300">Please wait while we process your payment...</p>
            <p className="text-xs text-gray-400 mt-4">Do not close this window</p>
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Superchat Sent!</h4>
            <p className="text-gray-300">Your message will be highlighted for {selectedTier.duration}.</p>
            <p className="text-xs text-gray-400 mt-2">Thank you for your support!</p>
          </div>
        )}

        {paymentStatus === "failed" && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center">
              <X size={32} className="text-white" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Payment Failed</h4>
            <p className="text-gray-300 mb-4">{error || "There was an issue processing your payment."}</p>
            <Button onClick={() => setPaymentStatus("pending")}>Try Again</Button>
          </div>
        )}
      </div>
    </div>
  )
}
