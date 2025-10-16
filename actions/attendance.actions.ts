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
}

// ... (rest of the interfaces remain the same)
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

export interface CallAttendanceStats {
  call_id: string;
  call_date: string;
  created_by_id: string;
  total_participants: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
}


// Check if user is admin
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

// Mark attendance when user joins a call
export const markAttendance = async (
  callId: string,
  userId: string,
  username: string, // Added username
  status: 'present' | 'late' = 'present',
  joinedAt?: Date
): Promise<{ success: boolean; error?: string; data?: AttendanceRecord }> => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(
        {
          call_id: callId,
          user_id: userId,
          username, // Save the username
          status,
          joined_at: joinedAt?.toISOString() || new Date().toISOString(),
        },
        { onConflict: 'call_id,user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error marking attendance:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as AttendanceRecord };
  } catch (error: any) {
    console.error('Error marking attendance:', error);
    return { success: false, error: error.message };
  }
};

// ... (the rest of the file remains the same)


// Update attendance when user leaves a call
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

// Get user's attendance records
export const getUserAttendance = async (
  userId: string,
  limit = 50,
  offset = 0
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('detailed_attendance')
      .select('*')
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

// Get user's attendance statistics
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

// Get all attendance records (admin only)
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
      .from('detailed_attendance')
      .select('*')
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

// Get all users' attendance statistics (admin only)
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
      return { success: false, error: error.message, isAdmin: true };
    }

    return { success: true, data: data as AttendanceStats[], isAdmin: true };
  } catch (error: any) {
    console.error('Error fetching all users attendance stats:', error);
    return { success: false, error: error.message };
  }
};

// Get attendance for a specific call (admin only)
export const getCallAttendance = async (
  callId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('detailed_attendance')
      .select('*')
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

// Update attendance record (admin only)
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

// Delete attendance record (admin only)
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

// Get attendance statistics for a date range (admin only)
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
      .from('detailed_attendance')
      .select('*')
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

// Update attendance for all when admin ends call
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
