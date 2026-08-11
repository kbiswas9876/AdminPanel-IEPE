'use server'

import { createAdminClient, type UserProfile } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { StudentFilters } from '@/lib/types/studentAdmin'

// Get all users with a specific status (legacy function for backward compatibility)
export async function getUsersByStatus(status?: 'pending' | 'active' | 'suspended'): Promise<UserProfile[]> {
  try {
    const supabase = createAdminClient()
    
    let query = supabase
      .from('user_profiles')
      .select('*')
      .order('updated_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching users:', error)
      return []
    }
    
    return data as UserProfile[]
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

// Enhanced function to get students with advanced filtering
export async function getStudents(filters: StudentFilters = {}): Promise<UserProfile[]> {
  try {
    const supabase = createAdminClient()
    
    // Start with base query
    let query = supabase
      .from('user_profiles')
      .select('*')
    
    // Apply status filter
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    // Apply inactivity filter
    if (filters.inactiveSince) {
      const cutoffDate = filters.inactiveSince
      query = query.lt('updated_at', cutoffDate)
    }
    
    // Apply search query (name or email)
    if (filters.searchQuery) {
      query = query.or(`full_name.ilike.%${filters.searchQuery}%,email.ilike.%${filters.searchQuery}%`)
    }
    
    // Note: Accuracy filtering on analytics_summary JSONB requires that column to exist
    // This will be added in Phase 2 or when the analytics_summary column is available
    // For now, we skip this filter if analytics_summary doesn't exist
    
    // Order by updated_at desc
    query = query.order('updated_at', { ascending: false })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching students with filters:', error)
      return []
    }
    
    let results = (data || []) as UserProfile[]
    
    // Filter by accuracy if both min and max are provided
    // This is done client-side because JSONB queries are complex
    if (filters.minAccuracy !== undefined || filters.maxAccuracy !== undefined) {
      results = results.filter(user => {
        const accuracy = (user as any).analytics_summary?.overall_accuracy
        if (accuracy === undefined) return false
        
        if (filters.minAccuracy !== undefined && accuracy < filters.minAccuracy) {
          return false
        }
        if (filters.maxAccuracy !== undefined && accuracy > filters.maxAccuracy) {
          return false
        }
        return true
      })
    }
    
    return results
  } catch (error) {
    console.error('Unexpected error fetching students:', error)
    return []
  }
}

// Get user counts for each status
export async function getUserCounts(): Promise<{
  pending: number
  active: number
  total: number
}> {
  try {
    const supabase = createAdminClient()
    
    const [pendingResult, activeResult, totalResult] = await Promise.all([
      supabase.from('user_profiles').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('user_profiles').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('user_profiles').select('id', { count: 'exact' })
    ])
    
    return {
      pending: pendingResult.count || 0,
      active: activeResult.count || 0,
      total: totalResult.count || 0
    }
  } catch (error) {
    console.error('Error fetching user counts:', error)
    return { pending: 0, active: 0, total: 0 }
  }
}

// Approve a user (change status to active)
export async function approveUser(userId: string): Promise<{ success: boolean; message: string }> {
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
      console.error('Error approving user:', error)
      return {
        success: false,
        message: `Failed to approve user: ${error.message}`
      }
    }
    
    revalidatePath('/students')
    
    return {
      success: true,
      message: 'User approved successfully'
    }
  } catch (error) {
    console.error('Error approving user:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while approving the user'
    }
  }
}

// Request user correction / revision (change status to correction_required with reason message)
export async function requestUserCorrection(userId: string, reasonMessage: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        status: 'correction_required',
        rejection_reason: reasonMessage || 'Please update your profile details for approval.',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) {
      console.error('Error requesting user correction:', error)
      return {
        success: false,
        message: `Failed to request correction: ${error.message}`
      }
    }
    
    revalidatePath('/students')
    
    return {
      success: true,
      message: 'Correction request sent to student successfully'
    }
  } catch (error) {
    console.error('Error requesting user correction:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while requesting user correction'
    }
  }
}

// Reject a user (delete from profiles and auth)
export async function rejectUser(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    // First, delete from user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)
    
    if (profileError) {
      console.error('Error deleting user profile:', profileError)
      return {
        success: false,
        message: `Failed to delete user profile: ${profileError.message}`
      }
    }
    
    // Then, delete from auth.users using admin client
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    
    if (authError) {
      console.error('Error deleting user from auth:', authError)
      // Don't return error here as profile is already deleted
      // Just log the error and continue
    }
    
    revalidatePath('/students')
    
    return {
      success: true,
      message: 'User rejected and removed successfully'
    }
  } catch (error) {
    console.error('Error rejecting user:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while rejecting the user'
    }
  }
}

// Suspend a user (change status to suspended)
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

// Promote a user to admin
export async function promoteToAdmin(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) {
      console.error('Error promoting user to admin:', error)
      return {
        success: false,
        message: `Failed to promote user: ${error.message}`
      }
    }
    
    revalidatePath('/students')
    
    return {
      success: true,
      message: 'User promoted to admin successfully!'
    }
  } catch (error) {
    console.error('Error promoting user to admin:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while promoting the user'
    }
  }
}

// Demote an admin to student
export async function demoteToStudent(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        role: 'student',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) {
      console.error('Error demoting admin to student:', error)
      return {
        success: false,
        message: `Failed to demote user: ${error.message}`
      }
    }
    
    revalidatePath('/students')
    
    return {
      success: true,
      message: 'User demoted to student successfully!'
    }
  } catch (error) {
    console.error('Error demoting admin to student:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while demoting the user'
    }
  }
}


