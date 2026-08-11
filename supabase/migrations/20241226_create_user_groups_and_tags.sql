-- Create user groups and tags system
-- Migration: 20241226_create_user_groups_and_tags

-- Create user_groups table
CREATE TABLE IF NOT EXISTS user_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
  is_system BOOLEAN DEFAULT FALSE, -- System groups cannot be deleted
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#10B981', -- Hex color for UI
  category VARCHAR(50) DEFAULT 'general', -- e.g., 'skill', 'department', 'level'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_group_members table (many-to-many)
CREATE TABLE IF NOT EXISTS user_group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- 'admin', 'moderator', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, group_id)
);

-- Create user_tags table (many-to-many)
CREATE TABLE IF NOT EXISTS user_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_groups_name ON user_groups(name);
CREATE INDEX IF NOT EXISTS idx_user_groups_created_by ON user_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category);
CREATE INDEX IF NOT EXISTS idx_user_group_members_user_id ON user_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_group_members_group_id ON user_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_user_id ON user_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_tag_id ON user_tags(tag_id);

-- Enable RLS
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_groups
CREATE POLICY "Admins can view all groups" ON user_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert groups" ON user_groups
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update groups" ON user_groups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete non-system groups" ON user_groups
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) AND is_system = FALSE
  );

-- RLS Policies for tags
CREATE POLICY "Admins can view all tags" ON tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert tags" ON tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update tags" ON tags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete tags" ON tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for user_group_members
CREATE POLICY "Admins can view all group members" ON user_group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage group members" ON user_group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for user_tags
CREATE POLICY "Admins can view all user tags" ON user_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage user tags" ON user_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default system groups
INSERT INTO user_groups (name, description, color, is_system, created_by) VALUES
('Administrators', 'System administrators with full access', '#DC2626', TRUE, (SELECT id FROM auth.users WHERE email = 'admin@algebros.com' LIMIT 1)),
('Students', 'Regular students with standard access', '#059669', TRUE, (SELECT id FROM auth.users WHERE email = 'admin@algebros.com' LIMIT 1)),
('Premium Students', 'Students with premium access', '#7C3AED', TRUE, (SELECT id FROM auth.users WHERE email = 'admin@algebros.com' LIMIT 1)),
('Beta Testers', 'Users testing new features', '#EA580C', TRUE, (SELECT id FROM auth.users WHERE email = 'admin@algebros.com' LIMIT 1));

-- Insert default tags
INSERT INTO tags (name, description, color, category, created_by) VALUES
('Mathematics', 'Students interested in mathematics', '#3B82F6', 'subject', (SELECT id FROM auth.users WHERE email = 'admin@algebros.com' LIMIT 1)),
('Physics', 'Students interested in physics', '#8B5CF6', 'subject', (SELECT id FROM auth.users WHERE email = 'admin@algebros.com' LIMIT 1)),
('Chemistry', 'Students interested in chemistry', '#10B981', 'subject', (SELECT id FROM auth.users WHERE email = 'admin@algebros.com' LIMIT 1)),
('Beginner', 'Entry level students', '#F59E0B', 'level', (SELECT id FROM auth.users WHERE email = 'admin@algebros.com' LIMIT 1)),
('Intermediate', 'Intermediate level students', '#EF4444', 'level', (SELECT id FROM auth.users WHERE email = 'admin@algebros.com' LIMIT 1)),
('Advanced', 'Advanced level students', '#8B5CF6', 'level', (SELECT id FROM auth.users WHERE email = 'admin@algebros.com' LIMIT 1)),
('High Performer', 'Students with excellent performance', '#10B981', 'performance', (SELECT id FROM auth.users WHERE email = 'admin@algebros.com' LIMIT 1)),
('Needs Support', 'Students requiring additional support', '#F59E0B', 'support', (SELECT id FROM auth.users WHERE email = 'admin@algebros.com' LIMIT 1));

-- Add comments
COMMENT ON TABLE user_groups IS 'User groups for organizing and managing users';
COMMENT ON TABLE tags IS 'Tags for categorizing and labeling users';
COMMENT ON TABLE user_group_members IS 'Many-to-many relationship between users and groups';
COMMENT ON TABLE user_tags IS 'Many-to-many relationship between users and tags';
COMMENT ON COLUMN user_groups.is_system IS 'System groups cannot be deleted and are managed by the application';
COMMENT ON COLUMN user_group_members.role IS 'Role within the group: admin, moderator, or member';
COMMENT ON COLUMN tags.category IS 'Category for organizing tags: subject, level, performance, support, etc.';
