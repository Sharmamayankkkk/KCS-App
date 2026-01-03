-- Migration: Fix Meetings Table Schema
-- This migration ensures the meetings table has all required columns for scheduled meetings functionality
-- Run this if you're experiencing issues with meetings not being saved or displayed
-- 
-- Issue: The scheduled meetings feature requires is_active, is_private, and end_time columns
-- which may not exist in databases created before these features were added.
-- Additionally, the table may be missing or have sequence issues.
--
-- This migration is safe to run multiple times (idempotent) and will:
-- 1. Create the sequence if it doesn't exist
-- 2. Ensure the meetings table exists with all required columns
-- 3. Add missing columns if they don't exist
-- 4. Create necessary indexes for performance
-- 5. Not affect existing data

-- ============================================
-- Step 1: Ensure sequence exists
-- ============================================
-- Create the sequence that the id column needs
CREATE SEQUENCE IF NOT EXISTS public.meetings_id_seq;

-- ============================================
-- Step 2: Ensure meetings table exists
-- ============================================
-- If the table doesn't exist, create it with all required columns
-- Using CREATE TABLE IF NOT EXISTS means this won't fail if table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'meetings') THEN
    CREATE TABLE public.meetings (
      id integer NOT NULL DEFAULT nextval('meetings_id_seq'::regclass),
      call_id text NOT NULL UNIQUE,
      title text NOT NULL,
      description text,
      start_time timestamp with time zone NOT NULL,
      created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
      is_active boolean DEFAULT true,
      is_private boolean DEFAULT false,
      end_time timestamp with time zone,
      CONSTRAINT meetings_pkey PRIMARY KEY (id)
    );
    
    -- Set the sequence owner
    ALTER SEQUENCE public.meetings_id_seq OWNED BY public.meetings.id;
  END IF;
END $$;

-- ============================================
-- Step 3: Add Missing Columns
-- ============================================
-- These commands are safe to run even if columns already exist
ALTER TABLE public.meetings 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

ALTER TABLE public.meetings 
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;

ALTER TABLE public.meetings 
ADD COLUMN IF NOT EXISTS end_time timestamp with time zone;

-- ============================================
-- Step 3: Set default values for existing rows
-- ============================================
-- Update any existing rows that have NULL values for the new columns
UPDATE public.meetings 
SET is_active = true 
WHERE is_active IS NULL;

UPDATE public.meetings 
SET is_private = false 
WHERE is_private IS NULL;

-- ============================================
-- Step 4: Create indexes for performance
-- ============================================
-- Add index on start_time for faster queries
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON public.meetings(start_time);

-- Add index on is_active for faster filtering
CREATE INDEX IF NOT EXISTS idx_meetings_is_active ON public.meetings(is_active);

-- Add index on is_private for faster filtering
CREATE INDEX IF NOT EXISTS idx_meetings_is_private ON public.meetings(is_private);

-- Add index on call_id (should already exist due to UNIQUE constraint, but adding for safety)
CREATE UNIQUE INDEX IF NOT EXISTS idx_meetings_call_id ON public.meetings(call_id);

-- ============================================
-- Step 5: Add column comments for documentation
-- ============================================
COMMENT ON COLUMN public.meetings.is_active IS 'Controls whether the meeting is visible on the home page. Admins can toggle this to hide completed or cancelled meetings.';
COMMENT ON COLUMN public.meetings.is_private IS 'Controls whether the meeting is private (invite-only) or public. Private meetings are only accessible via direct link.';
COMMENT ON COLUMN public.meetings.end_time IS 'Timestamp when the meeting actually ended. Can be set manually by admins or automatically when the last participant leaves.';
COMMENT ON TABLE public.meetings IS 'Stores scheduled meeting metadata. Each meeting has a unique call_id used to identify and join the meeting.';

-- ============================================
-- Step 6: Verify the schema
-- ============================================
-- You can run this query to verify all columns exist:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'meetings'
-- ORDER BY ordinal_position;

-- ============================================
-- NOTES
-- ============================================
-- 1. This migration is idempotent - safe to run multiple times
-- 2. Run this migration if you see "Failed to save meeting metadata" errors
-- 3. After running this migration, restart your application
-- 4. If you still have issues, check your environment variables:
--    - NEXT_PUBLIC_SUPABASE_URL
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY
-- 5. Ensure RLS (Row Level Security) policies allow your operations if enabled
