'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';

import { tokenProvider } from '@/actions/stream.actions';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []; // Define admin emails

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // If user is not logged in, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // Restrict access if the user is not an admin
    if (!adminEmails.includes(user.primaryEmailAddress?.emailAddress || '')) {
      console.warn('Access Denied: Only admins can create meetings.');
      router.push('/'); // Redirect to home or another page
      return;
    }

    // Initialize StreamVideoClient if API key is available
    if (API_KEY) {
      const client = new StreamVideoClient({
        apiKey: API_KEY,
        user: {
          id: user.id,
          name: user.username || user.id,
          image: user.imageUrl,
        },
        tokenProvider,
      });

      setVideoClient(client);
    } else {
      console.error('Stream API key is missing');
    }
  }, [user, isLoaded, router]);

  if (!videoClient) return <Loader />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
