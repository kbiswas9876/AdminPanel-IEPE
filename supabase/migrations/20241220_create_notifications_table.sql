-- Create proper notifications table for centralized notification management
-- Migration: 20241220_create_notifications_table

-- Drop existing notification_read_status if it exists (we'll recreate with proper FKs)
-- Note: In production, you might want to migrate data first
-- DROP TABLE IF EXISTS notification_read_status CASCADE;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  
  -- User who should receive this notification
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification details
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'user_registration',
    'error_report',
    'question_added',
    'test_published',
    'system_alert',
    'admin_login',
    'admin_action',
    'bulk_import',
    'test_created'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Source tracking
  source_table VARCHAR(50), -- e.g., 'user_profiles', 'error_reports', 'tests'
  source_id BIGINT, -- ID of the source record
  
  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Read status (denormalized for performance)
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Notification lifecycle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'), -- Auto-expire after 90 days
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_source ON notifications(source_table, source_id);

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC) WHERE deleted_at IS NULL;

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (
    auth.uid() = user_id AND 
    deleted_at IS NULL AND 
    (expires_at IS NULL OR expires_at > NOW())
  );

-- Users can update read status of their own notifications
CREATE POLICY "Users can update their own notification read status" ON notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System can insert notifications (allow server-side inserts)
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Users can soft delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
  -- Soft delete notifications that have expired
  UPDATE notifications
  SET deleted_at = NOW()
  WHERE expires_at < NOW()
    AND deleted_at IS NULL;
  
  -- Hard delete notifications that have been soft-deleted for more than 30 days
  DELETE FROM notifications
  WHERE deleted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET read = TRUE,
      read_at = NOW()
  WHERE id = notification_id
    AND user_id = auth.uid()
    AND read = FALSE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for current user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications
  SET read = TRUE,
      read_at = NOW()
  WHERE user_id = auth.uid()
    AND read = FALSE
    AND deleted_at IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification (helper for triggers)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title TEXT,
  p_message TEXT,
  p_source_table VARCHAR(50) DEFAULT NULL,
  p_source_id BIGINT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days')
)
RETURNS BIGINT AS $$
DECLARE
  new_notification_id BIGINT;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    source_table,
    source_id,
    metadata,
    expires_at
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_source_table,
    p_source_id,
    p_metadata,
    p_expires_at
  )
  RETURNING id INTO new_notification_id;
  
  RETURN new_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to notify admins of new user registrations
CREATE OR REPLACE FUNCTION notify_admins_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Only create notification for pending users
  IF NEW.status = 'pending' THEN
    -- Get all admin users
    FOR admin_record IN 
      SELECT id FROM user_profiles 
      WHERE role IN ('admin', 'super_admin') 
      AND status = 'active'
    LOOP
      PERFORM create_notification(
        admin_record.id,
        'user_registration',
        'New User Registration',
        (NEW.full_name || ' (' || NEW.email || ') has registered and is awaiting approval'),
        'user_profiles',
        NEW.id::BIGINT,
        jsonb_build_object('userId', NEW.id, 'userEmail', NEW.email),
        NOW() + INTERVAL '30 days'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to notify admins of new error reports
CREATE OR REPLACE FUNCTION notify_admins_new_error_report()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Get all admin users
  FOR admin_record IN 
    SELECT id FROM user_profiles 
    WHERE role IN ('admin', 'super_admin') 
    AND status = 'active'
  LOOP
    PERFORM create_notification(
      admin_record.id,
      'error_report',
      'New Error Report',
      COALESCE(NEW.title, 'New error report submitted'),
      'error_reports',
      NEW.id,
      jsonb_build_object('reportId', NEW.id, 'status', NEW.status),
      NOW() + INTERVAL '30 days'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers (optional - can be enabled later)
-- Uncomment to enable automatic notification creation

-- DROP TRIGGER IF EXISTS trigger_notify_admins_new_user ON user_profiles;
-- CREATE TRIGGER trigger_notify_admins_new_user
--   AFTER INSERT ON user_profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_admins_new_user();

-- DROP TRIGGER IF EXISTS trigger_notify_admins_new_error_report ON error_reports;
-- CREATE TRIGGER trigger_notify_admins_new_error_report
--   AFTER INSERT ON error_reports
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_admins_new_error_report();

-- Add comments for documentation
COMMENT ON TABLE notifications IS 'Centralized notification system for all user notifications';
COMMENT ON COLUMN notifications.user_id IS 'User who receives this notification';
COMMENT ON COLUMN notifications.type IS 'Category of notification';
COMMENT ON COLUMN notifications.source_table IS 'Source table name (e.g., user_profiles, error_reports)';
COMMENT ON COLUMN notifications.source_id IS 'ID of the source record';
COMMENT ON COLUMN notifications.metadata IS 'Additional JSON data for the notification';
COMMENT ON COLUMN notifications.read IS 'Whether the notification has been read (denormalized for performance)';
COMMENT ON COLUMN notifications.expires_at IS 'When the notification should expire (default 90 days)';
COMMENT ON COLUMN notifications.deleted_at IS 'Soft delete timestamp';

COMMENT ON FUNCTION create_notification IS 'Helper function to create notifications with proper validation';
COMMENT ON FUNCTION mark_notification_read IS 'Mark a single notification as read for current user';
COMMENT ON FUNCTION mark_all_notifications_read IS 'Mark all unread notifications as read for current user';
COMMENT ON FUNCTION cleanup_expired_notifications IS 'Cleanup expired and old notifications (run via cron)';

-- Note: Set up a cron job or scheduled task to run cleanup_expired_notifications periodically
-- Example: Run daily at 2 AM
-- SELECT cron.schedule('cleanup-notifications', '0 2 * * *', 'SELECT cleanup_expired_notifications()');

