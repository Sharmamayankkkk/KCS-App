-- Attendance System SQL Schema
-- This file contains the complete SQL code for the attendance system

-- Attendance Table
-- Tracks attendance records for each meeting/call
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    call_id TEXT NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 0,
    marked_by TEXT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(call_id, user_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_call_id ON attendance(call_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON attendance(created_at);

-- Function to automatically calculate duration when left_at is set
CREATE OR REPLACE FUNCTION calculate_attendance_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.left_at IS NOT NULL AND NEW.joined_at IS NOT NULL THEN
        NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.left_at - NEW.joined_at)) / 60;
    END IF;
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate duration automatically
DROP TRIGGER IF EXISTS trigger_calculate_attendance_duration ON attendance;
CREATE TRIGGER trigger_calculate_attendance_duration
    BEFORE INSERT OR UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION calculate_attendance_duration();

-- View for attendance statistics per user
CREATE OR REPLACE VIEW user_attendance_stats AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    COUNT(*) as total_meetings,
    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
    COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
    ROUND(
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END)::NUMERIC / 
         NULLIF(COUNT(*)::NUMERIC, 0)) * 100, 
        2
    ) as attendance_percentage,
    SUM(a.duration_minutes) as total_duration_minutes
FROM users u
LEFT JOIN attendance a ON u.id = a.user_id
GROUP BY u.id, u.username, u.email;

-- View for attendance statistics per call
CREATE OR REPLACE VIEW call_attendance_stats AS
SELECT 
    c.id as call_id,
    c.created_at as call_date,
    c.created_by_id,
    COUNT(a.id) as total_participants,
    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
    COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
    ROUND(
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END)::NUMERIC / 
         NULLIF(COUNT(*)::NUMERIC, 0)) * 100, 
        2
    ) as attendance_percentage
FROM calls c
LEFT JOIN attendance a ON c.id = a.call_id
GROUP BY c.id, c.created_at, c.created_by_id;

-- Enable Row Level Security (RLS)
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own attendance
CREATE POLICY "Users can view own attendance" ON attendance
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- Policy: Admins can view all attendance (modify based on your admin check)
-- Note: This requires setting up proper admin roles in your auth system
CREATE POLICY "Admins can view all attendance" ON attendance
    FOR SELECT
    USING (true); -- Modify this based on your admin check implementation

-- Policy: Admins can insert attendance records
CREATE POLICY "Admins can insert attendance" ON attendance
    FOR INSERT
    WITH CHECK (true); -- Modify this based on your admin check implementation

-- Policy: Admins can update attendance records
CREATE POLICY "Admins can update attendance" ON attendance
    FOR UPDATE
    USING (true) -- Modify this based on your admin check implementation
    WITH CHECK (true);

-- Policy: Admins can delete attendance records
CREATE POLICY "Admins can delete attendance" ON attendance
    FOR DELETE
    USING (true); -- Modify this based on your admin check implementation

-- Enable realtime for attendance table (if using Supabase Realtime)
-- Run this in Supabase SQL editor or via Supabase dashboard:
-- alter publication supabase_realtime add table attendance;

-- Sample query to get a user's attendance summary
-- SELECT * FROM user_attendance_stats WHERE user_id = 'user_id_here';

-- Sample query to get attendance for a specific call
-- SELECT * FROM call_attendance_stats WHERE call_id = 'call_id_here';

-- Sample query to get detailed attendance records for a user
-- SELECT 
--     a.*,
--     c.created_at as meeting_date,
--     c.started_at
-- FROM attendance a
-- JOIN calls c ON a.call_id = c.id
-- WHERE a.user_id = 'user_id_here'
-- ORDER BY c.created_at DESC;