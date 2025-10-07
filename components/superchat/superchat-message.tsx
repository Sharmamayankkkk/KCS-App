'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SuperchatMessage {
  id: string;
  sender: string;
  text: string;
  amount: number;
  timestamp: string;
  currency: string;
  duration: number; // in seconds
  isPinned: boolean;
}

interface SuperchatMessageProps {
  message: SuperchatMessage;
  onPin?: (id: string) => void;
  isAdmin?: boolean;
}

const getTierStyle = (amount: number): { color: string; shadow: string } => {
    if (amount >= 5000) return { color: '#f59e0b', shadow: 'shadow-yellow-500/30' };
    if (amount >= 1000) return { color: '#10b981', shadow: 'shadow-emerald-500/30' };
    if (amount >= 500) return { color: '#ef4444', shadow: 'shadow-red-500/30' };
    if (amount >= 250) return { color: '#f97316', shadow: 'shadow-orange-500/30' };
    if (amount >= 100) return { color: '#ec4899', shadow: 'shadow-pink-500/30' };
    if (amount >= 50) return { color: '#8b5cf6', shadow: 'shadow-purple-500/30' };
    return { color: '#3b82f6', shadow: 'shadow-blue-500/30' };
};

export const SuperchatMessage = ({ message, onPin, isAdmin = false }: SuperchatMessageProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(message.duration);
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    if (!message.isPinned && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft <= 0 && !message.isPinned) {
      setVisible(false);
    }
  }, [message.isPinned, timeLeft]);

  if (!visible && !message.isPinned) return null;

  const { color, shadow } = getTierStyle(message.amount);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={cn(
        'relative rounded-xl overflow-hidden mb-3 shadow-lg text-white p-4',
        shadow,
        message.isPinned && 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-[#19232d]'
      )}
      style={{ backgroundColor: color }}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm drop-shadow-sm">{message.sender}</span>
          <span className="font-bold text-lg drop-shadow-sm">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: message.currency, minimumFractionDigits: 0 }).format(message.amount)}
          </span>
        </div>
        <p className="text-white text-base font-medium leading-tight">{message.text}</p>
      </div>

      {!message.isPinned && timeLeft > 0 &&
        <div className="absolute bottom-1 right-2 text-xs font-bold opacity-75">{Math.floor(timeLeft/60)}m {timeLeft%60}s</div>
      }
      
      {isAdmin && (
        <button
          onClick={() => onPin?.(message.id)}
          className={cn('absolute top-1 right-1 text-white/70 p-1 rounded-full hover:bg-black/20 hover:text-white', message.isPinned && 'text-yellow-400')}>
          <Pin size={16} />
        </button>
      )}
    </motion.div>
  );
};
