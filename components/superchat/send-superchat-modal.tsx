'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, X, AlertCircle, Check, Star, Zap, Sparkles, Gem, Crown, Send, Trophy, Award, type LucideIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

const AMOUNT_TIERS = [
    { value: 25, label: '₹25', duration: '30s', icon: Star, color: '#3b82f6', description: 'Nitya Seva' },
    { value: 50, label: '₹50', duration: '1m 10s', icon: Zap, color: '#8b5cf6', description: 'Bhakti Boost' },
    { value: 100, label: '₹100', duration: '2m 30s', icon: Sparkles, color: '#ec4899', description: 'Gopi Glimmer' },
    { value: 250, label: '₹250', duration: '6m', icon: Gem, color: '#f97316', description: 'Vaikuntha Vibes' },
    { value: 500, label: '₹500', duration: '12m', icon: Crown, color: '#ef4444', description: 'Raja Bhakta Blessing' },
    { value: 1000, label: '₹1000', duration: '25m', icon: Trophy, color: '#10b981', description: 'Parama Bhakta Offering' },
    { value: 5000, label: '₹5000', duration: '1h 10m', icon: Award, color: '#f59e0b', description: 'Goloka Mahadhaan' },
];

declare global {
    interface Window { Cashfree: any; }
}

interface SendSuperchatModalProps {
  callId: string;
  senderName: string;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const SendSuperchatModal = ({ callId, senderName, userId, onClose, onSuccess }: SendSuperchatModalProps) => {
    const [message, setMessage] = useState('');
    const [selectedAmount, setSelectedAmount] = useState(AMOUNT_TIERS[0].value);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [orderId, setOrderId] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => { setIsVisible(true); }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && !window.Cashfree) {
            const script = document.createElement('script');
            script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
            script.async = true;
            script.onload = () => console.log('Cashfree SDK loaded');
            script.onerror = () => setError('Failed to load payment gateway');
            document.body.appendChild(script);
            return () => { document.body.removeChild(script); };
        }
    }, []);

    const selectedTier = AMOUNT_TIERS.find(tier => tier.value === selectedAmount) || AMOUNT_TIERS[0];

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const initiateCashfreePayment = async () => {
        setLoading(true);
        setError('');
        try {
            const newOrderId = `SC-${callId.slice(0, 8)}-${Date.now()}`;
            setOrderId(newOrderId);

            const res = await fetch('/api/create-cashfree-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: selectedAmount, userId, callId, orderId: newOrderId, currency: 'INR' }),
            });

            if (!res.ok) throw new Error((await res.json()).message || 'Could not create order');

            const data = await res.json();
            if (!data.payment_session_id) throw new Error('No payment session ID received');

            setPaymentStatus('processing');
            const cashfree = new window.Cashfree(data.payment_session_id);
            cashfree.checkout({ paymentSessionId: data.payment_session_id, redirectTarget: '_modal' });

        } catch (err: any) {
            setError(err.message);
            setPaymentStatus('failed');
            setLoading(false);
        }
    };

    const createSuperchatEntry = async (orderRef: string) => {
        try {
            const { error: dbErr } = await supabase.from('superchats').insert([{
                call_id: callId,
                sender_id: userId,
                sender_name: senderName,
                message,
                amount: selectedAmount,
                currency: 'INR',
                timestamp: new Date().toISOString(),
                is_pinned: false,
                order_reference: orderRef,
            }]);
            if (dbErr) throw dbErr;

            setPaymentStatus('success');
            setTimeout(() => { onSuccess(); handleClose(); }, 1500);

        } catch (err: any) {
            setError('Failed to save superchat.');
            setPaymentStatus('failed');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (paymentStatus !== 'processing' || !orderId) return;
        const iv = setInterval(async () => {
            try {
                const res = await fetch(`/api/check-payment-status?orderId=${orderId}`);
                const data = await res.json();
                if (data.status === 'PAID' || data.status === 'SUCCESS') {
                    clearInterval(iv);
                    await createSuperchatEntry(orderId);
                }
            } catch { /* ignore */ }
        }, 3000);
        return () => clearInterval(iv);
    }, [orderId, paymentStatus]);

    const handleSubmit = () => {
        if (!message.trim()) {
            setError('Please enter a message');
            return;
        }
        initiateCashfreePayment();
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-black/80 backdrop-blur-sm' : 'bg-black/0'}`}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`w-full max-w-lg mx-auto transition-all duration-300 ease-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <div className="bg-[#1c1c1e] rounded-2xl shadow-2xl border border-[#333333] max-h-[90vh] overflow-y-auto flex flex-col">
                    <div className="px-6 py-4 border-b border-[#333333] flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                <Star size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Send a Superchat</h3>
                                <p className="text-sm text-gray-400">Support with a highlighted message</p>
                            </div>
                        </div>
                        <button onClick={handleClose} className="p-2 text-gray-400 hover:text-white hover:bg-[#333333] rounded-full" disabled={loading}><X size={20} /></button>
                    </div>

                    <div className="px-6 py-6 flex-grow space-y-6">
                        {paymentStatus === 'pending' && (
                            <>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-300">Your Message</label>
                                    <div className="relative">
                                        <textarea value={message} onChange={e => setMessage(e.target.value.slice(0, 200))} rows={3} maxLength={200} disabled={loading}
                                            placeholder="Say something special..." className="w-full p-3 text-white bg-[#2c2c2e] rounded-xl border border-[#444444] focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 placeholder-gray-500 resize-none" />
                                        <div className="absolute bottom-2 right-3 text-xs text-gray-400">{message.length}/200</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-300">Choose Amount</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {AMOUNT_TIERS.map(tier => (
                                            <button key={tier.value} onClick={() => setSelectedAmount(tier.value)} disabled={loading}
                                                className={`relative p-3 rounded-xl transition-all border-2 ${selectedAmount === tier.value ? 'border-yellow-500 shadow-lg' : 'border-[#444444] bg-[#2c2c2e] hover:bg-[#3c3c3e]'}`}>
                                                <div className="flex flex-col items-center space-y-1">
                                                    <div style={{ color: tier.color }}><tier.icon size={22} /></div>
                                                    <div className="font-bold text-sm text-white">{tier.label}</div>
                                                </div>
                                                {selectedAmount === tier.value && <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-[#1c1c1e]"><Check size={14} className="text-white" /></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {error && <div className="flex items-start space-x-3 p-3 bg-red-900/50 border border-red-700 rounded-xl"><AlertCircle size={18} className="text-red-500 mt-0.5" /><span className="text-red-400 text-sm">{error}</span></div>}

                                <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4 border-t border-[#333333]">
                                    <Button onClick={handleSubmit} disabled={loading || !message.trim()} style={{ background: selectedTier.color, color: 'white' }} className="flex-1 font-semibold shadow-lg hover:opacity-90">
                                        {loading ? <><Loader2 size={16} className="mr-2 animate-spin" />Processing...</> : `Send for ${selectedTier.label}`}
                                    </Button>
                                    <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1 border-[#444444] text-gray-300 hover:bg-[#2c2c2e] hover:text-white">Cancel</Button>
                                </div>
                            </>
                        )}

                        {paymentStatus === 'processing' && <StatusScreen icon={Loader2} title="Processing Payment" message="Please complete the transaction in the window that opened." spinner />}
                        {paymentStatus === 'success' && <StatusScreen icon={Check} title="Superchat Sent!" message={`Your message is now highlighted. Thank you for your support!`} color="#10b981" />}
                        {paymentStatus === 'failed' && <StatusScreen icon={X} title="Payment Failed" message={error || 'An unknown error occurred.'} color="#ef4444" onRetry={() => setPaymentStatus('pending')} />}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

interface StatusScreenProps {
    icon: LucideIcon;
    title: string;
    message: string;
    color?: string;
    spinner?: boolean;
    onRetry?: () => void;
}

const StatusScreen = ({ icon: Icon, title, message, color, spinner, onRetry }: StatusScreenProps) => (
    <div className="py-12 text-center space-y-4 flex flex-col items-center justify-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center`} style={{ background: color || '#3b82f6' }}>
            <Icon size={32} className={`text-white ${spinner ? 'animate-spin' : ''}`} />
        </div>
        <div>
            <h4 className="text-xl font-bold text-white mb-1">{title}</h4>
            <p className="text-gray-400">{message}</p>
        </div>
        {onRetry && <Button onClick={onRetry} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white">Try Again</Button>}
    </div>
);
