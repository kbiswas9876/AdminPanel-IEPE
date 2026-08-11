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
  difficulty?: 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard' | null
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
  icon_url?: string | null
  exam_type?: string | null
  author?: string | null
  publisher?: string | null
  publication_year?: string | null
  description?: string | null
  created_at: string
}

// Types for user profiles table
export interface UserProfile {
  id: string
  full_name?: string
  email?: string
  phone_number?: string
  role: 'admin' | 'student'
  status: 'pending' | 'correction_required' | 'active' | 'suspended'
  rejection_reason?: string
  date_of_birth?: string
  state?: string
  city?: string
  target_exam?: string
  student_category?: string
  created_at: string
  updated_at?: string
  active_flags?: string[]
  profile_picture_url?: string
}

// Enhanced Analytics Types
export interface TestResult {
  id: number
  user_id: string
  test_type: 'practice' | 'mock_test'
  session_type: string
  mock_test_id?: number
  score: number
  score_percentage: number
  accuracy: number
  total_questions: number
  total_correct: number
  total_incorrect: number
  total_skipped: number
  total_time_taken: number
  submitted_at: string
  created_at: string
}

export interface AnswerLog {
  id: number
  result_id: number
  question_id: number
  user_id: string
  user_answer: string | null
  status: 'correct' | 'incorrect' | 'skipped'
  time_taken: number
  created_at: string
}

export interface EnhancedStudentAnalytics {
  // Overview
  totalTests: number
  practiceTests: number
  mockTests: number
  
  // Performance
  overallScore: number
  practiceScore: number
  mockScore: number
  overallAccuracy: number
  
  // Time
  totalTimeSpent: number
  averageTimePerQuestion: number
  
  // Question Stats
  totalQuestionsAttempted: number
  totalCorrect: number
  totalIncorrect: number
  totalSkipped: number
  
  // Trends
  recentPerformance: PerformanceTrend[]
}

export interface PerformanceTrend {
  date: string
  score: number
  testType: 'practice' | 'mock_test'
}

export interface QuestionPerformanceDetail {
  questionId: number
  questionText: string
  book_source: string
  chapter_name: string
  difficulty: string
  attempts: number
  correctAttempts: number
  averageTime: number
  lastAttempted: string
  recentStatus: 'correct' | 'incorrect' | 'skipped'
}

export interface SessionDetail {
  id: number
  sessionType: 'practice' | 'mock_test'
  testName?: string
  score: number
  accuracy: number
  totalQuestions: number
  correct: number
  incorrect: number
  skipped: number
  timeSpent: number
  submittedAt: string
  answerLog: AnswerLog[]
}

export interface QuestionFilters {
  subject?: string
  chapter?: string
  difficulty?: string
  status?: 'correct' | 'incorrect' | 'skipped'
}

// Types for user groups and tags
export interface UserGroup {
  id: string
  name: string
  description?: string
  color: string
  is_system: boolean
  created_by?: string
  created_at: string
  updated_at?: string
  member_count?: number
}

export interface Tag {
  id: string
  name: string
  description?: string
  color: string
  category: string
  created_by?: string
  created_at: string
  updated_at?: string
  usage_count?: number
}

export interface UserGroupMember {
  id: string
  user_id: string
  group_id: string
  role: 'admin' | 'moderator' | 'member'
  joined_at: string
  added_by?: string
  user?: UserProfile
  group?: UserGroup
}

export interface UserTag {
  id: string
  user_id: string
  tag_id: string
  added_at: string
  added_by?: string
  user?: UserProfile
  tag?: Tag
}

// Types for permissions system
export interface Permission {
  id: string
  name: string
  description?: string
  category: string
  resource: string
  action: string
  created_at: string
  updated_at?: string
}

export interface AdminRole {
  id: string
  name: string
  description?: string
  is_system: boolean
  created_by?: string
  created_at: string
  updated_at?: string
  permission_count?: number
}

export interface RolePermission {
  id: string
  role_id: string
  permission_id: string
  granted_at: string
  granted_by?: string
  role?: AdminRole
  permission?: Permission
}

export interface UserPermission {
  id: string
  user_id: string
  permission_id: string
  granted_at: string
  granted_by?: string
  expires_at?: string
  user?: UserProfile
  permission?: Permission
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
  assigned_at: string
  assigned_by?: string
  expires_at?: string
  user?: UserProfile
  role?: AdminRole
}

// Types for audit log system
export interface AuditLog {
  id: string
  admin_id: string
  action_type: string
  resource_type: string
  resource_id?: string
  description: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  metadata?: Record<string, any>
  ip_address?: string
  user_agent?: string
  session_id?: string
  created_at: string
  admin?: UserProfile
}

export interface AuditLogFilter {
  id: string
  name: string
  description?: string
  filters: Record<string, any>
  created_by?: string
  created_at: string
  updated_at?: string
}

export interface AuditLogStats {
  total_actions: number
  unique_admins: number
  most_common_action: string
  action_count: number
  most_active_admin: string
  admin_action_count: number
}

export interface AuditLogSearchParams {
  search_term?: string
  action_types?: string[]
  resource_types?: string[]
  admin_ids?: string[]
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
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
  dynamic_status?: 'draft' | 'scheduled' | 'live' | 'completed' // Added dynamic_status
  start_time?: string
  end_time?: string
  created_at: string
  updated_at?: string
  allow_pausing?: boolean
  show_in_question_timer?: boolean
  is_proctored?: boolean
  is_dynamically_shuffled?: boolean
  result_policy: 'instant' | 'scheduled'
  result_release_at?: string | null
  result_declaration_status?: 'instant' | 'declared' | 'scheduled' | 'not_configured';
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
  allow_pausing?: boolean
  show_in_question_timer?: boolean
  is_proctored?: boolean
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

// Types for test_attempt_answers table
export interface TestAttemptAnswer {
  id: number
  attempt_id: number
  question_id: number
  question_number: number
  selected_option: string | null
  correct_option: string
  is_correct: boolean
  marks_awarded: number
  time_spent_seconds: number
  created_at: string
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
  report_tag: string
  report_description: string | null
  status: 'new' | 'reviewed' | 'resolved' | 'dismissed'
  admin_notes?: string
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
