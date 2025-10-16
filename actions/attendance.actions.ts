'use server';

import { supabase } from '@/lib/supabaseClient';
import { currentUser } from '@clerk/nextjs/server';

export interface AttendanceRecord {
  id: number;
  call_id: string;
  user_id: string;
  username?: string;
  status: 'present' | 'absent' | 'late';
  joined_at?: string;
  left_at?: string;
  duration_minutes?: number;
  marked_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  meeting_title?: string;
}

export interface AttendanceStats {
  user_id: string;
  username: string;
  email: string;
  total_meetings: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
  total_duration_minutes: number;
}

export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const user = await currentUser();
    if (!user) return false;

    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);

    const userEmail = user.emailAddresses?.[0]?.emailAddress || '';
    return adminEmails.includes(userEmail);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const markAttendance = async (
  callId: string,
  userId: string,
  username: string,
  status: 'present' | 'late' = 'present',
  joinedAt?: Date
): Promise<{ success: boolean; error?: string; data?: AttendanceRecord }> => {
  try {
    // Step 1: Ensure the user exists in our public.users table to prevent race conditions.
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      // User does not exist, so create them. This handles the race condition with Clerk webhooks.
      const clerkUser = await currentUser();
      if (clerkUser && clerkUser.id === userId) {
        const { error: insertUserError } = await supabase.from('users').insert({
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || username,
          first_name: clerkUser.firstName,
          last_name: clerkUser.lastName,
          image_url: clerkUser.imageUrl,
        });

        if (insertUserError) {
          console.error('Error creating user during attendance marking:', insertUserError);
          return { success: false, error: `Failed to create user: ${insertUserError.message}` };
        }
      } else {
          // Fallback if clerk user isn't found, though this is unlikely.
         const { error: insertUserError } = await supabase.from('users').insert({
            id: userId,
            email: 'email@placeholder.com', // Placeholder
            username: username,
          });
           if (insertUserError) {
              console.error('Error creating placeholder user during attendance marking:', insertUserError);
              return { success: false, error: `Failed to create user: ${insertUserError.message}` };
           }
      }
    }

    // Step 2: Ensure a meeting record exists.
    const { error: meetingError } = await supabase.from('meetings').upsert(
      {
        call_id: callId,
        title: 'Instant Meeting',
        start_time: new Date().toISOString(),
      },
      {
        onConflict: 'call_id',
      }
    );

    if (meetingError) {
      console.error('Error ensuring meeting record exists:', meetingError);
      return { success: false, error: `Failed to ensure meeting record: ${meetingError.message}` };
    }

    // Step 3: Now that user and meeting are guaranteed to exist, mark the attendance.
    const { data, error: attendanceError } = await supabase
      .from('attendance')
      .upsert(
        {
          call_id: callId,
          user_id: userId,
          username,
          status,
          joined_at: joinedAt?.toISOString() || new Date().toISOString(),
        },
        { onConflict: 'call_id,user_id' }
      )
      .select()
      .single();

    if (attendanceError) {
      console.error('Error marking attendance:', attendanceError);
      return { success: false, error: attendanceError.message };
    }

    return { success: true, data: data as AttendanceRecord };
  } catch (error: any) {
    console.error('Error in markAttendance flow:', error);
    return { success: false, error: error.message };
  }
};

export const updateAttendanceOnLeave = async (
  callId: string,
  userId: string,
  leftAt?: Date
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('attendance')
      .update({
        left_at: leftAt?.toISOString() || new Date().toISOString(),
      })
      .match({ call_id: callId, user_id: userId });

    if (error) {
      console.error('Error updating attendance on leave:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error updating attendance on leave:', error);
    return { success: false, error: error.message };
  }
};

export const getUserAttendance = async (
  userId: string,
  limit = 50,
  offset = 0
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        meetings (title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching user attendance:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error fetching user attendance:', error);
    return { success: false, error: error.message };
  }
};

export const getUserAttendanceStats = async (
  userId: string
): Promise<{ success: boolean; data?: AttendanceStats; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('user_attendance_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user attendance stats:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as AttendanceStats };
  } catch (error: any) {
    console.error('Error fetching user attendance stats:', error);
    return { success: false, error: error.message };
  }
};

export const getAllAttendance = async (
  limit = 100,
  offset = 0
): Promise<{ success: boolean; data?: any[]; error?: string; isAdmin?: boolean }> => {
  try {
    const admin = await isUserAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized', isAdmin: false };
    }

    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        meetings (title),
        users (username, email)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching all attendance:', error);
      return { success: false, error: error.message, isAdmin: true };
    }

    return { success: true, data: data || [], isAdmin: true };
  } catch (error: any) {
    console.error('Error fetching all attendance:', error);
    return { success: false, error: error.message };
  }
};

export const getAllUsersAttendanceStats = async (): Promise<{
  success: boolean;
  data?: AttendanceStats[];
  error?: string;
  isAdmin?: boolean;
}> => {
  try {
    const admin = await isUserAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized', isAdmin: false };
    }

    const { data, error } = await supabase
      .from('user_attendance_stats')
      .select('*')
      .order('attendance_percentage', { ascending: false });

    if (error) {
      console.error('Error fetching all users attendance stats:', error);
      return { success: false, error: message, isAdmin: true };
    }

    return { success: true, data: data as AttendanceStats[], isAdmin: true };
  } catch (error: any) {
    console.error('Error fetching all users attendance stats:', error);
    return { success: false, error: error.message };
  }
};

export const getCallAttendance = async (
  callId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        meetings (title),
        users (username, email)
      `)
      .eq('call_id', callId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching call attendance:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error fetching call attendance:', error);
    return { success: false, error: error.message };
  }
};

export const updateAttendance = async (
  attendanceId: number,
  updates: Partial<AttendanceRecord>
): Promise<{ success: boolean; error?: string; data?: AttendanceRecord }> => {
  try {
    const admin = await isUserAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await currentUser();
    const updateData = {
      ...updates,
      marked_by: user?.id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('attendance')
      .update(updateData)
      .eq('id', attendanceId)
      .select()
      .single();

    if (error) {
      console.error('Error updating attendance:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as AttendanceRecord };
  } catch (error: any) {
    console.error('Error updating attendance:', error);
    return { success: false, error: error.message };
  }
};

export const deleteAttendance = async (
  attendanceId: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const admin = await isUserAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', attendanceId);

    if (error) {
      console.error('Error deleting attendance:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting attendance:', error);
    return { success: false, error: error.message };
  }
};

export const getAttendanceByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const admin = await isUserAdmin();
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        meetings (title),
        users (username, email)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching attendance by date range:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error fetching attendance by date range:', error);
    return { success: false, error: error.message };
  }
};

export const endCallForAllParticipants = async (
  callId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('attendance')
      .update({ left_at: new Date().toISOString() })
      .eq('call_id', callId)
      .is('left_at', null);

    if (error) {
      console.error('Error ending call for all participants:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error ending call for all participants:', error);
    return { success: false, error: error.message };
  }
};
