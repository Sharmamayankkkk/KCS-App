'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Calendar, Clock, Users, Video, Eye, EyeOff, Lock, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { isUserAdmin } from '@/lib/utils';
import { useToast } from './ui/use-toast';
import PrivacyBadge from './PrivacyBadge';

interface Meeting {
  id: number;
  call_id: string;
  title: string;
  description: string | null;
  start_time: string;
  created_at: string;
  is_active: boolean;
  is_private: boolean;
  end_time: string | null;
}

const ScheduledMeetings = () => {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingMeeting, setUpdatingMeeting] = useState<string | null>(null);

  const isAdmin = useMemo(() => {
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';
    return isUserAdmin(userEmail);
  }, [user?.emailAddresses]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch('/api/meetings');
        if (!response.ok) {
          throw new Error('Failed to fetch meetings');
        }
        const data = await response.json();
        setMeetings(data.meetings || []);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError('Failed to load scheduled meetings');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
    // Refresh meetings every minute
    const interval = setInterval(fetchMeetings, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Format the time
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Format relative time
    let relativeTime = '';
    if (diffMins < 0) {
      relativeTime = 'Started';
    } else if (diffMins < 60) {
      relativeTime = `In ${diffMins} min`;
    } else if (diffHours < 24) {
      relativeTime = `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      relativeTime = 'Tomorrow';
    } else if (diffDays < 7) {
      relativeTime = `In ${diffDays} days`;
    } else {
      relativeTime = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }

    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return { timeStr, dateStr, relativeTime, hasStarted: diffMins < 0 };
  };

  const handleJoinMeeting = (callId: string) => {
    router.push(`/meeting/${callId}`);
  };

  const toggleMeetingVisibility = async (meeting: Meeting) => {
    if (!isAdmin) return;
    
    setUpdatingMeeting(meeting.call_id);
    try {
      const response = await fetch('/api/meetings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_id: meeting.call_id,
          is_active: !meeting.is_active,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update meeting visibility');
      }

      // Update local state
      setMeetings(meetings.map(m => 
        m.call_id === meeting.call_id 
          ? { ...m, is_active: !m.is_active }
          : m
      ));

      toast({
        title: meeting.is_active ? 'Meeting Hidden' : 'Meeting Shown',
        description: meeting.is_active 
          ? 'This meeting will no longer appear on the home page'
          : 'This meeting is now visible on the home page',
      });
    } catch (err) {
      console.error('Error updating meeting:', err);
      toast({
        title: 'Error',
        description: 'Failed to update meeting visibility',
        variant: 'destructive',
      });
    } finally {
      setUpdatingMeeting(null);
    }
  };

  const toggleMeetingPrivacy = async (meeting: Meeting) => {
    if (!isAdmin) return;
    
    setUpdatingMeeting(meeting.call_id);
    try {
      const response = await fetch('/api/meetings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_id: meeting.call_id,
          is_private: !meeting.is_private,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update meeting privacy');
      }

      // Update local state
      setMeetings(meetings.map(m => 
        m.call_id === meeting.call_id 
          ? { ...m, is_private: !m.is_private }
          : m
      ));

      toast({
        title: meeting.is_private ? 'Meeting Set to Public' : 'Meeting Set to Private',
        description: meeting.is_private 
          ? 'Anyone can join this meeting'
          : 'Only people with the link can join this meeting',
      });
    } catch (err) {
      console.error('Error updating meeting:', err);
      toast({
        title: 'Error',
        description: 'Failed to update meeting privacy',
        variant: 'destructive',
      });
    } finally {
      setUpdatingMeeting(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full rounded-[28px] border border-[#49454F]/40 bg-[#2B2930] p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-[20px] bg-[#D0BCFF]/15">
            <Calendar className="size-6 text-[#D0BCFF]" />
          </div>
          <h2 className="text-2xl font-bold text-[#E6E0E9]">Scheduled Meetings</h2>
        </div>
        <p className="text-[#CAC4D0]">Loading meetings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-[28px] border border-[#49454F]/40 bg-[#2B2930] p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-[20px] bg-[#D0BCFF]/15">
            <Calendar className="size-6 text-[#D0BCFF]" />
          </div>
          <h2 className="text-2xl font-bold text-[#E6E0E9]">Scheduled Meetings</h2>
        </div>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="w-full rounded-[28px] border border-[#49454F]/40 bg-[#2B2930] p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-[20px] bg-[#D0BCFF]/15">
            <Calendar className="size-6 text-[#D0BCFF]" />
          </div>
          <h2 className="text-2xl font-bold text-[#E6E0E9]">Scheduled Meetings</h2>
        </div>
        <p className="text-[#CAC4D0]">No upcoming meetings scheduled.</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[28px] border border-[#49454F]/40 bg-[#2B2930] p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-[20px] bg-[#D0BCFF]/15">
          <Calendar className="size-6 text-[#D0BCFF]" />
        </div>
        <h2 className="text-2xl font-bold text-[#E6E0E9]">Scheduled Meetings</h2>
      </div>
      <div className="space-y-4">
        {meetings.map((meeting) => {
          const { timeStr, dateStr, relativeTime, hasStarted } = formatDateTime(
            meeting.start_time
          );

          return (
            <div
              key={meeting.id}
              className="group flex flex-col justify-between gap-4 rounded-[24px] border border-[#49454F]/40 bg-[#1D1B20] p-6 transition-all hover:border-[#D0BCFF]/50 hover:shadow-md sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="truncate text-lg font-semibold text-[#E6E0E9]">
                    {meeting.title}
                  </h3>
                  <PrivacyBadge isPrivate={meeting.is_private} />
                </div>
                {meeting.description && (
                  <p className="mb-3 truncate text-sm text-[#CAC4D0]">
                    {meeting.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#CAC4D0]">
                  <div className="flex items-center gap-2 rounded-full bg-[#49454F]/30 px-3 py-1.5">
                    <Calendar className="size-4 text-[#D0BCFF]" />
                    <span>{dateStr}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-[#49454F]/30 px-3 py-1.5">
                    <Clock className="size-4 text-[#D0BCFF]" />
                    <span>{timeStr}</span>
                  </div>
                  {hasStarted && (
                    <span className="rounded-full bg-green-600/20 px-3 py-1.5 text-xs font-medium text-green-400">
                      Live Now
                    </span>
                  )}
                  {!hasStarted && (
                    <span className="rounded-full bg-blue-600/20 px-3 py-1.5 text-xs font-medium text-blue-400">
                      {relativeTime}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {isAdmin && (
                  <>
                    <Button
                      onClick={() => toggleMeetingPrivacy(meeting)}
                      disabled={updatingMeeting === meeting.call_id}
                      className="shrink-0 rounded-full bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-600/40"
                      size="sm"
                      title={meeting.is_private ? 'Make Public' : 'Make Private'}
                    >
                      {meeting.is_private ? <Globe className="size-4" /> : <Lock className="size-4" />}
                    </Button>
                    <Button
                      onClick={() => toggleMeetingVisibility(meeting)}
                      disabled={updatingMeeting === meeting.call_id}
                      className="shrink-0 rounded-full bg-[#49454F]/40 text-[#CAC4D0] hover:bg-[#49454F]/60 border border-[#49454F]/50"
                      size="sm"
                      title={meeting.is_active ? 'Hide Meeting' : 'Show Meeting'}
                    >
                      {meeting.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => handleJoinMeeting(meeting.call_id)}
                  className="shrink-0 rounded-full bg-[#D0BCFF] text-[#381E72] hover:bg-[#E8DEF8] font-medium shadow-sm hover:shadow-md transition-all"
                  size="sm"
                >
                  <Video className="mr-2 size-4" />
                  {hasStarted ? 'Join Now' : 'View Meeting'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduledMeetings;
