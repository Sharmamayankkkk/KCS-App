'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Users,
  Calendar,
  TrendingUp,
  Edit2,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getAllUsersAttendanceStats,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
  isUserAdmin,
} from '@/actions/attendance.actions';
import Loader from '@/components/Loader';

interface AttendanceStats {
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

interface AttendanceRecord {
  id: number;
  call_id: string;
  user_id: string;
  status: 'present' | 'absent' | 'late';
  joined_at?: string;
  left_at?: string;
  duration_minutes?: number;
  notes?: string;
  created_at: string;
  users?: {
    id: string;
    username: string;
    email: string;
  };
  calls?: {
    id: string;
    created_at: string;
    started_at?: string;
  };
}

const AdminAttendancePage = () => {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<AttendanceStats[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [editNotes, setEditNotes] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const adminStatus = await isUserAdmin();
        setIsAdmin(adminStatus);

        if (!adminStatus) {
          setError('You do not have permission to view this page');
          setLoading(false);
          return;
        }

        const [statsResult, attendanceResult] = await Promise.all([
          getAllUsersAttendanceStats(),
          getAllAttendance(200, 0),
        ]);

        if (!statsResult.success) {
          setError(statsResult.error || 'Failed to fetch statistics');
        } else {
          setStats(statsResult.data || []);
        }

        if (!attendanceResult.success) {
          setError(attendanceResult.error || 'Failed to fetch attendance records');
        } else {
          setAllAttendance(attendanceResult.data || []);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      checkAdminAndFetchData();
    }
  }, [user, isLoaded]);

  const handleEdit = (record: AttendanceRecord) => {
    setEditingId(record.id);
    setEditStatus(record.status);
    setEditNotes(record.notes || '');
  };

  const handleSave = async (id: number) => {
    const result = await updateAttendance(id, {
      status: editStatus,
      notes: editNotes,
    });

    if (result.success) {
      setAllAttendance((prev) =>
        prev.map((record) =>
          record.id === id
            ? { ...record, status: editStatus, notes: editNotes }
            : record
        )
      );
      setEditingId(null);
    } else {
      alert('Failed to update attendance: ' + result.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    const result = await deleteAttendance(id);
    if (result.success) {
      setAllAttendance((prev) => prev.filter((record) => record.id !== id));
    } else {
      alert('Failed to delete attendance: ' + result.error);
    }
  };

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
        return '#10B981';
      case 'absent':
        return '#EF4444';
      case 'late':
        return '#F59E0B';
      default:
        return '#6B7280';
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

  const filteredStats = stats.filter(
    (stat) =>
      stat.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stat.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserAttendanceRecords = (userId: string) => {
    return allAttendance.filter((record) => record.user_id === userId);
  };

  if (!isLoaded || loading) {
    return <Loader />;
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xl" style={{ color: '#292F36' }}>
          You do not have permission to view this page
        </p>
      </div>
    );
  }

  return (
    <section className="flex size-full flex-col gap-6">
      <h1 className="text-3xl font-bold" style={{ color: '#292F36' }}>
        Admin Attendance Management
      </h1>

      {error && (
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
        >
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          className="rounded-lg p-6"
          style={{ backgroundColor: '#292F36', color: '#FAF5F1' }}
        >
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8" style={{ color: '#A41F13' }} />
            <div>
              <p className="text-sm opacity-80">Total Users</p>
              <p className="text-2xl font-bold">{stats.length}</p>
            </div>
          </div>
        </div>

        <div
          className="rounded-lg p-6"
          style={{ backgroundColor: '#292F36', color: '#FAF5F1' }}
        >
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8" style={{ color: '#3B82F6' }} />
            <div>
              <p className="text-sm opacity-80">Total Records</p>
              <p className="text-2xl font-bold">{allAttendance.length}</p>
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
              <p className="text-sm opacity-80">Avg Attendance</p>
              <p className="text-2xl font-bold">
                {stats.length > 0
                  ? (
                      stats.reduce((sum, s) => sum + (s.attendance_percentage || 0), 0) /
                      stats.length
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: '#292F36', color: '#FAF5F1' }}
      >
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 opacity-70" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none placeholder:opacity-50"
            style={{ color: '#FAF5F1' }}
          />
        </div>
      </div>

      {/* User Statistics Table with Expandable Attendance Records */}
      <div
        className="rounded-lg p-6"
        style={{ backgroundColor: '#292F36', color: '#FAF5F1' }}
      >
        <h2 className="mb-4 text-xl font-semibold">User Attendance Statistics</h2>
        {filteredStats.length === 0 ? (
          <p className="text-center opacity-70">No users found</p>
        ) : (
          <div className="space-y-2">
            {filteredStats.map((stat) => (
              <div key={stat.user_id}>
                <div
                  className="cursor-pointer rounded-lg p-4 transition-colors"
                  style={{ backgroundColor: '#1F2937' }}
                  onClick={() =>
                    setExpandedUser(expandedUser === stat.user_id ? null : stat.user_id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{stat.username}</p>
                      <p className="text-sm opacity-70">{stat.email}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm opacity-70">Meetings</p>
                        <p className="font-semibold">{stat.total_meetings || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm opacity-70">Present</p>
                        <p className="font-semibold" style={{ color: '#10B981' }}>
                          {stat.present_count || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm opacity-70">Absent</p>
                        <p className="font-semibold" style={{ color: '#EF4444' }}>
                          {stat.absent_count || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm opacity-70">Rate</p>
                        <p className="font-semibold">
                          {stat.attendance_percentage?.toFixed(1) || 0}%
                        </p>
                      </div>
                      {expandedUser === stat.user_id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Attendance Records */}
                {expandedUser === stat.user_id && (
                  <div
                    className="mt-2 rounded-lg p-4"
                    style={{ backgroundColor: '#374151' }}
                  >
                    <h3 className="mb-3 font-semibold">Attendance Records</h3>
                    <div className="space-y-2">
                      {getUserAttendanceRecords(stat.user_id).map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between rounded p-3"
                          style={{ backgroundColor: '#1F2937' }}
                        >
                          {editingId === record.id ? (
                            <>
                              <div className="flex flex-1 items-center gap-4">
                                <div>
                                  <p className="text-sm">
                                    {formatDate(
                                      record.calls?.created_at || record.created_at
                                    )}
                                  </p>
                                </div>
                                <select
                                  value={editStatus}
                                  onChange={(e) =>
                                    setEditStatus(
                                      e.target.value as 'present' | 'absent' | 'late'
                                    )
                                  }
                                  className="rounded px-3 py-1"
                                  style={{
                                    backgroundColor: '#292F36',
                                    color: '#FAF5F1',
                                  }}
                                >
                                  <option value="present">Present</option>
                                  <option value="absent">Absent</option>
                                  <option value="late">Late</option>
                                </select>
                                <input
                                  type="text"
                                  placeholder="Notes..."
                                  value={editNotes}
                                  onChange={(e) => setEditNotes(e.target.value)}
                                  className="flex-1 rounded px-3 py-1"
                                  style={{
                                    backgroundColor: '#292F36',
                                    color: '#FAF5F1',
                                  }}
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSave(record.id)}
                                  className="rounded px-3 py-1"
                                  style={{
                                    backgroundColor: '#10B981',
                                    color: '#FFFFFF',
                                  }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="rounded px-3 py-1"
                                  style={{
                                    backgroundColor: '#6B7280',
                                    color: '#FFFFFF',
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex flex-1 items-center gap-4">
                                <div>
                                  <p className="text-sm">
                                    {formatDate(
                                      record.calls?.created_at || record.created_at
                                    )}
                                  </p>
                                  <p className="text-xs opacity-70">
                                    {record.joined_at
                                      ? formatTime(record.joined_at)
                                      : 'N/A'}
                                  </p>
                                </div>
                                <span style={getStatusBadgeStyle(record.status)}>
                                  {record.status}
                                </span>
                                <p className="text-sm">
                                  {formatDuration(record.duration_minutes)}
                                </p>
                                {record.notes && (
                                  <p className="text-sm opacity-70">{record.notes}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(record)}
                                  className="rounded p-2 transition-colors"
                                  style={{ backgroundColor: '#3B82F6' }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(record.id)}
                                  className="rounded p-2 transition-colors"
                                  style={{ backgroundColor: '#EF4444' }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      {getUserAttendanceRecords(stat.user_id).length === 0 && (
                        <p className="text-center text-sm opacity-70">
                          No attendance records
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminAttendancePage;
