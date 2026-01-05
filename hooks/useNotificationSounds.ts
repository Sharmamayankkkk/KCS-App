'use client';

import { useEffect, useRef } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';

/**
 * Hook to play notification sounds for various meeting events
 */
export const useNotificationSounds = () => {
  const call = useCall();
  const { useParticipants, useCallCallingState } = useCallStateHooks();
  const participants = useParticipants();
  const callingState = useCallCallingState();
  
  const previousParticipantCount = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(true);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Function to play a tone
  const playTone = (frequency: number, duration: number, volume: number = 0.3) => {
    if (!soundEnabledRef.current || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Play join sound (ascending tone)
  const playJoinSound = () => {
    playTone(523.25, 0.15); // C5
    setTimeout(() => playTone(659.25, 0.15), 100); // E5
  };

  // Play leave sound (descending tone)
  const playLeaveSound = () => {
    playTone(659.25, 0.15); // E5
    setTimeout(() => playTone(523.25, 0.15), 100); // C5
  };

  // Play reaction sound (quick chirp)
  const playReactionSound = () => {
    playTone(880, 0.1, 0.2); // A5
  };

  // Monitor participant changes
  useEffect(() => {
    if (!call) return;

    const currentCount = participants.length;
    const previousCount = previousParticipantCount.current;

    // Skip first render
    if (previousCount === 0) {
      previousParticipantCount.current = currentCount;
      return;
    }

    // Someone joined
    if (currentCount > previousCount) {
      playJoinSound();
    }
    // Someone left
    else if (currentCount < previousCount) {
      playLeaveSound();
    }

    previousParticipantCount.current = currentCount;
  }, [participants, call]);

  // Listen for reactions
  useEffect(() => {
    if (!call) return;

    const unsubscribe = call.on('call.reaction_new', () => {
      playReactionSound();
    });

    return () => {
      unsubscribe();
    };
  }, [call]);

  // Function to toggle sounds on/off
  const toggleSounds = (enabled: boolean) => {
    soundEnabledRef.current = enabled;
    localStorage.setItem('notificationSoundsEnabled', enabled.toString());
  };

  // Load sound preference
  useEffect(() => {
    const saved = localStorage.getItem('notificationSoundsEnabled');
    if (saved !== null) {
      soundEnabledRef.current = saved === 'true';
    }
  }, []);

  return {
    toggleSounds,
    soundEnabled: soundEnabledRef.current,
  };
};
