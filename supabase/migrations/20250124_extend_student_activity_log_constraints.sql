-- Extend student_activity_log check constraint to include admin action types
-- Migration: 20250124_extend_student_activity_log_constraints

-- Drop existing constraint
ALTER TABLE public.student_activity_log 
DROP CONSTRAINT IF EXISTS student_activity_log_activity_type_check;

-- Add updated constraint with new admin action types
ALTER TABLE public.student_activity_log
ADD CONSTRAINT student_activity_log_activity_type_check CHECK (
  activity_type = ANY (ARRAY[
    'PRACTICE_SESSION_COMPLETED'::text,
    'MOCK_TEST_COMPLETED'::text,
    'QUESTION_BOOKMARKED'::text,
    'QUESTION_UNBOOKMARKED'::text,
    'REVIEW_SESSION_COMPLETED'::text,
    'ADMIN_ACCOUNT_APPROVED'::text,
    'ADMIN_ACCOUNT_SUSPENDED'::text,
    'ADMIN_ACCOUNT_ACTIVATED'::text,
    'ADMIN_NOTE_ADDED'::text,
    'ADMIN_DATA_EXPORTED'::text
  ])
);

-- Add comments for new activity types
COMMENT ON CONSTRAINT student_activity_log_activity_type_check ON public.student_activity_log IS 
'Extended activity types including admin actions: APPROVED, SUSPENDED, ACTIVATED, NOTE_ADDED, DATA_EXPORTED';

