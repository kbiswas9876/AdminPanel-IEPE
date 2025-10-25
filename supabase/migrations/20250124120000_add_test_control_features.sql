-- Add teacher-controlled test features to tests table
-- This migration adds allow_pausing and show_in_question_timer columns
-- with smart defaults: existing tests get TRUE (preserve current behavior),
-- new tests default to FALSE (strict mode)

-- Step 1: Add columns with default TRUE to backfill existing tests
ALTER TABLE public.tests
ADD COLUMN allow_pausing BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN show_in_question_timer BOOLEAN NOT NULL DEFAULT TRUE;

-- Step 2: Change the default for all NEW rows going forward to be FALSE (strict mode)
ALTER TABLE public.tests
ALTER COLUMN allow_pausing SET DEFAULT FALSE,
ALTER COLUMN show_in_question_timer SET DEFAULT FALSE;

-- Add comments for clarity
COMMENT ON COLUMN public.tests.allow_pausing IS 'If TRUE, students can pause this specific mock test. Defaults to FALSE for new tests.';
COMMENT ON COLUMN public.tests.show_in_question_timer IS 'If TRUE, the timer for each individual question will be displayed. Defaults to FALSE for new tests.';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tests_allow_pausing ON public.tests(allow_pausing);
CREATE INDEX IF NOT EXISTS idx_tests_show_in_question_timer ON public.tests(show_in_question_timer);
