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
