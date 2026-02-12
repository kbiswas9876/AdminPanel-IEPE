'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Bulk approve users
export async function bulkApproveUsers(userIds: string[]): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
    
    if (error) {
      console.error('Error bulk approving users:', error)
      return {
        success: false,
        message: `Failed to approve users: ${error.message}`
      }
    }
    
    revalidatePath('/students')
    
    return {
      success: true,
      message: `Successfully approved ${userIds.length} users`
    }
  } catch (error) {
    console.error('Error bulk approving users:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while approving users'
    }
  }
}

// Bulk suspend users
export async function bulkSuspendUsers(userIds: string[]): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        status: 'suspended',
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
    
    if (error) {
      console.error('Error bulk suspending users:', error)
      return {
        success: false,
        message: `Failed to suspend users: ${error.message}`
      }
    }
    
    revalidatePath('/students')
    
    return {
      success: true,
      message: `Successfully suspended ${userIds.length} users`
    }
  } catch (error) {
    console.error('Error bulk suspending users:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while suspending users'
    }
  }
}

// Bulk promote users to admin
export async function bulkPromoteUsers(userIds: string[]): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
    
    if (error) {
      console.error('Error bulk promoting users:', error)
      return {
        success: false,
        message: `Failed to promote users: ${error.message}`
      }
    }
    
    revalidatePath('/students')
    
    return {
      success: true,
      message: `Successfully promoted ${userIds.length} users to admin`
    }
  } catch (error) {
    console.error('Error bulk promoting users:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while promoting users'
    }
  }
}

// Bulk demote users to student
export async function bulkDemoteUsers(userIds: string[]): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        role: 'student',
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
    
    if (error) {
      console.error('Error bulk demoting users:', error)
      return {
        success: false,
        message: `Failed to demote users: ${error.message}`
      }
    }
    
    revalidatePath('/students')
    
    return {
      success: true,
      message: `Successfully demoted ${userIds.length} users to student`
    }
  } catch (error) {
    console.error('Error bulk demoting users:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while demoting users'
    }
  }
}

// Bulk delete users
export async function bulkDeleteUsers(userIds: string[]): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    // First, delete from user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .in('id', userIds)
    
    if (profileError) {
      console.error('Error bulk deleting user profiles:', profileError)
      return {
        success: false,
        message: `Failed to delete user profiles: ${profileError.message}`
      }
    }
    
    // Then, delete from auth.users using admin client
    for (const userId of userIds) {
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      
      if (authError) {
        console.error('Error deleting user from auth:', authError)
        // Don't fail the entire operation for individual auth deletions
        // Just log the error and continue
      }
    }
    
    revalidatePath('/students')
    
    return {
      success: true,
      message: `Successfully deleted ${userIds.length} users`
    }
  } catch (error) {
    console.error('Error bulk deleting users:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while deleting users'
    }
  }
}

// Bulk activate users
export async function bulkActivateUsers(userIds: string[]): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
    
    if (error) {
      console.error('Error bulk activating users:', error)
      return {
        success: false,
        message: `Failed to activate users: ${error.message}`
      }
    }
    
    revalidatePath('/students')
    
    return {
      success: true,
      message: `Successfully activated ${userIds.length} users`
    }
  } catch (error) {
    console.error('Error bulk activating users:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while activating users'
    }
  }
}

// Get bulk operation statistics
export async function getBulkOperationStats(userIds: string[]): Promise<{
  totalUsers: number
  pendingUsers: number
  activeUsers: number
  suspendedUsers: number
  studentUsers: number
  adminUsers: number
}> {
  try {
    const supabase = createAdminClient()
    
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('status, role')
      .in('id', userIds)
    
    if (error) {
      console.error('Error fetching bulk operation stats:', error)
      return {
        totalUsers: 0,
        pendingUsers: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        studentUsers: 0,
        adminUsers: 0
      }
    }
    
    const stats = {
      totalUsers: users.length,
      pendingUsers: users.filter(u => u.status === 'pending').length,
      activeUsers: users.filter(u => u.status === 'active').length,
      suspendedUsers: users.filter(u => u.status === 'suspended').length,
      studentUsers: users.filter(u => u.role === 'student').length,
      adminUsers: users.filter(u => u.role === 'admin').length
    }
    
    return stats
  } catch (error) {
    console.error('Error getting bulk operation stats:', error)
    return {
      totalUsers: 0,
      pendingUsers: 0,
      activeUsers: 0,
      suspendedUsers: 0,
      studentUsers: 0,
      adminUsers: 0
    }
  }
}
