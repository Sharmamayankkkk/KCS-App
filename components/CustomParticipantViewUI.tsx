'use client';

import { useEffect, useState } from 'react';
import { useParticipantViewContext } from '@stream-io/video-react-sdk';
import { AnimatePresence, motion } from 'framer-motion';

interface CustomReactionState {
  id: string;
  content: string;
  isImage: boolean;
}

export const CustomParticipantViewUI = () => {
  const { participant } = useParticipantViewContext();
  const [reactions, setReactions] = useState<CustomReactionState[]>([]);

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

  return (
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
  );
};
