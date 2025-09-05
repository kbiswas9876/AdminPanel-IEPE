'use server'

import { createAdminClient, type UserProfile } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Get all users with a specific status
export async function getUsersByStatus(status?: 'pending' | 'active' | 'suspended'): Promise<UserProfile[]> {
  try {
    const supabase = createAdminClient()
    
    let query = supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
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


