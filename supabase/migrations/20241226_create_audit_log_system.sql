-- Create comprehensive audit log system
-- Migration: 20241226_create_audit_log_system

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  action_type VARCHAR(100) NOT NULL, -- e.g., 'user_created', 'user_updated', 'user_deleted', 'role_assigned'
  resource_type VARCHAR(50) NOT NULL, -- e.g., 'user', 'role', 'permission', 'group', 'tag'
  resource_id VARCHAR(100), -- ID of the affected resource
  description TEXT NOT NULL,
  old_values JSONB, -- Previous values (for updates)
  new_values JSONB, -- New values (for creates/updates)
  metadata JSONB, -- Additional context data
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_log_filters table for saved filter presets
CREATE TABLE IF NOT EXISTS audit_log_filters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  filters JSONB NOT NULL, -- Filter criteria as JSON
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON audit_logs(session_id);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_action ON audit_logs(admin_id, action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_action ON audit_logs(resource_type, action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date_range ON audit_logs(created_at, action_type);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log_filters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true); -- Allow system to insert logs

-- RLS Policies for audit_log_filters
CREATE POLICY "Admins can view all audit filters" ON audit_log_filters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage audit filters" ON audit_log_filters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to automatically log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action_type VARCHAR(100),
  p_resource_type VARCHAR(50),
  p_resource_id VARCHAR(100),
  p_description TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id VARCHAR(100) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    admin_id,
    action_type,
    resource_type,
    resource_id,
    description,
    old_values,
    new_values,
    metadata,
    ip_address,
    user_agent,
    session_id
  ) VALUES (
    p_admin_id,
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_description,
    p_old_values,
    p_new_values,
    p_metadata,
    p_ip_address,
    p_user_agent,
    p_session_id
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get audit log statistics
CREATE OR REPLACE FUNCTION get_audit_log_stats(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS TABLE (
  total_actions BIGINT,
  unique_admins BIGINT,
  most_common_action VARCHAR(100),
  action_count BIGINT,
  most_active_admin UUID,
  admin_action_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH date_filtered AS (
    SELECT *
    FROM audit_logs
    WHERE (p_start_date IS NULL OR created_at >= p_start_date)
      AND (p_end_date IS NULL OR created_at <= p_end_date)
  ),
  action_stats AS (
    SELECT 
      action_type,
      COUNT(*) as action_count
    FROM date_filtered
    GROUP BY action_type
    ORDER BY action_count DESC
    LIMIT 1
  ),
  admin_stats AS (
    SELECT 
      admin_id,
      COUNT(*) as admin_action_count
    FROM date_filtered
    GROUP BY admin_id
    ORDER BY admin_action_count DESC
    LIMIT 1
  )
  SELECT 
    (SELECT COUNT(*) FROM date_filtered) as total_actions,
    (SELECT COUNT(DISTINCT admin_id) FROM date_filtered) as unique_admins,
    (SELECT action_type FROM action_stats) as most_common_action,
    (SELECT action_count FROM action_stats) as action_count,
    (SELECT admin_id FROM admin_stats) as most_active_admin,
    (SELECT admin_action_count FROM admin_stats) as admin_action_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to search audit logs
CREATE OR REPLACE FUNCTION search_audit_logs(
  p_search_term TEXT DEFAULT NULL,
  p_action_types TEXT[] DEFAULT NULL,
  p_resource_types TEXT[] DEFAULT NULL,
  p_admin_ids UUID[] DEFAULT NULL,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  id UUID,
  admin_id UUID,
  action_type VARCHAR(100),
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  description TEXT,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.admin_id,
    al.action_type,
    al.resource_type,
    al.resource_id,
    al.description,
    al.old_values,
    al.new_values,
    al.metadata,
    al.ip_address,
    al.user_agent,
    al.session_id,
    al.created_at
  FROM audit_logs al
  WHERE (p_search_term IS NULL OR 
         al.description ILIKE '%' || p_search_term || '%' OR
         al.action_type ILIKE '%' || p_search_term || '%' OR
         al.resource_type ILIKE '%' || p_search_term || '%')
    AND (p_action_types IS NULL OR al.action_type = ANY(p_action_types))
    AND (p_resource_types IS NULL OR al.resource_type = ANY(p_resource_types))
    AND (p_admin_ids IS NULL OR al.admin_id = ANY(p_admin_ids))
    AND (p_start_date IS NULL OR al.created_at >= p_start_date)
    AND (p_end_date IS NULL OR al.created_at <= p_end_date)
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default audit log filters
INSERT INTO audit_log_filters (name, description, filters, created_by) VALUES
('Recent User Actions', 'Show recent user management actions', 
 '{"action_types": ["user_created", "user_updated", "user_deleted", "user_approved", "user_suspended"], "days": 7}', 
 (SELECT id FROM auth.users WHERE email = 'admin@algebros.com' LIMIT 1)),
('Security Events', 'Show security-related actions', 
 '{"action_types": ["user_login", "user_logout", "permission_granted", "permission_revoked", "role_assigned", "role_removed"], "days": 30}', 
 (SELECT id FROM auth.users WHERE email = 'admin@algebros.com' LIMIT 1)),
('System Changes', 'Show system configuration changes', 
 '{"action_types": ["system_settings_updated", "role_created", "role_updated", "role_deleted", "permission_created"], "days": 30}', 
 (SELECT id FROM auth.users WHERE email = 'admin@algebros.com' LIMIT 1));

-- Add comments
COMMENT ON TABLE audit_logs IS 'Comprehensive audit log for tracking all admin actions';
COMMENT ON TABLE audit_log_filters IS 'Saved filter presets for audit log queries';
COMMENT ON COLUMN audit_logs.action_type IS 'Type of action performed (user_created, user_updated, etc.)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (user, role, permission, etc.)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN audit_logs.old_values IS 'Previous values for update operations';
COMMENT ON COLUMN audit_logs.new_values IS 'New values for create/update operations';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context and metadata';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the admin performing the action';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string of the admin';
COMMENT ON COLUMN audit_logs.session_id IS 'Session ID for tracking related actions';
COMMENT ON FUNCTION log_admin_action IS 'Function to automatically log admin actions';
COMMENT ON FUNCTION get_audit_log_stats IS 'Function to get audit log statistics';
COMMENT ON FUNCTION search_audit_logs IS 'Function to search and filter audit logs';
