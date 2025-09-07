'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'

interface ProtectedRouteProps {
  children: React.ReactNode
}

interface UserProfile {
  role: string
  status: string
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profileLoading, setProfileLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Check user profile and role
  useEffect(() => {
    if (!authLoading && user) {
      const checkUserProfile = async () => {
        try {
          setProfileLoading(true)
          setProfileError(null)
          
          const supabase = createClient()
          const { data, error } = await supabase
            .from('user_profiles')
            .select('role, status')
            .eq('id', user.id)
            .single()

          if (error) {
            console.error('Profile check error:', error)
            setProfileError('Failed to verify user profile')
            // Sign out the user for security
            await supabase.auth.signOut()
            router.push('/login?error=Profile verification failed')
            return
          }

          if (!data) {
            setProfileError('User profile not found')
            await supabase.auth.signOut()
            router.push('/login?error=Profile not found')
            return
          }

          setUserProfile(data)

          // Check if user is admin
          if (data.role !== 'admin') {
            await supabase.auth.signOut()
            router.push('/login?error=Admin access required')
            return
          }

          // Check if admin is active
          if (data.status !== 'active') {
            await supabase.auth.signOut()
            router.push('/login?error=Account is not active')
            return
          }

        } catch (error) {
          console.error('Unexpected error during profile check:', error)
          setProfileError('Unexpected error occurred')
          const supabase = createClient()
          await supabase.auth.signOut()
          router.push('/login?error=Authentication error')
        } finally {
          setProfileLoading(false)
        }
      }

      checkUserProfile()
    } else if (!authLoading && !user) {
      // No user authenticated, redirect to login
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Show loading state while checking authentication or profile
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Show error state if profile check failed
  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{profileError}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  // If no user, don't render anything (redirect will happen)
  if (!user || !userProfile) {
    return null
  }

  // User is authenticated and is an active admin - render the protected content
  return <>{children}</>
}


