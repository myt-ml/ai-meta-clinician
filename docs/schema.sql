-- AI Meta-Clinician Database Schema for Supabase
-- 
-- This schema supports:
-- - User authentication (via Supabase Auth)
-- - Session management with messages
-- - Clinical assessments (PHQ-9, GAD-7, etc.)
-- - Multi-device sync
-- - Clinical review workflow
--
-- Deployment: Run this SQL in Supabase SQL Editor
-- https://app.supabase.com/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- Extends Supabase Auth users with application-specific data
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Indexes
  CONSTRAINT users_email_key UNIQUE(email)
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SESSIONS TABLE
-- Stores mental health consultation sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  last_update TIMESTAMPTZ NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  language TEXT NOT NULL CHECK (language IN ('en', 'ar_egy', 'ar_msa')),
  flagged_for_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Allow anonymous sessions (user_id can be NULL)
  -- Sessions are linked to user if they sign in later
  CONSTRAINT sessions_risk_level_check CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  CONSTRAINT sessions_language_check CHECK (language IN ('en', 'ar_egy', 'ar_msa'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_flagged ON sessions(flagged_for_review) WHERE flagged_for_review = TRUE;
CREATE INDEX IF NOT EXISTS idx_sessions_risk_level ON sessions(risk_level);
CREATE INDEX IF NOT EXISTS idx_sessions_last_update ON sessions(last_update DESC);

-- ============================================================
-- MESSAGES TABLE
-- Stores individual messages within sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai', 'system')),
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT messages_role_check CHECK (role IN ('user', 'ai', 'system'))
);

-- Indexes for message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

-- ============================================================
-- ASSESSMENTS TABLE
-- Stores standardized assessments (PHQ-9, GAD-7, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('phq9', 'gad7', 'custom')),
  score INTEGER NOT NULL,
  responses INTEGER[] NOT NULL, -- Array of question responses
  interpretation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT assessments_type_check CHECK (type IN ('phq9', 'gad7', 'custom')),
  CONSTRAINT assessments_score_check CHECK (score >= 0)
);

-- Indexes for assessment queries
CREATE INDEX IF NOT EXISTS idx_assessments_session_id ON assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_assessments_type ON assessments(type);
CREATE INDEX IF NOT EXISTS idx_assessments_score ON assessments(score);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can only access their own data
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- SESSIONS policies
CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- MESSAGES policies
CREATE POLICY "Users can view messages in their sessions"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = messages.session_id
      AND (sessions.user_id = auth.uid() OR sessions.user_id IS NULL)
    )
  );

CREATE POLICY "Users can insert messages in their sessions"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = messages.session_id
      AND (sessions.user_id = auth.uid() OR sessions.user_id IS NULL)
    )
  );

CREATE POLICY "Users can delete messages in their sessions"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = messages.session_id
      AND (sessions.user_id = auth.uid() OR sessions.user_id IS NULL)
    )
  );

-- ASSESSMENTS policies
CREATE POLICY "Users can view assessments in their sessions"
  ON assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = assessments.session_id
      AND (sessions.user_id = auth.uid() OR sessions.user_id IS NULL)
    )
  );

CREATE POLICY "Users can insert assessments in their sessions"
  ON assessments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = assessments.session_id
      AND (sessions.user_id = auth.uid() OR sessions.user_id IS NULL)
    )
  );

-- ============================================================
-- ADMIN POLICIES (for clinical reviewers)
-- Create a separate role for clinicians to review flagged sessions
-- ============================================================

-- Create custom claim for admin/clinician role
-- (This is set in Supabase Auth custom claims or metadata)

CREATE POLICY "Clinicians can view flagged sessions"
  ON sessions FOR SELECT
  USING (
    flagged_for_review = TRUE 
    AND (
      auth.jwt()->>'role' = 'clinician' 
      OR auth.jwt()->>'role' = 'admin'
    )
  );

CREATE POLICY "Clinicians can view messages in flagged sessions"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = messages.session_id
      AND sessions.flagged_for_review = TRUE
      AND (
        auth.jwt()->>'role' = 'clinician' 
        OR auth.jwt()->>'role' = 'admin'
      )
    )
  );

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function to auto-flag high-risk sessions
CREATE OR REPLACE FUNCTION auto_flag_high_risk_sessions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.risk_level IN ('high', 'critical') THEN
    NEW.flagged_for_review = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_flag_sessions
  BEFORE INSERT OR UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION auto_flag_high_risk_sessions();

-- Function to clean up old anonymous sessions (>90 days)
CREATE OR REPLACE FUNCTION cleanup_old_anonymous_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions
  WHERE user_id IS NULL
  AND last_update < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-sessions', '0 2 * * *', 'SELECT cleanup_old_anonymous_sessions()');

-- ============================================================
-- ANALYTICS VIEWS (for dashboards)
-- ============================================================

-- View: Session statistics by risk level
CREATE OR REPLACE VIEW session_stats_by_risk AS
SELECT
  risk_level,
  COUNT(*) AS session_count,
  COUNT(CASE WHEN flagged_for_review THEN 1 END) AS flagged_count,
  AVG(EXTRACT(EPOCH FROM (last_update - start_time)) / 60) AS avg_duration_minutes
FROM sessions
GROUP BY risk_level;

-- View: Daily session counts
CREATE OR REPLACE VIEW daily_session_counts AS
SELECT
  DATE(start_time) AS date,
  COUNT(*) AS total_sessions,
  COUNT(CASE WHEN flagged_for_review THEN 1 END) AS flagged_sessions,
  COUNT(DISTINCT user_id) AS unique_users
FROM sessions
GROUP BY DATE(start_time)
ORDER BY date DESC;

-- View: User engagement metrics
CREATE OR REPLACE VIEW user_engagement_metrics AS
SELECT
  users.id,
  users.email,
  COUNT(sessions.id) AS total_sessions,
  MAX(sessions.last_update) AS last_active,
  AVG(EXTRACT(EPOCH FROM (sessions.last_update - sessions.start_time)) / 60) AS avg_session_duration
FROM users
LEFT JOIN sessions ON users.id = sessions.user_id
GROUP BY users.id, users.email;

-- ============================================================
-- SAMPLE DATA (for testing)
-- ============================================================

-- Uncomment to insert sample data:
/*
INSERT INTO users (id, email, metadata) VALUES
  ('00000000-0000-0000-0000-000000000001', 'test@example.com', '{"name": "Test User", "country": "EG"}');

INSERT INTO sessions (id, user_id, start_time, last_update, risk_level, language, flagged_for_review) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 hour', NOW(), 'moderate', 'en', FALSE);

INSERT INTO messages (session_id, role, text, timestamp, risk_level) VALUES
  ('10000000-0000-0000-0000-000000000001', 'user', 'I feel very sad', NOW() - INTERVAL '50 minutes', 'moderate'),
  ('10000000-0000-0000-0000-000000000001', 'ai', 'I understand. Can you tell me more?', NOW() - INTERVAL '49 minutes', 'low');
*/

-- ============================================================
-- GRANTS (for authenticated users)
-- ============================================================

-- Grant basic permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================
-- COMPLETION MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE 'AI Meta-Clinician database schema created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Configure Supabase Auth settings';
  RAISE NOTICE '2. Set up email templates for magic links';
  RAISE NOTICE '3. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local';
  RAISE NOTICE '4. Test authentication flow';
  RAISE NOTICE '5. Migrate localStorage sessions to cloud';
END $$;
