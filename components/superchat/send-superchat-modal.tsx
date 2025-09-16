"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  X,
  AlertCircle,
  Check,
  Star,
  Zap,
  Sparkles,
  Gem,
  Crown,
  Send,
  Trophy,
  Award,
} from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

interface SendSuperchatModalProps {
  callId: string
  senderName: string
  userId: string
  onClose: () => void
  onSuccess: () => void
}

// Price Tiers
const AMOUNT_TIERS = [
  {
    value: 25,
    label: "₹25",
    duration: "30s",
    icon: Star,
    color: "blue",
    description: "Nitya Seva",
  },
  {
    value: 50,
    label: "₹50",
    duration: "1m 10s",
    icon: Zap,
    color: "purple",
    description: "Bhakti Boost",
  },
  {
    value: 100,
    label: "₹100",
    duration: "2m 30s",
    icon: Sparkles,
    color: "pink",
    description: "Gopi Glimmer",
  },
  {
    value: 250,
    label: "₹250",
    duration: "6m",
    icon: Gem,
    color: "orange",
    description: "Vaikuntha Vibes",
  },
  {
    value: 500,
    label: "₹500",
    duration: "12m",
    icon: Crown,
    color: "red",
    description: "Raja Bhakta Blessing",
  },
  {
    value: 1000,
    label: "₹1000",
    duration: "25m",
    icon: Trophy,
    color: "emerald",
    description: "Parama Bhakta Offering",
  },
  {
    value: 5000,
    label: "₹5000",
    duration: "1h 10m",
    icon: Award,
    color: "gold",
    description: "Goloka Mahadhaan",
  },
]

declare global {
  interface Window {
    Cashfree: any
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
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "processing" | "success" | "failed"
  >("pending")
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

  const selectedTier =
    AMOUNT_TIERS.find((tier) => tier.value === selectedAmount) || AMOUNT_TIERS[0]

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
      const newOrderId = `SC-${callId.slice(0, 8)}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`
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
        setError(
          "Payment response was incomplete. Please contact support if payment was deducted."
        )
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
    const colors: Record<
      string,
      {
        bg: string
        text: string
        border: string
        icon: string
        glow: string
      }
    > = {
      emerald: {
        bg: isSelected
          ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
          : "bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200",
        text: isSelected ? "text-white" : "text-emerald-700",
        border: isSelected
          ? "border-emerald-500 shadow-lg shadow-emerald-200"
          : "border-emerald-200 hover:border-emerald-300",
        icon: isSelected ? "text-white" : "text-emerald-600",
        glow: isSelected ? "shadow-lg shadow-emerald-200" : "",
      },
      blue: {
        bg: isSelected
          ? "bg-gradient-to-br from-blue-500 to-blue-600"
          : "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200",
        text: isSelected ? "text-white" : "text-blue-700",
        border: isSelected
          ? "border-blue-500 shadow-lg shadow-blue-200"
          : "border-blue-200 hover:border-blue-300",
        icon: isSelected ? "text-white" : "text-blue-600",
        glow: isSelected ? "shadow-lg shadow-blue-200" : "",
      },
      purple: {
        bg: isSelected
          ? "bg-gradient-to-br from-purple-500 to-purple-600"
          : "bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200",
        text: isSelected ? "text-white" : "text-purple-700",
        border: isSelected
          ? "border-purple-500 shadow-lg shadow-purple-200"
          : "border-purple-200 hover:border-purple-300",
        icon: isSelected ? "text-white" : "text-purple-600",
        glow: isSelected ? "shadow-lg shadow-purple-200" : "",
      },
      pink: {
        bg: isSelected
          ? "bg-gradient-to-br from-pink-500 to-pink-600"
          : "bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200",
        text: isSelected ? "text-white" : "text-pink-700",
        border: isSelected
          ? "border-pink-500 shadow-lg shadow-pink-200"
          : "border-pink-200 hover:border-pink-300",
        icon: isSelected ? "text-white" : "text-pink-600",
        glow: isSelected ? "shadow-lg shadow-pink-200" : "",
      },
      orange: {
        bg: isSelected
          ? "bg-gradient-to-br from-orange-500 to-orange-600"
          : "bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200",
        text: isSelected ? "text-white" : "text-orange-700",
        border: isSelected
          ? "border-orange-500 shadow-lg shadow-orange-200"
          : "border-orange-200 hover:border-orange-300",
        icon: isSelected ? "text-white" : "text-orange-600",
        glow: isSelected ? "shadow-lg shadow-orange-200" : "",
      },
      red: {
        bg: isSelected
          ? "bg-gradient-to-br from-red-500 to-red-600"
          : "bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200",
        text: isSelected ? "text-white" : "text-red-700",
        border: isSelected
          ? "border-red-500 shadow-lg shadow-red-200"
          : "border-red-200 hover:border-red-300",
        icon: isSelected ? "text-white" : "text-red-600",
        glow: isSelected ? "shadow-lg shadow-red-200" : "",
      },
      gold: {
        bg: isSelected
          ? "bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500"
          : "bg-gradient-to-br from-yellow-50 to-amber-100 hover:from-yellow-100 hover:to-amber-200",
        text: isSelected ? "text-white" : "text-amber-700",
        border: isSelected
          ? "border-amber-500 shadow-lg shadow-amber-200"
          : "border-amber-200 hover:border-amber-300",
        icon: isSelected ? "text-white" : "text-amber-600",
        glow: isSelected ? "shadow-lg shadow-amber-200" : "",
      },
    }
    return colors[color] || colors.blue
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? "bg-black/50 backdrop-blur-sm" : "bg-black/0"
      }`}
    >
      <div
        className={`mx-auto w-full max-w-md transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        <div className="max-h-[90vh] overflow-hidden overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-2xl">
          {/* Header */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:px-6 sm:py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                                  <Send size={20} className="text-white" />
                                                </div>
                {/* <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <Loader2 size={20} className="text-white" />
                </div> */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">
                    Send Superchat
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 sm:text-sm md:text-base">
                    Support with a highlighted message
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-6 px-4 py-6 sm:px-6">
            {!scriptLoaded && (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-blue-100">
                  <Loader2 size={24} className="animate-spin text-blue-600" />
                </div>
                <p className="font-medium text-gray-600">Loading payment gateway...</p>
                <p className="mt-1 text-sm text-gray-400">Please wait a moment</p>
              </div>
            )}

            {scriptLoaded && paymentStatus === "pending" && (
              <>
                {/* Message Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Your Message
                  </label>
                  <div className="relative">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                      rows={3}
                      maxLength={200}
                      disabled={loading}
                      placeholder="Write a message to highlight..."
                      className="w-full resize-none rounded-xl border border-gray-200 p-3 text-gray-900 transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute bottom-2 right-3 bg-white px-1 text-xs text-gray-400">
                      {message.length}/200
                    </div>
                  </div>
                </div>

                {/* Amount Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Choose Amount
                  </label>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {AMOUNT_TIERS.map((tier, idx) => {
                      const IconComponent = tier.icon
                      const isSelected = selectedAmount === tier.value
                      const isLast = idx === AMOUNT_TIERS.length - 1
                      const colorClasses = getColorClasses(tier.color, isSelected)

                      return (
                        <button
                          key={tier.value}
                          onClick={() => handleAmountSelect(tier.value)}
                          disabled={loading}
                          className={`
                            relative rounded-xl border-2 p-3 transition-all duration-200 sm:p-4
                            ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border} ${colorClasses.glow}
                            hover:scale-105 active:scale-95
                            ${isLast ? "col-span-2 md:col-span-3" : ""}
                          `}
                        >
                          <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                            <div
                              className={`rounded-full p-2 ${
                                isSelected ? "bg-white/20" : "bg-white/50"
                              } backdrop-blur-sm`}
                            >
                              <IconComponent size={20} className={colorClasses.icon} />
                            </div>
                            <div className="text-center text-sm font-bold sm:text-base">
                              {tier.label}
                            </div>
                            <div className="text-center text-xs font-medium opacity-75 sm:text-sm">
                              {tier.duration}
                            </div>
                            <div className="text-center text-xs font-medium opacity-60">
                              {tier.description}
                            </div>
                          </div>

                          {isSelected && (
                            <div className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow-lg">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex flex-row items-center justify-between rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 text-sm shadow-inner">
                    <div className="flex items-center space-x-2">
                      <Award size={16} className="text-gray-600" />
                      <span className="font-medium text-gray-600">Highlight Duration:</span>
                    </div>
                    <span className="rounded-lg bg-white px-2 py-1 font-bold text-gray-900 shadow-sm">
                      {selectedTier.duration}
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start space-x-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
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
                    className={`flex-1 ${getColorClasses(
                      selectedTier.color,
                      true
                    ).bg} font-semibold text-white shadow-lg hover:opacity-90`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check size={16} className="mr-2" />
                        Send {selectedTier.label}
                      </>
                    )}
                  </Button>
                </div>

                {/* Terms */}
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500">
                    By proceeding, you agree to our{" "}
                    <Link
                      href="/terms-and-conditions"
                      className="text-blue-500 underline hover:text-blue-600"
                    >
                      Terms & Conditions
                    </Link>
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <Link
                      href="/refunds-and-cancellations"
                      className="text-blue-500 underline hover:text-blue-600"
                    >
                      Refunds & Cancellations
                    </Link>
                    <Link
                      href="/contact-us"
                      className="text-blue-500 underline hover:text-blue-600"
                    >
                      Contact Us
                    </Link>
                    <Link
                      href="/services"
                      className="text-blue-500 underline hover:text-blue-600"
                    >
                      Services
                    </Link>
                  </div>
                </div>
              </>
            )}

            {paymentStatus === "processing" && (
              <div className="space-y-4 py-8 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-blue-100">
                  <Loader2 size={32} className="animate-spin text-blue-600" />
                </div>
                <div>
                  <h4 className="mb-2 text-lg font-bold text-gray-900">
                    Processing Payment
                  </h4>
                  <p className="text-gray-600">Please complete the payment process</p>
                </div>

                <div
                  id="cashfree-dropin-container"
                  className="mt-6 flex min-h-[300px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <p className="text-gray-500">Loading payment options...</p>
                </div>

                <p className="text-xs text-gray-500">🔒 Secure payment • Don't close this window</p>
              </div>
            )}

            {paymentStatus === "success" && (
              <div className="space-y-4 py-8 text-center">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                  <Check size={36} className="text-white" />
                </div>
                <div>
                  <h4 className="mb-2 text-xl font-bold text-gray-900">
                    Superchat Sent! 🎉
                  </h4>
                  <p className="mb-1 text-gray-600">
                    Your message will be highlighted for {selectedTier.duration}
                  </p>
                  <p className="text-sm text-gray-500">Thank you for your support!</p>
                </div>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="space-y-4 py-8 text-center">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg">
                  <X size={36} className="text-white" />
                </div>
                <div>
                  <h4 className="mb-2 text-lg font-bold text-gray-900">Payment Failed</h4>
                  <p className="mb-4 text-gray-600">
                    {error || "There was an error processing your payment."}
                  </p>
                  <Button
                    onClick={() => setPaymentStatus("pending")}
                    className="bg-blue-500 text-white hover:bg-blue-600"
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