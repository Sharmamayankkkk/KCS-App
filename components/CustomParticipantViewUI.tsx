'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParticipantViewContext, hasAudio, hasVideo } from '@stream-io/video-react-sdk';
import { AnimatePresence, motion } from 'framer-motion';
import { isUserAdmin } from '@/lib/utils';
import Image from 'next/image';

interface CustomReactionState {
  id: string;
  content: string;
  isImage: boolean;
}

export const CustomParticipantViewUI = () => {
  const { participant } = useParticipantViewContext();
  const [reactions, setReactions] = useState<CustomReactionState[]>([]);

  // Check if participant is an admin based on their userId (email)
  const isAdmin = useMemo(() => {
    return isUserAdmin(participant.userId);
  }, [participant.userId]);

  useEffect(() => {
    let newReaction: CustomReactionState | null = null;
    const reactionData = participant.reaction;

    let customData = reactionData?.custom;
    if (typeof customData === 'string') {
      try { customData = JSON.parse(customData); } catch (e) { customData = {}; }
    }

    if (reactionData?.type === 'custom' && customData?.image_url) {
      newReaction = {
        id: `${participant.sessionId}-${Date.now()}`,
        content: customData.image_url,
        isImage: true,
      };
    } 
    else if (reactionData?.emoji_code) {
      const emojiMap: Record<string, string> = { ':like:': '👍', ':raise-hand:': '✋', ':fireworks:': '🎉' };
      newReaction = {
        id: `${participant.sessionId}-${Date.now()}`,
        content: emojiMap[reactionData.emoji_code] || '',
        isImage: false,
      };
    }

    if (newReaction && newReaction.content) {
      setReactions((prev) => [...prev, newReaction]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== newReaction!.id));
      }, 4000);
    }
  }, [participant.reaction, participant.sessionId]);

  const hasAudioTrack = hasAudio(participant);
  const hasVideoTrack = hasVideo(participant);

  return (
    <>
      {/* Participant name and status indicators */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '8px',
        right: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(0, 0, 0, 0.6)',
        padding: '6px 10px',
        borderRadius: '6px',
        zIndex: 5,
      }}>
        <span style={{
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}>
          {participant.name || participant.userId}
        </span>
        
        {/* Verified badge for admins */}
        {isAdmin && (
          <Image
            src="/images/verified.png"
            alt="Verified Admin"
            width={16}
            height={16}
            style={{ flexShrink: 0 }}
            title="Verified Admin"
          />
        )}
        
        {/* Audio muted indicator */}
        {!hasAudioTrack && (
          <span style={{ color: '#ef4444', fontSize: '16px' }} title="Microphone muted">
            🔇
          </span>
        )}
        
        {/* Video muted indicator */}
        {!hasVideoTrack && (
          <span style={{ color: '#ef4444', fontSize: '16px' }} title="Camera off">
            📹
          </span>
        )}
      </div>

      {/* Reactions */}
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ y: '100%', x: '-50%', opacity: 1, scale: 0.5 }}
            animate={{ y: '-100%', opacity: [1, 1, 0], scale: [0.7, 1.2], transition: { duration: 4, ease: 'easeInOut' } }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', bottom: 0, left: '50%', zIndex: 10 }}
          >
            {reaction.isImage ? (
              <img src={reaction.content} alt="Custom Reaction" width={64} height={64} />
            ) : (
              <span style={{ fontSize: '48px' }}>{reaction.content}</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
};
