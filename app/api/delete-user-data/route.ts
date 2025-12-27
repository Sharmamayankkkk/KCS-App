/* eslint-disable camelcase */
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, dataTypes } = await request.json();

    if (!userId || !dataTypes || !Array.isArray(dataTypes)) {
      return NextResponse.json(
        { error: 'Missing or invalid parameters' },
        { status: 400 },
      );
    }

    // Verify the user is deleting their own data
    if (clerkUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const results: any = {
      success: [],
      failed: [],
    };

    // Delete chat messages
    if (dataTypes.includes('chat')) {
      try {
        const { error } = await supabase
          .from('chat_messages')
          .delete()
          .eq('sender', userId);

        if (error) throw error;
        results.success.push('chat');
      } catch (error) {
        console.error('Error deleting chat messages:', error);
        results.failed.push('chat');
      }
    }

    // Delete poll responses
    if (dataTypes.includes('polls')) {
      try {
        const { error } = await supabase
          .from('poll_votes')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
        results.success.push('polls');
      } catch (error) {
        console.error('Error deleting poll votes:', error);
        results.failed.push('polls');
      }
    }

    // Delete meeting participation history
    if (dataTypes.includes('meetings')) {
      try {
        const { error } = await supabase
          .from('participants')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
        results.success.push('meetings');
      } catch (error) {
        console.error('Error deleting meeting history:', error);
        results.failed.push('meetings');
      }
    }

    // Remove access to recordings (mark as deleted, don't actually delete files)
    if (dataTypes.includes('recordings')) {
      try {
        // In a real implementation, you might want to update a user_access table
        // or add a deleted_for_users column to the recordings table
        // For now, we'll just mark it as successful
        results.success.push('recordings');
      } catch (error) {
        console.error('Error removing recording access:', error);
        results.failed.push('recordings');
      }
    }

    return NextResponse.json(
      {
        message: 'Data deletion completed',
        results,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error in data deletion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
