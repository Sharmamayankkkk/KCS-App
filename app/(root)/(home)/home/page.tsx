'use client';

import { useEffect, useState } from 'react';
import MeetingTypeList from '@/components/MeetingTypeList';
import ScheduledMeetings from '@/components/ScheduledMeetings';

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
    <section className="flex size-full flex-col gap-6">
      {/* Material Design 3 Hero Card with elevated surface */}
      <div className="relative flex h-80 w-full items-center overflow-hidden rounded-3xl shadow-lg transition-shadow hover:shadow-xl">
        <video
          src="/images/hero-background.mp4"
          autoPlay
          muted
          loop
          className="absolute left-0 top-0 z-0 size-full object-cover"
        />
        {/* MD3 Gradient overlay for better text readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-black/40 via-black/20 to-transparent" />
        
        <div className="relative z-10 flex flex-col gap-3 p-8">
          <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg lg:text-7xl">
            {time || 'Loading...'}
          </h1>
          <p className="text-xl font-medium text-white/95 drop-shadow-md lg:text-2xl">
            {date || 'Loading...'}
          </p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-md">
            <svg 
              className="size-4 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <span className="text-sm font-medium text-white">
              {userTimeZone || 'Detecting...'}
            </span>
          </div>
        </div>
      </div>

      <MeetingTypeList />
      
      <ScheduledMeetings />
    </section>
  );
};

export default Home;
