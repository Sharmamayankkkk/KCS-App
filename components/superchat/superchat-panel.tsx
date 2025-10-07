'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crown, Pin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SuperchatMessage, type SuperchatMessage as SuperchatMessageType } from './superchat-message';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

interface SuperchatPanelProps {
  callId: string;
  isAdmin?: boolean;
  onClose: () => void;
}

export const SuperchatPanel = ({ callId, isAdmin = false, onClose }: SuperchatPanelProps) => {
  const [superchats, setSuperchats] = useState<SuperchatMessageType[]>([]);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/superchat-alert.mp3');
  }, []);

  const calculateDuration = (amount: number): number => {
    if (amount >= 5000) return 60 * 70; // 1h 10m
    if (amount >= 1000) return 60 * 25; // 25m
    if (amount >= 500) return 60 * 12; // 12m
    if (amount >= 250) return 60 * 6;  // 6m
    if (amount >= 100) return 150;     // 2m 30s
    if (amount >= 50) return 70;       // 1m 10s
    return 30; // 30s
  }

  useEffect(() => {
    const fetchSuperchats = async () => {
      const { data, error } = await supabase
        .from('superchats')
        .select('*')
        .eq('call_id', callId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error("Error fetching superchats:", error);
      } else {
        const processedSuperchats = data.map(item => ({
          id: item.id,
          sender: item.sender_name,
          text: item.message,
          amount: item.amount,
          currency: item.currency || 'INR',
          timestamp: item.timestamp,
          duration: calculateDuration(item.amount),
          isPinned: item.is_pinned || false,
        }));
        setSuperchats(processedSuperchats);
      }
    };

    fetchSuperchats();

    const subscription = supabase
      .channel(`superchats:${callId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'superchats', filter: `call_id=eq.${callId}` }, (payload) => {
        audioRef.current?.play().catch(e => console.error("Superchat audio failed:", e));
        const newItem = payload.new;
        const newSuperchat: SuperchatMessageType = {
          id: newItem.id,
          sender: newItem.sender_name,
          text: newItem.message,
          amount: newItem.amount,
          currency: newItem.currency || 'INR',
          timestamp: newItem.timestamp,
          duration: calculateDuration(newItem.amount),
          isPinned: newItem.is_pinned || false,
        };
        setSuperchats(current => [newSuperchat, ...current]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'superchats', filter: `call_id=eq.${callId}` }, (payload) => {
        setSuperchats(current =>
          current.map(sc => sc.id === payload.new.id ? { ...sc, isPinned: payload.new.is_pinned } : sc)
        );
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [callId]);

  const handlePinSuperchat = async (id: string) => {
    if (!isAdmin) return;
    const superchat = superchats.find(sc => sc.id === id);
    if (!superchat) return;

    await supabase.from('superchats').update({ is_pinned: !superchat.isPinned }).eq('id', id);
  };

  const filteredSuperchats = showPinnedOnly ? superchats.filter(msg => msg.isPinned) : superchats;

  return (
    <div className="flex flex-col h-full bg-[#1c1c1e]/90 backdrop-blur-lg rounded-2xl border border-[#333333] shadow-2xl p-3">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Crown className="text-yellow-400" size={22} />
          <h3 className="text-lg font-bold text-white">Superchats</h3>
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
              className={cn(
                'px-3 h-8 text-xs rounded-full transition-all',
                showPinnedOnly 
                  ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' 
                  : 'bg-white/5 text-white/80 border-transparent'
              )}
            >
              <Pin size={12} className={cn('mr-1.5', showPinnedOnly && 'fill-yellow-400')} />
              Pinned
            </Button>
          )}
          <button className="text-gray-400 hover:text-white transition rounded-full p-1.5 hover:bg-white/10" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <AnimatePresence>
          {filteredSuperchats.map(message => (
            <SuperchatMessage key={message.id} message={message} onPin={handlePinSuperchat} isAdmin={isAdmin} />
          ))}
        </AnimatePresence>

        {filteredSuperchats.length === 0 && (
          <div className="text-center text-gray-500 py-16 text-sm">
            <p>{showPinnedOnly ? "No pinned superchats yet." : "No superchats have been sent yet."}</p>
          </div>
        )}
      </div>
    </div>
  );
};
