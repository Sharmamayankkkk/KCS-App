/* eslint-disable camelcase */
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { call_id, title, description, start_time } = await request.json();

    if (!call_id || !title || !start_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Upsert operation: Insert a new record or update an existing one if the call_id already exists.
    const { data, error } = await supabase
      .from('meetings')
      .upsert(
        {
          call_id,
          title,
          description,
          start_time,
        },
        { onConflict: 'call_id' },
      )
      .select();

    if (error) {
      console.error('Error saving meeting metadata:', error);
      return NextResponse.json(
        { error: 'Failed to save meeting metadata' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: 'Meeting metadata saved successfully', data },
      { status: 200 },
    );
  } catch (e) {
    console.error('Error in POST /api/meetings:', e);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Get all upcoming meetings (meetings that haven't started yet or started within the last 24 hours)
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .gte('start_time', twentyFourHoursAgo.toISOString())
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching meetings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch meetings' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { meetings: data || [] },
      { status: 200 },
    );
  } catch (e) {
    console.error('Error in GET /api/meetings:', e);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
