'use client';

import { useEffect, useState } from 'react';
import MeetingTypeList from '@/components/MeetingTypeList';
import ScheduledMeetings from '@/components/ScheduledMeetings';
import { Clock, MapPin } from 'lucide-react';

const Home = () => {
  const [userTimeZone, setUserTimeZone] = useState<string | null>(null);
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    // Ensure this runs only on the client
    const now = new Date();
    const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    setUserTimeZone(detectedTimeZone);

    // Format time correctly using detected timezone
    setTime(
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true, // Ensures AM/PM format
        timeZone: detectedTimeZone, // Apply user's timezone
      }),
    );

    // Format date correctly using detected timezone
    setDate(
      new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeZone: detectedTimeZone, // Apply user's timezone
      }).format(now),
    );
  }, []);

  return (
    <section className="flex size-full flex-col gap-8">
      {/* Material Design 3 Hero Section */}
      <div className="relative flex h-[360px] w-full items-end overflow-hidden rounded-[32px] bg-gradient-to-br from-[#2B2930] via-[#1D1B20] to-[#141218] shadow-lg border border-[#49454F]/30">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/images/hero-background.jpg')] bg-cover bg-center opacity-20" />
        </div>
        
        {/* Decorative Orbs */}
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#D0BCFF]/20 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-[#D0BCFF]/10 blur-[100px]" />
        
        {/* Content Container */}
        <div className="relative z-10 flex w-full flex-col gap-6 p-8 pb-10">
          {/* Time Display */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#D0BCFF]/20 backdrop-blur-sm">
                <Clock className="size-6 text-[#D0BCFF]" />
              </div>
              <h1 className="text-6xl font-bold tracking-tight text-[#E6E0E9]">
                {time || 'Loading...'}
              </h1>
            </div>
            
            <p className="text-xl font-medium text-[#CAC4D0] pl-[60px]">
              {date || 'Loading...'}
            </p>
          </div>
          
          {/* Timezone Badge */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#2B2930]/80 backdrop-blur-md px-5 py-2.5 border border-[#49454F]/50 ml-[60px]">
            <MapPin className="size-4 text-[#D0BCFF]" />
            <span className="text-sm font-medium text-[#E6E0E9]">
              {userTimeZone || 'Detecting timezone...'}
            </span>
          </div>
        </div>
      </div>

      {/* Meeting Actions Grid */}
      <MeetingTypeList />
      
      {/* Scheduled Meetings Section */}
      <ScheduledMeetings />
    </section>
  );
};

export default Home;
