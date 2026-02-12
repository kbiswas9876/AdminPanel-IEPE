// Type definitions for Student Admin Operations

/**
 * Student Note - Represents an admin note attached to a student profile
 */
export interface StudentNote {
  id: number
  student_id: string
  admin_id: string
  note: string
  created_at: string
}

/**
 * Admin note with admin profile information (for UI display)
 */
export interface StudentNoteWithAdmin extends StudentNote {
  admin_name?: string
  admin_email?: string
}

/**
 * Complete student export data structure
 */
export interface StudentExportData {
  profile: {
    id: string
    full_name: string
    email: string
    status: 'pending' | 'active' | 'suspended'
    role: string
    created_at: string
    updated_at?: string
  }
  analytics: {
    totalTests: number
    averageScore: number
    averageAccuracy: number
    totalCorrect: number
    totalIncorrect: number
    totalSkipped: number
    totalTimeSpent: number
    bestScore: number
    worstScore: number
  }
  testAttempts: Array<{
    id: number
    test_name: string
    score: number
    total_correct: number
    total_incorrect: number
    total_skipped: number
    time_taken_seconds: number
    completed_at: string
    test_type?: string
  }>
  revisionHub: {
    totalBookmarks: number
    masteryDistribution: {
      learning: number
      maturing: number
      mastered: number
    }
    bookmarks?: Array<{
      question_id: string
      chapter_name: string
      srs_interval: number
      srs_ease_factor: number
      created_at: string
    }>
  }
  activityTimeline: Array<{
    activity_type: string
    created_at: string
    metadata: Record<string, unknown>
  }>
  adminNotes: StudentNote[]
}

/**
 * Filters for student list query
 */
export interface StudentFilters {
  status?: 'pending' | 'active' | 'suspended'
  minAccuracy?: number
  maxAccuracy?: number
  inactiveSince?: string // ISO date string
  searchQuery?: string // for name/email search
}

/**
 * Response from admin action operations
 */
export interface AdminActionResponse {
  success: boolean
  message: string
  data?: unknown
}

