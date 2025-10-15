'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Calendar, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { getUserAttendance, getUserAttendanceStats } from '@/actions/attendance.actions';
import Loader from '@/components/Loader';

interface AttendanceRecord {
  id: number;
  call_id: string;
  status: 'present' | 'absent' | 'late';
  joined_at?: string;
  left_at?: string;
  duration_minutes?: number;
  created_at: string;
  calls?: {
    id: string;
    created_at: string;
    started_at?: string;
  };
}

interface AttendanceStats {
  total_meetings: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
  total_duration_minutes: number;
}

const AttendancePage = () => {
  const { user, isLoaded } = useUser();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const [attendanceResult, statsResult] = await Promise.all([
          getUserAttendance(user.id),
          getUserAttendanceStats(user.id),
        ]);

        if (!attendanceResult.success) {
          setError(attendanceResult.error || 'Failed to fetch attendance');
        } else {
          setAttendance(attendanceResult.data || []);
        }

        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchAttendanceData();
    }
  }, [user, isLoaded]);

  if (!isLoaded || loading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xl" style={{ color: '#292F36' }}>
          Please sign in to view your attendance
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return '#10B981'; // Green
      case 'absent':
        return '#EF4444'; // Red
      case 'late':
        return '#F59E0B'; // Orange
      default:
        return '#6B7280'; // Gray
    }
  };

  const getStatusBadgeStyle = (status: string): React.CSSProperties => ({
    backgroundColor: getStatusColor(status),
    color: '#FFFFFF',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '600',
    textTransform: 'capitalize',
  });

  return (
    <section className="flex size-full flex-col gap-6">
      <h1 className="text-3xl font-bold" style={{ color: '#292F36' }}>
        My Attendance
      </h1>

      {error && (
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
        >
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div
            className="rounded-lg p-6"
            style={{ backgroundColor: '#292F36', color: '#FAF5F1' }}
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8" style={{ color: '#A41F13' }} />
              <div>
                <p className="text-sm opacity-80">Total Meetings</p>
                <p className="text-2xl font-bold">{stats.total_meetings || 0}</p>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg p-6"
            style={{ backgroundColor: '#292F36', color: '#FAF5F1' }}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8" style={{ color: '#10B981' }} />
              <div>
                <p className="text-sm opacity-80">Attendance Rate</p>
                <p className="text-2xl font-bold">
                  {stats.attendance_percentage?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg p-6"
            style={{ backgroundColor: '#292F36', color: '#FAF5F1' }}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8" style={{ color: '#3B82F6' }} />
              <div>
                <p className="text-sm opacity-80">Present</p>
                <p className="text-2xl font-bold">{stats.present_count || 0}</p>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg p-6"
            style={{ backgroundColor: '#292F36', color: '#FAF5F1' }}
          >
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8" style={{ color: '#F59E0B' }} />
              <div>
                <p className="text-sm opacity-80">Total Duration</p>
                <p className="text-2xl font-bold">
                  {formatDuration(stats.total_duration_minutes)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Visualization */}
      {stats && stats.total_meetings > 0 && (
        <div
          className="rounded-lg p-6"
          style={{ backgroundColor: '#292F36', color: '#FAF5F1' }}
        >
          <h2 className="mb-4 text-xl font-semibold">Attendance Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between">
                <span>Present</span>
                <span className="font-semibold">{stats.present_count || 0}</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full" style={{ backgroundColor: '#1F2937' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${((stats.present_count || 0) / (stats.total_meetings || 1)) * 100}%`,
                    backgroundColor: '#10B981',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between">
                <span>Absent</span>
                <span className="font-semibold">{stats.absent_count || 0}</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full" style={{ backgroundColor: '#1F2937' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${((stats.absent_count || 0) / (stats.total_meetings || 1)) * 100}%`,
                    backgroundColor: '#EF4444',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between">
                <span>Late</span>
                <span className="font-semibold">{stats.late_count || 0}</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full" style={{ backgroundColor: '#1F2937' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${((stats.late_count || 0) / (stats.total_meetings || 1)) * 100}%`,
                    backgroundColor: '#F59E0B',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records */}
      <div
        className="rounded-lg p-6"
        style={{ backgroundColor: '#292F36', color: '#FAF5F1' }}
      >
        <h2 className="mb-4 text-xl font-semibold">Attendance History</h2>
        {attendance.length === 0 ? (
          <p className="text-center opacity-70">No attendance records found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '2px solid #8F7A6E' }}>
                  <th className="pb-3 text-left">Date</th>
                  <th className="pb-3 text-left">Time</th>
                  <th className="pb-3 text-left">Status</th>
                  <th className="pb-3 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr
                    key={record.id}
                    style={{ borderBottom: '1px solid #8F7A6E' }}
                    className="transition-colors hover:bg-opacity-5"
                  >
                    <td className="py-3">
                      {formatDate(record.calls?.created_at || record.created_at)}
                    </td>
                    <td className="py-3">
                      {record.joined_at
                        ? formatTime(record.joined_at)
                        : 'N/A'}
                    </td>
                    <td className="py-3">
                      <span style={getStatusBadgeStyle(record.status)}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3">{formatDuration(record.duration_minutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default AttendancePage;
