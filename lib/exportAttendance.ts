import * as XLSX from 'xlsx';

export interface AttendanceExportData {
  id: number;
  call_id: string;
  user_id: string;
  username?: string;
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
  meeting?: {
    title: string;
  };
}

export const exportToCSV = (data: AttendanceExportData[], filename: string) => {
  // Prepare data for export
  const exportData = data.map((record) => ({
    'Meeting Title': record.meeting?.title || 'N/A',
    'User Name': record.username || record.users?.username || 'Unknown',
    'Email': record.users?.email || 'N/A',
    'Status': record.status,
    'Joined At': record.joined_at
      ? new Date(record.joined_at).toLocaleString('en-US')
      : 'N/A',
    'Left At': record.left_at
      ? new Date(record.left_at).toLocaleString('en-US')
      : 'N/A',
    'Duration (minutes)': record.duration_minutes || 0,
    'Notes': record.notes || '',
    'Date': new Date(record.created_at).toLocaleDateString('en-US'),
  }));

  // Convert to CSV
  const headers = Object.keys(exportData[0] || {});
  const csvContent = [
    headers.join(','),
    ...exportData.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof typeof row];
          // Escape commas and quotes in values
          const stringValue = String(value || '');
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',')
    ),
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToXLSX = (data: AttendanceExportData[], filename: string) => {
  // Prepare data for export
  const exportData = data.map((record) => ({
    'Meeting Title': record.meeting?.title || 'N/A',
    'User Name': record.username || record.users?.username || 'Unknown',
    'Email': record.users?.email || 'N/A',
    'Status': record.status,
    'Joined At': record.joined_at
      ? new Date(record.joined_at).toLocaleString('en-US')
      : 'N/A',
    'Left At': record.left_at
      ? new Date(record.left_at).toLocaleString('en-US')
      : 'N/A',
    'Duration (minutes)': record.duration_minutes || 0,
    'Notes': record.notes || '',
    'Date': new Date(record.created_at).toLocaleDateString('en-US'),
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const colWidths = [
    { wch: 30 }, // Meeting Title
    { wch: 20 }, // User Name
    { wch: 30 }, // Email
    { wch: 10 }, // Status
    { wch: 20 }, // Joined At
    { wch: 20 }, // Left At
    { wch: 15 }, // Duration
    { wch: 30 }, // Notes
    { wch: 15 }, // Date
  ];
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

  // Save file
  XLSX.writeFile(wb, filename);
};
