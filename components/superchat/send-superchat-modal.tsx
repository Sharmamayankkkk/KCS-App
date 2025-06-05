"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, X, AlertCircle, Check, Heart, Star, Zap, Send, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

interface SendSuperchatModalProps {
  callId: string
  senderName: string
  userId: string
  onClose: () => void
  onSuccess: () => void
}

// Clean, modern amount tiers
const AMOUNT_TIERS = [
  { value: 20, label: "₹20", duration: "30s", icon: Star, color: "blue" },
  { value: 100, label: "₹100", duration: "1m", icon: Zap, color: "purple" },
  { value: 200, label: "₹200", duration: "2m", icon: Sparkles, color: "pink" },
  { value: 500, label: "₹500", duration: "3m", icon: Star, color: "orange" },
  { value: 1000, label: "₹1000", duration: "5m", icon: Heart, color: "red" },
  { value: 5000, label: "₹5000", duration: "30m", icon: Heart, color: "emerald" }
]

declare global {
  interface Window {
    Cashfree: any
  }
}

export const SendSuperchatModal = ({ callId, senderName, userId, onClose, onSuccess }: SendSuperchatModalProps) => {
  const [message, setMessage] = useState("")
  const [selectedAmount, setSelectedAmount] = useState(AMOUNT_TIERS[0].value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "failed">("pending")
  const [orderId, setOrderId] = useState("")
  const [orderToken, setOrderToken] = useState<string>("")
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Load Cashfree SDK
  useEffect(() => {
    if (typeof window === "undefined") return

    if (window.Cashfree) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js"
    script.async = true
    script.onload = () => {
      console.log("Cashfree SDK loaded successfully")
      setScriptLoaded(true)
    }
    script.onerror = () => {
      console.error("Failed to load Cashfree SDK")
      setError("Failed to load payment gateway")
    }
    document.body.appendChild(script)

    return () => {
      script.onload = null
      script.onerror = null
    }
  }, [])

  // Polling for backend payment status
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

  const selectedTier = AMOUNT_TIERS.find((tier) => tier.value === selectedAmount) || AMOUNT_TIERS[0]

  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt)
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const initiateCashfreePayment = async () => {
    setLoading(true)
    setError("")

    try {
      const newOrderId = `SC-${callId.slice(0, 8)}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setOrderId(newOrderId)

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
        const errData = await res.json()
        throw new Error(errData.message || "Could not create order")
      }

      const data = await res.json()
      console.log("Cashfree API response:", data)

      const sessionId = data.payment_session_id
      if (!sessionId) {
        throw new Error("No payment session ID received from server")
      }

      setOrderToken(sessionId)
      setPaymentStatus("processing")

      const { load } = await import("@cashfreepayments/cashfree-js")
      const cashfree = await load({
        mode: "production",
      })

      const checkoutOptions = {
        paymentSessionId: sessionId,
        redirectTarget: "_modal",
        theme: {
          backgroundColor: "#ffffff",
          color: "#1f2937",
          font: "14px",
          errorColor: "#ef4444",
        },
      }

      const result = await cashfree.checkout(checkoutOptions)

      console.log("Payment result:", result)

      if (result.error) {
        console.error("Payment error:", result.error)
        setPaymentStatus("failed")
        setError("Payment failed: " + (result.error.message || "Unknown error"))
        setLoading(false)
      } else if (result.paymentDetails && result.paymentDetails.transaction) {
        console.log("Payment completed:", result.paymentDetails)

        const transactionStatus = result.paymentDetails.transaction.status
        if (transactionStatus === "SUCCESS") {
          await createSuperchatEntry(newOrderId)
        } else {
          setPaymentStatus("failed")
          setError(`Payment status: ${transactionStatus || "Unknown"}`)
          setLoading(false)
        }
      } else {
        console.warn("Payment result structure unexpected:", result)
        setPaymentStatus("failed")
        setError("Payment response was incomplete. Please contact support if payment was deducted.")
        setLoading(false)
      }
    } catch (err) {
      console.error("Payment error:", err)
      setError(err instanceof Error ? err.message : "Payment initialization error")
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

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      emerald: {
        bg: isSelected ? "bg-emerald-500" : "bg-emerald-50 hover:bg-emerald-100",
        text: isSelected ? "text-white" : "text-emerald-700",
        border: isSelected ? "border-emerald-500" : "border-emerald-200 hover:border-emerald-300",
        icon: isSelected ? "text-white" : "text-emerald-600"
      },
      blue: {
        bg: isSelected ? "bg-blue-500" : "bg-blue-50 hover:bg-blue-100",
        text: isSelected ? "text-white" : "text-blue-700",
        border: isSelected ? "border-blue-500" : "border-blue-200 hover:border-blue-300",
        icon: isSelected ? "text-white" : "text-blue-600"
      },
      purple: {
        bg: isSelected ? "bg-purple-500" : "bg-purple-50 hover:bg-purple-100",
        text: isSelected ? "text-white" : "text-purple-700",
        border: isSelected ? "border-purple-500" : "border-purple-200 hover:border-purple-300",
        icon: isSelected ? "text-white" : "text-purple-600"
      },
      pink: {
        bg: isSelected ? "bg-pink-500" : "bg-pink-50 hover:bg-pink-100",
        text: isSelected ? "text-white" : "text-pink-700",
        border: isSelected ? "border-pink-500" : "border-pink-200 hover:border-pink-300",
        icon: isSelected ? "text-white" : "text-pink-600"
      },
      orange: {
        bg: isSelected ? "bg-orange-500" : "bg-orange-50 hover:bg-orange-100",
        text: isSelected ? "text-white" : "text-orange-700",
        border: isSelected ? "border-orange-500" : "border-orange-200 hover:border-orange-300",
        icon: isSelected ? "text-white" : "text-orange-600"
      },
      red: {
        bg: isSelected ? "bg-red-500" : "bg-red-50 hover:bg-red-100",
        text: isSelected ? "text-white" : "text-red-700",
        border: isSelected ? "border-red-500" : "border-red-200 hover:border-red-300",
        icon: isSelected ? "text-white" : "text-red-600"
      }
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'}`}>
    <div className={`w-full max-w-md mx-auto transition-all duration-300 ease-out ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-4 py-4 sm:py-2 sm:px-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Send size={20} className="text-white" />
              </div>
                <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  Send Superchat
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1">
                  Support with a highlighted message
                </p>
                </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>
        </div>
  
        <div className="px-4 py-6 sm:px-6 space-y-6">
          {!scriptLoaded && (
            <div className="py-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-blue-600" />
              </div>
              <p className="text-gray-600 font-medium">Loading payment gateway...</p>
              <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
            </div>
          )}
  
          {scriptLoaded && paymentStatus === "pending" && (
            <>
              {/* Message Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Your Message</label>
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                    rows={3}
                    maxLength={200}
                    disabled={loading}
                    placeholder="Write a message to highlight..."
                    className="w-full p-3 text-gray-900 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 resize-none"
                  />
                  <div className="absolute bottom-2 right-3 text-xs text-gray-400 bg-white px-1">
                    {message.length}/200
                  </div>
                </div>
              </div>
  
              {/* Amount Selection */}
              <div className="space-y-4">
    <label className="block text-sm font-semibold text-gray-700">Choose Amount</label>
  
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
      {AMOUNT_TIERS.map((tier) => {
        const IconComponent = tier.icon
        const isSelected = selectedAmount === tier.value
        const colorClasses = getColorClasses(tier.color, isSelected)
  
        return (
          <button
            key={tier.value}
            onClick={() => handleAmountSelect(tier.value)}
            disabled={loading}
            className={`relative p-3 sm:p-4 rounded-xl transition-all duration-200 border-2 ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border} hover:scale-105 active:scale-95`}
          >
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <IconComponent size={20} className={colorClasses.icon} />
              <div className="font-bold text-sm sm:text-base text-center">{tier.label}</div>
              <div className="text-xs sm:text-sm opacity-75 text-center">{tier.duration}</div>
            </div>
  
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <Check size={12} className="text-white" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  
      <div className="flex flex-row items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 text-sm">
        <span className="text-gray-600 font-medium">Highlight Duration:</span>
        <span className="text-gray-900 font-bold">{selectedTier.duration}</span>
      </div>
  </div>
  
              {/* Error Message */}
              {error && (
                <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}
  
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !message.trim()}
                  className={`flex-1 ${getColorClasses(selectedTier.color, true).bg} hover:opacity-90 text-white font-semibold`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Send {selectedTier.label}
                    </>
                  )}
                </Button>
              </div>
  
              {/* Terms */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <p className="text-xs text-gray-500">
                  By proceeding, you agree to our{" "}
                  <Link href="/terms-and-conditions" className="text-blue-500 hover:text-blue-600 underline">
                    Terms & Conditions
                  </Link>
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <Link href="/refunds-and-cancellations" className="text-blue-500 hover:text-blue-600 underline">
                    Refunds & Cancellations
                  </Link>
                  <Link href="/contact-us" className="text-blue-500 hover:text-blue-600 underline">
                    Contact Us
                  </Link>
                  <Link href="/services" className="text-blue-500 hover:text-blue-600 underline">
                    Services
                  </Link>
                </div>
              </div>
            </>
          )}
  
          {paymentStatus === "processing" && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Processing Payment</h4>
                <p className="text-gray-600">Please complete the payment process</p>
              </div>
  
              <div
                id="cashfree-dropin-container"
                className="mt-6 p-4 rounded-xl border border-gray-200 bg-gray-50 min-h-[300px] flex items-center justify-center"
              >
                <p className="text-gray-500">Loading payment options...</p>
              </div>
  
              <p className="text-xs text-gray-500">🔒 Secure payment • Don't close this window</p>
            </div>
          )}
  
          {paymentStatus === "success" && (
            <div className="py-8 text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                <Check size={36} className="text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Superchat Sent! 🎉</h4>
                <p className="text-gray-600 mb-1">Your message will be highlighted for {selectedTier.duration}</p>
                <p className="text-gray-500 text-sm">Thank you for your support!</p>
              </div>
            </div>
          )}
  
          {paymentStatus === "failed" && (
            <div className="py-8 text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-red-500 rounded-full flex items-center justify-center">
                <X size={36} className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Payment Failed</h4>
                <p className="text-gray-600 mb-4">{error || "There was an error processing your payment."}</p>
                <Button
                  onClick={() => setPaymentStatus("pending")}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
