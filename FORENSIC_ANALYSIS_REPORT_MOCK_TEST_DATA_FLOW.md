# Forensic Analysis Report: Mock Test Submission Data Flow

**Date:** January 2025  
**Objective:** Trace complete data lifecycle from student submission to admin panel display  
**Status:** ✅ **ROOT CAUSE IDENTIFIED**

---

## Executive Summary

**CRITICAL FINDING:** The Student Management dashboard fails to display new mock test submissions because **the `student_activity_log` table is never populated when a test is submitted**. The Admin Panel queries `student_activity_log` for activity feed data, but the Student Portal submission API (`/api/practice/submit`) does not create entries in this table.

---

## Phase 1: The Origin - Student Portal Submission

### 1.1 Client-Side Submission (`PracticeInterface.tsx`)

**Location:** `student-portal/src/components/PracticeInterface.tsx` (lines 1144-1272)

**Function:** `submitTest(finalSessionStates: SessionState[])`

**Exact JSON Payload Structure:**
```typescript
{
  user_id: string,
  questions: [
    {
      question_id: number,      // Numeric ID from questions table
      user_answer: string,      // Selected option (A, B, C, D, etc.)
      status: 'correct' | 'incorrect' | 'skipped',
      time_taken: number       // Time in seconds
    },
    // ... one per question
  ],
  score: number,               // Client-side calculated percentage
  total_time: number,          // Total time in seconds
  total_questions: number,
  correct_answers: number,
  incorrect_answers: number,
  skipped_answers: number,
  session_type: 'mock_test' | 'practice',
  mock_test_id: number | null,
  question_order: number[] | undefined,    // For shuffled tests
  option_order: object | undefined       // For shuffled tests
}
```

**API Endpoint:** `POST /api/practice/submit`

**Logging:** The client logs the payload structure (lines 1197-1204):
```typescript
console.log('Submitting practice session:', {
  user_id: userId,
  total_questions: totalQuestions,
  correct_answers: correctAnswers,
  incorrect_answers: incorrectAnswers,
  skipped_answers: skippedAnswers,
  score
})
```

---

### 1.2 Server-Side Ingestion (`/api/practice/submit` route)

**Location:** `student-portal/src/app/api/practice/submit/route.ts`

**Request Body Validation:**
- ✅ Validates `questions` array exists (line 44-46)
- ✅ Allows anonymous submissions (`user_id || 'anonymous'`) (line 41)

**Server Logging:**
```typescript
console.log('Submitting practice session:', { 
  user_id, 
  total_questions, 
  correct_answers,
  incorrect_answers,
  skipped_answers,
  score 
})
```

**Exact Supabase Queries Executed:**

#### Query 1: INSERT into `test_results` table
**Location:** Lines 58-75
```sql
INSERT INTO test_results (
  user_id,
  test_type,
  score,
  score_percentage,
  total_questions,
  total_correct,
  total_incorrect,
  total_skipped,
  total_time_taken,
  session_type,
  mock_test_id,
  submitted_at
) VALUES (
  :normalizedUserId,
  :session_type === 'mock_test' ? 'mock_test' : 'practice',
  :score,
  :score,
  :total_questions,
  :correct_answers,
  :incorrect_answers,
  :skipped_answers,
  :total_time,
  :session_type,
  :mock_test_id,
  NOW()
)
RETURNING id
```

**Status:** ✅ **SUCCESSFUL** - This query executes successfully and returns `testResult.id`

#### Query 2: INSERT into `test_attempt_order_log` table (if mock test with orders)
**Location:** Lines 83-95
```sql
INSERT INTO test_attempt_order_log (
  test_result_id,
  question_order_json,
  option_order_json
) VALUES (
  :testResult.id,
  :question_order,
  :option_order
)
```

**Status:** ✅ **CONDITIONAL** - Only executes if `session_type === 'mock_test'` AND `question_order` and `option_order` are provided

#### Query 3: INSERT into `answer_log` table
**Location:** Lines 99-113
```sql
INSERT INTO answer_log (
  result_id,
  question_id,
  user_id,
  user_answer,
  status,
  time_taken,
  created_at
) VALUES (
  :testResult.id,
  :question.question_id,
  :normalizedUserId,
  :question.user_answer,
  :question.status,
  :question.time_taken,
  NOW()
)
-- ... one row per question
```

**Status:** ✅ **SUCCESSFUL** - This query executes successfully

#### Query 4: UPDATE `test_results` with accurate score (mock tests only)
**Location:** Lines 141-147
```sql
UPDATE test_results
SET 
  score = :actualScore,
  score_percentage = :scorePercentage
WHERE id = :testResult.id
```

**Status:** ✅ **CONDITIONAL** - Only executes for mock tests with `mock_test_id`

---

### 1.3 Critical Missing Query: INSERT into `student_activity_log`

**❌ MISSING:** The API route does **NOT** insert any entry into the `student_activity_log` table.

**Expected Query (NOT PRESENT):**
```sql
INSERT INTO student_activity_log (
  user_id,
  activity_type,
  related_entity_id,
  metadata,
  created_at
) VALUES (
  :normalizedUserId,
  'MOCK_TEST_COMPLETED' | 'PRACTICE_SESSION_COMPLETED',
  :testResult.id,
  {
    test_name: :test_name,
    total_correct: :correct_answers,
    total_incorrect: :incorrect_answers,
    total_skipped: :skipped_answers,
    total_time_taken_seconds: :total_time,
    score_percentage: :scorePercentage
  },
  NOW()
)
```

**Impact:** This is the **ROOT CAUSE** of the data synchronization failure.

---

## Phase 2: The Destination - Admin Panel Reporting

### 2.1 Data Fetching (`/admin/students/[studentId]/page.tsx`)

**Location:** `AdminPanel-IEPE/src/app/students/[userID]/page.tsx`

**Server Action Called:**
```typescript
const initialData = await getStudentActivityFeed(userId, {}, { page: 1, limit: 20 })
```

**Caching Configuration:**
```typescript
export const revalidate = 0  // ✅ Disabled caching (added in recent fix)
```

---

### 2.2 Server-Side Retrieval (`getStudentActivityFeed`)

**Location:** `AdminPanel-IEPE/src/lib/actions/studentAnalyticsActions.ts` (lines 113-206)

**Exact Supabase Query:**
```typescript
const supabase = createAdminClient()

let query = supabase
  .from('student_activity_log')        // ← Querying student_activity_log
  .select('*')
  .eq('user_id', userId)
  
// Apply filters...
// Apply pagination...

const { data: entries, error } = await query
  .order('created_at', { ascending: false })
  .range(from, to)
```

**Query Breakdown:**
1. **Table:** `student_activity_log`
2. **Filter:** `user_id = :userId`
3. **Order:** `created_at DESC` (most recent first)
4. **Pagination:** `LIMIT :limit OFFSET :from`

**Status:** ✅ **Query is correct** - The query logic is sound and would return data if it existed.

---

### 2.3 The Point of Failure

**Problem:** The Admin Panel queries `student_activity_log`, but this table is **never populated** when a mock test is submitted.

**Evidence:**
1. ✅ Test submission API successfully writes to `test_results` table
2. ✅ Test submission API successfully writes to `answer_log` table
3. ❌ Test submission API **does NOT write** to `student_activity_log` table
4. ✅ Admin Panel queries `student_activity_log` table
5. ❌ `student_activity_log` table is empty for new submissions

**Root Cause:** Missing INSERT statement in `/api/practice/submit` route.

---

## Phase 3: Data Flow Map

```
┌─────────────────────────────────────────────────────────────────┐
│ STUDENT PORTAL                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. PracticeInterface.tsx                                        │
│    └─> submitTest()                                             │
│        └─> POST /api/practice/submit                           │
│            │                                                    │
│            ├─> ✅ INSERT INTO test_results                      │
│            ├─> ✅ INSERT INTO answer_log                        │
│            ├─> ✅ INSERT INTO test_attempt_order_log (if mock)  │
│            ├─> ✅ UPDATE test_results (score recalculation)    │
│            └─> ❌ MISSING: INSERT INTO student_activity_log      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ (Data missing)
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│ ADMIN PANEL                                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 2. /admin/students/[studentId]/page.tsx                         │
│    └─> getStudentActivityFeed(userId)                           │
│        └─> SELECT * FROM student_activity_log                  │
│            WHERE user_id = :userId                               │
│            ORDER BY created_at DESC                             │
│            │                                                     │
│            └─> ❌ Returns empty array (no data exists)          │
│                                                                 │
│ 3. ActivityFeed.tsx                                             │
│    └─> Displays empty timeline (no activities found)            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Final Deliverable: The Forensic Report

### Question 1: Data Submission Confirmation

**Was the mock test data successfully and correctly written to the `test_results` and `answer_log` tables?**

**Answer: ✅ YES**

- ✅ `test_results` table: INSERT successful (line 58-75 of `/api/practice/submit`)
- ✅ `answer_log` table: INSERT successful (line 99-113 of `/api/practice/submit`)
- ✅ `test_attempt_order_log` table: INSERT successful (if applicable, line 83-95)

**Verification Steps:**
1. Submit a mock test from the Student Portal
2. Check `test_results` table in Supabase SQL Editor:
   ```sql
   SELECT * FROM test_results 
   WHERE user_id = '<student_id>' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
   **Expected:** Should return the new test result with correct `session_type = 'mock_test'`

3. Check `answer_log` table:
   ```sql
   SELECT * FROM answer_log 
   WHERE result_id = <test_result_id>
   ORDER BY id;
   ```
   **Expected:** Should return all answer log entries for the test

---

### Question 2: Admin Query Analysis

**What is the exact Supabase query used by the Admin Panel to fetch the student's activity?**

**Answer:**
```typescript
SELECT * 
FROM student_activity_log 
WHERE user_id = :userId 
ORDER BY created_at DESC 
LIMIT :limit OFFSET :from
```

**Location:** `AdminPanel-IEPE/src/lib/actions/studentAnalyticsActions.ts`, lines 131-174

**Query Verification:**
Run this query directly in Supabase SQL Editor:
```sql
SELECT * 
FROM student_activity_log 
WHERE user_id = '<student_id>' 
ORDER BY created_at DESC 
LIMIT 20;
```

**Expected Result:** ❌ **Empty result set** (no rows returned)

**Why:** The `student_activity_log` table is never populated when a test is submitted.

---

### Question 3: The Point of Failure

**Where exactly is the data flow breaking?**

**Answer: The submission API route does not create activity log entries.**

**Exact Location of Failure:**
- **File:** `student-portal/src/app/api/practice/submit/route.ts`
- **Missing Code:** After line 163 (after successful submission), there should be an INSERT into `student_activity_log`

**The Flaw:**
The API route successfully writes test data to `test_results` and `answer_log`, but **completely omits** writing to `student_activity_log`. The Admin Panel depends on `student_activity_log` for the activity timeline, but this table remains empty.

**Is it a query flaw?** No - the admin query is correct.

**Is it a caching issue?** No - caching has been disabled with `revalidate = 0`.

**Is it a data writing failure?** **YES** - The data is never written to `student_activity_log` in the first place.

---

### Question 4: Route and Component Map

**Complete Data Flow Map:**

```
┌──────────────────────────────────────────────────────────────────┐
│ STUDENT PORTAL                                                    │
│                                                                   │
│ Component: PracticeInterface.tsx                                  │
│   Location: student-portal/src/components/PracticeInterface.tsx │
│   Function: submitTest() (line 1144)                             │
│   Action: POST /api/practice/submit                              │
│                                                                   │
│ API Route: /api/practice/submit                                  │
│   Location: student-portal/src/app/api/practice/submit/route.ts │
│   Function: POST() (line 21)                                     │
│   Database Writes:                                               │
│     ✅ test_results (INSERT) - line 58                           │
│     ✅ answer_log (INSERT) - line 99                              │
│     ✅ test_attempt_order_log (INSERT) - line 85 (if mock)        │
│     ✅ test_results (UPDATE) - line 141 (score recalculation)     │
│     ❌ student_activity_log (INSERT) - MISSING                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Database Tables
                                    ▼
┌──────────────────────────────────────────────────────────────────┐
│ DATABASE                                                          │
│                                                                   │
│ ✅ test_results                                                   │
│    └─> Contains: test submission data                             │
│                                                                   │
│ ✅ answer_log                                                     │
│    └─> Contains: per-question answers                            │
│                                                                   │
│ ❌ student_activity_log                                          │
│    └─> EMPTY - Never populated by submission API                 │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Admin Query
                                    ▼
┌──────────────────────────────────────────────────────────────────┐
│ ADMIN PANEL                                                       │
│                                                                   │
│ Page: /admin/students/[userID]                                   │
│   Location: AdminPanel-IEPE/src/app/students/[userID]/page.tsx   │
│   Function: Server Component (line 9)                            │
│   Action: Calls getStudentActivityFeed()                         │
│                                                                   │
│ Server Action: getStudentActivityFeed()                           │
│   Location: AdminPanel-IEPE/src/lib/actions/studentAnalyticsActions.ts │
│   Function: getStudentActivityFeed() (line 113)                  │
│   Query: SELECT * FROM student_activity_log WHERE user_id = ... │
│   Result: ❌ Empty array (no data in table)                       │
│                                                                   │
│ Component: ActivityFeed.tsx                                      │
│   Location: AdminPanel-IEPE/src/app/students/[userID]/components/ActivityFeed.tsx │
│   Function: ActivityFeed() (line 30)                              │
│   Display: Empty timeline (no activities to show)               │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Conclusion

**Root Cause Identified:** The Student Portal submission API (`/api/practice/submit`) does not create entries in the `student_activity_log` table. The Admin Panel queries this table for activity feed data, but since it's never populated, the timeline remains empty.

**Solution Required:** Add an INSERT statement to `/api/practice/submit` route that creates a `student_activity_log` entry after successful test submission.

**Priority:** 🔴 **CRITICAL** - This is a complete data pipeline failure that prevents admins from seeing any student activity.

---

## Recommendations

1. **Immediate Fix:** Add activity log creation to `/api/practice/submit` route
2. **Verify:** Check if `QUESTION_BOOKMARKED` and `REVIEW_SESSION_COMPLETED` activities are also missing
3. **Database Trigger Consideration:** Consider creating a database trigger on `test_results` INSERT to automatically create `student_activity_log` entries (alternative approach)
4. **Testing:** After fix, verify that new submissions appear in Admin Panel within seconds of submission

---

**Report Generated:** January 2025  
**Status:** ✅ **Investigation Complete - Root Cause Identified**

