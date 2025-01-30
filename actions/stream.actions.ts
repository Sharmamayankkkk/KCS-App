'use server';

import { StreamVideoServerClient } from '@stream-io/node-sdk';
import { currentUser } from '@clerk/nextjs/server';
import { randomUUID } from 'crypto';

const apiKey = process.env.STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;
const serverClient = new StreamVideoServerClient(apiKey, apiSecret, {
  timeout: 6000,
});

// Define admin users
const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

export const createMeeting = async (description: string, dateTime: Date) => {
  try {
    const user = await currentUser();
    if (!user || !user.primaryEmailAddress) {
      throw new Error('User not found');
    }

    // Check if user is an admin
    if (!adminEmails.includes(user.primaryEmailAddress.emailAddress)) {
      throw new Error('Access Denied: Only admins can create meetings.');
    }

    if (!dateTime) {
      throw new Error('Meeting date and time are required.');
    }

    const id = randomUUID();
    const startsAt = dateTime.toISOString();
    const call = await serverClient.call('default', id).getOrCreate({
      data: {
        starts_at: startsAt,
        custom: {
          description: description || 'Instant Meeting',
        },
      },
    });

    return {
      id: call.id,
      link: `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${call.id}`,
    };
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw new Error('Failed to create meeting.');
  }
};
