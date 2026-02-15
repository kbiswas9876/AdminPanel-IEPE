'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Enhanced Admin Profile Interface
export interface AdminProfileData {
  id: string
  email: string
  full_name: string | null
  profile_picture_url: string | null
  phone_number: string | null
  department: string | null
  job_title: string | null
  bio: string | null
  timezone: string
  language: string
  role: string
  status: string
  last_login_at: string | null
  updated_at: string | null
}

// Admin Settings Interface
export interface AdminSettings {
  theme: 'light' | 'dark' | 'auto'
  sidebar_collapsed: boolean
  dashboard_layout: Record<string, unknown>
  email_notifications: boolean
  push_notifications: boolean
  notification_sound: boolean
  notification_frequency: 'realtime' | 'hourly' | 'daily' | 'off'
  two_factor_enabled: boolean
  session_timeout_minutes: number
  require_password_change: boolean
  items_per_page: number
  date_format: string
  time_format: '12h' | '24h'
}

// Activity Log Interface
export interface ActivityLogEntry {
  id: number
  action_type: string
  action_description: string
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown>
  created_at: string
}

// Get current admin's full profile
export async function getCurrentAdminFullProfile(): Promise<AdminProfileData | null> {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    // Get current user (using getUser for security)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return null
    }
    
    // Get profile from database with all fields
    const { data: profile, error } = await adminSupabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error || !profile) {
      console.error('Error fetching admin profile:', error)
      return null
    }
    
    return {
      ...profile,
      email: profile.email || user.email || 'Unknown'
    }
  } catch (error) {
    console.error('Error fetching admin full profile:', error)
    return null
  }
}

// Get admin settings
export async function getAdminSettings(): Promise<AdminSettings | null> {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return null
    }
    
    const { data: settings, error } = await adminSupabase
      .from('admin_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      // If settings don't exist, create default ones
      if (error.code === 'PGRST116') {
        const { data: newSettings } = await adminSupabase
          .from('admin_settings')
          .insert({ user_id: user.id })
          .select()
          .single()
        
        return newSettings
      }
      
      console.error('Error fetching admin settings:', error)
      return null
    }
    
    return settings
  } catch (error) {
    console.error('Error fetching admin settings:', error)
    return null
  }
}

// Update admin profile
export async function updateAdminProfile(updates: Partial<AdminProfileData>): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { success: false, message: 'Not authenticated' }
    }
    
    // Remove fields that shouldn't be updated directly
    const { id, role, status, ...allowedUpdates } = updates as any
    
    const { error } = await adminSupabase
      .from('user_profiles')
      .update({
        ...allowedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    
    if (error) {
      console.error('Error updating profile:', error)
      return { success: false, message: 'Failed to update profile' }
    }
    
    // Log activity
    await logAdminActivity(
      user.id, 
      'profile_update', 
      'Admin updated their profile',
      { updated_fields: Object.keys(allowedUpdates) }
    )
    
    revalidatePath('/')
    revalidatePath('/profile')
    return { success: true, message: 'Profile updated successfully' }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, message: 'An error occurred' }
  }
}

// Update admin settings
export async function updateAdminSettings(updates: Partial<AdminSettings>): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { success: false, message: 'Not authenticated' }
    }
    
    const { error } = await adminSupabase
      .from('admin_settings')
      .update(updates)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error updating settings:', error)
      return { success: false, message: 'Failed to update settings' }
    }
    
    // Log activity
    await logAdminActivity(
      user.id, 
      'settings_change', 
      'Admin updated their settings',
      { updated_settings: Object.keys(updates) }
    )
    
    revalidatePath('/')
    revalidatePath('/settings')
    return { success: true, message: 'Settings updated successfully' }
  } catch (error) {
    console.error('Error updating settings:', error)
    return { success: false, message: 'An error occurred' }
  }
}

// Log admin activity
export async function logAdminActivity(
  adminId: string,
  actionType: string,
  description: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const adminSupabase = createAdminClient()
    
    await adminSupabase
      .from('admin_activity_log')
      .insert({
        admin_id: adminId,
        action_type: actionType,
        action_description: description,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      })
  } catch (error) {
    // Don't throw errors for logging failures
    console.error('Error logging admin activity:', error)
  }
}

// Update last login timestamp
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    const adminSupabase = createAdminClient()
    
    await adminSupabase
      .from('user_profiles')
      .update({ 
        last_login_at: new Date().toISOString(),
        email: (await adminSupabase.auth.admin.getUserById(userId)).data.user?.email
      })
      .eq('id', userId)
    
    await logAdminActivity(userId, 'login', 'Admin logged in')
  } catch (error) {
    console.error('Error updating last login:', error)
  }
}

// Get admin activity history
export async function getAdminActivityHistory(limit: number = 50): Promise<ActivityLogEntry[]> {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return []
    }
    
    const { data, error } = await adminSupabase
      .from('admin_activity_log')
      .select('*')
      .eq('admin_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching activity history:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching activity history:', error)
    return []
  }
}

// Sync email from auth.users to user_profiles (utility function)
export async function syncUserEmail(userId: string): Promise<void> {
  try {
    const adminSupabase = createAdminClient()
    
    const { data: { user } } = await adminSupabase.auth.admin.getUserById(userId)
    
    if (user?.email) {
      await adminSupabase
        .from('user_profiles')
        .update({ email: user.email })
        .eq('id', userId)
    }
  } catch (error) {
    console.error('Error syncing user email:', error)
  }
}

