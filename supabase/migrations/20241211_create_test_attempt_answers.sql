-- Create table for storing detailed student answers for each question in a test attempt
CREATE TABLE IF NOT EXISTS test_attempt_answers (
  id BIGSERIAL PRIMARY KEY,
  attempt_id BIGINT NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  selected_option TEXT, -- 'a', 'b', 'c', 'd', or NULL if unattempted
  correct_option TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  marks_awarded DECIMAL(10, 2) NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one answer per question per attempt
  UNIQUE(attempt_id, question_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_test_attempt_answers_attempt_id ON test_attempt_answers(attempt_id);
CREATE INDEX idx_test_attempt_answers_question_id ON test_attempt_answers(question_id);
CREATE INDEX idx_test_attempt_answers_is_correct ON test_attempt_answers(is_correct);

-- Add RLS policies
ALTER TABLE test_attempt_answers ENABLE ROW LEVEL SECURITY;

-- Allow admins full access
CREATE POLICY "Admins can manage all test attempt answers"
  ON test_attempt_answers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Allow students to view their own answers
CREATE POLICY "Students can view their own answers"
  ON test_attempt_answers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM test_attempts
      WHERE test_attempts.id = test_attempt_answers.attempt_id
      AND test_attempts.user_id = auth.uid()
    )
  );

COMMENT ON TABLE test_attempt_answers IS 'Stores detailed answer information for each question in a test attempt';
COMMENT ON COLUMN test_attempt_answers.selected_option IS 'The option selected by the student (a/b/c/d) or NULL if unattempted';
COMMENT ON COLUMN test_attempt_answers.time_spent_seconds IS 'Time spent by student on this specific question';

