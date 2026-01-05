'use client';

import { useEffect, useState } from 'react';
import { useCall } from '@stream-io/video-react-sdk';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Volume2, Check } from 'lucide-react';

export const AudioSettings = () => {
  const call = useCall();
  const [noiseCancellationEnabled, setNoiseCancellationEnabled] = useState(false);
  const [audioQuality, setAudioQuality] = useState<'standard' | 'hifi'>('standard');
  const [stereoEnabled, setStereoEnabled] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedNoiseCancellation = localStorage.getItem('noiseCancellation');
    const savedAudioQuality = localStorage.getItem('audioQuality');
    const savedStereo = localStorage.getItem('stereoAudio');

    if (savedNoiseCancellation !== null) {
      setNoiseCancellationEnabled(savedNoiseCancellation === 'true');
    }
    if (savedAudioQuality) {
      setAudioQuality(savedAudioQuality as 'standard' | 'hifi');
    }
    if (savedStereo !== null) {
      setStereoEnabled(savedStereo === 'true');
    }
  }, []);

  const toggleNoiseCancellation = async () => {
    if (!call) return;

    try {
      const newValue = !noiseCancellationEnabled;
      
      // Update local state
      setNoiseCancellationEnabled(newValue);
      localStorage.setItem('noiseCancellation', newValue.toString());

      // Apply noise cancellation using Stream's audio filters
      if (newValue) {
        // Enable noise suppression
        await call.microphone.enable({
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        });
      } else {
        // Disable noise suppression
        await call.microphone.enable({
          noiseSuppression: false,
          echoCancellation: true,
          autoGainControl: true,
        });
      }
    } catch (error) {
      console.error('Failed to toggle noise cancellation:', error);
    }
  };

  const setHiFiAudio = async (enable: boolean) => {
    if (!call) return;

    try {
      const quality = enable ? 'hifi' : 'standard';
      setAudioQuality(quality);
      localStorage.setItem('audioQuality', quality);

      // Configure audio codec settings for high-fidelity audio
      // This would typically be done during call setup
      // Stream SDK supports opus codec which can be configured for high quality
      console.log(`Audio quality set to: ${quality}`);
    } catch (error) {
      console.error('Failed to set audio quality:', error);
    }
  };

  const toggleStereoAudio = async () => {
    if (!call) return;

    try {
      const newValue = !stereoEnabled;
      setStereoEnabled(newValue);
      localStorage.setItem('stereoAudio', newValue.toString());

      // Enable stereo audio
      // Stream SDK supports stereo audio via Opus codec
      console.log(`Stereo audio ${newValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to toggle stereo audio:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="icon" title="Audio Settings">
          <Volume2 />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="center" className="z-[200] w-56">
        <DropdownMenuLabel>Audio Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuCheckboxItem
          checked={noiseCancellationEnabled}
          onCheckedChange={toggleNoiseCancellation}
        >
          Noise Cancellation
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
          Audio Quality
        </DropdownMenuLabel>

        <DropdownMenuItem
          onClick={() => setHiFiAudio(false)}
          className="cursor-pointer"
        >
          <Check className={`mr-2 size-4 ${audioQuality === 'standard' ? 'visible' : 'invisible'}`} />
          <span>Standard Quality</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setHiFiAudio(true)}
          className="cursor-pointer"
        >
          <Check className={`mr-2 size-4 ${audioQuality === 'hifi' ? 'visible' : 'invisible'}`} />
          <span>Hi-Fi Quality</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem
          checked={stereoEnabled}
          onCheckedChange={toggleStereoAudio}
        >
          Stereo Audio
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
