import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

/**
 * GET /api/meetings/query
 * Advanced meeting query with filters
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const isPrivate = searchParams.get('isPrivate');
    const isActive = searchParams.get('isActive');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'start_time';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    let query = supabase
      .from('meetings')
      .select('*', { count: 'exact' });

    if (status === 'upcoming') {
      query = query.gt('start_time', now.toISOString());
    } else if (status === 'live') {
      query = query
        .lte('start_time', now.toISOString())
        .gte('start_time', twoHoursAgo.toISOString());
    } else if (status === 'completed') {
      query = query.or(`end_time.not.is.null,start_time.lt.${twoHoursAgo.toISOString()}`);
    }

    if (isPrivate !== null) {
      query = query.eq('is_private', isPrivate === 'true');
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    if (startDate) {
      query = query.gte('start_time', startDate);
    }
    if (endDate) {
      query = query.lte('start_time', endDate);
    }

    const ascending = sortOrder === 'asc';
    query = query.order(sortBy as any, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error querying meetings:', error);
      return NextResponse.json(
        { 
          error: 'Failed to query meetings',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        meetings: data || [],
        total: count || 0,
        limit,
        offset,
        filters: {
          status,
          isPrivate,
          isActive,
          startDate,
          endDate,
          sortBy,
          sortOrder
        }
      },
      { status: 200 }
    );
  } catch (e) {
    console.error('Error in GET /api/meetings/query:', e);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
