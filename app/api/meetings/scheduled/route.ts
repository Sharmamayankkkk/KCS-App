import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

/**
 * GET /api/meetings/scheduled
 * Fetches all upcoming scheduled meetings (future meetings only)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';
    const includePrivate = searchParams.get('includePrivate') === 'true';

    const now = new Date();
    
    let query = supabase
      .from('meetings')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .gt('start_time', now.toISOString())
      .order('start_time', { ascending: true })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Filter by privacy setting if needed
    if (!includePrivate) {
      query = query.eq('is_private', false);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching scheduled meetings:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch scheduled meetings',
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
    console.error('Error in GET /api/meetings/scheduled:', e);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
