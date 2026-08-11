/**
 * Activity Utilities
 * Icon mappings, colors, and formatting helpers for Activity Timeline
 */

import type { ActivityType } from '@/lib/types/analytics'
import type { ComponentType } from 'react'
import { parseISO, isValid, format, isToday, isYesterday } from 'date-fns'

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

// Format date for headers (using date-fns for robust parsing)
export function formatDateHeader(dateString: string): string {
  try {
    // Handle fallback keys
    if (dateString === 'Date Unavailable' || dateString === 'Invalid Date Record' || dateString === 'Error Grouping') {
      return dateString
    }
    
    // Parse using date-fns for robust ISO string handling
    const parsedDate = parseISO(dateString)
    
    if (!isValid(parsedDate)) {
      console.warn('⚠️ formatDateHeader: Invalid date string:', dateString)
      return 'Invalid Date'
    }
    
    // Check if it's today or yesterday
    if (isToday(parsedDate)) {
      return 'Today'
    }
    
    if (isYesterday(parsedDate)) {
      return 'Yesterday'
    }
    
    // Format for other dates
    const today = new Date()
    return format(parsedDate, parsedDate.getFullYear() !== today.getFullYear() 
      ? 'EEEE, MMMM d, yyyy' 
      : 'EEEE, MMMM d'
    )
  } catch (error) {
    console.error('❌ formatDateHeader: Error formatting date:', dateString, error)
    return 'Invalid Date'
  }
}

// Calculate total time from activities
export function calculateTotalTime(activities: any[]): number {
  return activities.reduce((total, activity) => {
    // Check for total_time_taken_seconds in metadata (used by both practice and mock tests)
    if (activity.metadata?.total_time_taken_seconds) {
      return total + (activity.metadata.total_time_taken_seconds || 0)
    }
    // Fallback to total_time_taken if total_time_taken_seconds is not available
    if (activity.metadata?.total_time_taken) {
      return total + (activity.metadata.total_time_taken || 0)
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
  
  // Get unique dates with activity (normalize to midnight)
  const uniqueDates = new Set<string>()
  
  for (const activity of activities) {
    try {
      const activityDate = new Date(activity.created_at)
      if (!isNaN(activityDate.getTime())) {
        activityDate.setHours(0, 0, 0, 0)
        uniqueDates.add(activityDate.toISOString())
      }
    } catch (error) {
      console.warn('⚠️ calculateStreak: Invalid date for activity:', activity.id, error)
    }
  }
  
  if (uniqueDates.size === 0) return 0
  
  // Sort dates in descending order (most recent first)
  const sortedDates = Array.from(uniqueDates)
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => b.getTime() - a.getTime())
  
  // Calculate streak starting from today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let streak = 0
  let expectedDate = today
  
  for (const activityDate of sortedDates) {
    const diffDays = Math.floor((expectedDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // If activity is on the expected date (today, yesterday, etc.), increment streak
    if (diffDays === 0) {
      streak++
      expectedDate = new Date(expectedDate)
      expectedDate.setDate(expectedDate.getDate() - 1) // Move to previous day
    } else if (diffDays > 0) {
      // Gap found - streak is broken
      break
    }
    // If diffDays < 0, activity is in the future (shouldn't happen, but skip it)
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

