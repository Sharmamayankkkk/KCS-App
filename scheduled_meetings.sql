-- Scheduled Meetings Feature SQL
-- This file contains SQL queries related to the scheduled meetings feature

-- The meetings table already exists in the database (see database.sql)
-- No additional tables or schema changes are required for basic scheduled meetings functionality

-- ============================================
-- Useful Queries for Scheduled Meetings
-- ============================================

-- Get all upcoming meetings (scheduled for the future or within last 24 hours)
-- This query is used by the API endpoint GET /api/meetings
SELECT 
  id,
  call_id,
  title,
  description,
  start_time,
  created_at,
  updated_at
FROM public.meetings
WHERE start_time >= (NOW() - INTERVAL '24 hours')
ORDER BY start_time ASC;

-- Get only future meetings (not yet started)
SELECT 
  id,
  call_id,
  title,
  description,
  start_time,
  created_at
FROM public.meetings
WHERE start_time > NOW()
ORDER BY start_time ASC;

-- Get meetings happening today
SELECT 
  id,
  call_id,
  title,
  description,
  start_time
FROM public.meetings
WHERE DATE(start_time) = CURRENT_DATE
ORDER BY start_time ASC;

-- Get meetings for a specific date range
SELECT 
  id,
  call_id,
  title,
  description,
  start_time
FROM public.meetings
WHERE start_time >= '2024-01-01 00:00:00+00'
  AND start_time < '2024-01-02 00:00:00+00'
ORDER BY start_time ASC;

-- Get meeting by call_id (used when joining a meeting)
SELECT 
  id,
  call_id,
  title,
  description,
  start_time,
  created_at
FROM public.meetings
WHERE call_id = 'YOUR_CALL_ID_HERE';

-- Insert a new scheduled meeting (used by POST /api/meetings)
INSERT INTO public.meetings (call_id, title, description, start_time)
VALUES ('example_call_id', 'Example Meeting', 'Description here', '2024-12-25 10:00:00+00')
ON CONFLICT (call_id) 
DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  start_time = EXCLUDED.start_time,
  updated_at = CURRENT_TIMESTAMP
RETURNING *;

-- Update meeting details
UPDATE public.meetings
SET 
  title = 'Updated Title',
  description = 'Updated Description',
  start_time = '2024-12-25 15:00:00+00',
  updated_at = CURRENT_TIMESTAMP
WHERE call_id = 'YOUR_CALL_ID_HERE'
RETURNING *;

-- Delete old meetings (cleanup query - run periodically)
-- Deletes meetings older than 30 days
DELETE FROM public.meetings
WHERE start_time < (NOW() - INTERVAL '30 days');

-- ============================================
-- Optional: Enhanced Features (Future)
-- ============================================

-- If you want to add meeting status tracking in the future, you can add:
-- ALTER TABLE public.meetings ADD COLUMN status text DEFAULT 'scheduled';
-- Possible values: 'scheduled', 'live', 'completed', 'cancelled'

-- If you want to add recurring meetings in the future, you can create:
-- CREATE TABLE public.recurring_meetings (
--   id SERIAL PRIMARY KEY,
--   title text NOT NULL,
--   description text,
--   recurrence_pattern jsonb NOT NULL, -- e.g., {"frequency": "weekly", "day": "monday", "time": "10:00"}
--   start_date date NOT NULL,
--   end_date date,
--   created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
--   created_by text REFERENCES public.users(id)
-- );

-- ============================================
-- Indexes for Performance
-- ============================================

-- Add index on start_time for faster queries
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON public.meetings(start_time);

-- Add index on call_id for faster lookups (should already exist due to UNIQUE constraint)
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_meetings_call_id ON public.meetings(call_id);

-- ============================================
-- Views for Common Queries
-- ============================================

-- Create a view for upcoming meetings
CREATE OR REPLACE VIEW public.upcoming_meetings AS
SELECT 
  id,
  call_id,
  title,
  description,
  start_time,
  created_at,
  CASE 
    WHEN start_time > NOW() THEN 'upcoming'
    WHEN start_time <= NOW() AND start_time >= (NOW() - INTERVAL '2 hours') THEN 'live'
    ELSE 'ended'
  END as status
FROM public.meetings
WHERE start_time >= (NOW() - INTERVAL '24 hours')
ORDER BY start_time ASC;

-- Query the view
-- SELECT * FROM public.upcoming_meetings WHERE status = 'upcoming';
-- SELECT * FROM public.upcoming_meetings WHERE status = 'live';
