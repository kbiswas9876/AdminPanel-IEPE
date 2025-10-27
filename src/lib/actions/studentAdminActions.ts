'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { StudentNote, AdminActionResponse } from '@/lib/types/studentAdmin'

/**
 * Log admin action to student_activity_log
 */
async function logStudentAdminActivity(
  userId: string,
  activityType: string,
  adminId: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const supabase = createAdminClient()
    
    await supabase
      .from('student_activity_log')
      .insert({
        user_id: userId,
        activity_type: activityType,
        metadata: {
          admin_id: adminId,
          ...metadata
        }
      })
  } catch (error) {
    // Don't throw - logging is non-critical
    console.error('Error logging student activity:', error)
  }
}

/**
 * Log admin action to admin_activity_log
 */
async function logAdminActivity(
  adminId: string,
  actionType: string,
  description: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const supabase = createAdminClient()
    
    await supabase
      .from('admin_activity_log')
      .insert({
        admin_id: adminId,
        action_type: actionType,
        action_description: description,
        metadata: metadata
      })
  } catch (error) {
    console.error('Error logging admin activity:', error)
  }
}

/**
 * Update student status with audit trail
 */
export async function updateStudentStatus(
  userId: string,
  newStatus: 'pending' | 'active' | 'suspended',
  adminId: string,
  reason?: string
): Promise<AdminActionResponse> {
  try {
    const supabase = createAdminClient()
    
    // Get current status before update
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('status')
      .eq('id', userId)
      .single()
    
    const previousStatus = currentProfile?.status || 'unknown'
    
    // Update status
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) {
      console.error('Error updating student status:', error)
      return {
        success: false,
        message: `Failed to update student status: ${error.message}`
      }
    }
    
    // Log to student_activity_log
    const activityTypeMap: Record<string, string> = {
      active: 'ADMIN_ACCOUNT_ACTIVATED',
      pending: 'ADMIN_ACCOUNT_APPROVED',
      suspended: 'ADMIN_ACCOUNT_SUSPENDED'
    }
    
    const activityType = activityTypeMap[newStatus] || 'ADMIN_ACCOUNT_STATUS_CHANGE'
    
    await logStudentAdminActivity(userId, activityType, adminId, {
      previous_status: previousStatus,
      new_status: newStatus,
      reason: reason || 'No reason provided'
    })
    
    // Log to admin_activity_log
    await logAdminActivity(
      adminId,
      'student_status_changed',
      `Changed student status from ${previousStatus} to ${newStatus}`,
      { student_id: userId, previous_status: previousStatus, new_status: newStatus }
    )
    
    revalidatePath('/students')
    revalidatePath(`/students/${userId}`)
    
    return {
      success: true,
      message: `Student status updated to ${newStatus} successfully`
    }
  } catch (error) {
    console.error('Unexpected error updating student status:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while updating student status'
    }
  }
}

/**
 * Add admin note to student profile
 */
export async function addAdminNote(
  studentId: string,
  note: string,
  adminId: string
): Promise<AdminActionResponse> {
  try {
    const supabase = createAdminClient()
    
    // Insert note
    const { error } = await supabase
      .from('student_notes')
      .insert({
        student_id: studentId,
        admin_id: adminId,
        note: note.trim()
      })
    
    if (error) {
      console.error('Error adding admin note:', error)
      return {
        success: false,
        message: `Failed to add note: ${error.message}`
      }
    }
    
    // Log to student_activity_log
    await logStudentAdminActivity(studentId, 'ADMIN_NOTE_ADDED', adminId, {
      note_length: note.length
    })
    
    // Log to admin_activity_log
    await logAdminActivity(
      adminId,
      'note_added',
      `Added note to student profile`,
      { student_id: studentId, note_length: note.length }
    )
    
    revalidatePath(`/students/${studentId}`)
    
    return {
      success: true,
      message: 'Note added successfully'
    }
  } catch (error) {
    console.error('Unexpected error adding note:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while adding the note'
    }
  }
}

/**
 * Get all notes for a student
 */
export async function getStudentNotes(
  studentId: string
): Promise<Array<StudentNote>> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('student_notes')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching student notes:', error)
      return []
    }
    
    return (data || []) as Array<StudentNote>
  } catch (error) {
    console.error('Unexpected error fetching notes:', error)
    return []
  }
}

/**
 * Get notes with admin profile information
 */
export async function getStudentNotesWithAdmin(
  studentId: string
): Promise<Array<{ id: number; note: string; admin_id: string; admin_name?: string; admin_email?: string; created_at: string }>> {
  try {
    const supabase = createAdminClient()
    
    // Fetch notes with admin emails
    const { data: notes, error } = await supabase
      .from('student_notes')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    
    if (error || !notes) {
      console.error('Error fetching notes:', error)
      return []
    }
    
    // Get admin emails from auth.users
    const adminIds = [...new Set(notes.map(n => n.admin_id))]
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    
    const adminMap = new Map<string, { email?: string }>()
    if (authUsers?.users) {
      authUsers.users.forEach(user => {
        if (adminIds.includes(user.id)) {
          adminMap.set(user.id, { email: user.email })
        }
      })
    }
    
    // Get admin profile info
    const { data: adminProfiles } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .in('id', adminIds)
    
    const nameMap = new Map<string, string>()
    if (adminProfiles) {
      adminProfiles.forEach(profile => {
        nameMap.set(profile.id, profile.full_name || profile.id.substring(0, 8))
      })
    }
    
    return notes.map(note => ({
      id: note.id,
      note: note.note,
      admin_id: note.admin_id,
      admin_name: nameMap.get(note.admin_id),
      admin_email: adminMap.get(note.admin_id)?.email,
      created_at: note.created_at
    }))
  } catch (error) {
    console.error('Unexpected error fetching notes with admin info:', error)
    return []
  }
}

