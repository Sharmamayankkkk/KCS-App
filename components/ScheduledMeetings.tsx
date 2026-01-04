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
      <div className="w-full rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-[#B91C1C]" />
          <h2 className="text-xl font-bold text-[#0F172A]">Scheduled Meetings</h2>
        </div>
        <p className="text-[#64748B]">Loading meetings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-[#B91C1C]" />
          <h2 className="text-xl font-bold text-[#0F172A]">Scheduled Meetings</h2>
        </div>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="w-full rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-[#B91C1C]" />
          <h2 className="text-xl font-bold text-[#0F172A]">Scheduled Meetings</h2>
        </div>
        <p className="text-[#64748B]">No upcoming meetings scheduled.</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-border bg-surface p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-[#B91C1C]" />
        <h2 className="text-xl font-bold text-[#0F172A]">Scheduled Meetings</h2>
      </div>
      <div className="space-y-3">
        {meetings.map((meeting) => {
          const { timeStr, dateStr, relativeTime, hasStarted } = formatDateTime(
            meeting.start_time
          );

          return (
            <div
              key={meeting.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border hover:border-accent hover:shadow-md transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[#0F172A] truncate">
                    {meeting.title}
                  </h3>
                  <PrivacyBadge isPrivate={meeting.is_private} />
                </div>
                {meeting.description && (
                  <p className="text-sm text-[#64748B] truncate">
                    {meeting.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[#64748B]">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{dateStr}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{timeStr}</span>
                  </div>
                  {hasStarted && (
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      Live Now
                    </span>
                  )}
                  {!hasStarted && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
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
                      className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                      size="sm"
                      title={meeting.is_private ? 'Make Public' : 'Make Private'}
                    >
                      {meeting.is_private ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={() => toggleMeetingVisibility(meeting)}
                      disabled={updatingMeeting === meeting.call_id}
                      className="bg-gray-600 hover:bg-gray-700 text-white shrink-0"
                      size="sm"
                      title={meeting.is_active ? 'Hide Meeting' : 'Show Meeting'}
                    >
                      {meeting.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => handleJoinMeeting(meeting.call_id)}
                  className="bg-[#B91C1C] hover:bg-[#991B1B] text-white shrink-0"
                  size="sm"
                >
                  <Video className="h-4 w-4 mr-2" />
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
