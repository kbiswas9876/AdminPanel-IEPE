# Comprehensive System Analysis: Admin Panel - Student Management & Mock Test Reporting Modules

## Document Purpose

This document provides a complete technical analysis of the Admin Panel's Student Management and Mock Test Reporting modules, including all components, data views, API endpoints, database queries, and data flow. This serves as the single source of truth for understanding how administrators monitor and evaluate student performance.

---

## Table of Contents

1. [Student Management Module (Student-Centric View)](#student-management-module-student-centric-view)
2. [Mock Test Reporting Module (Test-Centric View)](#mock-test-reporting-module-test-centric-view)
3. [API Routes & Database Queries](#api-routes--database-queries)
4. [Data Flow Diagrams](#data-flow-diagrams)

---

## Student Management Module (Student-Centric View)

### Overview

The Student Management module provides administrators with a comprehensive view of individual student performance. It focuses on analyzing a single student's complete activity across all tests and practice sessions.

---

### 1. Student List View (`/admin/students` or `/students`)

**Purpose**: Main landing page displaying all students in the system

**Route**: `/students/page.tsx`

**Key Features**:
- Paginated student list (25 per page)
- Search and filter capabilities
- Status-based tabs (Pending, Active, Suspended, All)
- Real-time updates via Supabase Realtime subscriptions
- Bulk selection and actions

**Data Fetching**:
- **Server-Side**: Fetches all users on page load using Server Actions
- **Client-Side**: Real-time subscriptions for status changes

**Supabase Queries**:

**Query 1: Fetch All User Profiles**
```typescript
const { data: allUsers } = await supabaseAdmin
  .from('user_profiles')
  .select('*')
  .order('id', { ascending: false })
```

**Query 2: Fetch User Emails from Auth**
```typescript
const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()

// Map emails to user profiles
const userEmails: { [key: string]: string } = {}
authUsers.users.forEach(user => {
  if (userIds.includes(user.id)) {
    userEmails[user.id] = user.email || 'No email'
  }
})
```

**Component Structure**:
```typescript
StudentsPage (Server Component)
└── ReorganizedStudentManagement (Client Component)
    ├── SearchBar (search by name/email)
    ├── FilterControls (status, activity filters)
    ├── Tab.Group (Pending / Active / Suspended / All)
    │   └── StudentTable (paginated, 25 per page)
    │       ├── StudentRow (with status badge)
    │       └── BulkActions (activate, suspend, etc.)
    └── RealtimeSubscription (status change updates)
```

**State Management**:
- `filteredUsers`: Filtered and sorted student list
- `searchQuery`: Search input state
- `activeSubTab`: Current status tab ('pending', 'active', 'suspended')
- `selectedUsers`: Bulk selection state

**Filtering Capabilities**:
- **By Status**: `pending`, `active`, `suspended`
- **By Search**: Name or email (case-insensitive)
- **By Activity**: Inactive since date (client-side filter)
- **By Accuracy**: Min/max accuracy range (client-side filter on `analytics_summary` JSONB)

**Server Action**: `getStudents(filters: StudentFilters)`

**Supabase Query with Filters**:
```typescript
let query = supabase
  .from('user_profiles')
  .select('*')

// Apply status filter
if (filters.status) {
  query = query.eq('status', filters.status)
}

// Apply inactivity filter
if (filters.inactiveSince) {
  query = query.lt('updated_at', filters.inactiveSince)
}

// Apply search query
if (filters.searchQuery) {
  query = query.or(`full_name.ilike.%${filters.searchQuery}%,email.ilike.%${filters.searchQuery}%`)
}

query = query.order('updated_at', { ascending: false })
```

---

### 2. Individual Student Profile View (`/students/[userID]`)

**Purpose**: Detailed view of a single student's profile and activity

**Route**: `/students/[userID]/page.tsx`

**Key Features**:
- Student profile information (name, email, status, registration date)
- Performance metrics (total tests, average score, accuracy, best score)
- Test history timeline
- Activity feed (mock tests, practice sessions)
- Export functionality (JSON/CSV)
- Admin controls (suspend, activate, password reset)

**Component Structure**:
```typescript
StudentPage
├── ActivitySummaryStats (summary cards)
│   ├── Total Sessions
│   ├── Overall Accuracy
│   └── Last Activity
└── ActivityFeed (paginated activity timeline)
    ├── ActivityEntry (mock test / practice session)
    └── LoadMoreButton (pagination)
```

**Data Fetching**:

**Server Action**: `getStudentActivityFeed(userId, filters, pagination)`

**Supabase Queries**:

**Query 1: Fetch Student Profile**
```typescript
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', userId)
  .single()

// Fetch email from auth.users
const { data: authUsers } = await supabase.auth.admin.listUsers()
const authUser = authUsers?.users?.find(user => user.id === userId)
const email = authUser?.email || 'No email'
```

**Query 2: Fetch Student Test Attempts**
```typescript
const { data: testAttempts } = await supabase
  .from('test_results')
  .select(`
    *,
    tests!inner(
      name,
      description,
      total_time_minutes,
      marks_per_correct,
      negative_marks_per_incorrect
    )
  `)
  .eq('user_id', userId)
  .order('submitted_at', { ascending: false })
```

**Query 3: Calculate Student Analytics**
```typescript
const { data: testResults } = await supabase
  .from('test_results')
  .select('score, total_correct, total_incorrect, total_skipped, total_time_taken')
  .eq('user_id', userId)

// Calculate metrics client-side:
const totalTests = testResults.length
const totalCorrect = testResults.reduce((sum, r) => sum + (r.total_correct || 0), 0)
const totalIncorrect = testResults.reduce((sum, r) => sum + (r.total_incorrect || 0), 0)
const averageScore = testResults.reduce((sum, r) => sum + (r.score || 0), 0) / totalTests
const averageAccuracy = totalCorrect + totalIncorrect > 0 
  ? (totalCorrect / (totalCorrect + totalIncorrect)) * 100 
  : 0
```

**Query 4: Fetch Activity Feed (Paginated)**
```typescript
let query = supabase
  .from('student_activity_log')
  .select('*')
  .eq('user_id', userId)

// Apply activity type filter
if (filters.activity_type) {
  query = query.eq('activity_type', filters.activity_type)
}

// Apply date range filter
if (filters.date_range) {
  query = query
    .gte('created_at', filters.date_range.start)
    .lte('created_at', filters.date_range.end)
}

// Pagination
const { page, limit } = pagination
const from = (page - 1) * limit
const to = from + limit - 1

const { data: entries } = await query
  .order('created_at', { ascending: false })
  .range(from, to)
```

**Displayed Information**:

**Mock Test Attempts Table**:
- Test Name
- Score (marks obtained)
- Accuracy (percentage)
- Duration (time taken)
- Completed On (submission timestamp)
- "View Full Report" button (links to detailed analysis)

**Performance Metrics Cards**:
- **Total Tests**: Number of mock tests completed
- **Average Score**: Average score across all tests
- **Accuracy**: Average accuracy percentage
- **Best Score**: Highest score achieved

---

### 3. Student Activity Timeline / Test History

**Purpose**: Consolidated view of all student activities (mock tests and practice sessions)

**Component**: `ActivityFeed` (in `/students/[userID]/components/ActivityFeed.tsx`)

**Key Features**:
- Paginated activity feed (20 entries per page)
- Filter by activity type (mock test, practice session)
- Filter by date range
- Chronological timeline display
- Detailed activity metadata

**Activity Types**:
- `MOCK_TEST_COMPLETED`: Mock test submission
- `PRACTICE_SESSION_COMPLETED`: Practice session completion

**Data Structure**:
```typescript
interface ActivityLogEntry {
  id: number
  user_id: string
  activity_type: 'MOCK_TEST_COMPLETED' | 'PRACTICE_SESSION_COMPLETED'
  activity_data: {
    test_id?: number
    test_name?: string
    score?: number
    accuracy?: number
    duration?: number
  }
  created_at: string
}
```

**Supabase Query**:
```typescript
const { data: entries } = await supabase
  .from('student_activity_log')
  .select('*')
  .eq('user_id', userId)
  .eq('activity_type', 'MOCK_TEST_COMPLETED') // Optional filter
  .order('created_at', { ascending: false })
  .range(from, to) // Pagination
```

**Activity Entry Display**:
- **Mock Test**: Test name, score, rank, percentile, submission date
- **Practice Session**: Session details, questions attempted, accuracy

**API Endpoint**: `GET /api/students/[userId]/sessions`

**Endpoint Logic**:
```typescript
const { data: sessions } = await supabase
  .from('test_results')
  .select(`
    id,
    session_type,
    test_type,
    mock_test_id,
    score,
    score_percentage,
    accuracy,
    total_questions,
    total_correct,
    total_incorrect,
    total_skipped,
    total_time_taken,
    submitted_at
  `)
  .eq('user_id', userId)
  .order('submitted_at', { ascending: false })
  .limit(limit)

// Transform to include test names for mock tests
if (session.session_type === 'mock_test' && session.mock_test_id) {
  const { data: test } = await supabase
    .from('tests')
    .select('name')
    .eq('id', session.mock_test_id)
    .single()
  
  session.test_name = test?.name
}
```

---

## Mock Test Reporting Module (Test-Centric View)

### Overview

The Mock Test Reporting module provides administrators with a comprehensive view of test performance across all students. It focuses on analyzing a single test's results and student rankings.

---

### 1. Mock Test List & Creation View (`/tests`)

**Purpose**: Interface for creating, editing, and managing mock tests

**Route**: `/tests/page.tsx`

**Key Features**:
- Test list with status (draft, scheduled, live, completed)
- Test creation wizard
- Edit existing tests
- Test status management
- Question bank integration

**Component Structure**:
```typescript
TestsPage
├── TestList (all tests)
│   ├── TestCard (test metadata)
│   └── TestActions (edit, publish, view report)
├── TestCreationWizard (create new test)
└── TestManagement (bulk operations)
```

**Test Creation Flow**:
1. Select questions from question bank
2. Configure test settings (name, duration, marking scheme)
3. Set proctoring options (`is_proctored`)
4. Configure result policy (instant/scheduled)
5. Publish test

**Note**: Detailed test creation flow is outside the scope of this analysis document.

---

### 2. Test Report View (`/tests/[testId]/report`)

**Purpose**: Comprehensive test performance analysis and leaderboard

**Route**: `/tests/[testId]/report/page.tsx`

**Key Features**:
- Aggregate statistics (average score, highest, lowest, median)
- Student leaderboard with rankings
- Score distribution chart
- Question-by-question analytics
- Topic/difficulty performance analysis
- Time vs score scatter plot
- Performance funnel metrics

**Component Structure**:
```typescript
TestReportPage (Server Component)
└── TestReportDashboard (Client Component)
    ├── Header (test name, status, breadcrumb)
    ├── KPI Cards (6 cards: Total Participants, Average, Median, Highest, Lowest, Avg Time)
    └── Tab.Group (4 tabs)
        ├── Tab 1: Overview (PopulatedOverallAnalyticsTab)
        │   ├── ScoreDistributionChart
        │   ├── PerformanceFunnel
        │   └── TimeVsScoreScatter
        ├── Tab 2: Leaderboard (StudentRankingsTab)
        │   ├── SearchBar
        │   ├── FilterControls (top 10, top 25%, bottom 25%)
        │   └── RankingsTable
        ├── Tab 3: Question Insights (QuestionInsightsTab)
        │   ├── QuestionAnalyticsTable
        │   └── EnhancedQuestionMetrics
        └── Tab 4: Topic Analysis (TopicDifficultyTab)
            ├── TopicPerformanceChart
            └── DifficultyPerformanceChart
```

**Data Fetching**:

**Server Actions** (called in parallel):
1. `getTestDetails(testId)` - Fetch test metadata
2. `getTestOverviewStats(testId)` - Fetch aggregate statistics
3. `getTestRankings(testId)` - Fetch student rankings

---

### 3. Aggregate Statistics

**Purpose**: High-level test performance metrics

**Server Action**: `getTestOverviewStats(testId)`

**Supabase Queries**:

**Query 1: Fetch Test Metadata**
```typescript
const { data: test } = await supabase
  .from('tests')
  .select('marks_per_correct')
  .eq('id', testId)
  .single()
```

**Query 2: Fetch All Test Attempts**
```typescript
const { data: attempts } = await supabase
  .from('test_results')
  .select('score, score_percentage, total_time_taken')
  .eq('mock_test_id', testId)
```

**Query 3: Calculate Total Marks (Per-Question Aware)**
```typescript
const { data: testQuestionRows } = await supabase
  .from('test_questions')
  .select('marks_per_correct')
  .eq('test_id', testId)

const globalMpc = Number(test.marks_per_correct) || 0
let totalMarks = 0

if (testQuestionRows && testQuestionRows.length > 0) {
  const haveAnyPerQuestion = testQuestionRows.some(r => 
    r.marks_per_correct !== null && r.marks_per_correct !== undefined
  )
  
  if (haveAnyPerQuestion) {
    // Sum all per-question marks (using global as fallback for null values)
    totalMarks = testQuestionRows.reduce(
      (s, r) => s + (Number(r.marks_per_correct ?? globalMpc) || 0), 
      0
    )
  } else {
    // All questions use global marking
    totalMarks = testQuestionRows.length * globalMpc
  }
}
```

**Calculated Metrics**:
```typescript
const totalParticipants = attempts.length
const averageScore = scores.reduce((sum, s) => sum + s, 0) / totalParticipants
const averagePercentage = percentages.reduce((sum, p) => sum + p, 0) / totalParticipants
const highestScore = Math.max(...scores)
const lowestScore = Math.min(...scores)
const averageTimeSeconds = times.reduce((sum, t) => sum + t, 0) / totalParticipants

// Calculate median score
const sortedScores = [...scores].sort((a, b) => a - b)
const medianScore = totalParticipants % 2 === 0
  ? (sortedScores[totalParticipants / 2 - 1] + sortedScores[totalParticipants / 2]) / 2
  : sortedScores[Math.floor(totalParticipants / 2)]
```

**Response Structure**:
```typescript
interface TestOverviewStats {
  totalParticipants: number
  averageScore: number
  averagePercentage: number
  averageTimeSeconds: number
  highestScore: number
  highestPercentage: number
  lowestScore: number
  lowestPercentage: number
  medianScore: number
  totalMarks: number
}
```

---

### 4. Student Leaderboard

**Purpose**: Ranked list of all students who took the test

**Server Action**: `getTestRankings(testId)`

**Supabase Queries**:

**Query 1: Fetch All Test Attempts (Ordered by Score)**
```typescript
const { data: attempts } = await supabase
  .from('test_results')
  .select('id, user_id, score, score_percentage, total_time_taken')
  .eq('mock_test_id', testId)
  .order('score', { ascending: false })
  .order('total_time_taken', { ascending: true }) // Tie-breaker: faster time ranks higher
```

**Query 2: Fetch User Profiles**
```typescript
const userIds = attempts.map(a => a.user_id)

const { data: profiles } = await supabase
  .from('user_profiles')
  .select('id, full_name, email')
  .in('id', userIds)

const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
```

**Ranking Calculation**:
```typescript
const rankings = attempts.map((attempt, index) => {
  const profile = profileMap.get(attempt.user_id)
  
  return {
    rank: index + 1, // Rank based on sorted position
    userId: attempt.user_id,
    studentName: profile?.full_name || 'Unknown Student',
    studentEmail: profile?.email || 'No email',
    score: Math.round(attempt.score * 100) / 100,
    percentage: Math.round((attempt.score_percentage || 0) * 100) / 100,
    timeSeconds: attempt.total_time_taken || 0,
    attemptId: attempt.id
  }
})
```

**Response Structure**:
```typescript
interface StudentRanking {
  rank: number
  userId: string
  studentName: string
  studentEmail: string
  score: number
  percentage: number
  timeSeconds: number
  attemptId: number
}
```

**Display Features**:
- **Search**: By student name or email
- **Filters**: Top 10, Top 25%, Bottom 25%
- **Sorting**: By rank (default), score, time taken
- **Actions**: "View Details" button opens detailed student attempt modal

**Percentile Calculation**:
Percentile is **not** calculated in the leaderboard query. It's calculated separately when viewing individual student attempts using:
```typescript
percentile = (usersWithLowerScore / totalParticipants) * 100
```

---

### 5. Question Analytics

**Purpose**: Per-question performance analysis

**Server Action**: `getEnhancedQuestionAnalytics(testId)`

**Supabase Queries**:

**Query 1: Fetch Test Questions with Details**
```typescript
const { data: testQuestions } = await supabase
  .from('test_questions')
  .select(`
    question_id,
    questions (
      id,
      question_text,
      chapter_name,
      book_source,
      difficulty
    )
  `)
  .eq('test_id', testId)
  .order('id')
```

**Query 2: Fetch All Test Attempts**
```typescript
const { data: attempts } = await supabase
  .from('test_results')
  .select('id, user_id')
  .eq('mock_test_id', testId)

const resultIds = attempts.map(a => a.id)
const totalParticipants = attempts.length
```

**Query 3: Fetch All Answer Logs**
```typescript
const { data: allAnswers } = await supabase
  .from('answer_log')
  .select('question_id, status, time_taken')
  .in('result_id', resultIds)
```

**Analytics Calculation**:
```typescript
// Group answers by question_id
const answersByQuestion = new Map<number, AnswerLog[]>()
for (const answer of allAnswers) {
  if (!answersByQuestion.has(answer.question_id)) {
    answersByQuestion.set(answer.question_id, [])
  }
  answersByQuestion.get(answer.question_id)!.push(answer)
}

// Calculate metrics for each question
for (const testQuestion of testQuestions) {
  const questionId = testQuestion.question_id
  const answers = answersByQuestion.get(questionId) || []
  
  const correctAnswers = answers.filter(a => a.status === 'correct')
  const incorrectAnswers = answers.filter(a => a.status === 'incorrect')
  const unattempted = totalParticipants - answers.length
  
  const correctnessPercentage = totalParticipants > 0 
    ? (correctAnswers.length / totalParticipants) * 100 
    : 0
  
  const averageTimeSeconds = answers.length > 0
    ? Math.round(answers.reduce((sum, a) => sum + (a.time_taken || 0), 0) / answers.length)
    : 0
  
  const averageTimeCorrect = correctAnswers.length > 0
    ? Math.round(correctAnswers.reduce((sum, a) => sum + (a.time_taken || 0), 0) / correctAnswers.length)
    : 0
  
  const averageTimeIncorrect = incorrectAnswers.length > 0
    ? Math.round(incorrectAnswers.reduce((sum, a) => sum + (a.time_taken || 0), 0) / incorrectAnswers.length)
    : 0
}
```

**Response Structure**:
```typescript
interface EnhancedQuestionAnalytics {
  questionId: number
  questionNumber: number
  questionText: string
  topic: string
  difficulty: string | null
  correctCount: number
  incorrectCount: number
  unattemptedCount: number
  correctnessPercentage: number
  averageTimeSeconds: number
  averageTimeCorrect: number
  averageTimeIncorrect: number
}
```

---

### 6. Topic & Difficulty Analysis

**Purpose**: Aggregated performance by topic/chapter and difficulty level

**Server Actions**:
- `getTopicAnalysis(testId)` - Groups by `chapter_name` or `book_source`
- `getDifficultyAnalysis(testId)` - Groups by `difficulty`

**Topic Analysis Implementation**:
```typescript
// Uses getEnhancedQuestionAnalytics data
const questionAnalytics = await getEnhancedQuestionAnalytics(testId)

// Group by topic
const topicMap = new Map<string, { totalAccuracy: number; count: number }>()

for (const question of questionAnalytics) {
  const topic = question.topic // chapter_name or book_source
  if (!topicMap.has(topic)) {
    topicMap.set(topic, { totalAccuracy: 0, count: 0 })
  }
  
  const topicData = topicMap.get(topic)!
  topicData.totalAccuracy += question.correctnessPercentage
  topicData.count += 1
}

// Calculate averages
const topicPerformance: TopicPerformance[] = []
for (const [topicName, data] of topicMap.entries()) {
  topicPerformance.push({
    topicName,
    questionCount: data.count,
    averageAccuracy: Math.round((data.totalAccuracy / data.count) * 10) / 10
  })
}

// Sort by accuracy (ascending) to show weakest topics first
topicPerformance.sort((a, b) => a.averageAccuracy - b.averageAccuracy)
```

**Response Structure**:
```typescript
interface TopicPerformance {
  topicName: string
  questionCount: number
  averageAccuracy: number
}

interface DifficultyPerformance {
  difficulty: string
  questionCount: number
  averageAccuracy: number
}
```

---

## API Routes & Database Queries

### Student Management API Routes

#### 1. `GET /api/students/[userId]/sessions`

**Purpose**: Fetch all test sessions (mock tests and practice) for a student

**Endpoint**: `/api/students/[userId]/sessions?type={type}&limit={limit}`

**Query Parameters**:
- `type`: Optional filter (`'practice'` | `'mock_test'`)
- `limit`: Maximum number of results (default: 50)

**Supabase Query**:
```typescript
let query = supabase
  .from('test_results')
  .select(`
    id,
    session_type,
    test_type,
    mock_test_id,
    score,
    score_percentage,
    accuracy,
    total_questions,
    total_correct,
    total_incorrect,
    total_skipped,
    total_time_taken,
    submitted_at
  `)
  .eq('user_id', userId)
  .order('submitted_at', { ascending: false })
  .limit(limit)

if (type) {
  query = query.eq('session_type', type)
}
```

**Response Structure**:
```json
{
  "sessions": [
    {
      "id": 123,
      "session_type": "mock_test",
      "test_type": "mock_test",
      "mock_test_id": 1,
      "test_name": "SSC CGL 2024 Mock Test",
      "score": 85.5,
      "score_percentage": 85.5,
      "accuracy": 80.0,
      "total_questions": 50,
      "total_correct": 40,
      "total_incorrect": 5,
      "total_skipped": 5,
      "total_time_taken": 3600,
      "submitted_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

---

#### 2. `GET /api/students/[userId]/session/[sessionId]`

**Purpose**: Fetch detailed session information including answer log

**Endpoint**: `/api/students/[userId]/session/[sessionId]`

**Supabase Queries**:

**Query 1: Fetch Test Result**
```typescript
const { data: testResult } = await supabase
  .from('test_results')
  .select('*')
  .eq('id', sessionId)
  .eq('user_id', userId)
  .single()
```

**Query 2: Fetch Answer Log**
```typescript
const { data: answerLog } = await supabase
  .from('answer_log')
  .select('*')
  .eq('result_id', sessionId)
  .order('question_id', { ascending: true })
```

**Query 3: Fetch Test Metadata (if mock test)**
```typescript
if (testResult.session_type === 'mock_test' && testResult.mock_test_id) {
  const { data: test } = await supabase
    .from('tests')
    .select('name, marks_per_correct, negative_marks_per_incorrect')
    .eq('id', testResult.mock_test_id)
    .single()
}
```

**Response Structure**:
```json
{
  "testResult": {
    "id": 123,
    "user_id": "user-uuid",
    "score": 85.5,
    "score_percentage": 85.5,
    "total_correct": 40,
    "total_incorrect": 5,
    "total_skipped": 5
  },
  "answerLog": [
    {
      "result_id": 123,
      "question_id": 1,
      "user_answer": "a",
      "status": "correct",
      "time_taken": 30
    }
  ],
  "testName": "SSC CGL 2024 Mock Test",
  "marksPerCorrect": 1,
  "negativeMarksPerIncorrect": 0.25
}
```

---

#### 3. `GET /api/students/[userId]/enhanced-analytics`

**Purpose**: Fetch comprehensive analytics for a student

**Endpoint**: `/api/students/[userId]/enhanced-analytics`

**Supabase Query**:
```typescript
const { data: testResults } = await supabase
  .from('test_results')
  .select('*')
  .eq('user_id', userId)
  .order('submitted_at', { ascending: false })
```

**Calculations** (client-side):
```typescript
const practiceTests = testResults.filter(r => r.session_type === 'practice')
const mockTests = testResults.filter(r => r.session_type === 'mock_test')

const totalTests = testResults.length
const totalQuestionsAttempted = testResults.reduce((sum, r) => sum + (r.total_questions || 0), 0)
const totalCorrect = testResults.reduce((sum, r) => sum + (r.total_correct || 0), 0)
const totalIncorrect = testResults.reduce((sum, r) => sum + (r.total_incorrect || 0), 0)
const totalSkipped = testResults.reduce((sum, r) => sum + (r.total_skipped || 0), 0)
const totalTimeSpent = testResults.reduce((sum, r) => sum + (r.total_time_taken || 0), 0)

const overallScore = testResults.reduce((sum, r) => sum + (r.score_percentage || 0), 0) / totalTests
const overallAccuracy = totalCorrect + totalIncorrect > 0 
  ? (totalCorrect / (totalCorrect + totalIncorrect)) * 100 
  : 0
```

**Response Structure**:
```json
{
  "data": {
    "totalTests": 10,
    "practiceTests": 5,
    "mockTests": 5,
    "overallScore": 85.5,
    "practiceScore": 80.0,
    "mockScore": 91.0,
    "overallAccuracy": 82.5,
    "totalTimeSpent": 36000,
    "averageTimePerQuestion": 30,
    "totalQuestionsAttempted": 500,
    "totalCorrect": 400,
    "totalIncorrect": 50,
    "totalSkipped": 50,
    "recentPerformance": [
      {
        "date": "2024-01-01",
        "score": 85.5,
        "test_name": "SSC CGL 2024 Mock Test"
      }
    ]
  }
}
```

---

### Mock Test Reporting API Routes

**Note**: Most mock test reporting uses Server Actions, not API routes. The following are the key server actions:

#### 1. Server Action: `getTestOverviewStats(testId)`

**Location**: `src/lib/actions/test-reports.ts`

**Purpose**: Calculate aggregate statistics for a test

**Supabase Queries**: (See [Aggregate Statistics](#3-aggregate-statistics) section above)

---

#### 2. Server Action: `getTestRankings(testId)`

**Location**: `src/lib/actions/test-reports.ts`

**Purpose**: Generate student leaderboard

**Supabase Queries**: (See [Student Leaderboard](#4-student-leaderboard) section above)

---

#### 3. Server Action: `getEnhancedQuestionAnalytics(testId)`

**Location**: `src/lib/actions/test-reports.ts`

**Purpose**: Calculate per-question performance metrics

**Supabase Queries**: (See [Question Analytics](#5-question-analytics) section above)

---

#### 4. Server Action: `getStudentAttemptDetails(attemptId)`

**Location**: `src/lib/actions/test-reports.ts`

**Purpose**: Fetch detailed attempt information for a specific student

**Supabase Queries**:

**Query 1: Fetch Attempt**
```typescript
const { data: attempt } = await supabase
  .from('test_results')
  .select('*, user_id, mock_test_id, score, score_percentage, total_correct, total_incorrect, total_skipped, total_time_taken')
  .eq('id', attemptId)
  .single()
```

**Query 2: Fetch User Profile**
```typescript
const { data: profile } = await supabase
  .from('user_profiles')
  .select('full_name, email')
  .eq('id', attempt.user_id)
  .single()
```

**Query 3: Calculate Rank and Percentile**
```typescript
const { data: allAttempts } = await supabase
  .from('test_results')
  .select('id, score')
  .eq('mock_test_id', attempt.mock_test_id)
  .order('score', { ascending: false })

const rank = (allAttempts?.findIndex(a => a.id === attemptId) || 0) + 1
const percentile = allAttempts && allAttempts.length > 1
  ? ((allAttempts.length - rank) / (allAttempts.length - 1)) * 100
  : 100
```

**Query 4: Fetch Answer Log**
```typescript
const { data: detailedAnswers } = await supabase
  .from('answer_log')
  .select('question_id, status, time_taken, user_answer')
  .eq('result_id', attemptId)
```

**Query 5: Fetch Test Questions with Per-Question Marking**
```typescript
const { data: testQuestions } = await supabase
  .from('test_questions')
  .select('question_id, marks_per_correct, penalty_per_incorrect')
  .eq('test_id', attempt.mock_test_id)
  .order('id', { ascending: true })
```

**Query 6: Fetch Question Details**
```typescript
const testQuestionIds = testQuestions?.map(tq => tq.question_id) || []

const { data: questions } = await supabase
  .from('questions')
  .select('id, question_text, options, correct_option, chapter_name, difficulty')
  .in('id', testQuestionIds)
```

**Response Structure**:
```typescript
interface StudentAttemptDetails {
  attemptId: number
  studentName: string
  studentEmail: string
  score: number
  percentage: number
  rank: number
  percentile: number
  totalTime: number
  accuracy: number
  totalCorrect: number
  totalIncorrect: number
  totalSkipped: number
  answers: StudentAnswer[]
}
```

---

## Data Flow Diagrams

### Flow 1: Student Profile View Flow

```
Admin navigates to /students/[userID]
    ↓
Server Component (StudentPage)
    ├─→ getStudentActivityFeed(userId, {}, { page: 1, limit: 20 })
    │   └─→ Query student_activity_log table
    │       └─→ Return paginated activity entries
    │
    └─→ ActivitySummaryStats Component
        ├─→ getStudentSummary(userId)
        │   ├─→ Query student_activity_log (count sessions)
        │   ├─→ Query test_results (calculate accuracy)
        │   └─→ Query user_profiles (profile info)
        │
        └─→ Display summary cards
    ↓
ActivityFeed Component
    ├─→ Displays activity entries
    ├─→ Load More button (pagination)
    └─→ Filters (activity type, date range)
```

---

### Flow 2: Test Report View Flow

```
Admin navigates to /tests/[testId]/report
    ↓
Server Component (TestReportPage)
    ├─→ getTestDetails(testId)
    │   └─→ Query tests table
    │
    ├─→ getTestOverviewStats(testId)
    │   ├─→ Query test_results (all attempts)
    │   ├─→ Query test_questions (calculate total marks)
    │   └─→ Calculate: average, median, highest, lowest
    │
    └─→ getTestRankings(testId)
        ├─→ Query test_results (ordered by score)
        ├─→ Query user_profiles (student names)
        └─→ Calculate ranks
    ↓
TestReportDashboard Component
    ├─→ Display KPI cards
    └─→ Tab.Group (4 tabs)
        ├─→ Tab 1: Overview
        │   ├─→ getScoreDistribution(testId)
        │   ├─→ getPerformanceFunnelMetrics(testId)
        │   └─→ getTimeVsScoreData(testId)
        │
        ├─→ Tab 2: Leaderboard
        │   └─→ Display rankings table with search/filters
        │
        ├─→ Tab 3: Question Insights
        │   └─→ getEnhancedQuestionAnalytics(testId)
        │
        └─→ Tab 4: Topic Analysis
            ├─→ getTopicAnalysis(testId)
            └─→ getDifficultyAnalysis(testId)
```

---

### Flow 3: Student Attempt Details Flow

```
Admin clicks "View Details" on leaderboard
    ↓
DetailedSessionModal Component
    ├─→ getStudentAttemptDetails(attemptId)
    │   ├─→ Query test_results (attempt data)
    │   ├─→ Query user_profiles (student info)
    │   ├─→ Query test_results (calculate rank/percentile)
    │   ├─→ Query answer_log (all answers)
    │   ├─→ Query test_questions (per-question marking)
    │   └─→ Query questions (question details)
    │
    └─→ Display attempt details
        ├─→ Performance metrics
        ├─→ Question-by-question review
        └─→ Answer analysis
```

---

## Summary

This document provides a comprehensive technical analysis of the Admin Panel's Student Management and Mock Test Reporting modules. Key highlights:

1. **Student-Centric View**: Complete student profile with activity timeline, test history, and performance analytics
2. **Test-Centric View**: Comprehensive test reports with aggregate statistics, leaderboards, and question analytics
3. **API Routes**: 3 primary API endpoints for student data fetching
4. **Server Actions**: 10+ server actions for test reporting and analytics
5. **Database Queries**: Detailed Supabase queries with exact syntax for all operations

The system is designed with:
- **Server-Side Rendering**: Initial data fetching on server
- **Client-Side Interactivity**: Real-time updates, filtering, pagination
- **Comprehensive Analytics**: Per-question, per-topic, per-difficulty analysis
- **Scalable Architecture**: Pagination, filtering, and efficient database queries

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-29  
**Author**: System Analysis Team

