'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Users, BarChart2, X, Crown, Send, Paperclip, Pin, Loader2 } from 'lucide-react';
import { CallParticipantsList } from '@stream-io/video-react-sdk';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import PollsPanel from './PollsPanel';
import { useSupabase } from '@/providers/SupabaseProvider';
import { SuperchatMessage, SuperchatMessageData as SuperchatMessageType } from '@/components/superchat/superchat-message';
import VerifiedBadge from './VerifiedBadge';

// Define the types for our messages right here
interface ChatMessageData {
  id: string;
  sender: string;
  text: string;
  is_pinned: boolean;
  attachment_url?: string | null;
  attachment_name?: string | null;
  created_at: string;
  type: 'chat';
  sender_email?: string;
}
type FeedItem = ChatMessageData | (SuperchatMessageType & { type: 'superchat', created_at: string, is_pinned: boolean });

// A small, internal component to display a regular chat message
const ChatMessageDisplay = ({ message, isAdmin, onPin }: { message: ChatMessageData, isAdmin: boolean, onPin: (id: string) => void }) => (
  <div className="bg-secondary-background/30 hover:bg-secondary-background/60 group relative rounded-lg p-3 transition-all duration-300">
    {message.is_pinned && <div className="absolute right-2 top-1 flex items-center text-xs text-secondary-text"><Pin size={12} className="mr-1" /> Pinned</div>}
    {isAdmin && <button onClick={() => onPin(message.id)} className="bg-light-background/50 absolute bottom-1 right-2 rounded-full p-1 text-secondary-text opacity-0 transition-opacity group-hover:opacity-100" title={message.is_pinned ? 'Unpin Message' : 'Pin Message'}><Pin size={14} /></button>}
    <div className="flex flex-col">
      <span className="flex items-center gap-1.5 break-words pr-8 font-semibold text-primary-text">
        {message.sender}
        <VerifiedBadge userEmail={message.sender_email} size={14} />
      </span>
      <span className="mt-1 break-words text-primary-text">{message.text}</span>
      {message.attachment_url && <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className="bg-secondary-background/50 mt-2 inline-flex items-center gap-2 rounded-md p-2 text-sm text-primary-accent hover:bg-secondary-background"><Paperclip size={16} /><span className="max-w-[200px] truncate">{message.attachment_name || 'View Attachment'}</span></a>}
    </div>
  </div>
);

interface FlexibleSidePanelProps {
  callId: string;
  userId: string;
  isAdmin: boolean;
  senderName: string;
  onClose: () => void;
  setShowSendSuperchat: React.Dispatch<React.SetStateAction<boolean>>;
}

type PanelTab = 'chat' | 'participants' | 'polls';

export const FlexibleSidePanel = ({ callId, userId, isAdmin, senderName, onClose, setShowSendSuperchat }: FlexibleSidePanelProps) => {
  const [activeTab, setActiveTab] = useState<PanelTab>('chat');
  const supabase = useSupabase();
  const [messageText, setMessageText] = useState('');
  const [combinedFeed, setCombinedFeed] = useState<FeedItem[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const calculateDuration = (amount: number): number => {
    if (amount >= 1000) return 300;
    if (amount >= 500) return 180;
    if (amount >= 200) return 120;
    if (amount >= 100) return 60;
    return 30;
  };
  
  useEffect(() => {
    if (!supabase) return;

    const fetchAndListen = async () => {
      const { data: chatData } = await supabase.from('chat_messages').select('*').eq('call_id', callId);
      const { data: superchatData } = await supabase.from('superchats').select('*').eq('call_id', callId);

      const formattedChatMessages: FeedItem[] = (chatData || []).map(msg => ({ ...msg, type: 'chat' }));
      const formattedSuperchats: FeedItem[] = (superchatData || []).map(sc => ({
        ...sc, sender: sc.sender_name, text: sc.message, duration: calculateDuration(sc.amount),
        isPinned: sc.is_pinned || false, created_at: sc.timestamp, type: 'superchat'
      }));
      
      const allMessages = [...formattedChatMessages, ...formattedSuperchats];
      allMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      setCombinedFeed(allMessages);

      const channel = supabase.channel(`call:${callId}`);
      channel
        .on('broadcast', { event: 'chat' }, (payload) => setCombinedFeed((prev) => [...prev, { ...payload.payload.newMessage, type: 'chat' } as FeedItem]))
        .on('broadcast', { event: 'superchat' }, (payload) => {
          const scData = payload.payload.newSuperchat;
          setCombinedFeed((prev) => [...prev, { ...scData, sender: scData.sender_name, text: scData.message, duration: calculateDuration(scData.amount), isPinned: scData.is_pinned || false, created_at: scData.timestamp, type: 'superchat' }]);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };
    
    fetchAndListen();
  }, [callId, supabase]);

  // Handle scroll detection to determine if we should auto-scroll
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      // Consider user at bottom if within 100px of the bottom
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isAtBottom);
    }
  };

  useEffect(() => {
    // Only auto-scroll if user is at or near the bottom
    if (shouldAutoScroll && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [combinedFeed, shouldAutoScroll]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) { setAttachmentFile(file); } 
    else if (file) { alert('File is too large. Maximum size is 5MB.'); }
  };

  const sendMessage = async () => {
    if (!supabase || (!messageText.trim() && !attachmentFile)) return;
    let attachmentUrl: string | null = null; let attachmentName: string | null = null;
    if (attachmentFile) {
      setIsUploading(true);
      const fileName = `${userId}-${Date.now()}.${attachmentFile.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('attachments').upload(fileName, attachmentFile);
      if (uploadError) {
        console.error('Upload Error:', uploadError); alert('Failed to upload attachment.');
        setIsUploading(false); return;
      }
      const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(fileName);
      attachmentUrl = urlData.publicUrl; attachmentName = attachmentFile.name;
      setIsUploading(false);
    }
    const { data, error } = await supabase.from('chat_messages').insert({ call_id: callId, sender: senderName, text: messageText, attachment_url: attachmentUrl, attachment_name: attachmentName }).select();
    if (error) { console.error('Send Error:', error); alert('Could not send message.'); } 
    else {
      setMessageText(''); setAttachmentFile(null);
      if (data && data[0]) {
        setCombinedFeed((prev) => [...prev, { ...data[0], type: 'chat' }]);
        const channel = supabase.channel(`call:${callId}`);
        await channel.send({ type: 'broadcast', event: 'chat', payload: { newMessage: data[0] } });
        // When user sends a message, enable auto-scroll
        setShouldAutoScroll(true);
      }
    }
  };

  const handlePinMessage = async (id: string) => {
    if (!supabase || !isAdmin) return;
    const msg = combinedFeed.find(m => m.type === 'chat' && m.id === id);
    if (!msg) return;
    const newPinnedState = !msg.is_pinned;
    if (newPinnedState) await supabase.from('chat_messages').update({ is_pinned: false }).eq('call_id', callId);
    await supabase.from('chat_messages').update({ is_pinned: newPinnedState }).eq('id', id);
  };
  
  const pinnedMessage = combinedFeed.find(msg => msg.type === 'chat' && msg.is_pinned);
  
  const tabs = [
    { name: 'chat', label: 'Chat', icon: MessageSquare },
    { name: 'participants', label: 'Participants', icon: Users },
    { name: 'polls', label: 'Polls', icon: BarChart2 },
  ];

  return (
    <div className="bg-light-background/90 fixed right-0 top-0 z-[100] flex h-full w-[300px] flex-col overflow-hidden rounded-l-2xl border-l border-secondary-background p-4 shadow-2xl backdrop-blur-md duration-300 animate-in slide-in-from-right-1/2 sm:w-[350px]">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div className="bg-secondary-background/50 flex items-center gap-2 rounded-lg p-1">
          {tabs.map((tab) => (
            <Button key={tab.name} variant="ghost" size="sm" onClick={() => setActiveTab(tab.name as PanelTab)} className={cn('flex items-center gap-1.5 px-2 sm:px-3 py-1 text-xs h-auto', activeTab === tab.name ? 'bg-background shadow-md rounded-md' : 'text-secondary-text')}>
              <tab.icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </Button>
          ))}
        </div>
        <button 
          className="bg-secondary-background/50 shrink-0 touch-manipulation rounded-full border border-secondary-background p-2 transition hover:bg-red-500/20" 
          onClick={onClose}
          title="Close panel"
          aria-label="Close panel"
        >
          <X className="size-5 text-primary-text" />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {activeTab === 'chat' && (
          <div className="flex min-h-0 flex-1 flex-col">
            {pinnedMessage && <div className="bg-secondary-background/50 mb-2 shrink-0 rounded-lg border border-secondary-background p-2"><div className="mb-1 flex items-center text-xs text-secondary-text"><Pin size={12} className="mr-1.5" /> PINNED MESSAGE</div><p className="truncate text-sm text-primary-text"><strong>{pinnedMessage.sender}:</strong> {pinnedMessage.text}</p></div>}
            <div ref={chatContainerRef} onScroll={handleScroll} className="custom-scrollbar-hidden flex-1 space-y-3 overflow-y-auto pr-2">
              {combinedFeed.map((item) => (item.type === 'superchat' ? <SuperchatMessage key={item.id} message={item as SuperchatMessageType} isAdmin={isAdmin} /> : <ChatMessageDisplay key={item.id} message={item} isAdmin={isAdmin} onPin={handlePinMessage} />))}
              <div ref={chatEndRef} />
            </div>
            <div className="mt-4 flex shrink-0 flex-col gap-3">
              {attachmentFile && <div className="bg-secondary-background/50 flex items-center justify-between rounded-md p-2 text-sm"><span className="max-w-[200px] truncate">{attachmentFile.name}</span><button onClick={() => setAttachmentFile(null)}><X size={16} /></button></div>}
              <div className="relative">
                <input type="text" placeholder="Type a message..." className="border-secondary-background/50 w-full rounded-full border bg-light-background py-3 pl-10 pr-12 text-primary-text shadow-soft-inset focus:outline-none" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}/>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-secondary-text hover:text-primary-text" title="Attach a file"><Paperclip size={18} /></button>
                <button onClick={sendMessage} disabled={isUploading || (!messageText.trim() && !attachmentFile)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary-text p-2 text-light-background transition-all duration-200 disabled:bg-secondary-background disabled:opacity-70">{isUploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}</button>
              </div>
              <Button onClick={() => setShowSendSuperchat(true)} className="bg-primary-accent font-semibold text-white shadow-soft-destructive hover:opacity-90" size="sm"><Crown size={14} className="mr-1.5" /> Send Superchat</Button>
            </div>
          </div>
        )}
        {activeTab === 'participants' && <div className="h-full"><CallParticipantsList onClose={onClose} /></div>}
        {activeTab === 'polls' && <PollsPanel callId={callId} userId={userId} isAdmin={isAdmin} onClose={onClose} />}
      </div>
    </div>
  );
};
