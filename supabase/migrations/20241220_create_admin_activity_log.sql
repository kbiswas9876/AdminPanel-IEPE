-- Create admin activity log for audit trail
-- Migration: 20241220_create_admin_activity_log

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, 
  -- Common action types: 'login', 'logout', 'profile_update', 'settings_change', 
  -- 'user_approved', 'user_rejected', 'user_suspended', 'question_created', 
  -- 'question_updated', 'question_deleted', 'test_created', 'test_published', etc.
  action_description TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action_type ON admin_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_created ON admin_activity_log(admin_id, created_at DESC);

-- Enable RLS
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can view their own activity
CREATE POLICY "Admins can view their own activity" ON admin_activity_log
  FOR SELECT USING (auth.uid() = admin_id);

-- System can insert activity logs (allow server-side inserts)
CREATE POLICY "System can insert activity logs" ON admin_activity_log
  FOR INSERT WITH CHECK (true);

-- Super admins can view all activity (optional - implement if needed)
-- CREATE POLICY "Super admins can view all activity" ON admin_activity_log
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM user_profiles 
--       WHERE id = auth.uid() 
--       AND role = 'super_admin'
--     )
--   );

-- Add comments
COMMENT ON TABLE admin_activity_log IS 'Audit trail of all admin actions for security and compliance';
COMMENT ON COLUMN admin_activity_log.action_type IS 'Category of action performed (login, profile_update, etc.)';
COMMENT ON COLUMN admin_activity_log.action_description IS 'Human-readable description of the action';
COMMENT ON COLUMN admin_activity_log.ip_address IS 'IP address from which the action was performed';
COMMENT ON COLUMN admin_activity_log.user_agent IS 'Browser/client user agent string';
COMMENT ON COLUMN admin_activity_log.metadata IS 'Additional JSON data about the action (e.g., changed fields, affected resources)';

