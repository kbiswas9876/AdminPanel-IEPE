-- Create permissions system
-- Migration: 20241226_create_permissions_system

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  resource VARCHAR(50) NOT NULL, -- e.g., 'users', 'content', 'reports'
  action VARCHAR(50) NOT NULL, -- e.g., 'read', 'write', 'delete', 'manage'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roles table (extended from existing roles)
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions table (many-to-many)
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID REFERENCES admin_roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(role_id, permission_id)
);

-- Create user_permissions table (direct user permissions)
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration
  UNIQUE(user_id, permission_id)
);

-- Create user_roles table (user role assignments)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES admin_roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration
  UNIQUE(user_id, role_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission_id ON user_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- Enable RLS
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permissions
CREATE POLICY "Admins can view all permissions" ON permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage permissions" ON permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for admin_roles
CREATE POLICY "Admins can view all roles" ON admin_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage roles" ON admin_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for role_permissions
CREATE POLICY "Admins can view all role permissions" ON role_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage role permissions" ON role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for user_permissions
CREATE POLICY "Admins can view all user permissions" ON user_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage user permissions" ON user_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all user roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default permissions
INSERT INTO permissions (name, description, category, resource, action) VALUES
-- User Management Permissions
('users.read', 'View user profiles and information', 'user_management', 'users', 'read'),
('users.write', 'Edit user profiles and information', 'user_management', 'users', 'write'),
('users.delete', 'Delete user accounts', 'user_management', 'users', 'delete'),
('users.manage', 'Full user management capabilities', 'user_management', 'users', 'manage'),
('users.approve', 'Approve pending user registrations', 'user_management', 'users', 'approve'),
('users.suspend', 'Suspend user accounts', 'user_management', 'users', 'suspend'),
('users.impersonate', 'Impersonate users for testing', 'user_management', 'users', 'impersonate'),

-- Content Management Permissions
('content.read', 'View content and materials', 'content_management', 'content', 'read'),
('content.write', 'Create and edit content', 'content_management', 'content', 'write'),
('content.delete', 'Delete content', 'content_management', 'content', 'delete'),
('content.manage', 'Full content management', 'content_management', 'content', 'manage'),
('content.publish', 'Publish content', 'content_management', 'content', 'publish'),

-- Analytics and Reports Permissions
('analytics.read', 'View analytics and reports', 'analytics', 'analytics', 'read'),
('analytics.export', 'Export analytics data', 'analytics', 'analytics', 'export'),
('reports.generate', 'Generate custom reports', 'analytics', 'reports', 'generate'),
('reports.export', 'Export reports', 'analytics', 'reports', 'export'),

-- System Administration Permissions
('system.settings', 'Manage system settings', 'system_admin', 'system', 'settings'),
('system.users', 'Manage user permissions and roles', 'system_admin', 'system', 'users'),
('system.logs', 'View system logs', 'system_admin', 'system', 'logs'),
('system.backup', 'Create system backups', 'system_admin', 'system', 'backup'),

-- Groups and Tags Permissions
('groups.read', 'View user groups', 'groups_tags', 'groups', 'read'),
('groups.write', 'Create and edit groups', 'groups_tags', 'groups', 'write'),
('groups.delete', 'Delete groups', 'groups_tags', 'groups', 'delete'),
('tags.read', 'View tags', 'groups_tags', 'tags', 'read'),
('tags.write', 'Create and edit tags', 'groups_tags', 'tags', 'write'),
('tags.delete', 'Delete tags', 'groups_tags', 'tags', 'delete');

-- Insert default roles
INSERT INTO admin_roles (name, description, is_system) VALUES
('Super Admin', 'Full system access with all permissions', TRUE),
('User Manager', 'Manage users, groups, and tags', TRUE),
('Content Manager', 'Manage content and materials', TRUE),
('Analytics Viewer', 'View analytics and generate reports', TRUE),
('Support Agent', 'Limited access for customer support', TRUE);

-- Assign permissions to Super Admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE name = 'Super Admin'),
  id
FROM permissions;

-- Assign permissions to User Manager role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE name = 'User Manager'),
  id
FROM permissions
WHERE category IN ('user_management', 'groups_tags');

-- Assign permissions to Content Manager role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE name = 'Content Manager'),
  id
FROM permissions
WHERE category IN ('content_management', 'groups_tags');

-- Assign permissions to Analytics Viewer role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE name = 'Analytics Viewer'),
  id
FROM permissions
WHERE category IN ('analytics', 'user_management');

-- Assign permissions to Support Agent role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE name = 'Support Agent'),
  id
FROM permissions
WHERE name IN ('users.read', 'users.write', 'groups.read', 'tags.read', 'analytics.read');

-- Add comments
COMMENT ON TABLE permissions IS 'System permissions for granular access control';
COMMENT ON TABLE admin_roles IS 'Admin roles with specific permission sets';
COMMENT ON TABLE role_permissions IS 'Many-to-many relationship between roles and permissions';
COMMENT ON TABLE user_permissions IS 'Direct permission assignments to users';
COMMENT ON TABLE user_roles IS 'Role assignments to users';
COMMENT ON COLUMN permissions.resource IS 'The resource being accessed (users, content, analytics, etc.)';
COMMENT ON COLUMN permissions.action IS 'The action being performed (read, write, delete, manage, etc.)';
COMMENT ON COLUMN user_permissions.expires_at IS 'Optional expiration date for temporary permissions';
COMMENT ON COLUMN user_roles.expires_at IS 'Optional expiration date for temporary role assignments';
