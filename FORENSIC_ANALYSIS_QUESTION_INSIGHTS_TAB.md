# Forensic Analysis Report: Question Insights Tab

**Date:** January 24, 2025  
**Component:** Question Insights Tab - Mock Test Report Section  
**Route:** `/tests/[testId]/report` → Tab: "Question Insights"  
**Status:** Complete Analysis

---

## Executive Summary

This report provides a comprehensive forensic analysis of the "Question Insights" tab in the Admin Panel's Mock Test Report section. The analysis identifies two critical issues:

1. **Question Numbering Anomaly:** Questions display incorrect numbers (e.g., starting from 23) instead of sequential numbering (1, 2, 3...)
2. **Static Statistics:** The current implementation only displays aggregated counts without interactive drill-down functionality

The root cause of the numbering issue has been identified in the `getQuestionInsightData` server action, which uses `question_number_in_book` from the database instead of calculating sequential positions based on the test's question order.

---

## Part 1: Architecture Overview

### 1.1 Component Hierarchy

```
TestReportPage (Server Component)
  └── /tests/[testId]/report/page.tsx
      └── TestReportDashboard (Client Component)
          └── src/components/tests/report/TestReportDashboard.tsx
              └── TabsContent (value="questions")
                  └── QuestionInsightsPage (ACTIVE) ✅
                      └── src/components/tests/question-insights/QuestionInsightsPage.tsx
                          ├── FiltersPanel (Client Component)
                          │   └── src/components/tests/question-insights/FiltersPanel.tsx
                          └── QuestionInsightCard (Client Component)
                              └── src/components/tests/question-insights/QuestionInsightCard.tsx
```

**Note:** There is also a legacy component `QuestionInsightsTab` (src/components/tests/report/QuestionInsightsTab.tsx) that is currently disabled via the `USE_NEW_QUESTION_INSIGHTS` flag set to `true` in `TestReportDashboard.tsx` (line 19).

### 1.2 Route Structure

- **Route:** `/tests/[testId]/report`
- **Page Component:** `src/app/tests/[testId]/report/page.tsx`
- **Active Tab Component:** `QuestionInsightsPage` (when `USE_NEW_QUESTION_INSIGHTS = true`)

---

## Part 2: Data Flow Analysis

### 2.1 Frontend Data Fetching

**Component:** `QuestionInsightsPage.tsx`

```typescript
// Location: src/components/tests/question-insights/QuestionInsightsPage.tsx
// Lines: 19-26

useEffect(() => {
  (async () => {
    setLoading(true)
    const data = await getQuestionInsightData(testId)
    setInsights(data)
    setLoading(false)
  })()
}, [testId])
```

**Key Details:**
- **Server Action:** `getQuestionInsightData(testId)` from `@/lib/actions/question-insights`
- **State Management:** React `useState` hook
- **Data Type:** `QuestionInsight[]` (defined in `@/lib/types/question-insights`)

### 2.2 Backend Data Source

**Server Action:** `getQuestionInsightData`

**Location:** `src/lib/actions/question-insights.ts`  
**Lines:** 37-154

#### Database Query Flow:

1. **Fetch Test Results (Attempts)**
   ```typescript
   // Lines: 41-50
   const { data: results } = await supabase
     .from('test_results')
     .select('id')
     .eq('mock_test_id', testId)
   ```
   - **Table:** `test_results`
   - **Purpose:** Get all test attempts for this test
   - **Output:** Array of `result_id` values

2. **Fetch Answer Logs**
   ```typescript
   // Lines: 54-63
   const { data: logs } = await supabase
     .from('answer_log')
     .select('result_id, question_id, status, time_taken')
     .in('result_id', resultIds)
   ```
   - **Table:** `answer_log`
   - **Purpose:** Get all student answers for these attempts
   - **Fields:** `result_id`, `question_id`, `status`, `time_taken`

3. **Fetch Test Questions (WITH JOINED QUESTION DATA)**
   ```typescript
   // Lines: 67-86
   const { data: tq } = await supabase
     .from('test_questions')
     .select(`
       question_id,
       questions:questions!inner(
         id,
         question_text,
         options,
         correct_option,
         chapter_name,
         difficulty,
         question_number_in_book
       )
     `)
     .eq('test_id', testId)
   ```
   - **Table:** `test_questions` (joined with `questions`)
   - **⚠️ CRITICAL ISSUE:** No `.order()` clause is present!
   - **Fields Fetched:**
     - `question_id` (from test_questions)
     - `id`, `question_text`, `options`, `correct_option` (from questions)
     - `chapter_name`, `difficulty`, `question_number_in_book` (from questions)

### 2.3 Data Processing Logic

**Location:** `src/lib/actions/question-insights.ts`  
**Lines:** 88-151

#### Aggregation Logic:

1. **Build Answer Map** (Lines 88-94)
   - Creates a `Map<questionId, answerLogs[]>`
   - Groups all answers by question ID

2. **Calculate Statistics Per Question** (Lines 98-122)
   - **Correct Count:** Answers with `status === 'correct'`
   - **Incorrect Count:** Answers with `status === 'incorrect'`
   - **Skipped Count:** Answers with `status === 'skipped'` (or null/empty)
   - **Time Arrays:** Collects `time_taken` values for correct answers and all answers

3. **Compute Metrics** (Lines 124-128)
   - **Correctness Percentage:** `(correct / attempted) * 100`
   - **Average Time (All):** Mean of all `time_taken` values
   - **Average Time (Correct):** Mean of `time_taken` for correct answers only
   - **Best Time (Correct):** Minimum `time_taken` for correct answers

4. **Calculate Realized Difficulty** (Line 130)
   - **Function:** `computeRealizedDifficulty(correctnessPct, avgAll, avgCorrect)`
   - **Logic:** Based on correctness percentage and time ratios
   - **Output:** `'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard'`

5. **Build Feedback Message** (Line 131)
   - **Function:** `buildFeedback(originalDifficulty, realizedDifficulty)`
   - **Output:** Human-readable feedback string

### 2.4 Data Structure (Type Definition)

**Location:** `src/lib/types/question-insights.ts`

```typescript
export interface QuestionInsight {
  questionId: number
  questionNumber: number | null  // ⚠️ ISSUE: Uses question_number_in_book
  questionText: string
  options: Record<string, string> | null
  correctOption: string | null
  topic: string | null
  difficultyOriginal: string | null
  counts: QuestionInsightCounts {
    correct: number
    incorrect: number
    skipped: number
  }
  times: QuestionInsightTimes {
    avgTimeAllSec: number | null
    avgTimeCorrectSec: number | null
    bestTimeCorrectSec: number | null
  }
  correctnessPct: number
  realizedDifficulty: RealizedDifficulty
  feedback: string
}
```

---

## Part 3: Root Cause Analysis

### 3.1 Question Numbering Issue

#### Problem Statement:
Questions display incorrect numbers (e.g., 23, 45, 67) instead of sequential numbers (1, 2, 3...) based on their position in the test.

#### Root Cause Location:
**File:** `src/lib/actions/question-insights.ts`  
**Line:** 135

```typescript
// CURRENT (INCORRECT) IMPLEMENTATION:
questionNumber: (q?.question_number_in_book as number | null) ?? null,
```

#### Root Cause Explanation:

1. **Wrong Data Source:** The code uses `question_number_in_book` from the `questions` table, which represents the question's number in the original book source, NOT its position in the test.

2. **No Ordering:** The query to `test_questions` does not include an `.order()` clause, so the order of questions is undefined (database-dependent, likely insertion order).

3. **Missing Sequential Calculation:** Unlike the old implementation (`getEnhancedQuestionAnalytics`), the new function does not calculate sequential numbers based on the loop index.

#### Comparison with Old Implementation:

**Old Function:** `getEnhancedQuestionAnalytics` (src/lib/actions/test-reports.ts, lines 574-690)

```typescript
// OLD (CORRECT) IMPLEMENTATION:
// Line 592: Orders test_questions
.order('id')  // ⚠️ Note: May not work if 'id' column doesn't exist

// Lines 635-671: Calculates sequential numbers
for (let i = 0; i < testQuestions.length; i++) {
  // ...
  analytics.push({
    questionId,
    questionNumber: i + 1,  // ✅ CORRECT: Sequential based on loop index
    // ...
  })
}
```

**Key Difference:**
- **Old:** Orders by `id` (may not work correctly), then uses loop index `i + 1` for sequential numbering
- **New:** No ordering, uses `question_number_in_book` from database

**⚠️ Important Note:** Since `test_questions` has no explicit `id` column (only composite primary key), the old function's `.order('id')` may not work as expected. The recommended fix is to use `.order('created_at')` which represents the insertion order and is explicitly present in the table.

### 3.2 Static Statistics Issue

#### Problem Statement:
The current implementation only displays aggregated counts (e.g., "Correct: 45") without the ability to drill down and see which specific students answered correctly/incorrectly.

#### Root Cause:

1. **No Detail Endpoint:** There is no server action or API endpoint to fetch student-level answer details for a specific question.

2. **No Modal Component:** There is no UI component (modal) to display the detailed student list.

3. **No Interactive Elements:** The statistics are displayed as static text/numbers without click handlers.

#### Current Implementation:

**Component:** `QuestionInsightCard.tsx`  
**Lines:** 57-61

```typescript
<div className="flex flex-wrap gap-4 text-sm text-slate-700">
  <div>✔ Correct: <span className="font-semibold text-green-700">{counts.correct}</span></div>
  <div>✖ Incorrect: <span className="font-semibold text-red-700">{counts.incorrect}</span></div>
  <div>⟳ Skipped: <span className="font-semibold text-slate-700">{counts.skipped}</span></div>
</div>
```

**Missing:**
- Click handlers on these statistics
- Modal component for displaying detailed student list
- Server action to fetch student-level data

---

## Part 4: Database Schema Analysis

### 4.1 Relevant Tables

#### `test_questions` Table
- **Purpose:** Junction table linking tests to questions
- **Primary Key:** Composite `(test_id, question_id)`
- **Columns:**
  - `test_id` (BIGINT) - References `tests(id)`
  - `question_id` (BIGINT) - References `questions(id)`
  - `created_at` (TIMESTAMPTZ)
  - Additional metadata columns (test_name, test_status, etc.)
- **⚠️ Important:** 
  - No explicit `id` column exists (composite primary key only)
  - No `order`/`position` column exists
  - **Ordering Strategy:** Should use `created_at` for consistent ordering (represents insertion order)
  - **Note:** The old function `getEnhancedQuestionAnalytics` uses `.order('id')`, which may not work correctly if `id` doesn't exist. Using `created_at` is safer.

#### `questions` Table
- **Purpose:** Stores question content and metadata
- **Key Columns:**
  - `id` (BIGSERIAL PRIMARY KEY)
  - `question_number_in_book` (INTEGER) - ⚠️ This is the source of the numbering issue
  - `question_text`, `options`, `correct_option`
  - `chapter_name`, `difficulty`

#### `answer_log` Table
- **Purpose:** Stores individual student answers
- **Key Columns:**
  - `id` (BIGSERIAL PRIMARY KEY)
  - `result_id` (BIGINT) - References `test_results(id)`
  - `question_id` (BIGINT) - References `questions(id)`
  - `user_id` (UUID) - References `auth.users(id)`
  - `status` (TEXT) - Values: `'correct'`, `'incorrect'`, `'skipped'`
  - `time_taken` (INTEGER) - Time in seconds
  - `user_answer` (TEXT) - The selected option

#### `test_results` Table
- **Purpose:** Stores test attempt summaries
- **Key Columns:**
  - `id` (BIGSERIAL PRIMARY KEY)
  - `user_id` (UUID) - References `auth.users(id)`
  - `mock_test_id` (BIGINT) - References `tests(id)`
  - Aggregated scores and counts

### 4.2 Data Relationships

```
tests (1) ──< (many) test_questions (many) >── (1) questions
                                                    │
                                                    │ (1)
                                                    │
                                                    ▼
                                                answer_log (many)
                                                    │
                                                    │ (many)
                                                    ▼
                                                test_results
```

---

## Part 5: Feature Inventory

### 5.1 Current Features

#### Search & Filtering
- **Search by Question Text:** ✅ Implemented (line 34-35 in QuestionInsightsPage.tsx)
- **Filter by Topic:** ✅ Implemented (lines 37-38)
- **Filter by Difficulty:** ✅ Implemented (lines 40-41)
- **Sort Options:**
  - ✅ Question Number (but incorrect data)
  - ✅ Most Correct
  - ✅ Most Incorrect
  - ✅ Slowest Average Time
  - ✅ Fastest Best Time

#### Statistics Display
- **Correct Count:** ✅ Implemented
- **Incorrect Count:** ✅ Implemented
- **Skipped Count:** ✅ Implemented
- **Correctness Percentage:** ✅ Implemented (with visual bar)
- **Average Time (All Attempts):** ✅ Implemented
- **Average Time (Correct Only):** ✅ Implemented
- **Best Time (Correct Only):** ✅ Implemented

#### Difficulty Analysis
- **Original Difficulty:** ✅ Displayed (from database)
- **Realized Difficulty:** ✅ Calculated and displayed
- **Feedback Message:** ✅ Generated based on performance vs. assigned difficulty

#### Visual Elements
- **Question Cards:** ✅ Implemented (QuestionInsightCard component)
- **Options Display:** ✅ Shows all options with correct option highlighted
- **Progress Bars:** ✅ Correctness percentage visualization
- **Difficulty Badges:** ✅ Color-coded difficulty tags

### 5.2 Missing Features

#### Interactive Drill-Down
- ❌ Click handlers on statistics
- ❌ Modal component for detailed view
- ❌ Server action to fetch student-level data
- ❌ Student list display (name, answer, time taken)
- ❌ Sorting within modal (by name, time taken)
- ❌ "Skipped" vs "Not Viewed" distinction

#### Enhanced Analytics
- ❌ Discrimination Index calculation
- ❌ Export functionality (CSV, PDF)
- ❌ Question-level time distribution charts

---

## Part 6: Data Integrity Issues

### 6.1 Question Ordering

**Issue:** The `test_questions` query does not specify an order, leading to:
- Unpredictable question order in the results
- Potential inconsistency across page loads
- Incorrect sequential numbering

**Impact:** High - Core functionality is broken

### 6.2 Question Numbering

**Issue:** Using `question_number_in_book` instead of sequential position

**Impact:** Critical - Users see incorrect question numbers (e.g., Q23, Q45 instead of Q1, Q2)

**Example:**
- Test has 10 questions
- Questions in database have `question_number_in_book` values: 23, 45, 67, 89, 12, 34, 56, 78, 90, 11
- **Current Display:** Q23, Q45, Q67, Q89, Q12, Q34, Q56, Q78, Q90, Q11
- **Expected Display:** Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10

---

## Part 7: Recommendations

### 7.1 Immediate Fixes (Critical)

1. **Fix Question Numbering**
   - Add `.order('id')` or `.order('created_at')` to the `test_questions` query
   - Calculate `questionNumber` as `i + 1` based on loop index (not `question_number_in_book`)

2. **Ensure Consistent Ordering**
   - Always order `test_questions` by a consistent field (e.g., `id` or `created_at`)
   - Document the ordering strategy

### 7.2 Feature Enhancements (High Priority)

1. **Implement Interactive Drill-Down**
   - Create server action: `getQuestionStudentDetails(questionId, testId)`
   - Create modal component: `QuestionDetailsModal`
   - Add click handlers to statistics in `QuestionInsightCard`
   - Implement student list with sorting (name, time taken)
   - Distinguish "Skipped" vs "Not Viewed"

2. **Enhance Data Display**
   - Add student names (from `auth.users` or `profiles` table)
   - Show individual answer choices
   - Display time taken per student
   - Add visual indicators for performance patterns

---

## Part 8: Code References

### 8.1 Key Files

| File | Purpose | Lines of Interest |
|------|---------|-------------------|
| `src/components/tests/question-insights/QuestionInsightsPage.tsx` | Main component | 19-26 (data fetching), 44-61 (filtering/sorting) |
| `src/lib/actions/question-insights.ts` | Server action | 37-154 (main logic), **135 (NUMBERING ISSUE)** |
| `src/components/tests/question-insights/QuestionInsightCard.tsx` | Display component | 14-90 (rendering) |
| `src/lib/types/question-insights.ts` | Type definitions | 22-35 (QuestionInsight interface) |
| `src/components/tests/report/TestReportDashboard.tsx` | Parent component | 19 (flag), 204-209 (conditional rendering) |

### 8.2 Database Tables

| Table | Purpose | Key Columns |
|-------|---------|--------------|
| `test_questions` | Test-question mapping | `test_id`, `question_id`, `created_at` |
| `questions` | Question content | `id`, `question_number_in_book` ⚠️, `question_text`, `difficulty` |
| `answer_log` | Student answers | `result_id`, `question_id`, `user_id`, `status`, `time_taken` |
| `test_results` | Test attempts | `id`, `user_id`, `mock_test_id` |

---

## Part 9: Implementation Plan Outline

### Phase 1: Fix Question Numbering (Critical)
1. Modify `getQuestionInsightData` to order `test_questions` by `id` or `created_at`
2. Change `questionNumber` calculation from `question_number_in_book` to `i + 1`
3. Test with multiple tests to ensure sequential numbering

### Phase 2: Implement Interactive Drill-Down
1. Create server action `getQuestionStudentDetails(questionId, testId)`
2. Create `QuestionDetailsModal` component
3. Add click handlers to statistics in `QuestionInsightCard`
4. Implement student list with sorting
5. Handle "Skipped" vs "Not Viewed" logic

### Phase 3: Testing & Validation
1. Test numbering fix with various test configurations
2. Test drill-down modal with different question types
3. Validate sorting functionality
4. Test edge cases (no attempts, all skipped, etc.)

---

## Conclusion

This forensic analysis has identified the root causes of both issues:

1. **Question Numbering Issue:** Caused by using `question_number_in_book` instead of calculating sequential positions. The fix requires ordering the `test_questions` query and using loop index for numbering.

2. **Static Statistics Issue:** Caused by missing interactive components and server actions. The fix requires creating a new server action, modal component, and click handlers.

The analysis provides a complete understanding of the current architecture, data flow, and database schema, enabling a robust implementation of the fixes and enhancements.

---

**End of Report**

