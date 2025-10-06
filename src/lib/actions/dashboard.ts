'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// Dashboard statistics interface
export interface DashboardStats {
  pendingUsers: number
  newErrorReports: number
  activeStudents: number
  totalQuestions: number
}

// Admin profile interface
export interface AdminProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  last_login?: string
}

// Recent activity interface
export interface RecentActivity {
  id: string
  type: 'user_registration' | 'test_created' | 'bulk_import' | 'error_report' | 'question_added'
  title: string
  description: string
  timestamp: string
  userEmail?: string
  metadata?: Record<string, unknown>
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const supabase = createAdminClient()
    
    const [
      pendingUsersResult,
      newErrorReportsResult,
      activeStudentsResult,
      totalQuestionsResult
    ] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .eq('status', 'pending'),
      supabase
        .from('error_reports')
        .select('id', { count: 'exact' })
        .eq('status', 'new'),
      supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .eq('status', 'active'),
      supabase
        .from('questions')
        .select('id', { count: 'exact' })
    ])
    
    return {
      pendingUsers: pendingUsersResult.count || 0,
      newErrorReports: newErrorReportsResult.count || 0,
      activeStudents: activeStudentsResult.count || 0,
      totalQuestions: totalQuestionsResult.count || 0
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      pendingUsers: 0,
      newErrorReports: 0,
      activeStudents: 0,
      totalQuestions: 0
    }
  }
}

// Get recent activity feed
export async function getRecentActivity(limit: number = 7): Promise<RecentActivity[]> {
  try {
    const supabase = createAdminClient()
    const activities: RecentActivity[] = []
    
    // Get recent user registrations
    const { data: recentUsers } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, created_at, status')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (recentUsers) {
      recentUsers.forEach(user => {
        activities.push({
          id: `user_${user.id}`,
          type: 'user_registration',
          title: 'New User Registration',
          description: user.status === 'pending' 
            ? `${user.full_name || user.email} registered and is pending approval`
            : `${user.full_name || user.email} registered and was approved`,
          timestamp: user.created_at,
          userEmail: user.email,
          metadata: { userId: user.id, status: user.status }
        })
      })
    }
    
    // Get recent error reports
    const { data: recentErrors } = await supabase
      .from('error_reports')
      .select('id, created_at, status, profiles(email)')
      .order('created_at', { ascending: false })
      .limit(2)
    
    if (recentErrors) {
      recentErrors.forEach(error => {
        activities.push({
          id: `error_${error.id}`,
          type: 'error_report',
          title: 'New Error Report',
          description: `Error report submitted by ${error.profiles?.[0]?.email || 'Unknown user'}`,
          timestamp: error.created_at,
          userEmail: error.profiles?.[0]?.email,
          metadata: { errorId: error.id, status: error.status }
        })
      })
    }
    
    // Get recent questions (if we can determine when they were added)
    const { data: recentQuestions } = await supabase
      .from('questions')
      .select('id, question_id, book_source, created_at')
      .order('created_at', { ascending: false })
      .limit(2)
    
    if (recentQuestions) {
      recentQuestions.forEach(question => {
        activities.push({
          id: `question_${question.id}`,
          type: 'question_added',
          title: 'New Question Added',
          description: `Question ${question.question_id} from ${question.book_source} was added`,
          timestamp: question.created_at,
          metadata: { questionId: question.id, bookSource: question.book_source }
        })
      })
    }
    
    // Sort all activities by timestamp and return the most recent
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

// Get current admin profile
export async function getCurrentAdminProfile(): Promise<AdminProfile | null> {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    // Get current user (secure method)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return null
    }
    
    // Get profile from database
    const { data: profile } = await adminSupabase
      .from('user_profiles')
      .select('id, full_name, role')
      .eq('id', user.id)
      .single()
    
    if (!profile) {
      return null
    }
    
    return {
      id: profile.id,
      email: user.email || 'Unknown',
      full_name: profile.full_name,
      role: profile.role,
      last_login: user.last_sign_in_at || undefined
    }
  } catch (error) {
    console.error('Error fetching admin profile:', error)
    return null
  }
}

// Get enhanced dashboard stats with badge counts for quick actions
export interface QuickActionBadges {
  pendingApprovals: number
  newErrors: number
  draftTests: number
  recentQuestions: number
}

export async function getQuickActionBadges(): Promise<QuickActionBadges> {
  try {
    const supabase = createAdminClient()
    
    const [
      pendingApprovalsResult,
      newErrorsResult,
      draftTestsResult,
      recentQuestionsResult
    ] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .eq('status', 'pending'),
      supabase
        .from('error_reports')
        .select('id', { count: 'exact' })
        .eq('status', 'new'),
      supabase
        .from('tests')
        .select('id', { count: 'exact' })
        .eq('status', 'draft'),
      supabase
        .from('questions')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ])
    
    return {
      pendingApprovals: pendingApprovalsResult.count || 0,
      newErrors: newErrorsResult.count || 0,
      draftTests: draftTestsResult.count || 0,
      recentQuestions: recentQuestionsResult.count || 0
    }
  } catch (error) {
    console.error('Error fetching quick action badges:', error)
    return {
      pendingApprovals: 0,
      newErrors: 0,
      draftTests: 0,
      recentQuestions: 0
    }
  }
}

