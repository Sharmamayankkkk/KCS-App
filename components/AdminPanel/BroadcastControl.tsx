'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { X, Youtube, Facebook } from 'lucide-react';
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
  const { useCallEgress } = useCallStateHooks();
  const egress = useCallEgress();

  const [activeBroadcasts, setActiveBroadcasts] = useState<string[]>([]);
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [selectedPlatformId, setSelectedPlatformId] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [streamKey, setStreamKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPlatform = BROADCAST_PLATFORMS.find((p) => p.id === selectedPlatformId);

  useEffect(() => {
    const currentBroadcasts = egress?.rtmps?.map((b: any) => b.name) || [];
    setActiveBroadcasts(currentBroadcasts);
  }, [egress]);

  const startBroadcast = useCallback(async (url: string, key: string, platform: string) => {
    if (!call || isProcessing) return;
    setIsProcessing(true);
    try {
      await call.startRTMPBroadcasts({
        broadcasts: [{ name: platform, stream_url: url, stream_key: key }],
      });
      toast({ title: 'Broadcast Started', description: `${platform} broadcast has begun.` });
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
    } catch (error) {
      console.error('Error stopping broadcast:', error);
      toast({ title: 'Error', description: `Failed to stop ${platformName} broadcast.`, type: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  }, [call, toast, isProcessing]);

  const handlePlatformClick = (platform: typeof BROADCAST_PLATFORMS[0]) => {
    if (activeBroadcasts.includes(platform.id)) {
      stopBroadcast(platform.id);
    } else {
      setSelectedPlatformId(platform.id);
      setStreamUrl(platform.defaultUrl || '');
      setStreamKey(platform.defaultKey || '');
      setShowBroadcastForm(true);
      setShowPlatforms(false);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ color: '#E0DBD8', fontWeight: '500', fontSize: '0.875rem' }}>Broadcast</h4>
          <button
            onClick={() => setShowPlatforms(!showPlatforms)}
            style={{ color: '#A41F13', fontSize: '0.875rem', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600' }}
          >
            {showPlatforms ? 'Close' : 'Expand'}
          </button>
        </div>

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
                  }}>
                    {isActive ? 'LIVE' : 'OFF'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showBroadcastForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(41, 47, 54, 0.8)' }}>
          <div style={{ padding: '24px', borderRadius: '12px', backgroundColor: '#292F36', maxWidth: '448px', width: '90%', border: '1px solid #8F7A6E', position: 'relative' }}>
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
                style={{ width: '100%', padding: '12px', color: '#FAF5F1', borderRadius: '8px', backgroundColor: '#292F36', border: '1px solid #8F7A6E' }}
              />
              <input
                type="password"
                value={streamKey}
                onChange={(e) => setStreamKey(e.target.value)}
                placeholder="Stream Key"
                style={{ width: '100%', padding: '12px', color: '#FAF5F1', borderRadius: '8px', backgroundColor: '#292F36', border: '1px solid #8F7A6E' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', gap: '12px' }}>
              <Button
                variant="outline"
                onClick={() => setShowBroadcastForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFormSubmit}
                disabled={!streamUrl || !streamKey || isProcessing}
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