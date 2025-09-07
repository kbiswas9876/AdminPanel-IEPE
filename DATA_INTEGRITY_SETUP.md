# Data Integrity Protection Setup

## Overview

This document provides the SQL script required to implement data integrity protection for question deletion. This prevents accidentally breaking existing tests when deleting questions from the master question bank.

## The Problem

By default, when a question is deleted from the master question bank, it could cascade and break existing tests that reference that question. This creates an unstable system where tests can become corrupted.

## The Solution

We implement a two-part solution:

1. **Database Constraint**: Change the foreign key relationship to `ON DELETE RESTRICT`
2. **Application Logic**: Check for test dependencies before deletion and show user-friendly error messages

## SQL Script to Run in Supabase

**⚠️ IMPORTANT**: Run this script in your Supabase SQL Editor to update the database constraint.

```sql
-- Data Integrity Protection: Prevent Question Deletion from Breaking Tests
-- This script updates the foreign key relationship to protect test integrity.

-- Step 1: Drop the old, potentially dangerous CASCADE constraint
ALTER TABLE public.test_questions
DROP CONSTRAINT IF EXISTS test_questions_question_id_fkey;

-- Step 2: Add the new, safer RESTRICT constraint
ALTER TABLE public.test_questions
ADD CONSTRAINT test_questions_question_id_fkey
FOREIGN KEY (question_id)
REFERENCES public.questions (id)
ON DELETE RESTRICT; -- The crucial change is here

-- Add a comment for clarity
COMMENT ON CONSTRAINT test_questions_question_id_fkey ON public.test_questions IS 'RESTRICT delete to prevent deleting a question that is part of an existing test.';
```

## What This Does

### Before (Dangerous)
- Deleting a question from the master bank would automatically delete all references in `test_questions`
- This would break existing tests, causing them to crash or be missing questions
- No warning or protection for the admin

### After (Safe)
- The database physically prevents deletion of questions that are used in tests
- The application checks for dependencies and shows a user-friendly error message
- Admins get clear guidance on what tests need to be updated first

## Application Logic

The application now includes:

1. **Pre-deletion Check**: Before attempting to delete a question, the system checks if it's used in any tests
2. **User-Friendly Error Messages**: If the question is used in tests, the admin sees:
   - Clear explanation of why deletion was blocked
   - List of specific tests that use the question
   - Instructions on how to proceed (remove from tests first)
3. **Graceful Handling**: No cryptic database errors, just professional user guidance

## Benefits

- **Data Integrity**: Impossible to accidentally break existing tests
- **Professional UX**: Clear, actionable error messages instead of database errors
- **System Stability**: Tests remain functional and reliable
- **Admin Guidance**: Clear instructions on how to proceed when deletion is blocked

## Testing the Implementation

After running the SQL script:

1. Create a test with some questions
2. Try to delete one of those questions from the Content Management page
3. You should see a professional error dialog listing the tests that use the question
4. The question should not be deleted, and the test should remain intact

## Rollback (If Needed)

If you need to revert to the old behavior (not recommended):

```sql
-- Rollback script (NOT RECOMMENDED)
ALTER TABLE public.test_questions
DROP CONSTRAINT IF EXISTS test_questions_question_id_fkey;

ALTER TABLE public.test_questions
ADD CONSTRAINT test_questions_question_id_fkey
FOREIGN KEY (question_id)
REFERENCES public.questions (id)
ON DELETE CASCADE;
```

---

**Note**: This is a critical security and data integrity feature. The `ON DELETE RESTRICT` constraint is the industry standard for protecting referential integrity in production systems.
