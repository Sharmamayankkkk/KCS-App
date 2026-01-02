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
    <section className="flex size-full flex-col gap-5 text-white">
      <div className="relative flex h-80 w-full items-center overflow-hidden rounded-[20px] p-4">
        <video
          src="/images/hero-background.mp4"
          autoPlay
          muted
          loop
          className="absolute left-0 top-0 z-[-1] size-full object-cover"
        />
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold text-white lg:text-7xl">
            {time || 'Loading...'}
          </h1>
          <p className="text-sky-1  text-lg font-medium lg:text-2xl">
            {date || 'Loading...'}
          </p>
          <p className="text-white-400 text-sm">
            Time Zone: {userTimeZone || 'Detecting...'}
          </p>
        </div>
      </div>

      <MeetingTypeList />
      
      <ScheduledMeetings />
    </section>
  );
};

export default Home;
