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
    color: "light",
    description: "Nitya Seva",
  },
  {
    value: 50,
    label: "₹50",
    duration: "1m 10s",
    icon: Zap,
    color: "secondary",
    description: "Bhakti Boost",
  },
  {
    value: 100,
    label: "₹100",
    duration: "2m 30s",
    icon: Sparkles,
    color: "medium",
    description: "Gopi Glimmer",
  },
  {
    value: 250,
    label: "₹250",
    duration: "6m",
    icon: Gem,
    color: "accent",
    description: "Vaikuntha Vibes",
  },
  {
    value: 500,
    label: "₹500",
    duration: "12m",
    icon: Crown,
    color: "accent-dark",
    description: "Raja Bhakta Blessing",
  },
  {
    value: 1000,
    label: "₹1000",
    duration: "25m",
    icon: Trophy,
    color: "premium",
    description: "Parama Bhakta Offering",
  },
  {
    value: 5000,
    label: "₹5000",
    duration: "1h 10m",
    icon: Award,
    color: "ultimate",
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
      light: {
        bg: isSelected
          ? "bg-gradient-to-br from-[#E0DBD8] to-[#D0C9C5]"
          : "bg-gradient-to-br from-[#FAF5F1] to-[#E0DBD8] hover:from-[#E0DBD8] hover:to-[#D0C9C5]",
        text: isSelected ? "text-[#292F36]" : "text-[#292F36]",
        border: isSelected
          ? "border-[#8F7A6E] shadow-lg shadow-[#E0DBD8]"
          : "border-[#E0DBD8] hover:border-[#8F7A6E]",
        icon: isSelected ? "text-[#A41F13]" : "text-[#8F7A6E]",
        glow: isSelected ? "shadow-lg shadow-[#E0DBD8]" : "",
      },
      secondary: {
        bg: isSelected
          ? "bg-gradient-to-br from-[#8F7A6E] to-[#7A6A5F]"
          : "bg-gradient-to-br from-[#E0DBD8] to-[#D0C9C5] hover:from-[#D0C9C5] hover:to-[#C0B9B5]",
        text: isSelected ? "text-white" : "text-[#292F36]",
        border: isSelected
          ? "border-[#8F7A6E] shadow-lg shadow-[#8F7A6E]/30"
          : "border-[#8F7A6E] hover:border-[#7A6A5F]",
        icon: isSelected ? "text-white" : "text-[#8F7A6E]",
        glow: isSelected ? "shadow-lg shadow-[#8F7A6E]/30" : "",
      },
      medium: {
        bg: isSelected
          ? "bg-gradient-to-br from-[#A41F13] to-[#8F1A10]"
          : "bg-gradient-to-br from-[#FAF5F1] to-[#E0DBD8] hover:from-[#E0DBD8] hover:to-[#D0C9C5]",
        text: isSelected ? "text-white" : "text-[#292F36]",
        border: isSelected
          ? "border-[#A41F13] shadow-lg shadow-[#A41F13]/30"
          : "border-[#A41F13]/30 hover:border-[#A41F13]",
        icon: isSelected ? "text-white" : "text-[#A41F13]",
        glow: isSelected ? "shadow-lg shadow-[#A41F13]/30" : "",
      },
      accent: {
        bg: isSelected
          ? "bg-gradient-to-br from-[#A41F13] to-[#8F1A10]"
          : "bg-gradient-to-br from-[#E0DBD8] to-[#D0C9C5] hover:from-[#D0C9C5] hover:to-[#C0B9B5]",
        text: isSelected ? "text-white" : "text-[#292F36]",
        border: isSelected
          ? "border-[#A41F13] shadow-lg shadow-[#A41F13]/40"
          : "border-[#A41F13]/30 hover:border-[#A41F13]",
        icon: isSelected ? "text-white" : "text-[#A41F13]",
        glow: isSelected ? "shadow-lg shadow-[#A41F13]/40" : "",
      },
      "accent-dark": {
        bg: isSelected
          ? "bg-gradient-to-br from-[#8F1A10] to-[#7A1610]"
          : "bg-gradient-to-br from-[#E0DBD8] to-[#D0C9C5] hover:from-[#D0C9C5] hover:to-[#C0B9B5]",
        text: isSelected ? "text-white" : "text-[#292F36]",
        border: isSelected
          ? "border-[#8F1A10] shadow-lg shadow-[#A41F13]/50"
          : "border-[#A41F13]/30 hover:border-[#A41F13]",
        icon: isSelected ? "text-white" : "text-[#A41F13]",
        glow: isSelected ? "shadow-lg shadow-[#A41F13]/50" : "",
      },
      premium: {
        bg: isSelected
          ? "bg-gradient-to-br from-[#7A1610] to-[#6A1210]"
          : "bg-gradient-to-br from-[#D0C9C5] to-[#C0B9B5] hover:from-[#C0B9B5] hover:to-[#B0A9A5]",
        text: isSelected ? "text-white" : "text-[#292F36]",
        border: isSelected
          ? "border-[#7A1610] shadow-lg shadow-[#A41F13]/60"
          : "border-[#A41F13]/30 hover:border-[#A41F13]",
        icon: isSelected ? "text-white" : "text-[#A41F13]",
        glow: isSelected ? "shadow-lg shadow-[#A41F13]/60" : "",
      },
      ultimate: {
        bg: isSelected
          ? "bg-gradient-to-br from-[#6A1210] to-[#5A0F0D]"
          : "bg-gradient-to-br from-[#C0B9B5] to-[#B0A9A5] hover:from-[#B0A9A5] hover:to-[#A09995]",
        text: isSelected ? "text-white" : "text-[#292F36]",
        border: isSelected
          ? "border-[#6A1210] shadow-lg shadow-[#A41F13]/70"
          : "border-[#A41F13]/30 hover:border-[#A41F13]",
        icon: isSelected ? "text-white" : "text-[#A41F13]",
        glow: isSelected ? "shadow-lg shadow-[#A41F13]/70" : "",
      },
    }
    return colors[color] || colors.light
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? "bg-pure-black/50 backdrop-blur-sm" : "bg-pure-black/0"
      }`}
    >
      <div
        className={`mx-auto w-full max-w-md transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        <div className="max-h-[90vh] overflow-hidden overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl">
          {/* Header */}
          <div className="border-b border-border bg-gradient-to-r from-background to-surface p-4 sm:px-6 sm:py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="to-accent/80 flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-accent">
                  <Send size={20} className="text-pure-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary sm:text-xl md:text-2xl">
                    Send Superchat
                  </h3>
                  <p className="mt-1 text-xs text-text-secondary sm:text-sm md:text-base">
                    Support with a highlighted message
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-2 text-text-secondary transition-colors hover:bg-background"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-6 px-4 py-6 sm:px-6">
            {!scriptLoaded && (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-background">
                  <Loader2 size={24} className="animate-spin text-accent" />
                </div>
                <p className="font-medium text-text-secondary">Loading payment gateway...</p>
                <p className="text-text-secondary/60 mt-1 text-sm">Please wait a moment</p>
              </div>
            )}

            {scriptLoaded && paymentStatus === "pending" && (
              <>
                {/* Message Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-text-primary">
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
                      className="placeholder:text-text-secondary/60 w-full resize-none rounded-xl border border-border bg-background p-3 text-text-primary transition-colors focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                    <div className="absolute bottom-2 right-3 rounded bg-surface px-1 text-xs text-text-secondary">
                      {message.length}/200
                    </div>
                  </div>
                </div>

                {/* Amount Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-text-primary">
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
                            <div className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border-2 border-surface bg-green-500 shadow-lg">
                              <Check size={12} className="text-pure-white" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex flex-row items-center justify-between rounded-xl border border-border bg-gradient-to-r from-background to-surface p-4 text-sm shadow-inner">
                    <div className="flex items-center space-x-2">
                      <Award size={16} className="text-text-secondary" />
                      <span className="font-medium text-text-secondary">Highlight Duration:</span>
                    </div>
                    <span className="rounded-lg bg-surface px-2 py-1 font-bold text-text-primary shadow-sm">
                      {selectedTier.duration}
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start space-x-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                    <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 border-border text-text-primary hover:bg-background"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !message.trim()}
                    className={`flex-1 ${getColorClasses(
                      selectedTier.color,
                      true
                    ).bg} text-pure-white font-semibold shadow-lg hover:opacity-90`}
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
                <div className="space-y-2 border-t border-border pt-4">
                  <p className="text-xs text-text-secondary">
                    By proceeding, you agree to our{" "}
                    <Link
                      href="/terms-and-conditions"
                      className="hover:text-accent/80 text-accent underline"
                    >
                      Terms & Conditions
                    </Link>
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <Link
                      href="/refunds-and-cancellations"
                      className="hover:text-accent/80 text-accent underline"
                    >
                      Refunds & Cancellations
                    </Link>
                    <Link
                      href="/contact-us"
                      className="hover:text-accent/80 text-accent underline"
                    >
                      Contact Us
                    </Link>
                    <Link
                      href="/services"
                      className="hover:text-accent/80 text-accent underline"
                    >
                      Services
                    </Link>
                  </div>
                </div>
              </>
            )}

            {paymentStatus === "processing" && (
              <div className="space-y-4 py-8 text-center">
                <div className="bg-accent/10 mx-auto flex size-16 items-center justify-center rounded-full">
                  <Loader2 size={32} className="animate-spin text-accent" />
                </div>
                <div>
                  <h4 className="mb-2 text-lg font-bold text-text-primary">
                    Processing Payment
                  </h4>
                  <p className="text-text-secondary">Please complete the payment process</p>
                </div>

                <div
                  id="cashfree-dropin-container"
                  className="mt-6 flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-background p-4"
                >
                  <p className="text-text-secondary">Loading payment options...</p>
                </div>

                <p className="text-xs text-text-secondary">🔒 Secure payment • Don't close this window</p>
              </div>
            )}

            {paymentStatus === "success" && (
              <div className="space-y-4 py-8 text-center">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                  <Check size={36} className="text-pure-white" />
                </div>
                <div>
                  <h4 className="mb-2 text-xl font-bold text-text-primary">
                    Superchat Sent! 🎉
                  </h4>
                  <p className="mb-1 text-text-secondary">
                    Your message will be highlighted for {selectedTier.duration}
                  </p>
                  <p className="text-text-secondary/80 text-sm">Thank you for your support!</p>
                </div>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="space-y-4 py-8 text-center">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg">
                  <X size={36} className="text-pure-white" />
                </div>
                <div>
                  <h4 className="mb-2 text-lg font-bold text-text-primary">Payment Failed</h4>
                  <p className="mb-4 text-text-secondary">
                    {error || "There was an error processing your payment."}
                  </p>
                  <Button
                    onClick={() => setPaymentStatus("pending")}
                    className="hover:bg-accent/90 text-pure-white bg-accent"
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
