-- SQL schema for Supabase

-- Table for storing superchat messages
CREATE TABLE IF NOT EXISTS public.superchats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    order_reference TEXT,
    payment_status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for storing polls
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id TEXT NOT NULL,
    question TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 60,
    end_time TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for storing poll options
CREATE TABLE IF NOT EXISTS public.poll_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for storing poll votes
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    poll_option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (poll_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_superchats_call_id ON public.superchats(call_id);
CREATE INDEX IF NOT EXISTS idx_polls_call_id ON public.polls(call_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_option_id ON public.poll_votes(poll_option_id);

-- Create RLS policies for security
-- Superchats policies
ALTER TABLE public.superchats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read superchats" ON public.superchats FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create superchats" ON public.superchats FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only admins can update superchats" ON public.superchats FOR UPDATE USING (auth.role() = 'authenticated'); -- You'll need to add custom logic for admin check

-- Polls policies
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Only admins can create polls" ON public.polls FOR INSERT WITH CHECK (auth.role() = 'authenticated'); -- Add admin check
CREATE POLICY "Only admins can update polls" ON public.polls FOR UPDATE USING (auth.role() = 'authenticated'); -- Add admin check

-- Poll options policies
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read poll options" ON public.poll_options FOR SELECT USING (true);
CREATE POLICY "Only admins can manage poll options" ON public.poll_options FOR ALL USING (auth.role() = 'authenticated'); -- Add admin check

-- Poll votes policies
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read poll votes" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.poll_votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can only delete their own votes" ON public.poll_votes FOR DELETE USING (user_id = auth.uid());
