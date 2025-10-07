'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, Send, Star, X, Paperclip } from 'lucide-react';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/superchat-alert.mp3');
  }, []);

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
      
      setMessages(combined);
    };

    fetchMessages();

    const handleNewChatMessage = (payload: any) => {
      setMessages(current => [...current, { ...payload.new, type: 'chat' }]);
    };

    const handleNewSuperchat = (payload: any) => {
      audioRef.current?.play().catch(e => console.error("Superchat audio failed:", e));
      setMessages(current => [...current, { ...payload.new, type: 'superchat', text: payload.new.message }]);
    };

    const handlePinUpdate = (payload: any) => {
      setMessages(current => 
        current.map(m => m.id === payload.new.id ? { ...m, is_pinned: payload.new.is_pinned } : m)
      );
    };

    const chatMessagesSubscription = supabase.channel(`chat-messages:${callId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `call_id=eq.${callId}` }, handleNewChatMessage)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `call_id=eq.${callId}` }, handlePinUpdate)
      .subscribe();

    const superchatsSubscription = supabase.channel(`superchats:${callId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'superchats', filter: `call_id=eq.${callId}` }, handleNewSuperchat)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'superchats', filter: `call_id=eq.${callId}` }, handlePinUpdate)
      .subscribe();

    return () => {
      supabase.removeChannel(chatMessagesSubscription);
      supabase.removeChannel(superchatsSubscription);
    };
  }, [callId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachment) return;
    setIsSending(true);

    let attachmentUrl: string | undefined = undefined;
    let attachmentName: string | undefined = undefined;

    try {
        if (attachment) {
            const fileExt = attachment.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${callId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('chat_attachments')
                .upload(filePath, attachment);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('chat_attachments')
                .getPublicUrl(filePath);
            
            attachmentUrl = data.publicUrl;
            attachmentName = attachment.name;
        }

        const { error: insertError } = await supabase.from('chat_messages').insert([{
            call_id: callId,
            sender_name: userId,
            text: newMessage.trim(),
            is_pinned: false,
            attachment_url: attachmentUrl,
            attachment_name: attachmentName,
        }]);

        if (insertError) throw insertError;

        setNewMessage('');
        setAttachment(null);
    } catch (error) {
        console.error("Chat send error:", error);
    } finally {
        setIsSending(false);
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setAttachment(e.target.files[0]);
    }
  }

  const handlePinMessage = async (message: CombinedMessage) => {
    if (!isAdmin) return;
    const table = message.type === 'chat' ? 'chat_messages' : 'superchats';
    await supabase.from(table).update({ is_pinned: !message.is_pinned }).eq('id', message.id);
  };
  
  const pinnedMessages = messages.filter(m => m.is_pinned);
  const regularMessages = messages.filter(m => !m.is_pinned);

  return (
    <>
      <div className="fixed top-0 right-0 h-full w-full sm:w-[350px] md:w-[380px] z-50 bg-[#141414]/80 backdrop-blur-xl shadow-2xl rounded-l-2xl flex flex-col border-l border-gray-700/50">
        <div className="flex items-center justify-between p-4 flex-shrink-0 border-b border-gray-700/50">
          <h3 className="text-lg font-bold text-white">Live Chat</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {pinnedMessages.length > 0 && (
          <motion.div layout className="p-4 border-b border-gray-700/50 flex-shrink-0">
            <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3 flex items-center">
              <Pin className='mr-2 text-yellow-400' size={14}/> Pinned
            </h4>
            <div className="space-y-3">
              {pinnedMessages.map(msg => 
                  msg.type === 'chat' ? 
                  <MessageItem key={msg.id} message={msg} isAdmin={isAdmin} onPin={() => handlePinMessage(msg)} /> : 
                  <SuperchatItem key={msg.id} message={msg} onPin={() => handlePinMessage(msg)} isAdmin={isAdmin} />
              )}
            </div>
          </motion.div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {regularMessages.map(msg => 
                msg.type === 'chat' ? 
                <MessageItem key={msg.id} message={msg} isAdmin={isAdmin} onPin={() => handlePinMessage(msg)} /> : 
                <SuperchatItem key={msg.id} message={msg} onPin={() => handlePinMessage(msg)} isAdmin={isAdmin} />
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 flex-shrink-0 border-t border-gray-700/50">
          {attachment && (
            <div className="mb-2 flex items-center justify-between bg-gray-700/50 p-2 rounded-lg text-sm">
                <span className="text-gray-300 truncate"><Paperclip size={14} className="inline mr-2"/>{attachment.name}</span>
                <button onClick={() => setAttachment(null)} className="text-gray-400 hover:text-white">
                    <X size={16} />
                </button>
            </div>
          )}
          <div className="relative">
            <Input
              placeholder="Send a message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isSending && handleSendMessage()}
              className="bg-gray-800 border-gray-600 text-white rounded-full pr-28 pl-10 h-11 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSending}
            />
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
                <button onClick={() => fileInputRef.current?.click()} className='p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10'>
                    <Paperclip size={18} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleAttachmentChange} className="hidden" />
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              <button onClick={() => setShowSuperchatModal(true)} className='p-2 text-yellow-400 hover:text-yellow-300 transition-colors rounded-full hover:bg-yellow-500/10'>
                <Star size={18} />
              </button>
              <Button onClick={handleSendMessage} size='icon' className='w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700' disabled={isSending}>
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
        />
      )}
    </>
  );
};

// --- Child Components ---

const MessageItem = ({ message, isAdmin, onPin }: { message: ChatMessage, isAdmin: boolean, onPin: () => void }) => {
    const formatTime = (date: string) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
          className={cn('group p-3 rounded-lg relative transition-colors', message.is_pinned ? 'bg-blue-900/40 border-l-2 border-blue-500' : 'bg-gray-800/60')}>
            <div className="flex items-start justify-between text-xs mb-1">
                <span className="font-bold text-white break-all">{message.sender_name}</span>
                <span className="text-gray-400 flex-shrink-0 ml-2">{formatTime(message.created_at)}</span>
            </div>
            {message.text && <p className="text-gray-200 text-sm whitespace-pre-wrap break-words">{message.text}</p>}
            {message.attachment_url && (
                <div className="mt-2">
                    <a
                        href={message.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors max-w-full"
                    >
                        <Paperclip size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-blue-400 truncate">{message.attachment_name || 'View Attachment'}</span>
                    </a>
                </div>
            )}
            {isAdmin && (
                <button onClick={onPin} className='absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 bg-gray-700/50 hover:bg-gray-600/80 transition-opacity'>
                    <Pin size={12} className={cn(message.is_pinned ? 'fill-current text-blue-400' : 'text-gray-400')} />
                </button>
            )}
        </motion.div>
    );
}

const SuperchatItem = ({ message, isAdmin, onPin }: { message: SuperchatMessage, isAdmin: boolean, onPin: () => void }) => {
    const getGradient = (amount: number) => {
        if (amount >= 500) return 'from-red-500 to-yellow-500';
        if (amount >= 100) return 'from-blue-500 to-purple-500';
        return 'from-green-500 to-teal-500';
    };

    return (
        <motion.div layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className={cn('relative rounded-xl overflow-hidden shadow-lg p-1 bg-gradient-to-br', getGradient(message.amount))}>
            <div className={cn('rounded-lg p-3', message.is_pinned ? 'bg-gray-900' : 'bg-gray-800/80 backdrop-blur-sm')}>
                <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">{message.sender_name}</span>
                    <span className="font-bold text-lg text-white">₹{message.amount}</span>
                </div>
                <p className="text-sm font-medium text-gray-100">{message.message}</p>
            </div>
            {isAdmin && (
                <button onClick={onPin} className='absolute top-2 right-2 opacity-80 hover:opacity-100 transition-opacity p-1.5 rounded-full bg-black/30'>
                    <Pin size={14} className={cn(message.is_pinned ? 'fill-current text-yellow-300' : 'text-white/80')} />
                </button>
            )}
        </motion.div>
    );
};

export default ChatPanel;
