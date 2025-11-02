
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Calendar,
  TrendingUp,
  Edit2,
  Trash2,
  Search,
  Save,
  XCircle,
  BookOpen,
} from 'lucide-react';
import {
  getAllUsersAttendanceStats,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
  isUserAdmin,
} from '@/actions/attendance.actions';
import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';

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
  username?: string; // Use the username directly from the attendance record
  status: 'present' | 'absent' | 'late';
  joined_at?: string;
  left_at?: string;
  duration_minutes?: number;
  notes?: string;
  created_at: string;
  users?: { // This may be undefined due to schema cache issues, so we rely on the top-level username
    id: string;
    username: string;
    email: string;
  };
  meeting?: {
    title: string;
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
          getAllAttendance(500, 0),
        ]);

        if (statsResult.success) setStats(statsResult.data || []);
        else setError(statsResult.error || 'Failed to fetch statistics');

        if (attendanceResult.success) setAllAttendance(attendanceResult.data || []);
        else setError((prev) => `${prev ? `${prev}, ` : ''}${attendanceResult.error || 'Failed to fetch records'}`);

      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) checkAdminAndFetchData();
  }, [user, isLoaded]);

  const handleEdit = (record: AttendanceRecord) => {
    setEditingId(record.id);
    setEditStatus(record.status);
    setEditNotes(record.notes || '');
  };

  const handleCancel = () => setEditingId(null);

  const handleSave = async (id: number) => {
    const result = await updateAttendance(id, { status: editStatus, notes: editNotes });
    if (result.success && result.data) {
      setAllAttendance((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: result.data!.status, notes: result.data!.notes } : r)
      );
      setEditingId(null);
    } else {
      alert('Failed to update: ' + result.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      const result = await deleteAttendance(id);
      if (result.success) setAllAttendance((prev) => prev.filter((r) => r.id !== id));
      else alert('Failed to delete: ' + result.error);
    }
  };

  const filteredAttendance = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    return allAttendance.filter(record => {
      return (
        record.username?.toLowerCase().includes(lowerCaseSearch) ||
        record.users?.email?.toLowerCase().includes(lowerCaseSearch) || // Email might not be available
        record.call_id.toLowerCase().includes(lowerCaseSearch) ||
        record.meeting?.title?.toLowerCase().includes(lowerCaseSearch) ||
        record.status.toLowerCase().includes(lowerCaseSearch)
      );
    });
  }, [allAttendance, searchTerm]);

  const groupedAttendance = useMemo(() => {
    const groups: { [key: string]: AttendanceRecord[] } = {};
    filteredAttendance.forEach(record => {
      const recordDate = new Date(record.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey: string;
      if (recordDate.toDateString() === today.toDateString()) dateKey = 'Today';
      else if (recordDate.toDateString() === yesterday.toDateString()) dateKey = 'Yesterday';
      else dateKey = recordDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(record);
    });
    return groups;
  }, [filteredAttendance]);

  // Formatting helpers
  const formatDate = (ds?: string) => ds ? new Date(ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';
  const formatTime = (ds?: string) => ds ? new Date(ds).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const formatDuration = (m?: number) => {
    if (m === undefined || m === null) return 'N/A';
    if (m < 1) return '< 1m';
    const h = Math.floor(m / 60);
    const mins = Math.round(m % 60);
    return h > 0 ? `${h}h ${mins}m` : `${mins}m`;
  };

  if (!isLoaded || loading) return <Loader />;
  if (!user || !isAdmin) return <div className="flex h-full items-center justify-center text-xl text-[#292F36]">Access Denied.</div>;

  return (
    <section className="flex size-full flex-col gap-6">
      <h1 className="text-3xl font-bold" style={{ color: '#292F36' }}>Admin Attendance Management</h1>
      {error && <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(164, 31, 19, 0.1)', color: '#A41F13' }}>{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard icon={<Calendar />} label="Total Records" value={allAttendance.length} />
        <StatCard icon={<TrendingUp />} label="Avg. Attendance" value={`${stats.length > 0 ? (stats.reduce((s, c) => s + (c.attendance_percentage || 0), 0) / stats.length).toFixed(1) : 0}%`} />
      </div>

      <div className="rounded-lg p-6" style={{ backgroundColor: '#292F36', color: '#FAF5F1' }}>
        <div className="flex items-center gap-2 rounded-lg p-4 mb-4" style={{ backgroundColor: '#1F2937'}}>
            <Search className="h-5 w-5 opacity-70" />
            <input
                type="text"
                placeholder="Search by user, email, meeting, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent outline-none placeholder:opacity-50"
            />
        </div>

        <div className="overflow-x-auto">
          {Object.keys(groupedAttendance).length === 0 ? (
            <p className="text-center py-8 opacity-70">No records found for your search.</p>
          ) : (
            Object.entries(groupedAttendance).map(([date, records]) => (
              <div key={date} className="mb-8">
                <h3 className="text-xl font-semibold mb-4" style={{ color: '#FAF5F1' }}>{date}</h3>
                <table className="w-full text-left">
                  <thead className="border-b border-gray-600">
                    <tr style={{ color: '#B0A8A3' }}>
                      <th className="p-3 font-semibold">User</th>
                      <th className="p-3 font-semibold">Meeting Info</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Notes</th>
                      <th className="p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                        {editingId === record.id ? (
                          <EditableRow record={record} onSave={handleSave} onCancel={handleCancel} editStatus={editStatus} setEditStatus={setEditStatus} editNotes={editNotes} setEditNotes={setEditNotes} />
                        ) : (
                          <DisplayRow record={record} onEdit={handleEdit} onDelete={handleDelete} formatters={{ formatDate, formatTime, formatDuration }} />
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <div className="rounded-lg p-6 flex items-center gap-4" style={{ backgroundColor: '#292F36', color: '#FAF5F1' }}>
        <div className="text-red-500">{icon}</div>
        <div>
            <p className="text-sm opacity-80">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const DisplayRow = ({ record, onEdit, onDelete, formatters }: any) => (
    <>
        <td className="p-3">
            <p className="font-semibold" style={{ color: '#FAF5F1' }}>{record.username || 'Unknown User'}</p>
            {record.users?.email && <p className="text-sm" style={{ color: '#B0A8A3' }}>{record.users.email}</p>}
        </td>
        <td className="p-3 text-sm" style={{ color: '#E0DBD8' }}>
            <p className="font-semibold flex items-center gap-1.5" style={{ color: '#FAF5F1' }}>
              <BookOpen className="h-4 w-4 opacity-80" />
              {record.meeting?.title || 'Meeting'}
            </p>
            <p><strong style={{ color: '#B0A8A3' }}>Joined:</strong> {formatters.formatTime(record.joined_at)}</p>
            <p><strong style={{ color: '#B0A8A3' }}>Duration:</strong> {formatters.formatDuration(record.duration_minutes)}</p>
        </td>
        <td className="p-3">
            <span 
              style={{ 
                color: '#FFFFFF',
                backgroundColor: record.status === 'present' ? '#8F7A6E' : record.status === 'late' ? '#A41F13' : '#7A1610'
              }} 
              className="px-3 py-1 text-sm font-semibold rounded-full capitalize"
            >
                {record.status}
            </span>
        </td>
        <td className="p-3 text-sm max-w-xs truncate" style={{ color: '#E0DBD8' }}>{record.notes || '-'}</td >
        <td className="p-3">
            <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => onEdit(record)}><Edit2 className="h-4 w-4" /></Button>
                <Button variant="destructive" size="icon" onClick={() => onDelete(record.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
        </td>
    </>
);

const EditableRow = ({ record, onSave, onCancel, editStatus, setEditStatus, editNotes, setEditNotes }: any) => (
    <>
        <td className="p-3">
            <p className="font-semibold" style={{ color: '#FAF5F1' }}>{record.username || 'Unknown User'}</p>
        </td>
        <td colSpan={2} className="p-3">
            <div className='flex gap-2'>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="rounded bg-gray-700 px-2 py-1" style={{ color: '#FAF5F1' }}>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                </select>
            </div>
        </td>
        <td className="p-3">
            <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Edit notes..." className="w-full rounded bg-gray-700 px-2 py-1" style={{ color: '#FAF5F1' }}/>
        </td>
        <td className="p-3">
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => onSave(record.id)}><Save className="h-4 w-4 text-green-500" /></Button>
                <Button variant="ghost" size="icon" onClick={onCancel}><XCircle className="h-4 w-4 text-red-500" /></Button>
            </div>
        </td>
    </>
);

export default AdminAttendancePage;
