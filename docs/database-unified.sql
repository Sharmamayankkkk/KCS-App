-- ============================================
-- KCS App - Unified Database Schema
-- ============================================
-- Complete database schema for the KCS Video Meeting Application
-- This file contains all tables, sequences, indexes, and views
-- needed for the application to function properly.
--
-- USAGE:
-- Execute this entire file in your Supabase SQL Editor to set up
-- a fresh database, or to ensure all required components exist.
--
-- FEATURES COVERED:
-- - User management
-- - Video call management
-- - Scheduled meetings
-- - Attendance tracking
-- - Participant management
-- - Chat messages
-- - Polls and voting
-- - Superchats (paid messages)
-- - Recordings
-- - Broadcast settings
-- ============================================

-- ============================================
-- SEQUENCES
-- ============================================

CREATE SEQUENCE IF NOT EXISTS public.attendance_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.meetings_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.participants_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.superchats_id_seq;

-- ============================================
-- TABLES
-- ============================================

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id text NOT NULL,
  email text NOT NULL UNIQUE,
  username text NOT NULL,
  first_name text,
  last_name text,
  image_url text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.users IS 'Stores user account information';

-- Calls Table
CREATE TABLE IF NOT EXISTS public.calls (
  id text NOT NULL,
  created_by_id text NOT NULL,
  state jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  started_at timestamp with time zone,
  CONSTRAINT calls_pkey PRIMARY KEY (id),
  CONSTRAINT calls_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id)
);

COMMENT ON TABLE public.calls IS 'Stores real-time video call sessions';

-- Meetings Table
CREATE TABLE IF NOT EXISTS public.meetings (
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

COMMENT ON TABLE public.meetings IS 'Stores scheduled meeting metadata. Each meeting has a unique call_id used to identify and join the meeting via Stream Video SDK.';
COMMENT ON COLUMN public.meetings.id IS 'Primary key, auto-generated integer ID';
COMMENT ON COLUMN public.meetings.call_id IS 'Unique identifier for the meeting, used by Stream Video SDK to join the call';
COMMENT ON COLUMN public.meetings.title IS 'Display name of the meeting shown to users';
COMMENT ON COLUMN public.meetings.description IS 'Optional meeting description providing additional context';
COMMENT ON COLUMN public.meetings.start_time IS 'Scheduled start time of the meeting in UTC';
COMMENT ON COLUMN public.meetings.is_active IS 'Controls whether the meeting is visible on the home page. Admins can toggle this to hide completed or cancelled meetings.';
COMMENT ON COLUMN public.meetings.is_private IS 'Controls whether the meeting is private (invite-only) or public. Private meetings are only accessible via direct link.';
COMMENT ON COLUMN public.meetings.end_time IS 'Timestamp when the meeting actually ended. Can be set manually by admins or automatically when the last participant leaves.';

ALTER SEQUENCE public.meetings_id_seq OWNED BY public.meetings.id;

-- Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id integer NOT NULL DEFAULT nextval('attendance_id_seq'::regclass),
  call_id text NOT NULL,
  user_id text NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['present'::text, 'absent'::text, 'late'::text])),
  joined_at timestamp with time zone,
  left_at timestamp with time zone,
  duration_minutes integer DEFAULT 0,
  marked_by text DEFAULT 'system'::text,
  notes text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  username character varying,
  CONSTRAINT attendance_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.meetings(call_id)
);

COMMENT ON TABLE public.attendance IS 'Tracks attendance for scheduled meetings';

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;

-- Participants Table
CREATE TABLE IF NOT EXISTS public.participants (
  id integer NOT NULL DEFAULT nextval('participants_id_seq'::regclass),
  call_id text NOT NULL,
  user_id text NOT NULL,
  joined_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  left_at timestamp with time zone,
  CONSTRAINT participants_pkey PRIMARY KEY (id),
  CONSTRAINT participants_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.calls(id),
  CONSTRAINT participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

COMMENT ON TABLE public.participants IS 'Tracks participants in real-time calls';

ALTER SEQUENCE public.participants_id_seq OWNED BY public.participants.id;

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  call_id text NOT NULL,
  sender text NOT NULL,
  text text NOT NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  attachment_url text,
  attachment_name text,
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.chat_messages IS 'Stores chat messages sent during calls';

-- Polls Table
CREATE TABLE IF NOT EXISTS public.polls (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  call_id text,
  question text,
  is_active boolean DEFAULT true,
  duration_seconds integer,
  end_time timestamp with time zone,
  CONSTRAINT polls_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.polls IS 'Stores polls created during meetings';

-- Poll Options Table
CREATE TABLE IF NOT EXISTS public.poll_options (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  poll_id bigint,
  text text,
  position smallint,
  CONSTRAINT poll_options_pkey PRIMARY KEY (id),
  CONSTRAINT poll_options_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id)
);

COMMENT ON TABLE public.poll_options IS 'Stores options for each poll';

-- Poll Votes Table
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id text,
  poll_option_id bigint,
  poll_id bigint,
  CONSTRAINT poll_votes_pkey PRIMARY KEY (id),
  CONSTRAINT poll_votes_poll_option_id_fkey FOREIGN KEY (poll_option_id) REFERENCES public.poll_options(id),
  CONSTRAINT poll_votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id)
);

COMMENT ON TABLE public.poll_votes IS 'Tracks user votes for poll options';

-- Superchats Table
CREATE TABLE IF NOT EXISTS public.superchats (
  id integer NOT NULL DEFAULT nextval('superchats_id_seq'::regclass),
  call_id text NOT NULL,
  sender_id text NOT NULL,
  message text NOT NULL,
  amount numeric NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending'::text,
  order_reference text NOT NULL UNIQUE,
  timestamp timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  sender_name text,
  currency text,
  is_pinned boolean DEFAULT false,
  CONSTRAINT superchats_pkey PRIMARY KEY (id),
  CONSTRAINT superchats_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.calls(id),
  CONSTRAINT superchats_user_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
);

COMMENT ON TABLE public.superchats IS 'Stores paid super chat messages during meetings';

ALTER SEQUENCE public.superchats_id_seq OWNED BY public.superchats.id;

-- Recordings Table
CREATE TABLE IF NOT EXISTS public.recordings (
  id text NOT NULL,
  call_id text NOT NULL,
  filename text NOT NULL,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  url text NOT NULL,
  CONSTRAINT recordings_pkey PRIMARY KEY (id),
  CONSTRAINT recordings_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.calls(id)
);

COMMENT ON TABLE public.recordings IS 'Stores metadata for call recordings';

-- Broadcast Settings Table
CREATE TABLE IF NOT EXISTS public.broadcast_settings (
  id bigint NOT NULL,
  layout text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT broadcast_settings_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.broadcast_settings IS 'Stores broadcast layout configuration';

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Meetings indexes
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON public.meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meetings_is_active ON public.meetings(is_active);
CREATE INDEX IF NOT EXISTS idx_meetings_is_private ON public.meetings(is_private);
CREATE UNIQUE INDEX IF NOT EXISTS idx_meetings_call_id ON public.meetings(call_id);
CREATE INDEX IF NOT EXISTS idx_meetings_active_start_time ON public.meetings(is_active, start_time);

-- Attendance indexes
CREATE INDEX IF NOT EXISTS idx_attendance_call_id ON public.attendance(call_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance(user_id);

-- Participants indexes
CREATE INDEX IF NOT EXISTS idx_participants_call_id ON public.participants(call_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON public.participants(user_id);

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_call_id ON public.chat_messages(call_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Polls indexes
CREATE INDEX IF NOT EXISTS idx_polls_call_id ON public.polls(call_id);
CREATE INDEX IF NOT EXISTS idx_polls_is_active ON public.polls(is_active);

-- ============================================
-- VIEWS
-- ============================================

-- Upcoming Meetings View
-- Shows active meetings from the last 24 hours with computed status
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

COMMENT ON VIEW public.upcoming_meetings IS 'View showing active meetings from the last 24 hours with computed status field';

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify all tables were created successfully:
-- 
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

-- ============================================
-- NOTES
-- ============================================
-- 1. This schema is idempotent - safe to run multiple times
-- 2. Existing data will be preserved
-- 3. If using Row Level Security (RLS), you'll need to configure policies
-- 4. Ensure your environment variables are set correctly:
--    - NEXT_PUBLIC_SUPABASE_URL
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY
-- 5. For production, consider adding additional constraints and validations
