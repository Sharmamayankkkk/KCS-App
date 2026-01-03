# Quick Fix Guide: Scheduled Meetings Not Working

## Problem
- Meetings not appearing on home screen
- "Failed to save meeting metadata" error
- Database shows "failed" status
- Cannot create or retrieve meetings

## Solution (5 Minutes)

### Step 1: Run the Migration SQL

1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `migrations/complete_meetings_setup.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Setup completed successfully!" in the results

### Step 2: Verify Environment Variables

Check your `.env.local` file has these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from:
- Supabase Dashboard → Settings → API
- Copy "Project URL" and "anon/public" key

### Step 3: Check Row Level Security (RLS)

In Supabase Dashboard → Table Editor → meetings table:

**Option A: Disable RLS (Quick Fix for Testing)**
```sql
ALTER TABLE public.meetings DISABLE ROW LEVEL SECURITY;
```

**Option B: Enable with Proper Policies (Recommended for Production)**
```sql
-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active meetings
CREATE POLICY "Anyone can view active meetings"
ON public.meetings FOR SELECT
USING (is_active = true);

-- Allow service role to insert (for API)
CREATE POLICY "Service role can insert meetings"
ON public.meetings FOR INSERT
WITH CHECK (true);

-- Allow service role to update (for API)
CREATE POLICY "Service role can update meetings"
ON public.meetings FOR UPDATE
USING (true)
WITH CHECK (true);
```

### Step 4: Restart Your Application

```bash
# Stop the dev server (Ctrl+C)
npm run dev
```

### Step 5: Test

1. Go to your application homepage
2. Click "Schedule Meeting" (must be admin)
3. Fill in title, description, and date/time
4. Click "Schedule Meeting"
5. Meeting should appear in "Scheduled Meetings" section

---

## Still Not Working?

### Test 1: Check if Database is Accessible

Open Supabase SQL Editor and run:
```sql
SELECT * FROM public.meetings ORDER BY created_at DESC LIMIT 5;
```

- **If you get results**: Database is working, check API/environment variables
- **If you get an error**: Run `complete_meetings_setup.sql` again

### Test 2: Check if API is Working

Open browser console (F12) → Network tab, then try to create a meeting.

Look for the `/api/meetings` POST request:
- **Status 200**: Meeting saved successfully
- **Status 400**: Missing required fields (check what you're sending)
- **Status 500**: Server error (check backend logs)

### Test 3: Check Backend Logs

In your terminal where you ran `npm run dev`, look for error messages:
```
Error saving meeting metadata: { ... }
```

Common errors:
- `column "is_active" does not exist` → Run `complete_meetings_setup.sql`
- `sequence "meetings_id_seq" does not exist` → Run `complete_meetings_setup.sql`
- `permission denied` → Check RLS policies (see Step 3)
- `relation "meetings" does not exist` → Run `database.sql` first, then `complete_meetings_setup.sql`

### Test 4: Manual Database Test

Try inserting a test meeting directly in Supabase SQL Editor:

```sql
INSERT INTO public.meetings (call_id, title, description, start_time, is_active, is_private)
VALUES (
  'test-' || extract(epoch from now())::text,
  'Test Meeting',
  'This is a test',
  now() + interval '1 hour',
  true,
  false
)
RETURNING *;
```

- **If this works**: API or environment variable issue
- **If this fails**: Schema issue, run `complete_meetings_setup.sql`

---

## Understanding the Error

The issue occurs because:

1. **Missing Columns**: The app code expects `is_active`, `is_private`, and `end_time` columns
2. **Missing Sequences**: The database needs `meetings_id_seq` to generate IDs
3. **Schema Mismatch**: Database was created with old schema, app expects new schema

The `complete_meetings_setup.sql` migration fixes all these issues safely without losing data.

---

## Prevention

For future deployments:

1. Always run `complete_meetings_setup.sql` after setting up database
2. Keep environment variables properly configured
3. Document any RLS policies you add
4. Test meeting creation in development before deploying

---

## Need More Help?

Check these files for detailed information:
- `migrations/README.md` - Complete migration guide
- `migrations/complete_meetings_setup.sql` - The fix script with comments
- `scheduled_meetings.sql` - Example queries for working with meetings

Common issues and solutions:
| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| "Failed to save meeting metadata" | Missing columns | Run `complete_meetings_setup.sql` |
| Meetings not showing on homepage | RLS blocking reads | Check RLS policies |
| "Permission denied" errors | RLS too restrictive | Add appropriate policies |
| No error but meeting not saved | Wrong Supabase project | Check environment variables |
| "Sequence does not exist" | Missing sequences | Run `complete_meetings_setup.sql` |
