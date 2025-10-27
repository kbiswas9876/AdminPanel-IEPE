/**
 * Activity Utilities
 * Icon mappings, colors, and formatting helpers for Activity Timeline
 */

import type { ActivityType } from '@/lib/types/analytics'
import type { ComponentType } from 'react'

// Icon mapping for each activity type
export interface ActivityIconConfig {
  Icon: ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
  badgeColor: string
  badgeTextColor: string
}

// Export icon types for use in components
export type IconConfig = ActivityIconConfig

// Activity type to icon mapping
// Will be populated by components importing the icons
export const getActivityIconConfig = (iconConfig: ActivityIconConfig): ActivityIconConfig => iconConfig

// Format time helper
export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now'
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}m ago`
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  }
  
  // Today
  if (date.toDateString() === now.toDateString()) {
    return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  }
  
  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  }
  
  // Older
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// Format date for headers
export function formatDateHeader(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  })
}

// Calculate total time from activities
export function calculateTotalTime(activities: any[]): number {
  return activities.reduce((total, activity) => {
    if (activity.metadata?.total_time_taken) {
      return total + activity.metadata.total_time_taken
    }
    return total
  }, 0)
}

// Calculate average accuracy
export function calculateAverageAccuracy(activities: any[]): number {
  const sessionsWithAccuracy = activities.filter(activity => 
    activity.metadata?.score_percentage !== undefined
  )
  
  if (sessionsWithAccuracy.length === 0) return 0
  
  const total = sessionsWithAccuracy.reduce((sum, activity) => 
    sum + (activity.metadata.score_percentage || 0), 0
  )
  
  return Math.round(total / sessionsWithAccuracy.length)
}

// Calculate streak (consecutive days with activity)
export function calculateStreak(activities: any[]): number {
  if (activities.length === 0) return 0
  
  // Sort by date descending
  const sorted = [...activities].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  for (const activity of sorted) {
    const activityDate = new Date(activity.created_at)
    activityDate.setHours(0, 0, 0, 0)
    
    const diffDays = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === streak) {
      streak++
      currentDate = activityDate
    } else if (diffDays > streak) {
      break
    }
  }
  
  return streak
}

// Filter activities by type
export function filterActivitiesByType(
  activities: any[],
  type: ActivityType | 'all'
): any[] {
  if (type === 'all') return activities
  
  return activities.filter(activity => activity.activity_type === type)
}

// Search activities
export function searchActivities(activities: any[], searchTerm: string): any[] {
  if (!searchTerm.trim()) return activities
  
  const term = searchTerm.toLowerCase()
  
  return activities.filter(activity => {
    const title = activity.metadata?.test_name || activity.activity_type || ''
    const subtitle = activity.metadata?.question_chapter || ''
    const type = activity.activity_type || ''
    
    return (
      title.toLowerCase().includes(term) ||
      subtitle.toLowerCase().includes(term) ||
      type.toLowerCase().includes(term)
    )
  })
}

