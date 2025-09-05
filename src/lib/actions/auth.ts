'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithRoleCheck(email: string, password: string) {
  try {
    // First, authenticate the user with Supabase Auth
    const supabase = await createClient()
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || 'Authentication failed'
      }
    }

    // Now check the user's role using admin client to bypass RLS
    const adminSupabase = createAdminClient()
    
    const { data: profile, error: profileError } = await adminSupabase
      .from('user_profiles')
      .select('role, status')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      // If no profile found, sign out the user and deny access
      await supabase.auth.signOut()
      return {
        success: false,
        error: 'User profile not found. Please contact an administrator.'
      }
    }

    // Check if user has admin role
    if (profile.role !== 'admin') {
      // Sign out the user immediately
      await supabase.auth.signOut()
      return {
        success: false,
        error: 'Access denied. Admin privileges required.'
      }
    }

    // Check if admin user is active
    if (profile.status !== 'active') {
      await supabase.auth.signOut()
      return {
        success: false,
        error: 'Account is not active. Please contact an administrator.'
      }
    }

    // User is authenticated and authorized
    return {
      success: true,
      user: authData.user
    }

  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during authentication'
    }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
