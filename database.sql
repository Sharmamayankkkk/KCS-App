-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.attendance (
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
CREATE TABLE public.broadcast_settings (
  id bigint NOT NULL,
  layout text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT broadcast_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.calls (
  id text NOT NULL,
  created_by_id text NOT NULL,
  state jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  started_at timestamp with time zone,
  CONSTRAINT calls_pkey PRIMARY KEY (id),
  CONSTRAINT calls_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id)
);
CREATE TABLE public.chat_messages (
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
CREATE TABLE public.meetings (
  id integer NOT NULL DEFAULT nextval('meetings_id_seq'::regclass),
  call_id text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  start_time timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT meetings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.participants (
  id integer NOT NULL DEFAULT nextval('participants_id_seq'::regclass),
  call_id text NOT NULL,
  user_id text NOT NULL,
  joined_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  left_at timestamp with time zone,
  CONSTRAINT participants_pkey PRIMARY KEY (id),
  CONSTRAINT participants_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.calls(id),
  CONSTRAINT participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.poll_options (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  poll_id bigint,
  text text,
  position smallint,
  CONSTRAINT poll_options_pkey PRIMARY KEY (id),
  CONSTRAINT poll_options_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id)
);
CREATE TABLE public.poll_votes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id text,
  poll_option_id bigint,
  poll_id bigint,
  CONSTRAINT poll_votes_pkey PRIMARY KEY (id),
  CONSTRAINT poll_votes_poll_option_id_fkey FOREIGN KEY (poll_option_id) REFERENCES public.poll_options(id),
  CONSTRAINT poll_votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id)
);
CREATE TABLE public.polls (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  call_id text,
  question text,
  is_active boolean DEFAULT true,
  duration_seconds integer,
  end_time timestamp with time zone,
  CONSTRAINT polls_pkey PRIMARY KEY (id)
);
CREATE TABLE public.recordings (
  id text NOT NULL,
  call_id text NOT NULL,
  filename text NOT NULL,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  url text NOT NULL,
  CONSTRAINT recordings_pkey PRIMARY KEY (id),
  CONSTRAINT recordings_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.calls(id)
);
CREATE TABLE public.superchats (
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
CREATE TABLE public.users (
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