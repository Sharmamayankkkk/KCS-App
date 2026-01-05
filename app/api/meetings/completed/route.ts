import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

/**
 * GET /api/meetings/completed
 * Fetches all completed meetings
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    // Get completed meetings (those with end_time set or older than 24 hours)
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const { data, error, count } = await supabase
      .from('meetings')
      .select('*', { count: 'exact' })
      .or(`end_time.not.is.null,and(start_time.lt.${twentyFourHoursAgo.toISOString()})`)
      .order('start_time', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      console.error('Error fetching completed meetings:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch completed meetings',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        meetings: data || [],
        total: count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      },
      { status: 200 }
    );
  } catch (e) {
    console.error('Error in GET /api/meetings/completed:', e);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
