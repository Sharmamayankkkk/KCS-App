# Admin Features Guide

This document describes the admin-specific features available in the KCS Meet application.

## Verified Badge

Admin users are automatically marked with a verified badge to distinguish them from regular users. The verified badge appears in the following locations:

1. **Navbar**: Next to the user profile button in the top navigation bar
2. **Mobile Navigation**: In the mobile menu next to the user profile
3. **Video Tiles**: During meetings, admin participants have a verified badge next to their name
4. **Chat Panel**: Admin messages in the chat show a verified badge next to the sender's name

### How Verified Status is Determined

User verification is based on email addresses listed in the `NEXT_PUBLIC_ADMIN_EMAILS` environment variable. Add admin email addresses as a comma-separated list:

```
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com
```

## Meeting Visibility Controls

Admins have enhanced controls over meeting visibility on the home page.

### Meeting Active Status

Each meeting has an `is_active` flag that controls whether it appears on the home page:

- **Active meetings**: Visible to all users on the home page
- **Inactive meetings**: Hidden from the home page but still accessible via direct link

#### How to Toggle Meeting Visibility

1. Navigate to the home page
2. Find the scheduled meeting you want to manage
3. Click the eye icon (👁️) to hide the meeting, or the crossed-eye icon (👁️‍🗨️) to show it
4. The change is immediate and all users will see the updated list

**Use cases for hiding meetings:**
- Mark completed meetings as inactive
- Hide cancelled meetings
- Temporarily hide meetings that are being rescheduled

### Meeting Privacy Settings

Each meeting can be set as either **Public** or **Private**:

- **Public meetings**: Anyone can join (default)
- **Private meetings**: Only accessible via direct link (invite-only)

#### How to Set Meeting Privacy

**When creating a meeting:**
1. Open the "New Meeting" or "Schedule Meeting" dialog
2. Check the "Make this meeting private (invite-only)" checkbox
3. Create the meeting

**For existing meetings:**
1. Navigate to the home page
2. Find the scheduled meeting you want to manage
3. Click the lock icon (🔒) to make it private, or the globe icon (🌐) to make it public
4. The change is immediate

**Use cases for private meetings:**
- Executive meetings
- One-on-one sessions
- Sensitive discussions
- Limited attendance events

## Database Schema

The meetings table includes these visibility-related columns:

```sql
is_active boolean DEFAULT true     -- Controls home page visibility
is_private boolean DEFAULT false   -- Controls if meeting is invite-only
end_time timestamp                 -- Optional: when the meeting ended
```

## API Endpoints

### Create Meeting (POST /api/meetings)

```json
{
  "call_id": "unique-meeting-id",
  "title": "Meeting Title",
  "description": "Meeting description",
  "start_time": "2024-01-01T10:00:00Z",
  "is_private": false
}
```

### Update Meeting (PATCH /api/meetings)

```json
{
  "call_id": "unique-meeting-id",
  "is_active": true,
  "is_private": false,
  "end_time": "2024-01-01T11:00:00Z"
}
```

### Get Meetings (GET /api/meetings)

Returns only active meetings by default. Meetings are filtered by:
- `is_active = true`
- `start_time >= now - 24 hours`

## Migration

To enable these features in your database, run the migration script:

```sql
-- Run this in your Supabase SQL editor or database client
-- File: migrations/add_meeting_visibility_columns.sql

ALTER TABLE public.meetings 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

ALTER TABLE public.meetings 
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;

ALTER TABLE public.meetings 
ADD COLUMN IF NOT EXISTS end_time timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_meetings_is_active ON public.meetings(is_active);
CREATE INDEX IF NOT EXISTS idx_meetings_is_private ON public.meetings(is_private);
```

## Troubleshooting

### Verified badge not showing

1. Check that the user's email is listed in `NEXT_PUBLIC_ADMIN_EMAILS`
2. Ensure the environment variable is properly set and the app has been restarted
3. Verify that the verified.png image exists in `/public/images/verified.png`

### Meeting visibility controls not appearing

1. Confirm you're logged in as an admin user
2. Check that the database migration has been applied
3. Verify the API endpoints are returning the new fields

### Meetings not appearing on home page

1. Check if the meeting's `is_active` flag is set to `true`
2. Verify the meeting's `start_time` is within the last 24 hours or in the future
3. Check the browser console for any API errors
