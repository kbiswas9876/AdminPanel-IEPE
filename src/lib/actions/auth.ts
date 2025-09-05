'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithRoleCheck(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // First, authenticate the user with Supabase Auth
  const supabase = await createClient()
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // If authentication itself fails, redirect back with an error
  if (authError || !authData.user) {
    redirect('/login?error=Invalid email or password')
  }

  // Now check the user's role using admin client to bypass RLS
  const adminSupabase = createAdminClient()
  
  // Handle the profile query with try/catch for database errors only
  let profile;
  try {
    const { data, error: profileError } = await adminSupabase
      .from('user_profiles')
      .select('role, status')
      .eq('id', authData.user.id)
      .single()

    if (profileError) throw profileError
    profile = data
  } catch {
    // If the profile query fails, sign the user out for safety and show an error
    await supabase.auth.signOut()
    redirect('/login?error=Could not verify user profile')
  }

  // If no profile found, sign out the user and deny access
  if (!profile) {
    await supabase.auth.signOut()
    redirect('/login?error=User profile not found')
  }

  // Check if user has admin role
  if (profile.role !== 'admin') {
    // Sign out the user immediately
    await supabase.auth.signOut()
    redirect('/login?error=Access denied. Admin privileges required')
  }

  // Check if admin user is active
  if (profile.status !== 'active') {
    await supabase.auth.signOut()
    redirect('/login?error=Account is not active')
  }

  // If all checks pass, redirect to dashboard
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
