# Attendance System Documentation

## Overview

The KCS-App attendance system provides comprehensive attendance tracking for all meetings conducted on the platform. It automatically tracks when users join and leave meetings, and provides detailed statistics and management capabilities.

## Features

### For Regular Users
- **View Personal Attendance**: Users can view their own attendance records
- **Attendance Statistics**: See total meetings, present/absent/late counts, and attendance percentage
- **Attendance History**: View detailed history with dates, times, and duration
- **Visual Graphs**: Progress bars showing attendance distribution

### For Admins
- **View All Users**: See attendance statistics for all users in the system
- **Manage Attendance**: Edit attendance status (present/absent/late) and add notes
- **Delete Records**: Remove incorrect or duplicate attendance entries
- **Search Functionality**: Search users by username or email
- **Detailed Views**: Expand user rows to see all their attendance records

## Database Setup

### Step 1: Run the SQL Schema

The complete SQL schema is stored in `attendance.sql` at the root of the project. To set up the attendance system in your Supabase database:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `attendance.sql`
4. Run the SQL script

The script will create:
- `attendance` table with all necessary columns and indexes
- Automatic duration calculation trigger
- `user_attendance_stats` view for easy statistics queries
- `call_attendance_stats` view for meeting-level statistics
- Row Level Security (RLS) policies

### Step 2: Enable Realtime (Optional)

If you want real-time updates for attendance records, run this in the Supabase SQL editor:

```sql
alter publication supabase_realtime add table attendance;
```

### Step 3: Configure Admin Access

Admins are identified by their email addresses. Add admin emails to your environment variables:

```env
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com
```

Multiple emails can be added, separated by commas.

## Database Schema

### Attendance Table

```sql
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    call_id TEXT NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 0,
    marked_by TEXT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(call_id, user_id)
);
```

### Key Features

- **Automatic Duration Calculation**: When `left_at` is set, the duration in minutes is automatically calculated
- **Foreign Key Constraints**: Ensures data integrity with calls and users tables
- **Unique Constraint**: One attendance record per user per call
- **Indexes**: Optimized queries on user_id, call_id, status, and created_at
- **Audit Trail**: Tracks who marked/modified attendance with `marked_by` field

## API/Actions Reference

All attendance actions are in `actions/attendance.actions.ts`. They are server-side actions that interact with Supabase.

### For All Users

#### `getUserAttendance(userId, limit, offset)`
Get attendance records for a specific user.
```typescript
const result = await getUserAttendance(userId, 50, 0);
if (result.success) {
  console.log(result.data);
}
```

#### `getUserAttendanceStats(userId)`
Get attendance statistics for a user (total meetings, percentage, etc.).
```typescript
const result = await getUserAttendanceStats(userId);
if (result.success) {
  console.log(result.data);
}
```

### For Admins Only

#### `getAllUsersAttendanceStats()`
Get attendance statistics for all users.
```typescript
const result = await getAllUsersAttendanceStats();
if (result.success && result.isAdmin) {
  console.log(result.data);
}
```

#### `getAllAttendance(limit, offset)`
Get all attendance records with user and call details.
```typescript
const result = await getAllAttendance(100, 0);
if (result.success && result.isAdmin) {
  console.log(result.data);
}
```

#### `updateAttendance(attendanceId, updates)`
Update an attendance record (admin only).
```typescript
const result = await updateAttendance(recordId, {
  status: 'present',
  notes: 'Arrived late but attended'
});
```

#### `deleteAttendance(attendanceId)`
Delete an attendance record (admin only).
```typescript
const result = await deleteAttendance(recordId);
```

### Automatic Tracking

#### `markAttendance(callId, userId, status, joinedAt)`
Automatically marks attendance when a user joins a meeting. This is called automatically in the MeetingRoom component.

#### `updateAttendanceOnLeave(callId, userId, leftAt)`
Updates the `left_at` timestamp when a user leaves. Also called automatically in MeetingRoom.

## User Interface

### Navigation

The sidebar now includes:
- **My Attendance** (for all users) - Route: `/attendance`
- **Manage Attendance** (for admins only) - Route: `/admin-attendance`

### My Attendance Page (`/attendance`)

Features:
1. **Statistics Cards**: Shows total meetings, attendance rate, present count, and total duration
2. **Visual Graphs**: Horizontal bar graphs showing distribution of present/absent/late
3. **Attendance History Table**: Detailed list with date, time, status, and duration

### Admin Attendance Page (`/admin-attendance`)

Features:
1. **Overview Cards**: Total users, total records, and average attendance
2. **Search Bar**: Filter users by username or email
3. **User Statistics Table**: Shows all users with their attendance metrics
4. **Expandable Rows**: Click on a user to see all their attendance records
5. **Edit Records**: Click edit button to change status or add notes
6. **Delete Records**: Remove incorrect entries

## Automatic Tracking

The attendance system automatically tracks user participation:

1. **On Join**: When a user joins a meeting, their attendance is automatically marked as "present"
2. **On Leave**: When a user leaves, the `left_at` timestamp is recorded
3. **Duration Calculation**: The system automatically calculates meeting duration in minutes

This is implemented in `components/MeetingRoom.tsx` using React hooks that trigger on:
- `CallingState.JOINED` - Marks attendance
- Component unmount - Updates leave time

## Usage Examples

### Example 1: View Your Attendance
1. Click "My Attendance" in the sidebar
2. View your statistics and attendance history
3. See your attendance percentage and graphs

### Example 2: Admin Managing Attendance
1. Click "Manage Attendance" in the sidebar (admins only)
2. Use the search bar to find a specific user
3. Click on a user to expand their attendance records
4. Click "Edit" to change status or add notes
5. Click "Save" to update the record

### Example 3: Correcting Incorrect Attendance
1. Admin navigates to "Manage Attendance"
2. Finds the user with incorrect record
3. Clicks "Edit" on the specific record
4. Changes status from "absent" to "present"
5. Adds note: "User confirmed attendance via email"
6. Clicks "Save"

## Customization

### Adding New Status Types

To add new attendance status types (e.g., "excused"):

1. Update the SQL constraint in `attendance.sql`:
```sql
status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused'))
```

2. Update TypeScript types in `actions/attendance.actions.ts`:
```typescript
status: 'present' | 'absent' | 'late' | 'excused';
```

3. Update UI components to handle the new status

### Customizing Status Colors

In the attendance pages, update the `getStatusColor` function:

```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'present':
      return '#10B981'; // Green
    case 'absent':
      return '#EF4444'; // Red
    case 'late':
      return '#F59E0B'; // Orange
    case 'excused':
      return '#3B82F6'; // Blue
    default:
      return '#6B7280'; // Gray
  }
};
```

## Security Considerations

1. **Row Level Security (RLS)**: Enabled on the attendance table
2. **Admin Checks**: All admin actions verify user permissions server-side
3. **User Isolation**: Users can only view their own attendance records
4. **Audit Trail**: All modifications are tracked with `marked_by` and `updated_at`

## Troubleshooting

### Issue: Attendance not being tracked automatically
- Check that the MeetingRoom component is being used
- Verify Supabase connection is working
- Check browser console for errors

### Issue: Admin can't see attendance management
- Verify email is in `NEXT_PUBLIC_ADMIN_EMAILS` environment variable
- Check that environment variable is properly formatted (comma-separated)
- Restart the development server after changing env variables

### Issue: Database queries failing
- Ensure `attendance.sql` has been run in Supabase
- Verify foreign key relationships with `users` and `calls` tables exist
- Check Supabase logs for specific error messages

### Issue: RLS policies blocking access
- Review RLS policies in Supabase dashboard
- Adjust policies based on your authentication setup
- The default policies may need modification for your auth system

## Future Enhancements

Potential improvements for the attendance system:

1. **Export Reports**: Download attendance data as CSV or PDF
2. **Email Notifications**: Notify users of low attendance
3. **Attendance Targets**: Set and track attendance goals
4. **Advanced Analytics**: Charts showing attendance trends over time
5. **Bulk Operations**: Mark attendance for multiple users at once
6. **Integration with Calendar**: Sync with external calendars
7. **Mobile Notifications**: Push notifications for upcoming meetings
8. **Attendance Certificates**: Generate attendance certificates for users

## Support

For issues or questions about the attendance system:
1. Check this documentation first
2. Review the code comments in the relevant files
3. Check Supabase logs for database-related issues
4. Contact the development team

## File Structure

```
/attendance.sql                                 # Database schema
/actions/attendance.actions.ts                  # Server actions for attendance
/app/(root)/(home)/attendance/page.tsx         # User attendance page
/app/(root)/(home)/admin-attendance/page.tsx   # Admin attendance page
/components/MeetingRoom.tsx                     # Automatic attendance tracking
/components/NavLinks.tsx                        # Navigation with attendance links
/constants/links.ts                             # Navigation link definitions
```

## License

This attendance system is part of the KCS-App project and follows the same license.
