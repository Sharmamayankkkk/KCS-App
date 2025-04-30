"use client"

import { useState, useEffect } from "react"
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

// Declare Cashfree types
declare global {
  interface Window {
    Cashfree?: {
      init: (options: { orderToken: string }) => Promise<{
        renderDropin: (config: any) => void
      }>
    }
  }
}

export const SendSuperchatModal = ({
  callId,
  senderName,
  userId,
  onClose,
  onSuccess,
}: SendSuperchatModalProps) => {
  const [message, setMessage] = useState("")
  const [selectedAmount, setSelectedAmount] = useState(AMOUNT_TIERS[0].value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentStatus, setPaymentStatus] =
    useState<"pending" | "processing" | "success" | "failed">("pending")
  const [orderId, setOrderId] = useState("")
  const [orderToken, setOrderToken] = useState<string>("")

  // Load Cashfree SDK
  useEffect(() => {
    if (typeof window === "undefined" || window.Cashfree) return
    const script = document.createElement("script")
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js"
    script.async = true
    document.body.appendChild(script)
  }, [])

  // Polling for backend payment status if drop-in was bypassed
  useEffect(() => {
    let iv: NodeJS.Timeout
    if (paymentStatus === "processing" && orderId) {
      iv = setInterval(async () => {
        try {
          const res = await fetch(`/api/check-payment-status?orderId=${orderId}`)
          const data = await res.json()
          if (data.status === "PAID" || data.status === "SUCCESS") {
            clearInterval(iv)
            await createSuperchatEntry(orderId)
          } else if (data.status === "FAILED" || data.status === "CANCELLED") {
            clearInterval(iv)
            setPaymentStatus("failed")
            setError("Payment did not complete")
            setLoading(false)
          }
        } catch {
          // ignore transient errors
        }
      }, 3000)
    }
    return () => {
      if (iv) clearInterval(iv)
    }
  }, [orderId, paymentStatus])

  const selectedTier =
    AMOUNT_TIERS.find((tier) => tier.value === selectedAmount) ||
    AMOUNT_TIERS[0]

  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt)
  }

  const initiateCashfreePayment = async () => {
    setLoading(true)
    setError("")

    try {
      // 1️⃣ generate a unique order ID
      const newOrderId = `SC-${callId.slice(0, 8)}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`
      setOrderId(newOrderId)

      // 2️⃣ create order on backend
      const res = await fetch("/api/create-cashfree-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedAmount,
          userId,
          callId,
          orderId: newOrderId,
          currency: "INR",
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Could not create order")
      }
      const { order_token } = await res.json()
      setOrderToken(order_token)
      setPaymentStatus("processing")

      // 3️⃣ init & render drop-in
      if (!window.Cashfree) {
        throw new Error("Cashfree SDK failed to load")
      }
      const cf = await window.Cashfree.init({ orderToken: order_token })
      cf.renderDropin({
        components: ["order-details", "card", "upi", "netbanking"],
        style: {},
        onSuccess: async (payload: any) => {
          await createSuperchatEntry(newOrderId)
        },
        onFailure: (err: any) => {
          setPaymentStatus("failed")
          setError("Payment failed: " + err.reason || "Unknown")
          setLoading(false)
        },
        onClose: () => {
          if (paymentStatus !== "success") {
            setPaymentStatus("failed")
            setError("Payment was cancelled")
            setLoading(false)
          }
        },
      })
    } catch (err: any) {
      setError(err.message || "Payment initialization error")
      setPaymentStatus("failed")
      setLoading(false)
    }
  }

  const createSuperchatEntry = async (orderRef: string) => {
    try {
      const { error: dbErr } = await supabase.from("superchats").insert([
        {
          call_id: callId,
          sender_id: userId,
          sender_name: senderName,
          message,
          amount: selectedAmount,
          currency: "INR",
          timestamp: new Date().toISOString(),
          is_pinned: false,
          order_reference: orderRef,
        },
      ])
      if (dbErr) throw dbErr

      setPaymentStatus("success")
      setTimeout(onSuccess, 1500)
    } catch (err) {
      console.error(err)
      setError("Failed to save superchat, please try again.")
      setPaymentStatus("failed")
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (!message.trim()) {
      setError("Please enter a message")
      return
    }
    initiateCashfreePayment()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md p-6 bg-[#243341] rounded-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          disabled={loading}
        >
          <X size={20} />
        </button>

        <h3 className="mb-6 text-xl font-bold text-white">Send a Superchat</h3>

        {paymentStatus === "pending" && (
          <>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-white">
                Your Message (max 200 chars)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                rows={3}
                maxLength={200}
                disabled={loading}
                placeholder="Type your message..."
                className="w-full p-3 text-white rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-right text-xs text-gray-400">
                {message.length}/200
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-white">
                Select Amount
              </label>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {AMOUNT_TIERS.map((tier) => (
                  <button
                    key={tier.value}
                    onClick={() => handleAmountSelect(tier.value)}
                    disabled={loading}
                    className={`p-2 rounded-lg text-center transition ${
                      selectedAmount === tier.value
                        ? `${tier.color} text-white ring-2 ring-white`
                        : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    }`}
                  >
                    <div className="font-semibold">{tier.label}</div>
                    <div className="text-xs">{tier.duration}</div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-sm">
                <span className="text-gray-300">Duration:</span>
                <span className="font-semibold text-white">
                  {selectedTier.duration} highlight
                </span>
              </div>
            </div>

            {error && (
              <div className="flex items-center p-3 mb-4 text-red-200 bg-red-500/20 rounded-lg">
                <AlertCircle size={16} className="mr-2" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                className={selectedTier.color}
                onClick={handleSubmit}
                disabled={loading || !message.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Processing...
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
            <h4 className="mb-2 text-lg font-semibold text-white">
              Processing Payment
            </h4>
            <p className="text-gray-300">Complete payment in the popup</p>
            <p className="mt-4 text-xs text-gray-400">Don't close this window</p>
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="py-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h4 className="mb-2 text-lg font-semibold text-white">
              Superchat Sent!
            </h4>
            <p className="text-gray-300">
              Highlight lasts for {selectedTier.duration}.
            </p>
            <p className="mt-2 text-xs text-gray-400">Thank you!</p>
          </div>
        )}

        {paymentStatus === "failed" && (
          <div className="py-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full">
              <X size={32} className="text-white" />
            </div>
            <h4 className="mb-2 text-lg font-semibold text-white">
              Payment Failed
            </h4>
            <p className="mb-4 text-gray-300">
              {error || "There was an error processing your payment."}
            </p>
            <Button onClick={() => setPaymentStatus("pending")}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
