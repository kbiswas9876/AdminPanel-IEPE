# Mock Test Results Data Flow Analysis

## Executive Summary

This document provides a comprehensive analysis of how mock test metrics (marks, rank, percentile) are calculated and fetched in the Student Portal system. The data flow is fully **on-demand** and calculated dynamically for each request, with no pre-calculated ranking system.

---

## 1. Marks Calculation

### Source Tables
- **Primary:** `test_results` table
- **Secondary:** `tests` table (for marking scheme)

### Calculation Process

The marks are calculated **on-demand** using the following logic from `student-portal/src/app/api/mock-tests/route.ts`:

```typescript
// Lines 88-90
const marksObtained = (attempt.total_correct * test.marks_per_correct) - 
                    (attempt.total_incorrect * Math.abs(test.negative_marks_per_incorrect))
const totalMarks = attempt.total_questions * test.marks_per_correct
```

### Data Source
- **`total_correct`**: Stored in `test_results` table (count of correct answers)
- **`total_incorrect`**: Stored in `test_results` table (count of incorrect answers)
- **`marks_per_correct`**: Stored in `tests` table (e.g., 4 marks per correct answer)
- **`negative_marks_per_incorrect`**: Stored in `tests` table (e.g., -1 mark per incorrect answer)

### Database Query

The marking scheme is fetched from the `tests` table:

```sql
SELECT 
  id,
  name,
  marks_per_correct,
  negative_marks_per_incorrect,
  status
FROM tests
WHERE id = {mock_test_id}
```

### Questions Addressed

- **Final Score Calculation:** `marks_obtained / total_marks` (e.g., "120 out of 200")
- **Marking Scheme Source:** From `tests` table - each test has a global marking scheme
- **Question-Specific Marks:** Currently **not supported** - the marking scheme is uniform across all questions
- **Pre-calculated vs On-demand:** Marks are calculated **on-demand** at query time

---

## 2. Rank Calculation

### Source Table
- **Primary:** `test_results` table

### Calculation Process (On-Demand)

Rank is calculated dynamically in the `/api/mock-tests` route:

```typescript
// Lines 98-111
// 1. Fetch ALL results for this mock test, ordered by score_percentage descending
const { data: allTestResults } = await supabaseAdmin
  .from('test_results')
  .select('user_id, score_percentage')
  .eq('mock_test_id', attempt.mock_test_id)
  .eq('session_type', 'mock_test')
  .order('score_percentage', { ascending: false })

// 2. Find the user's position in the sorted list
const userRank = allTestResults.findIndex((result: any) => result.user_id === userId) + 1
```

### Database Query

```sql
SELECT user_id, score_percentage
FROM test_results
WHERE mock_test_id = {test_id} 
  AND session_type = 'mock_test'
ORDER BY score_percentage DESC
```

### Process Flow

1. Query all students who took the same mock test
2. Sort by `score_percentage` (descending)
3. Find the user's index position in the sorted list
4. Add 1 to convert from 0-based to 1-based rank

### Important Notes

- **Pre-calculated:** **NO** - Ranks are calculated **on-demand** for each request
- **Caching:** No separate rank table exists
- **Performance:** For large test cohorts (e.g., 2,345 students), this query runs every time the mock test page loads
- **Real-time:** The rank reflects the current state of the `test_results` table

---

## 3. Percentile Calculation

### Source Table
- **Primary:** `test_results` table

### Formula

The exact formula used (lines 113-118):

```typescript
// Percentile = (Number of users with score < your score / Total participants) * 100
const usersWithLowerScore = allTestResults.filter((result: any) => 
  result.score_percentage < attempt.score_percentage
).length

const totalTestTakers = allTestResults.length
const percentile = totalTestTakers > 1 
  ? (usersWithLowerScore / totalTestTakers) * 100 
  : 100
```

### Formula Breakdown

**Percentile = (Count of students who scored LESS than you / Total number of test takers) × 100**

### Example

If a student scores 85%:
- Total participants: 2,345
- Students who scored < 85%: 2,103
- Percentile = (2,103 / 2,345) × 100 = **89.7th percentile**

### Total Test Takers Count

The count is obtained from the same query that fetches rank data:

```typescript
const totalTestTakers = allTestResults.length
```

This means the query:
```sql
SELECT user_id, score_percentage
FROM test_results
WHERE mock_test_id = {test_id} 
  AND session_type = 'mock_test'
ORDER BY score_percentage DESC
```

Returns all results for that specific mock test, and the length of the array = total test takers.

### Process Flow

1. Fetch all test results for the mock test (ordered by score)
2. Filter results where `score_percentage < user's score_percentage`
3. Count: `usersWithLowerScore.length`
4. Apply formula

---

## 4. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  Student Clicks "Mock Test Card" in Activity Timeline   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  GET /api/mock-tests?userId={userId}                    │
└────────────────────┬────────────────────────────────────┘
                     │
    ┌────────────────┴────────────────┐
    │                                  │
    ▼                                  ▼
┌──────────────┐              ┌──────────────────────┐
│ Query 1:     │              │ Query 2:             │
│ Fetch Tests  │              │ Fetch User Attempts  │
└──────┬───────┘              └───────┬──────────────┘
       │                              │
       ▼                              ▼
    tests table              test_results table
  (marking scheme)           (attempt data)
       │                              │
       └────────────┬─────────────────┘
                    ▼
        ┌───────────────────────┐
        │  For Each Attempt:    │
        │  1. Calculate Marks    │
        │  2. Fetch All Results │
        │  3. Calculate Rank    │
        │  4. Calculate Percentile│
        └────────────┬──────────┘
                     ▼
        ┌─────────────────────────┐
        │  Return Enhanced Data:  │
        │  {                      │
        │    marks_obtained,      │
        │    total_marks,         │
        │    rank,                │
        │    percentile,          │
        │    total_test_takers    │
        │  }                      │
        └─────────────────────────┘
```

---

## 5. Key Database Tables

### `test_results` Table

**Purpose:** Stores individual student attempt data

**Relevant Fields:**
```typescript
{
  id: number
  user_id: string
  mock_test_id: number
  score_percentage: number        // Used for ranking
  total_questions: number
  total_correct: number          // Used for marks calculation
  total_incorrect: number        // Used for marks calculation
  submitted_at: string
  session_type: 'mock_test'       // Filter condition
}
```

### `tests` Table

**Purpose:** Stores test metadata and marking scheme

**Relevant Fields:**
```typescript
{
  id: number
  name: string
  marks_per_correct: number              // e.g., 4
  negative_marks_per_incorrect: number   // e.g., -1
  status: 'scheduled' | 'live' | 'completed'
}
```

---

## 6. Performance Considerations

### Current Implementation

- **On-Demand Calculation:** Every page load triggers:
  1. Query all test results for rank calculation
  2. Sort results by score
  3. Calculate rank by index
  4. Calculate percentile by filtering

### Scalability Concerns

For a mock test with **2,345 participants**:
- Database query returns 2,345 rows
- In-memory sort of 2,345 records
- Filter operation for percentile calculation

**Estimated cost per request:** ~50-100ms (depends on database performance)

### Optimization Recommendations

1. **Consider indexing:** `CREATE INDEX idx_mock_test_ranking ON test_results(mock_test_id, score_percentage DESC)`
2. **Caching strategy:** Cache rankings for completed tests (ranks don't change after test is closed)
3. **Pagination:** If displaying leaderboard, implement cursor-based pagination

---

## 7. Complete Data Query Example

When displaying a mock test card with "Rank 15 out of 2,345":

```javascript
// Step 1: Fetch test and user attempt
const { data: attempt } = await supabase
  .from('test_results')
  .select('*, tests(marks_per_correct, negative_marks_per_incorrect)')
  .eq('id', resultId)
  .eq('user_id', userId)
  .single()

// Step 2: Calculate marks (if not done on backend)
const marksObtained = (attempt.total_correct * attempt.tests.marks_per_correct) - 
                     (attempt.total_incorrect * attempt.tests.negative_marks_per_incorrect)

// Step 3: Fetch ALL results for rank and percentile
const { data: allResults } = await supabase
  .from('test_results')
  .select('user_id, score_percentage')
  .eq('mock_test_id', attempt.mock_test_id)
  .eq('session_type', 'mock_test')
  .order('score_percentage', { ascending: false })

// Step 4: Calculate metrics
const userRank = allResults.findIndex(r => r.user_id === userId) + 1
const usersWithLowerScore = allResults.filter(r => r.score_percentage < attempt.score_percentage).length
const percentile = (usersWithLowerScore / allResults.length) * 100
const totalTestTakers = allResults.length

// Display: "Rank 15 out of 2,345"
```

---

## 8. Summary Table

| Metric | Source Table(s) | Calculation Type | Formula |
|--------|----------------|------------------|---------|
| **Marks** | `test_results`, `tests` | On-demand | `(correct × marks_per_correct) - (incorrect × negative_marks)` |
| **Rank** | `test_results` | On-demand | `findIndex(sorted by score) + 1` |
| **Percentile** | `test_results` | On-demand | `(count_lower / total) × 100` |
| **Total Test Takers** | `test_results` | On-demand | `count(*) WHERE mock_test_id = X` |

---

## 9. For Admin Panel Integration

When implementing the Admin Panel's detailed view for mock test results:

1. **Use the same calculation logic** - Fetch from `test_results` and `tests` tables
2. **Leverage existing API** - Consider using `/api/mock-tests/[testId]/metadata` if available
3. **Cache completed tests** - Ranks don't change after test completion
4. **Display clearly** - Show both absolute rank (15) and total participants (2,345)

---

## 10. Code References

All calculations are performed in:
- **File:** `student-portal/src/app/api/mock-tests/route.ts`
- **Lines:** 97-138
- **Function:** GET handler's `enhancedUserAttempts` calculation

The logic is client-agnostic and can be reused in the Admin Panel with the same database queries.

