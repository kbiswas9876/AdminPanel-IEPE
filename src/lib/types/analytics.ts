/**
 * Type definitions for Student Analytics System
 * Phase 2: Admin Panel Master View
 */

// ============================================================================
// CORE SUMMARY & METRICS
// ============================================================================

export interface StudentSummary {
  id: string
  name: string | null
  email: string
  last_active_at: string | null
  total_sessions: number
  overall_accuracy: number
  joined_date: string
  profile_picture_url?: string | null
}

// ============================================================================
// ACTIVITY FEED & LOGGING
// ============================================================================

export type ActivityType = 
  | 'PRACTICE_SESSION_COMPLETED'
  | 'MOCK_TEST_COMPLETED'
  | 'QUESTION_BOOKMARKED'
  | 'QUESTION_UNBOOKMARKED'
  | 'REVIEW_SESSION_COMPLETED'

export interface ActivityLogEntry {
  id: number
  user_id: string
  activity_type: ActivityType
  related_entity_id: number | null
  metadata: Record<string, any>
  created_at: string
}

export interface ActivityFeedFilters {
  activity_type?: ActivityType
  date_range?: {
    start: string
    end: string
  }
}

export interface ActivityFeedPagination {
  page: number
  limit: number
}

export interface ActivityFeedResponse {
  entries: ActivityLogEntry[]
  total_count: number
  current_page: number
  total_pages: number
}

// ============================================================================
// TEST RESULTS & ANALYSIS
// ============================================================================

export interface TestResultMetadata {
  test_result_id: number
  test_name: string | null
  score_percentage: number
  total_time_taken_seconds: number
  total_questions: number
  total_correct: number
  total_incorrect: number
  total_skipped: number
  chapter_performance: ChapterPerformance
}

export interface ChapterPerformance {
  [chapter: string]: {
    correct: number
    total: number
    accuracy: number
  }
}

export interface TimingCategory {
  category: 'fast' | 'optimal' | 'slow'
  emoji: string
  label: string
}

export interface EnrichedAnswer {
  answer_log: AnswerLog
  question: Question
  timingCategory: TimingCategory
  isCorrect: boolean
  time_taken_seconds: number
  performanceFeedback?: 'Slow' | 'Superfast' | 'OnTime' | 'OnTimeButNotCorrect'
  targetTime?: number
  marksPerCorrect?: number
  penaltyPerIncorrect?: number
}

export interface AnswerLog {
  id: number
  result_id: number
  question_id: number
  user_answer: string
  status: 'correct' | 'incorrect' | 'skipped'
  time_taken: number
  created_at: string
}

export interface Question {
  id: number
  question_id: string
  book_source: string
  chapter_name: string
  question_text: string
  options: any
  correct_option: string
  solution_text: string | null
  difficulty: string | null
  created_at: string
}

export interface EnrichedTestResult {
  testResult: TestResult
  enrichedAnswers: EnrichedAnswer[]
  chapterBreakdown: ChapterPerformance
}

export interface TestResult {
  id: number
  user_id: string
  test_type: string
  session_type: string
  score: number
  score_percentage: number
  accuracy: number
  total_questions: number
  total_correct: number
  total_incorrect: number
  total_skipped: number
  total_time_taken: number
  submitted_at: string
  mock_test_id: number | null
}

// ============================================================================
// REVISION HUB MIRROR
// ============================================================================

export interface BookmarkFilters {
  chapter?: string
  difficulty?: string
  srs_status?: 'due' | 'not_due' | 'all'
  tags?: string[]
}

export interface BookmarkData {
  id: number
  user_id: string
  question_id: string
  personal_note: string | null
  custom_tags: string[] | null
  user_difficulty_rating: number | null
  srs_repetitions: number
  srs_ease_factor: number
  srs_interval: number
  next_review_date: string | null
  is_custom_reminder_active: boolean
  custom_next_review_date: string | null
  created_at: string
  updated_at: string
}

export interface SrsStatus {
  srs_repetitions: number
  srs_ease_factor: number
  srs_interval: number
  next_review_date: string | null
  is_custom_reminder_active: boolean
  custom_next_review_date: string | null
}

export interface AttemptHistory {
  date: string
  result: 'correct' | 'incorrect'
  time_taken: number
  test_context?: string
}

export interface PerformanceHistory {
  total_attempts: number
  correct_attempts: number
  success_rate: number
  recent_trend: 'improving' | 'declining' | 'stable'
  attempts: AttemptHistory[]
  average_time: number
}

export interface EnrichedBookmark {
  bookmark: BookmarkData
  question: Question
  performanceHistory: PerformanceHistory
  srsStatus: SrsStatus
}

// ============================================================================
// BOOKMARK METADATA TYPES
// ============================================================================

export interface BookmarkMetadata {
  question_id: string
  bookmarked_question_id: number
  question_chapter: string
  question_difficulty: string | null
  user_difficulty_rating: number | null
  custom_tags: string[] | null
  has_personal_note: boolean
}

// ============================================================================
// REVIEW SESSION METADATA
// ============================================================================

export interface ReviewSessionMetadata {
  bookmarked_question_id: number
  question_id: string
  performance_rating: number
  previous_srs_interval: number
  new_srs_interval: number
  previous_srs_repetitions?: number
  new_srs_repetitions?: number
  previous_ease_factor?: number
  new_ease_factor?: number
  result_id?: number // For post-test reviews
}

// ============================================================================
// TIMING ANALYSIS UTILITIES
// ============================================================================

export interface TimingAnalysis {
  averageTimePerQuestion: number
  fastQuestions: number
  optimalQuestions: number
  slowQuestions: number
  totalTime: number
}

// Timing category thresholds (in seconds)
export const TIMING_THRESHOLDS = {
  fast: 60,      // Less than 1 minute = fast
  optimal: 180,  // 1-3 minutes = optimal
  // Above 3 minutes = slow
}

/**
 * Determines the timing category for a question based on time taken
 */
export function getTimingCategory(timeTaken: number): TimingCategory {
  if (timeTaken < TIMING_THRESHOLDS.fast) {
    return {
      category: 'fast',
      emoji: '⚡',
      label: 'Fast'
    }
  } else if (timeTaken < TIMING_THRESHOLDS.optimal) {
    return {
      category: 'optimal',
      emoji: '✓',
      label: 'Optimal'
    }
  } else {
    return {
      category: 'slow',
      emoji: '🐢',
      label: 'Slow'
    }
  }
}

