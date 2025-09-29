-- Enhanced Test Questions Metadata Migration
-- This migration adds comprehensive test metadata to the test_questions table
-- to support robust test updates and enhanced data integrity

-- Add columns for scoring and timing rules
ALTER TABLE public.test_questions
ADD COLUMN total_time_minutes INTEGER;

ALTER TABLE public.test_questions
ADD COLUMN marks_per_correct REAL;

ALTER TABLE public.test_questions
ADD COLUMN penalty_per_incorrect REAL;

-- Add comments for clarity
COMMENT ON COLUMN public.test_questions.total_time_minutes IS 'Total time allowed for the test in minutes';
COMMENT ON COLUMN public.test_questions.marks_per_correct IS 'Marks awarded for each correct answer';
COMMENT ON COLUMN public.test_questions.penalty_per_incorrect IS 'Marks deducted for each incorrect answer';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_test_questions_total_time ON public.test_questions(total_time_minutes);
CREATE INDEX IF NOT EXISTS idx_test_questions_marks_per_correct ON public.test_questions(marks_per_correct);
CREATE INDEX IF NOT EXISTS idx_test_questions_penalty_per_incorrect ON public.test_questions(penalty_per_incorrect);

-- Update existing records with the denormalized data from the tests table
UPDATE public.test_questions 
SET 
  total_time_minutes = tests.total_time_minutes,
  marks_per_correct = tests.marks_per_correct,
  penalty_per_incorrect = tests.negative_marks_per_incorrect
FROM public.tests
WHERE public.test_questions.test_id = public.tests.id;

-- Add a comment explaining the enhanced denormalization strategy
COMMENT ON TABLE public.test_questions IS 'Join table linking tests and questions. Enhanced with comprehensive test metadata (name, status, timing, scoring) for robust test management and efficient safe deletion analysis.';
