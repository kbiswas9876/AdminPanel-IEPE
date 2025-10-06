'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export interface Notification {
  id: number
  type: 'user_registration' | 'error_report' | 'question_added' | 'test_published' | 'system_alert' | 'admin_login' | 'admin_action' | 'bulk_import' | 'test_created'
  title: string
  message: string
  timestamp: Date
  read: boolean
  metadata?: Record<string, unknown>
  source_table?: string
  source_id?: number
}

/**
 * Get notifications for the current user from the notifications table
 * This is the new implementation using the proper notifications table
 */
export async function getNotificationsFromTable(limit: number = 10): Promise<Notification[]> {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return []
    }
    
    // Fetch notifications from the notifications table
    const { data: notifications, error } = await adminSupabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching notifications from table:', error)
      return []
    }
    
    // Transform to match the expected format
    return (notifications || []).map(n => ({
      id: Number(n.id),
      type: n.type as Notification['type'],
      title: n.title,
      message: n.message,
      timestamp: new Date(n.created_at),
      read: n.read || false,
      metadata: n.metadata as Record<string, unknown>,
      source_table: n.source_table || undefined,
      source_id: n.source_id ? Number(n.source_id) : undefined
    }))
    
  } catch (error) {
    console.error('Error fetching notifications from table:', error)
    return []
  }
}

/**
 * Mark a notification as read using the notifications table
 */
export async function markNotificationAsReadInTable(notificationId: number): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { success: false }
    }
    
    // Update notification read status
    const { error } = await adminSupabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error marking notification as read:', error)
      return { success: false }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { success: false }
  }
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllNotificationsAsReadInTable(): Promise<{ success: boolean; message: string; count: number }> {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { success: false, message: 'Not authenticated', count: 0 }
    }
    
    // Update all unread notifications
    const { data, error } = await adminSupabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('read', false)
      .is('deleted_at', null)
      .select('id')
    
    if (error) {
      console.error('Error marking all notifications as read:', error)
      return { success: false, message: 'Failed to mark notifications as read', count: 0 }
    }
    
    return { 
      success: true, 
      message: 'All notifications marked as read',
      count: data?.length || 0
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return { success: false, message: 'An error occurred', count: 0 }
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCountFromTable(): Promise<number> {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return 0
    }
    
    const { count, error } = await adminSupabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)
      .is('deleted_at', null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    
    if (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }
    
    return count || 0
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }
}

/**
 * Soft delete a notification
 */
export async function deleteNotification(notificationId: number): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { success: false }
    }
    
    const { error } = await adminSupabase
      .from('notifications')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting notification:', error)
      return { success: false }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting notification:', error)
    return { success: false }
  }
}

/**
 * Create a new notification
 * This is typically called by server-side triggers or actions
 */
export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  options?: {
    sourceTable?: string
    sourceId?: number
    metadata?: Record<string, unknown>
    expiresInDays?: number
  }
): Promise<{ success: boolean; notificationId?: number }> {
  try {
    const adminSupabase = createAdminClient()
    
    const expiresAt = options?.expiresInDays 
      ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // Default 90 days
    
    const { data, error } = await adminSupabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        source_table: options?.sourceTable,
        source_id: options?.sourceId,
        metadata: options?.metadata || {},
        expires_at: expiresAt.toISOString()
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('Error creating notification:', error)
      return { success: false }
    }
    
    return { success: true, notificationId: Number(data.id) }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false }
  }
}

/**
 * Notify all admins about an event
 */
export async function notifyAllAdmins(
  type: Notification['type'],
  title: string,
  message: string,
  options?: {
    sourceTable?: string
    sourceId?: number
    metadata?: Record<string, unknown>
    expiresInDays?: number
  }
): Promise<{ success: boolean; count: number }> {
  try {
    const adminSupabase = createAdminClient()
    
    // Get all active admin users
    const { data: admins, error: adminError } = await adminSupabase
      .from('user_profiles')
      .select('id')
      .in('role', ['admin', 'super_admin'])
      .eq('status', 'active')
    
    if (adminError || !admins || admins.length === 0) {
      console.error('Error fetching admins:', adminError)
      return { success: false, count: 0 }
    }
    
    // Create notification for each admin
    const results = await Promise.all(
      admins.map(admin => createNotification(admin.id, type, title, message, options))
    )
    
    const successCount = results.filter(r => r.success).length
    
    return { success: successCount > 0, count: successCount }
  } catch (error) {
    console.error('Error notifying admins:', error)
    return { success: false, count: 0 }
  }
}

