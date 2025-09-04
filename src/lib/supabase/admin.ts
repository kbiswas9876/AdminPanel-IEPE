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
