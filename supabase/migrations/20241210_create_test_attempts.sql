-- Create test_attempts table for storing student test attempts
-- This table stores the main test attempt records before detailed answers

CREATE TABLE IF NOT EXISTS test_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id BIGINT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  score DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_incorrect INTEGER NOT NULL DEFAULT 0,
  total_skipped INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX idx_test_attempts_test_id ON test_attempts(test_id);
CREATE INDEX idx_test_attempts_completed_at ON test_attempts(completed_at DESC);
CREATE INDEX idx_test_attempts_score ON test_attempts(score DESC);

-- Add RLS policies
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

-- Allow admins full access
CREATE POLICY "Admins can manage all test attempts"
  ON test_attempts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Allow students to view their own attempts
CREATE POLICY "Students can view their own attempts"
  ON test_attempts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow students to insert their own attempts
CREATE POLICY "Students can create their own attempts"
  ON test_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow students to update their own attempts
CREATE POLICY "Students can update their own attempts"
  ON test_attempts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Add comments
COMMENT ON TABLE test_attempts IS 'Stores student test attempt records with scores and timing';
COMMENT ON COLUMN test_attempts.score IS 'Total score achieved in the test';
COMMENT ON COLUMN test_attempts.total_correct IS 'Number of correct answers';
COMMENT ON COLUMN test_attempts.total_incorrect IS 'Number of incorrect answers';
COMMENT ON COLUMN test_attempts.total_skipped IS 'Number of skipped questions';
COMMENT ON COLUMN test_attempts.time_taken_seconds IS 'Total time taken to complete the test in seconds';

