-- Create security_logs table
CREATE TABLE security_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  resource_type TEXT,
  resource_id TEXT,
  action TEXT,
  details JSONB,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create confirmation_codes table
CREATE TABLE confirmation_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  resource_id TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rate_limits table for persistent rate limiting
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  reset_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(key)
);

-- Create action_reasons table for tracking why actions were taken
CREATE TABLE action_reasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE confirmation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_reasons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_logs (only admins can view)
CREATE POLICY "Allow admins to view security logs" ON security_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Allow system to insert security logs" ON security_logs FOR INSERT WITH CHECK (true);

-- RLS Policies for confirmation_codes
CREATE POLICY "Allow users to manage their own codes" ON confirmation_codes FOR ALL USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for rate_limits
CREATE POLICY "Allow system to manage rate limits" ON rate_limits FOR ALL WITH CHECK (true);

-- RLS Policies for action_reasons
CREATE POLICY "Allow admins to manage action reasons" ON action_reasons FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes for performance
CREATE INDEX idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX idx_security_logs_severity ON security_logs(severity);

CREATE INDEX idx_confirmation_codes_code ON confirmation_codes(code);
CREATE INDEX idx_confirmation_codes_user_id ON confirmation_codes(user_id);
CREATE INDEX idx_confirmation_codes_expires_at ON confirmation_codes(expires_at);
CREATE INDEX idx_confirmation_codes_used ON confirmation_codes(used);

CREATE INDEX idx_rate_limits_key ON rate_limits(key);
CREATE INDEX idx_rate_limits_reset_time ON rate_limits(reset_time);

CREATE INDEX idx_action_reasons_action_type ON action_reasons(action_type);

-- Insert default action reasons
INSERT INTO action_reasons (action_type, reason, description, is_system) VALUES
('user_suspend', 'Violation of Terms of Service', 'User violated platform terms and conditions', true),
('user_suspend', 'Inappropriate Behavior', 'User engaged in inappropriate or harmful behavior', true),
('user_suspend', 'Security Concern', 'Account flagged for security reasons', true),
('user_suspend', 'Spam Activity', 'User engaged in spam or fraudulent activity', true),
('user_delete', 'Account Closure Request', 'User requested account deletion', true),
('user_delete', 'Inactive Account', 'Account has been inactive for extended period', true),
('user_delete', 'Policy Violation', 'Severe violation of platform policies', true),
('bulk_action', 'Administrative Cleanup', 'Routine administrative maintenance', true),
('bulk_action', 'Data Migration', 'Part of data migration or system update', true),
('bulk_action', 'Policy Enforcement', 'Enforcing platform policies across multiple accounts', true);

-- Function to cleanup expired confirmation codes
CREATE OR REPLACE FUNCTION cleanup_expired_confirmation_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM confirmation_codes 
  WHERE expires_at < NOW() AND used = false;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old rate limit entries
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits 
  WHERE reset_time < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old security logs (keep for 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM security_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
