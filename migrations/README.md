# Database Migrations Guide

This folder contains SQL migration files to set up and fix the database schema for the KCS-App.

## Quick Fix for Scheduled Meetings Issue

If you're experiencing issues with scheduled meetings not being saved or displayed:

### Solution: Run `complete_meetings_setup.sql`

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy the contents of `complete_meetings_setup.sql`
4. Paste and execute it
5. Restart your Next.js application

This file will:
- ✅ Create all necessary sequences
- ✅ Ensure the meetings table exists with the correct schema
- ✅ Add any missing columns (is_active, is_private, end_time)
- ✅ Create required indexes for performance
- ✅ Preserve all existing data
- ✅ Display verification output

**This script is safe to run multiple times** - it won't duplicate data or cause errors if run repeatedly.

---

## Migration Files

### `complete_meetings_setup.sql` ⭐ **RECOMMENDED**
**Purpose:** Complete setup/repair script for the meetings table and scheduled meetings functionality.

**When to use:**
- First time setup
- Fixing "Failed to save meeting metadata" errors
- Meetings not appearing on home screen
- After database schema issues

**What it fixes:**
- Missing sequences (meetings_id_seq, etc.)
- Missing columns (is_active, is_private, end_time)
- Missing indexes
- Incorrect default values

### `fix_meetings_schema.sql`
**Purpose:** Lightweight migration focused on adding missing columns.

**When to use:**
- If you already have the meetings table but missing the visibility/privacy columns
- As a targeted fix after verifying the sequence exists

### `add_meeting_visibility_columns.sql`
**Purpose:** Original migration to add is_active, is_private, and end_time columns.

**When to use:**
- Legacy migration, superseded by `complete_meetings_setup.sql`
- For reference only

---

## Understanding the Issue

### Root Cause
The application requires these columns in the `meetings` table:
- `is_active` - Controls if meeting is visible on home page
- `is_private` - Controls if meeting is public or invite-only
- `end_time` - Records when meeting ended

These columns were added in a later update, so databases created from an earlier version may not have them.

Additionally, the `database.sql` file references sequences (like `meetings_id_seq`) that weren't explicitly created, causing INSERT operations to fail.

### The Fix
The `complete_meetings_setup.sql` migration:
1. Creates all necessary sequences
2. Ensures the table exists with all columns
3. Adds missing columns to existing tables
4. Sets proper defaults
5. Creates performance indexes

---

## Execution Order (for new setups)

If you're setting up a fresh database:

1. **First**: Run `database.sql` (core schema)
2. **Then**: Run `complete_meetings_setup.sql` (fixes meetings table)
3. **Optional**: Run any other migrations as needed

---

## Verification

After running the migration, verify it worked:

```sql
-- Check that all columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'meetings'
ORDER BY ordinal_position;
```

You should see all these columns:
- id
- call_id
- title
- description
- start_time
- created_at
- updated_at
- is_active
- is_private
- end_time

---

## Troubleshooting

### Still seeing errors after running migration?

1. **Check Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your anon/public API key

2. **Check Row Level Security (RLS)**
   
   If RLS is enabled, ensure you have proper policies. To test, temporarily disable RLS:
   ```sql
   ALTER TABLE public.meetings DISABLE ROW LEVEL SECURITY;
   ```
   
   For production, create appropriate RLS policies:
   ```sql
   -- Allow everyone to read active meetings
   CREATE POLICY "Public meetings are viewable by everyone"
   ON public.meetings FOR SELECT
   USING (is_active = true);
   
   -- Allow authenticated users to create meetings
   CREATE POLICY "Authenticated users can create meetings"
   ON public.meetings FOR INSERT
   TO authenticated
   WITH CHECK (true);
   ```

3. **Check API Connection**
   
   Test the API endpoint:
   ```bash
   curl http://localhost:3000/api/meetings
   ```
   
   Should return: `{"meetings": [...]}`

4. **Check Browser Console**
   
   Open DevTools (F12) and look for:
   - Network errors when fetching/creating meetings
   - Console errors with stack traces

5. **Restart Your Application**
   
   After database changes, always restart:
   ```bash
   npm run dev
   ```

---

## Database.sql vs Migrations

**database.sql**: 
- Contains the base schema for reference
- Not meant to be run directly on existing databases
- May not be fully executable without modifications

**Migrations**: 
- Safe to run on existing databases
- Idempotent (can run multiple times)
- Designed to fix specific issues
- Recommended for updates and fixes

---

## Need Help?

If you're still experiencing issues:

1. Check the application logs for specific error messages
2. Verify your Supabase project is active and accessible
3. Ensure your API keys are correct in `.env.local`
4. Check the Supabase dashboard for any table/policy issues

Common error messages and solutions:

| Error Message | Solution |
|---------------|----------|
| "Failed to save meeting metadata" | Run `complete_meetings_setup.sql` |
| "column does not exist" | Run `complete_meetings_setup.sql` |
| "sequence does not exist" | Run `complete_meetings_setup.sql` |
| "permission denied" | Check RLS policies or disable RLS |
| "relation does not exist" | Run `database.sql` then `complete_meetings_setup.sql` |

---

## Contributing

When creating new migrations:
- Make them idempotent (safe to run multiple times)
- Use `IF NOT EXISTS` and `IF EXISTS` clauses
- Document what the migration does
- Test on a fresh database AND an existing database
- Don't modify existing migration files - create new ones
