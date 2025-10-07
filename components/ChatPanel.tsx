'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Pin, Send, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { SendSuperchatModal } from '@/components/superchat/send-superchat-modal';

// --- Interfaces ---
interface ChatMessage {
  id: string;
  sender_name: string;
  text: string;
  created_at: string;
  is_pinned: boolean;
  attachment_url?: string;
  attachment_name?: string;
}

interface SuperchatMessage {
  id: string;
  sender_name: string;
  message: string;
  amount: number;
  timestamp: string;
  is_pinned: boolean;
}

type CombinedMessage = (ChatMessage & { type: 'chat' }) | (SuperchatMessage & { type: 'superchat' });

interface ChatPanelProps {
  callId: string;
  userId: string;
  isAdmin: boolean;
  onClose: () => void;
}

// --- Main ChatPanel Component ---
const ChatPanel = ({ callId, userId, isAdmin, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<CombinedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showSuperchatModal, setShowSuperchatModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const initialLoad = useRef(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: chatData, error: chatError } = await supabase
        .from('chat_messages').select('*').eq('call_id', callId);
      const { data: superchatData, error: superchatError } = await supabase
        .from('superchats').select('*').eq('call_id', callId);

      if (chatError || superchatError) {
        console.error('Error fetching messages:', chatError || superchatError);
        return;
      }

      const combined: CombinedMessage[] = [
        ...(chatData || []).map(m => ({ ...m, type: 'chat' as const })),
        ...(superchatData || []).map(m => ({ ...m, type: 'superchat' as const, text: m.message })),
      ].sort((a, b) => new Date(a.created_at || a.timestamp).getTime() - new Date(b.created_at || b.timestamp).getTime());

      const dummySuperchat: SuperchatMessage = {
          id: 'dummy-superchat-1',
          sender_name: 'Admin',
          message: 'Welcome to the stream! Feel free to ask any questions.',
          amount: 25,
          timestamp: new Date().toISOString(),
          is_pinned: true,
      };

      if (!combined.some(m => m.id === 'dummy-superchat-1')) {
        combined.push({ ...dummySuperchat, type: 'superchat'});
      }

      setMessages(combined);

      if (initialLoad.current) {
        const audio = new Audio('/superchat-alert.mp3');
        audio.play().catch(e => console.error("Dummy superchat audio failed to play:", e));
        initialLoad.current = false;
      }
    };

    fetchMessages();

    const subscription = supabase
      .channel(`chat-room-${callId}`)
      .on('postgres_changes', { event: '*', schema: 'public' }, fetchMessages)
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [callId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachment) return;
    setIsSending(true);
    try {
      const { error } = await supabase.from('chat_messages').insert([{
        call_id: callId, sender_name: userId, text: newMessage.trim(), is_pinned: false,
      }]);
      if (error) throw error;
      setNewMessage('');
      setAttachment(null);
    } catch (error: any) {
      console.error("--- CHAT SEND ERROR ---", error);
    } finally {
      setIsSending(false);
    }
  };

  const handlePinMessage = async (message: CombinedMessage) => {
    if (!isAdmin) return;
    const table = message.type === 'chat' ? 'chat_messages' : 'superchats';
    await supabase.from(table).update({ is_pinned: !message.is_pinned }).eq('id', message.id);
  };
  
  const pinnedMessages = messages.filter(m => m.is_pinned);
  const regularMessages = messages.filter(m => !m.is_pinned);

  return (
    <>
      <div className="fixed top-0 right-0 w-[350px] h-full z-50 bg-white/80 backdrop-blur-lg shadow-lg rounded-l-2xl flex flex-col p-4 border-l border-gray-200/50">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-800">Live Chat</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900"><X /></button>
        </div>

        {pinnedMessages.length > 0 && (
          <motion.div layout className="mb-4 pb-4 border-b border-gray-200 flex-shrink-0">
            <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center"><Pin className='mr-2' size={16}/> Pinned</h4>
            <div className="space-y-2">
              {pinnedMessages.map(msg => 
                  msg.type === 'chat' ? 
                  <MessageItem key={msg.id} message={msg} isAdmin={isAdmin} onPin={() => handlePinMessage(msg)} /> : 
                  <SuperchatItem key={msg.id} message={msg} onPin={() => handlePinMessage(msg)} isAdmin={isAdmin} />
              )}
            </div>
          </motion.div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <AnimatePresence initial={false}>
            {regularMessages.map(msg => 
                msg.type === 'chat' ? 
                <MessageItem key={msg.id} message={msg} isAdmin={isAdmin} onPin={() => handlePinMessage(msg)} /> : 
                <SuperchatItem key={msg.id} message={msg} onPin={() => handlePinMessage(msg)} isAdmin={isAdmin} />
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        <div className="mt-4 flex-shrink-0">
          <div className="relative">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isSending && handleSendMessage()}
              className="pr-20 bg-white/70"
              disabled={isSending}
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
              <button onClick={() => setShowSuperchatModal(true)} className='p-2 text-yellow-500 hover:text-yellow-400'>
                <Star size={18} />
              </button>
              <Button onClick={handleSendMessage} size='sm' className='mr-1' disabled={isSending}>
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {showSuperchatModal && (
        <SendSuperchatModal
          callId={callId}
          senderName={userId}
          userId={userId}
          onClose={() => setShowSuperchatModal(false)}
          onSuccess={() => {
            setShowSuperchatModal(false);
          }}
        />
      )}
    </>
  );
};

// --- Child Components ---

const MessageItem = ({ message, isAdmin, onPin }: { message: ChatMessage, isAdmin: boolean, onPin: () => void }) => {
    const formatTime = (date: string) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={cn('group p-3 rounded-lg relative', message.is_pinned ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-100/80')}>
            <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-gray-800">{message.sender_name}</span>
                <span className="text-gray-500">{formatTime(message.created_at)}</span>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{message.text}</p>
            {isAdmin && (
                <button onClick={onPin} className='absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200'>
                    <Pin size={14} className={cn(message.is_pinned ? 'fill-current text-blue-500' : 'text-gray-500')} />
                </button>
            )}
        </motion.div>
    );
}

const SuperchatItem = ({ message, isAdmin, onPin }: { message: SuperchatMessage, isAdmin: boolean, onPin: () => void }) => {
    const getColorByAmount = (amount: number) => amount >= 500 ? 'bg-gradient-to-br from-red-500 to-yellow-500' : amount >= 100 ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-gradient-to-br from-gray-300 to-gray-400';
    return (
        <motion.div layout initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className={cn('relative rounded-xl overflow-hidden shadow-lg mb-3 border-2 text-white', message.is_pinned ? 'border-yellow-400' : 'border-transparent', getColorByAmount(message.amount))}>
            <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{message.sender_name}</span>
                    <span className="font-bold text-lg">₹{message.amount}</span>
                </div>
                <p className="text-sm font-medium">{message.message}</p>
            </div>
            {isAdmin && (
                <button onClick={onPin} className='absolute top-1 right-1 opacity-80 hover:opacity-100 transition-opacity p-1 rounded-full bg-black/20'>
                    <Pin size={14} className={cn(message.is_pinned ? 'fill-current text-yellow-300' : 'text-white/80')} />
                </button>
            )}
        </motion.div>
    );
};

export default ChatPanel;
