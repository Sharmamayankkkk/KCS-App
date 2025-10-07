'use client';

import { useState, useCallback } from 'react';
import { useCall } from '@stream-io/video-react-sdk';
import { Cast, X, Youtube, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const BROADCAST_PLATFORMS = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    defaultUrl: process.env.NEXT_PUBLIC_YOUTUBE_STREAM_URL || '',
    defaultKey: process.env.NEXT_PUBLIC_YOUTUBE_STREAM_KEY || '',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    defaultUrl: '',
    defaultKey: '',
  },
];

export const BroadcastControl = () => {
  const call = useCall();
  const { toast } = useToast();
  const [activeBroadcasts, setActiveBroadcasts] = useState<string[]>([]);
  const [showPlatforms, setShowPlatforms] = useState(false); // New state to show platform list
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [selectedPlatformId, setSelectedPlatformId] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [streamKey, setStreamKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPlatform = BROADCAST_PLATFORMS.find((p) => p.id === selectedPlatformId);

  const startBroadcast = useCallback(async (url: string, key: string, platform: string) => {
    if (!call || isProcessing) return;
    setIsProcessing(true);
    try {
      await call.startRTMPBroadcasts({
        broadcasts: [{ name: platform, stream_url: url, stream_key: key }],
      });
      toast({ title: 'Broadcast Started', description: `${platform} broadcast has begun.` });
      setActiveBroadcasts((prev) => [...prev, platform]);
      setShowBroadcastForm(false);
    } catch (error) {
      console.error('Error starting broadcast:', error);
      toast({ title: 'Broadcast Error', description: `Failed to start ${platform} broadcast. Please check your URL and Key.`, type: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  }, [call, toast, isProcessing]);

  const stopBroadcast = useCallback(async (platformName: string) => {
    if (!call || isProcessing) return;
    setIsProcessing(true);
    try {
      await call.stopRTMPBroadcast(platformName);
      toast({ title: 'Broadcast Stopped', description: `${platformName} broadcast has ended.` });
      setActiveBroadcasts((prev) => prev.filter((name) => name !== platformName));
    } catch (error) {
      console.error('Error stopping broadcast:', error);
      toast({ title: 'Error', description: `Failed to stop ${platformName} broadcast.`, type: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  }, [call, toast, isProcessing]);

  const handlePlatformClick = (platform: typeof BROADCAST_PLATFORMS[0]) => {
    if (activeBroadcasts.includes(platform.id)) {
      // Platform is live, stop it
      stopBroadcast(platform.id);
    } else if (platform.defaultUrl && platform.defaultKey) {
      // Start immediately with defaults
      startBroadcast(platform.defaultUrl, platform.defaultKey, platform.id);
    } else {
      // Open form for URL/Key input
      setSelectedPlatformId(platform.id);
      setStreamUrl('');
      setStreamKey('');
      setShowBroadcastForm(true);
      setShowPlatforms(false); // Close the platform list when opening the form
    }
  };

  const handleFormSubmit = () => {
    if (selectedPlatformId && streamUrl && streamKey) {
      startBroadcast(streamUrl, streamKey, selectedPlatformId);
    }
  };

  return (
    <>
      <div>
        {/* Title and Toggle Button (matching MuteButton style) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ color: '#E0DBD8', fontWeight: '500', fontSize: '0.875rem' }}>Broadcast</h4>
          <button
            onClick={() => setShowPlatforms(!showPlatforms)}
            style={{ color: '#A41F13', fontSize: '0.875rem', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600' }}
          >
            {showPlatforms ? 'Close' : 'Expand'}
          </button>
        </div>

        {/* Platform List (Expanded View) */}
        {showPlatforms && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', padding: '12px', backgroundColor: '#292F36', borderRadius: '8px', border: '1px solid #8F7A6E' }}>
            {BROADCAST_PLATFORMS.map((platform) => {
              const isActive = activeBroadcasts.includes(platform.id);
              const PlatformIcon = platform.icon;
              return (
                <div
                  key={platform.id}
                  onClick={() => handlePlatformClick(platform)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: isActive ? 'rgba(164, 31, 19, 0.1)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    border: '1px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', color: '#FAF5F1' }}>
                    <PlatformIcon style={{ marginRight: '8px', width: '18px', height: '18px', color: isActive ? '#A41F13' : '#E0DBD8' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{platform.name}</span>
                  </div>
                  <div style={{
                    backgroundColor: isActive ? '#A41F13' : '#8F7A6E',
                    color: '#FAF5F1',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    boxShadow: isActive ? '0 2px 5px rgba(164, 31, 19, 0.3)' : 'none',
                  }}>
                    {isActive ? 'LIVE' : 'OFF'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Broadcast Form/Modal */}
      {showBroadcastForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(41, 47, 54, 0.8)' }}>
          <div style={{ padding: '24px', borderRadius: '12px', backgroundColor: '#292F36', maxWidth: '448px', width: '90%', border: '1px solid #8F7A6E', position: 'relative', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}>
            <button
              onClick={() => setShowBroadcastForm(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', color: '#E0DBD8', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', fontWeight: '600', color: '#FAF5F1' }}>
              Start {selectedPlatform?.name || 'RTMP'} Broadcast
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="RTMP Stream URL (e.g., rtmp://...)"
                style={{ width: '100%', padding: '12px', color: '#FAF5F1', borderRadius: '8px', backgroundColor: '#292F36', border: '1px solid #8F7A6E', outline: 'none', transition: 'border-color 0.2s', fontSize: '1rem' }}
              />
              <input
                type="password"
                value={streamKey}
                onChange={(e) => setStreamKey(e.target.value)}
                placeholder="Stream Key"
                style={{ width: '100%', padding: '12px', color: '#FAF5F1', borderRadius: '8px', backgroundColor: '#292F36', border: '1px solid #8F7A6E', outline: 'none', transition: 'border-color 0.2s', fontSize: '1rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', gap: '12px' }}>
              <Button
                variant="outline"
                onClick={() => setShowBroadcastForm(false)}
                style={{
                  borderColor: '#8F7A6E',
                  color: '#E0DBD8',
                  backgroundColor: 'transparent',
                  fontWeight: '600',
                  padding: '10px 16px',
                  borderRadius: '8px'
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFormSubmit}
                disabled={!streamUrl || !streamKey || isProcessing}
                style={{
                  backgroundColor: '#A41F13',
                  color: '#FAF5F1',
                  fontWeight: '600',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  opacity: (!streamUrl || !streamKey || isProcessing) ? 0.6 : 1,
                }}
              >
                {isProcessing ? 'Starting...' : 'Start Broadcast'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};