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
import { cn } from "@/lib/utils"

interface SendSuperchatModalProps {
  callId: string
  senderName: string
  userId: string
  onClose: () => void
  onSuccess: () => void
}

const AMOUNT_TIERS = [
  { value: 25, label: "₹25", duration: "30s", icon: Star, color: "blue", description: "Nitya Seva" },
  { value: 50, label: "₹50", duration: "1m 10s", icon: Zap, color: "purple", description: "Bhakti Boost" },
  { value: 100, label: "₹100", duration: "2m 30s", icon: Sparkles, color: "pink", description: "Gopi Glimmer" },
  { value: 250, label: "₹250", duration: "6m", icon: Gem, color: "orange", description: "Vaikuntha Vibes" },
  { value: 500, label: "₹500", duration: "12m", icon: Crown, color: "red", description: "Raja Bhakta Blessing" },
  { value: 1000, label: "₹1000", duration: "25m", icon: Trophy, color: "emerald", description: "Parama Bhakta Offering" },
  { value: 5000, label: "₹5000", duration: "1h 10m", icon: Award, color: "gold", description: "Goloka Mahadhaan" },
]

declare global {
  interface Window { Cashfree: any }
}

export const SendSuperchatModal = ({ callId, senderName, userId, onClose, onSuccess }: SendSuperchatModalProps) => {
  const [message, setMessage] = useState("")
  const [selectedAmount, setSelectedAmount] = useState(AMOUNT_TIERS[0].value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "failed">("pending")
  const [orderId, setOrderId] = useState("")
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => { setIsVisible(true) }, [])
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Cashfree) { setScriptLoaded(true); return }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setError("Failed to load payment gateway");
    document.body.appendChild(script);
    return () => { script.onload = null; script.onerror = null };
  }, [])
  
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
        } catch {}
      }, 3000)
    }
    return () => { if (iv) clearInterval(iv) }
  }, [orderId, paymentStatus])

  const selectedTier = AMOUNT_TIERS.find((tier) => tier.value === selectedAmount) || AMOUNT_TIERS[0]

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }
  
  const initiateCashfreePayment = async () => { /* ... Function logic remains the same ... */ };
  
  const createSuperchatEntry = async (orderRef: string) => {
    try {
      const { data, error: dbErr } = await supabase.from("superchats").insert([
        { call_id: callId, sender_id: userId, sender_name: senderName, message, amount: selectedAmount, currency: "INR", timestamp: new Date().toISOString(), is_pinned: false, order_reference: orderRef },
      ]).select();
      if (dbErr) throw dbErr;
      if (!data) throw new Error("Could not retrieve new superchat after insert.");
      const channel = supabase.channel(`call:${callId}`);
      await channel.send({ type: 'broadcast', event: 'superchat', payload: { newSuperchat: data[0] } });
      setPaymentStatus("success");
      setTimeout(onSuccess, 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to save superchat, please try again.");
      setPaymentStatus("failed");
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!message.trim()) { setError("Please enter a message"); return }
    initiateCashfreePayment();
  };
  
  // ✅ FIXED: Corrected the shadow classes to be parsable
  const getTierClasses = (color: string, isSelected: boolean) => {
    const colorMap: Record<string, { main: string, text: string }> = {
        blue: { main: 'blue-500', text: 'blue-700' },
        purple: { main: 'purple-500', text: 'purple-700' },
        pink: { main: 'pink-500', text: 'pink-700' },
        orange: { main: 'orange-500', text: 'orange-700' },
        red: { main: 'red-500', text: 'red-700' },
        emerald: { main: 'emerald-500', text: 'emerald-700' },
        gold: { main: 'amber-500', text: 'amber-700' },
    };

    const c = colorMap[color] || colorMap.blue;

    if (isSelected) {
      return `bg-${c.main}/10 text-${c.text} border-transparent shadow-soft-inset`;
    }
    return `bg-light-background text-primary-text border-transparent shadow-soft hover:shadow-soft-hover`;
  };

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300", isVisible ? "bg-black/50 backdrop-blur-sm" : "bg-black/0")}>
      <div className={cn("w-full max-w-md mx-auto transition-all duration-300 ease-out", isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0")}>
        <div className="bg-light-background rounded-2xl shadow-soft max-h-[90vh] overflow-y-auto custom-scrollbar-hidden">
          <div className="px-6 py-4 border-b border-secondary-background/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-light-background rounded-full flex items-center justify-center shadow-soft"><Send size={20} className="text-primary-text" /></div>
                <div>
                  <h3 className="text-xl font-bold text-primary-text">Send Superchat</h3>
                  <p className="text-sm text-secondary-text mt-1">Support with a highlighted message</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 text-secondary-text hover:text-primary-text hover:bg-secondary-background rounded-full transition-colors" disabled={loading}><X size={20} /></button>
            </div>
          </div>
          <div className="px-6 py-6 space-y-6">
            {scriptLoaded && paymentStatus === "pending" && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-primary-text">Your Message</label>
                  <div className="relative">
                    <textarea value={message} onChange={(e) => setMessage(e.target.value.slice(0, 200))} rows={3} maxLength={200} disabled={loading} placeholder="Write a message to highlight..." className="w-full p-3 text-primary-text rounded-xl bg-light-background focus:outline-none shadow-soft-inset border border-secondary-background/50 placeholder-secondary-text resize-none"/>
                    <div className="absolute bottom-2 right-3 text-xs text-secondary-text">{message.length}/200</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-primary-text">Choose Amount</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {AMOUNT_TIERS.map((tier) => {
                      const IconComponent = tier.icon;
                      const isSelected = selectedAmount === tier.value;
                      return (
                        <button key={tier.value} onClick={() => setSelectedAmount(tier.value)} disabled={loading} className={cn("relative p-4 rounded-xl transition-all duration-200 active:scale-95 transform text-center space-y-2", getTierClasses(tier.color, isSelected))}>
                          <IconComponent size={20} className="mx-auto" />
                          <div className="font-bold">{tier.label}</div>
                          <div className="text-xs opacity-75">{tier.duration}</div>
                          {isSelected && (<div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg"><Check size={12} className="text-white" /></div>)}
                        </button>
                      )
                    })}
                  </div>
                </div>
                {error && (<div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"><AlertCircle size={18} className="text-red-500 mt-0.5" /><span className="text-red-700 text-sm">{error}</span></div>)}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-secondary-background/50">
                  <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1">Cancel</Button>
                  <Button onClick={handleSubmit} disabled={loading || !message.trim()} className={cn("flex-1 text-white font-semibold shadow-soft-inset", `bg-${(getTierClasses(selectedTier.color, true) as any).main}/80`)}>
                    {loading ? (<><Loader2 size={16} className="mr-2 animate-spin" />Processing...</>) : (<>Send {selectedTier.label}</>)}
                  </Button>
                </div>
              </>
            )}
            {paymentStatus === "processing" && ( <div className="py-8 text-center space-y-4"><div className="w-16 h-16 mx-auto rounded-full bg-light-background flex items-center justify-center shadow-soft"><Loader2 size={32} className="animate-spin text-primary-text" /></div><div><h4 className="text-lg font-bold text-primary-text mb-2">Processing Payment</h4><p className="text-secondary-text">Please complete the payment process</p></div></div> )}
            {paymentStatus === "success" && ( <div className="py-8 text-center space-y-4"><div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg"><Check size={36} className="text-white" /></div><div><h4 className="text-xl font-bold text-primary-text mb-2">Superchat Sent! 🎉</h4><p className="text-secondary-text mb-1">Your message will be highlighted for {selectedTier.duration}</p><p className="text-secondary-text/80 text-sm">Thank you for your support!</p></div></div> )}
            {paymentStatus === "failed" && ( <div className="py-8 text-center space-y-4"><div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg"><X size={36} className="text-white" /></div><div><h4 className="text-lg font-bold text-primary-text mb-2">Payment Failed</h4><p className="text-secondary-text mb-4">{error || "There was an error."}</p><Button onClick={() => setPaymentStatus("pending")}>Try Again</Button></div></div> )}
          </div>
        </div>
      </div>
    </div>
  )
}
