-- Create admin_settings table for user preferences
-- Migration: 20241220_create_admin_settings_table

CREATE TABLE IF NOT EXISTS admin_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Theme & UI Preferences
  theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  sidebar_collapsed BOOLEAN DEFAULT FALSE,
  dashboard_layout JSONB DEFAULT '{"widgets": []}'::jsonb,
  
  -- Notification Preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  notification_sound BOOLEAN DEFAULT TRUE,
  notification_frequency VARCHAR(20) DEFAULT 'realtime' CHECK (notification_frequency IN ('realtime', 'hourly', 'daily', 'off')),
  
  -- Security Settings
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  session_timeout_minutes INTEGER DEFAULT 480, -- 8 hours
  require_password_change BOOLEAN DEFAULT FALSE,
  
  -- Display Preferences
  items_per_page INTEGER DEFAULT 20 CHECK (items_per_page BETWEEN 10 AND 100),
  date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  time_format VARCHAR(10) DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_settings_user_id ON admin_settings(user_id);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own settings" ON admin_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON admin_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON admin_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

-- Function to create default settings for new users
CREATE OR REPLACE FUNCTION create_default_admin_settings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    INSERT INTO admin_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create settings when admin profile is created
DROP TRIGGER IF EXISTS trigger_create_default_admin_settings ON user_profiles;
CREATE TRIGGER trigger_create_default_admin_settings
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_admin_settings();

-- Add comments
COMMENT ON TABLE admin_settings IS 'User-specific settings and preferences for admin panel';
COMMENT ON COLUMN admin_settings.theme IS 'UI theme preference: light, dark, or auto';
COMMENT ON COLUMN admin_settings.sidebar_collapsed IS 'Whether sidebar is collapsed by default';
COMMENT ON COLUMN admin_settings.dashboard_layout IS 'JSON configuration for dashboard widget layout';
COMMENT ON COLUMN admin_settings.notification_frequency IS 'How often to receive notifications';
COMMENT ON COLUMN admin_settings.two_factor_enabled IS 'Whether 2FA is enabled for this user';
COMMENT ON COLUMN admin_settings.session_timeout_minutes IS 'Auto-logout after N minutes of inactivity';
COMMENT ON COLUMN admin_settings.items_per_page IS 'Default number of items to show in paginated lists';

