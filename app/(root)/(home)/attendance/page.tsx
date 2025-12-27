'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Calendar, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import {
  getUserAttendance,
  getUserAttendanceStats,
} from '@/actions/attendance.actions';
import Loader from '@/components/Loader';

interface AttendanceRecord {
  id: number;
  call_id: string;
  status: 'present' | 'absent' | 'late';
  joined_at?: string;
  left_at?: string;
  duration_minutes?: number;
  created_at: string;
  meeting?: {
    title: string;
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
    if (minutes === undefined || minutes === null) return 'N/A';
    if (minutes < 1) return '< 1m';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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

  const getStatusBadgeStyle = (status: string) => ({
    backgroundColor: getStatusColor(status),
    color: '#FFFFFF',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '600',
    textTransform: 'capitalize' as const,
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

      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Calendar />}
            label="Total Meetings"
            value={stats.total_meetings || 0}
          />
          <StatCard
            icon={<TrendingUp />}
            label="Attendance Rate"
            value={`${stats.attendance_percentage?.toFixed(1) || 0}%`}
          />
          <StatCard
            icon={<BarChart3 />}
            label="Present"
            value={stats.present_count || 0}
          />
          <StatCard
            icon={<Clock />}
            label="Total Duration"
            value={formatDuration(stats.total_duration_minutes)}
          />
        </div>
      )}

      {stats && stats.total_meetings > 0 && (
        <div
          className="rounded-lg p-6"
          style={{ backgroundColor: '#292F36', color: '#FAF5F1' }}
        >
          <h2 className="mb-4 text-xl font-semibold text-white">
            Attendance Overview
          </h2>
          <div className="space-y-4">
            <ProgressBar
              label="Present"
              value={stats.present_count}
              total={stats.total_meetings}
              color="#10B981"
            />
            <ProgressBar
              label="Absent"
              value={stats.absent_count}
              total={stats.total_meetings}
              color="#EF4444"
            />
            <ProgressBar
              label="Late"
              value={stats.late_count}
              total={stats.total_meetings}
              color="#F59E0B"
            />
          </div>
        </div>
      )}

      <div
        className="rounded-lg p-6"
        style={{ backgroundColor: '#292F36', color: '#FAF5F1' }}
      >
        <h2 className="mb-4 text-xl font-semibold text-white">
          Attendance History
        </h2>
        {attendance.length === 0 ? (
          <p className="text-center opacity-70">No attendance records found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    borderBottom: '2px solid #374151',
                    color: '#B0A8A3',
                  }}
                >
                  <th className="pb-3 text-left font-semibold">Meeting</th>
                  <th className="pb-3 text-left font-semibold">Date</th>
                  <th className="pb-3 text-left font-semibold">Status</th>
                  <th className="pb-3 text-left font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr
                    key={record.id}
                    style={{ borderBottom: '1px solid #374151' }}
                    className="transition-colors hover:bg-opacity-5"
                  >
                    <td
                      className="py-3 font-medium"
                      style={{ color: '#FFFFFF' }}
                    >
                      {record.meeting?.title || 'Meeting'}
                    </td>
                    <td className="py-3 text-gray-300">
                      {formatDate(record.created_at)}
                    </td>
                    <td className="py-3">
                      <span style={getStatusBadgeStyle(record.status)}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-300">
                      {formatDuration(record.duration_minutes)}
                    </td>
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

// Helper Components
const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div
    className="flex items-center gap-4 rounded-lg p-6"
    style={{ backgroundColor: '#292F36', color: '#FAF5F1' }}
  >
    <div className="text-red-500">{icon}</div>
    <div>
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const ProgressBar = ({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) => (
  <div>
    <div className="mb-2 flex justify-between font-medium text-white">
      <span>{label}</span>
      <span>{value || 0}</span>
    </div>
    <div
      className="h-4 w-full overflow-hidden rounded-full"
      style={{ backgroundColor: '#1F2937' }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${((value || 0) / (total || 1)) * 100}%`,
          backgroundColor: color,
        }}
      />
    </div>
  </div>
);

export default AttendancePage;
