-- Complete Database Setup for Scheduled Meetings
-- ================================================
-- This file provides a complete, executable SQL script to set up the meetings table
-- and all related dependencies from scratch or to fix existing setups.
--
-- WHEN TO USE THIS FILE:
-- 1. If you're getting "Failed to save meeting metadata" errors
-- 2. If meetings are not appearing on the home screen
-- 3. If you see database errors related to sequences or missing columns
-- 4. When setting up a fresh database for the application
--
-- HOW TO USE:
-- 1. Execute this entire file in your Supabase SQL Editor
-- 2. The script is idempotent - safe to run multiple times
-- 3. Existing data will be preserved
--
-- WHAT THIS FIXES:
-- - Creates all necessary sequences
-- - Ensures meetings table exists with correct schema
-- - Adds missing columns (is_active, is_private, end_time)
-- - Creates required indexes for performance
-- - Sets up proper defaults
-- ================================================

-- ============================================
-- PART 1: Create Sequences
-- ============================================

-- Create the sequence for meetings table ID
CREATE SEQUENCE IF NOT EXISTS public.meetings_id_seq;

-- Create sequences for other tables that depend on meetings
CREATE SEQUENCE IF NOT EXISTS public.attendance_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.participants_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.superchats_id_seq;

-- ============================================
-- PART 2: Create or Update Meetings Table
-- ============================================

-- Create the meetings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'meetings') THEN
    CREATE TABLE public.meetings (
      id integer NOT NULL DEFAULT nextval('meetings_id_seq'::regclass),
      call_id text NOT NULL,
      title text NOT NULL,
      description text,
      start_time timestamp with time zone NOT NULL,
      created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
      is_active boolean DEFAULT true,
      is_private boolean DEFAULT false,
      end_time timestamp with time zone,
      CONSTRAINT meetings_pkey PRIMARY KEY (id),
      CONSTRAINT meetings_call_id_key UNIQUE (call_id)
    );
    
    -- Set the sequence owner so it's deleted when table is dropped
    ALTER SEQUENCE public.meetings_id_seq OWNED BY public.meetings.id;
    
    RAISE NOTICE 'Created meetings table successfully';
  ELSE
    RAISE NOTICE 'Meetings table already exists, will add missing columns if any';
  END IF;
END $$;

-- ============================================
-- PART 3: Add Missing Columns
-- ============================================

-- Add is_active column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'meetings' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.meetings ADD COLUMN is_active boolean DEFAULT true;
    RAISE NOTICE 'Added is_active column';
  ELSE
    RAISE NOTICE 'is_active column already exists';
  END IF;
END $$;

-- Add is_private column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'meetings' 
    AND column_name = 'is_private'
  ) THEN
    ALTER TABLE public.meetings ADD COLUMN is_private boolean DEFAULT false;
    RAISE NOTICE 'Added is_private column';
  ELSE
    RAISE NOTICE 'is_private column already exists';
  END IF;
END $$;

-- Add end_time column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'meetings' 
    AND column_name = 'end_time'
  ) THEN
    ALTER TABLE public.meetings ADD COLUMN end_time timestamp with time zone;
    RAISE NOTICE 'Added end_time column';
  ELSE
    RAISE NOTICE 'end_time column already exists';
  END IF;
END $$;

-- ============================================
-- PART 4: Update Existing Data
-- ============================================

-- Set default values for any existing rows with NULL values
UPDATE public.meetings 
SET is_active = true 
WHERE is_active IS NULL;

UPDATE public.meetings 
SET is_private = false 
WHERE is_private IS NULL;

-- ============================================
-- PART 5: Create Indexes
-- ============================================

-- Index on start_time for faster time-based queries
CREATE INDEX IF NOT EXISTS idx_meetings_start_time 
ON public.meetings(start_time);

-- Index on is_active for filtering active/inactive meetings
CREATE INDEX IF NOT EXISTS idx_meetings_is_active 
ON public.meetings(is_active);

-- Index on is_private for filtering public/private meetings
CREATE INDEX IF NOT EXISTS idx_meetings_is_private 
ON public.meetings(is_private);

-- Ensure unique index on call_id exists
CREATE UNIQUE INDEX IF NOT EXISTS idx_meetings_call_id 
ON public.meetings(call_id);

-- Composite index for common query pattern (active meetings by time)
CREATE INDEX IF NOT EXISTS idx_meetings_active_start_time 
ON public.meetings(is_active, start_time);

-- ============================================
-- PART 6: Add Documentation
-- ============================================

-- Add helpful comments to columns
COMMENT ON TABLE public.meetings IS 
'Stores scheduled meeting metadata. Each meeting has a unique call_id used to identify and join the meeting via Stream Video SDK.';

COMMENT ON COLUMN public.meetings.id IS 
'Primary key, auto-generated integer ID';

COMMENT ON COLUMN public.meetings.call_id IS 
'Unique identifier for the meeting, used by Stream Video SDK to join the call';

COMMENT ON COLUMN public.meetings.title IS 
'Display name of the meeting shown to users';

COMMENT ON COLUMN public.meetings.description IS 
'Optional meeting description providing additional context';

COMMENT ON COLUMN public.meetings.start_time IS 
'Scheduled start time of the meeting in UTC';

COMMENT ON COLUMN public.meetings.is_active IS 
'Controls whether the meeting is visible on the home page. Admins can toggle this to hide completed or cancelled meetings.';

COMMENT ON COLUMN public.meetings.is_private IS 
'Controls whether the meeting is private (invite-only) or public. Private meetings are only accessible via direct link.';

COMMENT ON COLUMN public.meetings.end_time IS 
'Timestamp when the meeting actually ended. Can be set manually by admins or automatically when the last participant leaves.';

COMMENT ON COLUMN public.meetings.created_at IS 
'Timestamp when the meeting record was created';

COMMENT ON COLUMN public.meetings.updated_at IS 
'Timestamp when the meeting record was last updated';

-- ============================================
-- PART 7: Verification
-- ============================================

-- Display the final schema for verification
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '=================================';
  RAISE NOTICE 'Meetings Table Schema:';
  RAISE NOTICE '=================================';
  
  FOR rec IN 
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'meetings'
    ORDER BY ordinal_position
  LOOP
    RAISE NOTICE 'Column: % | Type: % | Nullable: % | Default: %', 
      rec.column_name, rec.data_type, rec.is_nullable, rec.column_default;
  END LOOP;
  
  RAISE NOTICE '=================================';
  RAISE NOTICE 'Setup completed successfully!';
  RAISE NOTICE '=================================';
END $$;

-- ============================================
-- PART 8: Optional - Create Helper View
-- ============================================

-- Create a view for upcoming meetings (used by the application)
CREATE OR REPLACE VIEW public.upcoming_meetings AS
SELECT 
  id,
  call_id,
  title,
  description,
  start_time,
  created_at,
  is_active,
  is_private,
  end_time,
  CASE 
    WHEN start_time > NOW() THEN 'upcoming'
    WHEN start_time <= NOW() AND start_time >= (NOW() - INTERVAL '2 hours') THEN 'live'
    ELSE 'ended'
  END as status
FROM public.meetings
WHERE is_active = true 
  AND start_time >= (NOW() - INTERVAL '24 hours')
ORDER BY start_time ASC;

COMMENT ON VIEW public.upcoming_meetings IS 
'View showing active meetings from the last 24 hours with computed status field';

-- ============================================
-- TROUBLESHOOTING NOTES
-- ============================================
-- 
-- If you still have issues after running this script:
--
-- 1. Check Environment Variables:
--    - NEXT_PUBLIC_SUPABASE_URL should point to your Supabase project
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY should be your anon/public key
--
-- 2. Check RLS (Row Level Security):
--    If RLS is enabled on the meetings table, you need policies that allow:
--    - INSERT for authenticated users (or service role)
--    - SELECT for all users (or authenticated users)
--    - UPDATE for admins (if using admin features)
--
--    Example to disable RLS for testing:
--    ALTER TABLE public.meetings DISABLE ROW LEVEL SECURITY;
--
-- 3. Check API Logs:
--    Look at your Next.js console for any errors from /api/meetings
--
-- 4. Verify Supabase Connection:
--    Test if you can query the table from Supabase SQL editor:
--    SELECT * FROM public.meetings LIMIT 5;
--
-- 5. Check Browser Console:
--    Open browser DevTools and check for any network errors
--    when creating or fetching meetings
--
-- ============================================
