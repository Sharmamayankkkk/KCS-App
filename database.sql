
-- Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Calls Table
CREATE TABLE calls (
    id TEXT PRIMARY KEY,
    created_by_id TEXT NOT NULL REFERENCES users(id),
    state JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE
);

-- Participants Table
CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    call_id TEXT NOT NULL REFERENCES calls(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(call_id, user_id)
);

-- Recordings Table
CREATE TABLE recordings (
    id TEXT PRIMARY KEY,
    call_id TEXT NOT NULL REFERENCES calls(id),
    filename TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    url TEXT NOT NULL
);

-- Polls Table
CREATE TABLE polls (
    id SERIAL PRIMARY KEY,
    call_id TEXT NOT NULL REFERENCES calls(id),
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Poll Votes Table
CREATE TABLE poll_votes (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER NOT NULL REFERENCES polls(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    option_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(poll_id, user_id)
);

-- Superchats Table
CREATE TABLE superchats (
    id SERIAL PRIMARY KEY,
    call_id TEXT NOT NULL REFERENCES calls(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    order_reference TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat Messages Table
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    call_id TEXT NOT NULL REFERENCES calls(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

