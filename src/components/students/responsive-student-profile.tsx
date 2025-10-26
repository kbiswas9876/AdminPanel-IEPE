'use client'

import { useState, useEffect } from 'react'
import { EnhancedStudentProfile } from './enhanced-student-profile'
import { MobileStudentProfile } from './mobile-student-profile'
import type { UserProfile } from '@/lib/supabase/admin'

interface ResponsiveStudentProfileProps {
  userId: string
  user: UserProfile
}

export function ResponsiveStudentProfile({ userId, user }: ResponsiveStudentProfileProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    return <MobileStudentProfile userId={userId} user={user} />
  }

  return <EnhancedStudentProfile userId={userId} user={user} />
}
