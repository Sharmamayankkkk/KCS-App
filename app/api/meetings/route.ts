/* eslint-disable camelcase */
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { call_id, title, description, start_time, is_private } = await request.json();

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
          is_active: true, // New meetings are active by default
          is_private: is_private || false, // Default to public if not specified
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
    // Get only active upcoming meetings (not cancelled/completed)
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('is_active', true) // Only show active meetings
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

export async function PATCH(request: Request) {
  try {
    const { call_id, is_active, is_private, end_time } = await request.json();

    if (!call_id) {
      return NextResponse.json(
        { error: 'Missing call_id' },
        { status: 400 },
      );
    }

    // Build update object with only provided fields
    const updateData: {
      is_active?: boolean;
      is_private?: boolean;
      end_time?: string;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString(),
    };
    
    if (typeof is_active !== 'undefined') updateData.is_active = is_active;
    if (typeof is_private !== 'undefined') updateData.is_private = is_private;
    if (end_time) updateData.end_time = end_time;

    const { data, error } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('call_id', call_id)
      .select();

    if (error) {
      console.error('Error updating meeting:', error);
      return NextResponse.json(
        { error: 'Failed to update meeting' },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: 'Meeting updated successfully', data: data[0] },
      { status: 200 },
    );
  } catch (e) {
    console.error('Error in PATCH /api/meetings:', e);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
