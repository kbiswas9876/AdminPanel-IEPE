'use server'

import { createAdminClient, type UserProfile, type TestAttemptWithDetails, type StudentAnalytics } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Interface for raw Supabase response
interface RawTestAttempt {
  id: number
  user_id: string
  test_id: number
  score: number
  total_correct: number
  total_incorrect: number
  total_skipped: number
  time_taken_seconds: number
  completed_at: string
  tests: {
    name: string
    description?: string
    total_time_minutes: number
    marks_per_correct: number
    negative_marks_per_incorrect: number
  }
}

// Get student profile by user ID
export async function getStudentProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error || !data) {
      console.error('Error fetching student profile:', error)
      return null
    }

    // Fetch email separately from auth.users
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const authUser = authUsers?.users?.find(user => user.id === userId)
    const email = authUser?.email || 'No email'
    
    return {
      ...data,
      email
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return null
  }
}

// Get student's test attempts with test details
export async function getStudentTestAttempts(userId: string): Promise<TestAttemptWithDetails[]> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('test_attempts')
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
      .order('completed_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching test attempts:', error)
      return []
    }
    
    // Transform the data to match our interface
    return data.map((attempt: RawTestAttempt) => ({
      id: attempt.id,
      user_id: attempt.user_id,
      test_id: attempt.test_id,
      score: attempt.score,
      total_correct: attempt.total_correct,
      total_incorrect: attempt.total_incorrect,
      total_skipped: attempt.total_skipped,
      time_taken_seconds: attempt.time_taken_seconds,
      completed_at: attempt.completed_at,
      test_name: attempt.tests.name,
      test_description: attempt.tests.description,
      test_total_time_minutes: attempt.tests.total_time_minutes,
      test_marks_per_correct: attempt.tests.marks_per_correct,
      test_negative_marks_per_incorrect: attempt.tests.negative_marks_per_incorrect
    }))
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

// Calculate student analytics
export async function getStudentAnalytics(userId: string): Promise<StudentAnalytics> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('test_attempts')
      .select('score, total_correct, total_incorrect, total_skipped, time_taken_seconds')
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching analytics data:', error)
      return {
        totalTests: 0,
        averageScore: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalSkipped: 0,
        averageAccuracy: 0,
        bestScore: 0,
        worstScore: 0,
        totalTimeSpent: 0
      }
    }
    
    if (data.length === 0) {
      return {
        totalTests: 0,
        averageScore: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalSkipped: 0,
        averageAccuracy: 0,
        bestScore: 0,
        worstScore: 0,
        totalTimeSpent: 0
      }
    }
    
    const totalTests = data.length
    const totalCorrect = data.reduce((sum, attempt) => sum + attempt.total_correct, 0)
    const totalIncorrect = data.reduce((sum, attempt) => sum + attempt.total_incorrect, 0)
    const totalSkipped = data.reduce((sum, attempt) => sum + attempt.total_skipped, 0)
    const totalTimeSpent = data.reduce((sum, attempt) => sum + attempt.time_taken_seconds, 0)
    
    const scores = data.map(attempt => attempt.score)
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalTests
    const bestScore = Math.max(...scores)
    const worstScore = Math.min(...scores)
    
    const totalAnswered = totalCorrect + totalIncorrect
    const averageAccuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0
    
    return {
      totalTests,
      averageScore: Math.round(averageScore * 100) / 100,
      totalCorrect,
      totalIncorrect,
      totalSkipped,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      bestScore,
      worstScore,
      totalTimeSpent
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      totalTests: 0,
      averageScore: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      totalSkipped: 0,
      averageAccuracy: 0,
      bestScore: 0,
      worstScore: 0,
      totalTimeSpent: 0
    }
  }
}

// Suspend user
export async function suspendUser(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        status: 'suspended',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) {
      console.error('Error suspending user:', error)
      return {
        success: false,
        message: `Failed to suspend user: ${error.message}`
      }
    }
    
    revalidatePath('/students')
    revalidatePath(`/students/${userId}`)
    
    return {
      success: true,
      message: 'User suspended successfully'
    }
  } catch (error) {
    console.error('Error suspending user:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while suspending the user'
    }
  }
}

// Activate user
export async function activateUser(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) {
      console.error('Error activating user:', error)
      return {
        success: false,
        message: `Failed to activate user: ${error.message}`
      }
    }
    
    revalidatePath('/students')
    revalidatePath(`/students/${userId}`)
    
    return {
      success: true,
      message: 'User activated successfully'
    }
  } catch (error) {
    console.error('Error activating user:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while activating the user'
    }
  }
}

// Trigger password reset
export async function triggerPasswordReset(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    // Get user email first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()
    
    if (profileError || !profile) {
      return {
        success: false,
        message: 'User not found'
      }
    }
    
    // Send password reset email
    const { error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: profile.email
    })
    
    if (error) {
      console.error('Error triggering password reset:', error)
      return {
        success: false,
        message: `Failed to send password reset: ${error.message}`
      }
    }
    
    return {
      success: true,
      message: 'Password reset email sent successfully'
    }
  } catch (error) {
    console.error('Error triggering password reset:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while sending password reset'
    }
  }
}
