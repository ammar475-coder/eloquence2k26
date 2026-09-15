-- =========================================================================
-- ELOQUENCE 2026: DATABASE TABLES SETUP (Supabase / PostgreSQL)
-- Tables: certificates, attendance_logs, event_scores
-- =========================================================================

-- 1. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_code TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  college TEXT,
  event_id TEXT,
  event_name TEXT NOT NULL,
  position TEXT DEFAULT 'Participant',
  certificate_url TEXT,
  issued_by TEXT DEFAULT 'Admin',
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ATTENDANCE LOGS TABLE
CREATE TABLE IF NOT EXISTS attendance_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_code TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_name TEXT,
  participant_name TEXT NOT NULL,
  verified_by TEXT NOT NULL DEFAULT 'Event Coordinator',
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'PRESENT',
  method TEXT DEFAULT 'QR_SCAN',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EVENT SCORES TABLE
CREATE TABLE IF NOT EXISTS event_scores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL,
  event_name TEXT,
  ticket_code TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  team_name TEXT,
  round_number INT DEFAULT 1,
  criteria_1_score NUMERIC DEFAULT 0,
  criteria_2_score NUMERIC DEFAULT 0,
  criteria_3_score NUMERIC DEFAULT 0,
  total_score NUMERIC DEFAULT 0,
  evaluator_name TEXT,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GRANT ACCESS & PERMISSIONS
GRANT ALL ON TABLE certificates TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE attendance_logs TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE event_scores TO anon, authenticated, service_role, postgres;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access on certificates" ON certificates;
CREATE POLICY "Public full access on certificates" ON certificates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on attendance_logs" ON attendance_logs;
CREATE POLICY "Public full access on attendance_logs" ON attendance_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on event_scores" ON event_scores;
CREATE POLICY "Public full access on event_scores" ON event_scores FOR ALL USING (true) WITH CHECK (true);
