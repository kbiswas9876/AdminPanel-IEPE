-- Create user_activity_log table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_activity ON user_activity_log(user_id, activity_type);

-- Create RLS policies
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all activity logs
CREATE POLICY "Admins can view all activity logs" ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Policy for users to view their own activity logs
CREATE POLICY "Users can view their own activity logs" ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy for system to insert activity logs
CREATE POLICY "System can insert activity logs" ON user_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_user_activity_log_updated_at
  BEFORE UPDATE ON user_activity_log
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample activity data (optional - for testing)
INSERT INTO user_activity_log (user_id, activity_type, description, metadata) VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    'login',
    'User logged in',
    '{"ip_address": "192.168.1.1", "user_agent": "Mozilla/5.0..."}'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'test_attempt',
    'Attempted mock test',
    '{"test_name": "Mathematics Practice Test", "score": 85}'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'bookmark',
    'Bookmarked content',
    '{"content_type": "chapter", "content_id": "chapter_1"}'
  )
ON CONFLICT DO NOTHING;
