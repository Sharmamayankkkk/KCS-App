'use client';

import { useEffect, useState } from 'react';
import MeetingTypeList from '@/components/MeetingTypeList';

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
      })
    );

    // Format date correctly using detected timezone
    setDate(
      new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeZone: detectedTimeZone, // Apply user's timezone
      }).format(now)
    );
  }, []);

  return (
    <section className="flex size-full flex-col gap-5 text-white">
      <div className="h-80 w-full flex items-center p-4 rounded-[20px] bg-hero bg-cover">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl">{time || 'Loading...'}</h1>
            <p className="text-lg font-medium text-sky-1 lg:text-2xl">{date || 'Loading...'}</p>
            <p className="text-sm text-gray-400">
              Time Zone: {userTimeZone || 'Detecting...'}
            </p>
          </div>
      </div>

      <MeetingTypeList />
    </section>
  );
};

export default Home;
