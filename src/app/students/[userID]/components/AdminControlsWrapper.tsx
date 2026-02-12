'use client'

import { AdminControls } from '@/components/students/admin-controls'
import { getStudentProfile } from '@/lib/actions/student-analytics'
import { useState, useEffect } from 'react'
import type { UserProfile } from '@/lib/supabase/admin'

interface AdminControlsWrapperProps {
  userId: string
}

export function AdminControlsWrapper({ userId }: AdminControlsWrapperProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getStudentProfile(userId)
        setProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-500">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <AdminControls 
        user={profile} 
        onAction={() => {
          // Refetch profile after action
          getStudentProfile(userId).then(setProfile)
        }} 
      />
    </div>
  )
}

