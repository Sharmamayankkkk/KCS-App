-- Migration: Add visibility and privacy columns to meetings table
-- This migration adds:
-- 1. is_active: Controls whether a meeting should be displayed on the home page
-- 2. is_private: Controls whether a meeting is private (invite-only) or public
-- 3. end_time: Optional field to track when meetings actually ended

-- Add is_active column (defaults to true for existing meetings)
ALTER TABLE public.meetings 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add is_private column (defaults to false for existing meetings - public)
ALTER TABLE public.meetings 
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;

-- Add end_time column for tracking when meetings end
ALTER TABLE public.meetings 
ADD COLUMN IF NOT EXISTS end_time timestamp with time zone;

-- Add index on is_active for faster filtering
CREATE INDEX IF NOT EXISTS idx_meetings_is_active ON public.meetings(is_active);

-- Add index on is_private for faster filtering
CREATE INDEX IF NOT EXISTS idx_meetings_is_private ON public.meetings(is_private);

-- Comment the columns for documentation
COMMENT ON COLUMN public.meetings.is_active IS 'Controls whether the meeting is visible on the home page. Admins can toggle this to hide completed or cancelled meetings.';
COMMENT ON COLUMN public.meetings.is_private IS 'Controls whether the meeting is private (invite-only) or public. Private meetings are only accessible via direct link.';
COMMENT ON COLUMN public.meetings.end_time IS 'Timestamp when the meeting actually ended. Can be set manually by admins or automatically when the last participant leaves.';
