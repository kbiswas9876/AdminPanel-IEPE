// /lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

// Admin client with service role key for full database access
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Types for our questions table
export interface Question {
  id?: number
  question_id: string
  book_source: string
  chapter_name: string
  question_number_in_book?: number
  question_text: string
  options?: {
    a: string
    b: string
    c: string
    d: string
  }
  correct_option?: string
  solution_text?: string
  exam_metadata?: string
  admin_tags?: string[]
  created_at: string
}

export interface QuestionsResponse {
  data: Question[]
  count: number
  error?: string
}

// Types for book_sources table
export interface BookSource {
  id: number
  name: string
  code: string
  created_at: string
}

// Types for user profiles table
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  status: 'pending' | 'active' | 'suspended'
  created_at: string
  updated_at?: string
}

// Types for tests table
export interface Test {
  id: number
  name: string
  description?: string
  total_time_minutes: number
  marks_per_correct: number
  negative_marks_per_incorrect: number
  status: 'draft' | 'scheduled' | 'live' | 'completed'
  start_time?: string
  end_time?: string
  created_at: string
  updated_at?: string
}

// Types for test_questions table
export interface TestQuestion {
  id: number
  test_id: number
  question_id: string
  created_at: string
}

// Types for test creation blueprint
export interface TestBlueprint {
  chapter_name: string
  question_count: number
}

// Types for test creation form data
export interface TestCreationData {
  name: string
  description?: string
  total_time_minutes: number
  marks_per_correct: number
  negative_marks_per_incorrect: number
  blueprint: TestBlueprint[]
}

// Types for test_attempts table
export interface TestAttempt {
  id: number
  user_id: string
  test_id: number
  score: number
  total_correct: number
  total_incorrect: number
  total_skipped: number
  time_taken_seconds: number
  completed_at: string
}

// Types for student analytics
export interface StudentAnalytics {
  totalTests: number
  averageScore: number
  totalCorrect: number
  totalIncorrect: number
  totalSkipped: number
  averageAccuracy: number
  bestScore: number
  worstScore: number
  totalTimeSpent: number
}

// Types for test attempt with test details
export interface TestAttemptWithDetails extends TestAttempt {
  test_name: string
  test_description?: string
  test_total_time_minutes: number
  test_marks_per_correct: number
  test_negative_marks_per_incorrect: number
}

// Types for error_reports table
export interface ErrorReport {
  id: number
  question_id: string
  user_id: string
  report_description: string
  status: 'new' | 'in_review' | 'resolved'
  created_at: string
  updated_at?: string
}

// Types for error report with user details
export interface ErrorReportWithDetails extends ErrorReport {
  user_email: string
  user_full_name?: string
  question_text?: string
  book_source?: string
  chapter_name?: string
}
