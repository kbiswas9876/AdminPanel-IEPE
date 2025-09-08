-- Create notification_read_status table to track which notifications have been read by users
CREATE TABLE IF NOT EXISTS notification_read_status (
  id BIGSERIAL PRIMARY KEY,
  notification_id INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one read status per notification per user
  UNIQUE(notification_id, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notification_read_status_user_id ON notification_read_status(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_read_status_notification_id ON notification_read_status(notification_id);

-- Enable RLS
ALTER TABLE notification_read_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notification read status" ON notification_read_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification read status" ON notification_read_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification read status" ON notification_read_status
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_read_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_notification_read_status_updated_at
  BEFORE UPDATE ON notification_read_status
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_read_status_updated_at();
