-- Add test metadata columns to test_questions table for efficient safe deletion analysis
-- This denormalizes test name and status into the join table to eliminate complex joins
-- and provide accurate, fast querying for the Safe Deletion Analysis feature

-- Add test_name column to store the name of the test
ALTER TABLE public.test_questions
ADD COLUMN test_name TEXT;

-- Add test_status column to store the status of the test (e.g., 'DRAFT', 'PUBLISHED')
ALTER TABLE public.test_questions
ADD COLUMN test_status TEXT;

-- Add comments for clarity
COMMENT ON COLUMN public.test_questions.test_name IS 'Denormalized test name for efficient safe deletion analysis';
COMMENT ON COLUMN public.test_questions.test_status IS 'Denormalized test status for efficient safe deletion analysis';

-- Create an index on the new columns for better query performance
CREATE INDEX IF NOT EXISTS idx_test_questions_test_name ON public.test_questions(test_name);
CREATE INDEX IF NOT EXISTS idx_test_questions_test_status ON public.test_questions(test_status);

-- Update existing records with the denormalized data
-- This populates the new columns for all existing test_questions records
UPDATE public.test_questions 
SET 
  test_name = tests.name,
  test_status = tests.status
FROM public.tests
WHERE public.test_questions.test_id = public.tests.id;

-- Add a comment explaining the denormalization strategy
COMMENT ON TABLE public.test_questions IS 'Join table linking tests and questions. Denormalized with test_name and test_status for efficient safe deletion analysis.';
