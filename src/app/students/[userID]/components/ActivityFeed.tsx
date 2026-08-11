'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { getStudentActivityFeed, getMockTestLeaderboardData } from '@/lib/actions/studentAnalyticsActions'
import type { ActivityLogEntry, ActivityFeedResponse, ActivityType } from '@/lib/types/analytics'
import { DetailedSessionModal } from './DetailedSessionModal'
import ViolationDetailsModal from '@/components/ViolationDetailsModal'
import { ActivityFeedSkeleton } from './ActivityFeedSkeleton'
import { ActivityEmptyState } from './ActivityEmptyState'
import { ActivityFilters } from './ActivityFilters'
import { ActivityExport } from './ActivityExport'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatTimestamp } from '@/lib/utils/activity-utils'
import { formatSecondsToHumanReadable } from '@/lib/utils/formatTime'
import { parseISO, isValid, format, startOfDay, isToday, isYesterday, differenceInCalendarDays } from 'date-fns'

interface EnrichedTestHistoryEntry {
  resultId: number
  isProctored: boolean
  violationCount: number
  testName?: string
}

interface LeaderboardData {
  rank: number | null
  percentile: number | null
  totalParticipants: number
}

// Ground Truth: Store the full Date object from the first activity in each group
interface GroupedActivity {
  date: Date // This is the "Ground Truth" - a full Date object with correct timezone context
  activities: ActivityLogEntry[]
}

export interface ActivityFeed_V2_Props {
  userId: string
  initialData: ActivityFeedResponse
  enrichedHistory?: EnrichedTestHistoryEntry[] // Optional enriched history for mock tests
}

export function ActivityFeed_V2(props: ActivityFeed_V2_Props) {
  const { userId, initialData, enrichedHistory } = props
  const [activities, setActivities] = useState<ActivityLogEntry[]>(initialData.entries)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialData.current_page < initialData.total_pages)
  const [loading, setLoading] = useState(false)
  const [selectedResultId, setSelectedResultId] = useState<number | null>(null)
  const [selectedViolationResultId, setSelectedViolationResultId] = useState<number | null>(null)
  const [selectedTestName, setSelectedTestName] = useState<string>('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | ActivityType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [leaderboardData, setLeaderboardData] = useState<Map<number, LeaderboardData>>(new Map())

  // Create lookup map for enriched history data (mock tests)
  // Maps resultId -> { isProctored, violationCount, testName }
  // SINGLE SOURCE OF TRUTH: Derived exclusively from server-provided enrichedHistory prop
  const enrichedHistoryMap = useMemo(() => {
    // Ensure the prop exists before creating the map
    if (!enrichedHistory) {
      return new Map()
    }
    
    const map = new Map<number, { isProctored: boolean; violationCount: number; testName: string }>()
    enrichedHistory.forEach(entry => {
      // Check for a valid resultId to use as the key
      if (entry.resultId) {
        map.set(entry.resultId, {
          isProctored: entry.isProctored,
          violationCount: entry.violationCount,
          testName: entry.testName || 'Mock Test'
        })
      }
    })
    return map
  }, [enrichedHistory]) // This dependency array is key. It only runs when the prop changes.

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    const nextPage = page + 1
    
    const data = await getStudentActivityFeed(userId, {}, { page: nextPage, limit: 20 })
    
    setActivities(prev => [...prev, ...data.entries])
    setPage(nextPage)
    setHasMore(data.current_page < data.total_pages)
    setLoading(false)
  }, [loading, hasMore, page, userId])

  // Fetch leaderboard data for mock tests
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      const mockTestActivities = activities.filter(a => a.activity_type === 'MOCK_TEST_COMPLETED')
      
      for (const activity of mockTestActivities) {
        const resultId = activity.related_entity_id
        if (resultId) {
          // Check if we already have this data
          if (leaderboardData.has(Number(resultId))) {
            continue
          }
          
          // Fetch the data
          try {
            const data = await getMockTestLeaderboardData(Number(resultId), userId)
            if (data) {
              setLeaderboardData(prev => {
                const newMap = new Map(prev)
                newMap.set(Number(resultId), data)
                return newMap
              })
            }
          } catch (error) {
            console.error('Error fetching leaderboard data:', error)
          }
        }
      }
    }
    
    fetchLeaderboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities, userId])

  // Format activity display
  const formatActivity = (activity: ActivityLogEntry) => {
    // Defensive date parsing - handle invalid dates gracefully
    let timestamp: Date
    let timeStr: string
    try {
      timestamp = new Date(activity.created_at)
      if (isNaN(timestamp.getTime())) {
        console.warn('⚠️ ActivityFeed: Invalid date for activity:', activity.id, activity.created_at)
        timestamp = new Date() // Fallback to current date
        timeStr = 'Date not available'
      } else {
        timeStr = formatTimestamp(activity.created_at)
      }
    } catch (error) {
      console.error('❌ ActivityFeed: Error parsing date:', error, activity)
      timestamp = new Date()
      timeStr = 'Date not available'
    }
    
    switch (activity.activity_type) {
      case 'PRACTICE_SESSION_COMPLETED':
        const meta = activity.metadata as any
        const practiceResultId = activity.related_entity_id
        
        // Handle orphan records: if related_entity_id is null, the test_result was deleted
        if (!practiceResultId) {
          // This is an orphan record - the test_result was deleted
          // Format as a "Deleted Test" card with limited information from metadata
          const fullDate = (() => {
            try {
              const date = new Date(activity.created_at)
              if (isNaN(date.getTime())) {
                return 'Date not available'
              }
              return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            } catch {
              return 'Date not available'
            }
          })()
          
          const totalQuestions = (meta.total_correct || 0) + (meta.total_incorrect || 0) + (meta.total_skipped || 0)
          const attempted = totalQuestions - (meta.total_skipped || 0)
          
          return {
            type: 'Practice Session (Deleted)',
            icon: 'mdi:file-document-outline',
            iconColor: 'text-gray-400',
            iconBg: 'bg-gray-50',
            title: meta.test_name || 'Practice Session (Deleted)',
            subtitle: `${totalQuestions} questions`,
            timestamp: timeStr,
            stats: {
              correct: meta.total_correct || 0,
              incorrect: meta.total_incorrect || 0,
              skipped: meta.total_skipped || 0,
              total: totalQuestions,
              attempted: attempted,
              timeSeconds: meta.total_time_taken_seconds || 0,
              formattedDuration: formatSecondsToHumanReadable(meta.total_time_taken_seconds || 0),
              dateTime: fullDate,
              isDeleted: true // Flag to indicate this is a deleted test
            },
            action: null, // Disable "View Details" for deleted tests
            resultId: null
          }
        }
        
        const totalQuestions = (meta.total_correct || 0) + (meta.total_incorrect || 0) + (meta.total_skipped || 0)
        const attempted = totalQuestions - (meta.total_skipped || 0)
        const timeInSeconds = meta.total_time_taken_seconds || 0
        
        // Format date and time with defensive parsing
        let fullDate: string
        try {
          const date = new Date(activity.created_at)
          if (isNaN(date.getTime())) {
            fullDate = 'Date not available'
          } else {
            fullDate = date.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          }
        } catch (error) {
          console.error('❌ ActivityFeed: Error formatting practice session date:', error)
          fullDate = 'Date not available'
        }
        
        // Format duration using clear, human-readable format (e.g., "1m 30s" or "90s")
        const formattedDuration = formatSecondsToHumanReadable(timeInSeconds)
        
        return {
          type: 'Practice Session',
          icon: 'mdi:file-document-outline',
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-50',
          title: meta.test_name || 'Practice Session',
          subtitle: `${totalQuestions} questions`,
          timestamp: timeStr,
          stats: {
            correct: meta.total_correct || 0,
            incorrect: meta.total_incorrect || 0,
            skipped: meta.total_skipped || 0,
            total: totalQuestions,
            attempted: attempted,
            timeSeconds: timeInSeconds,
            formattedDuration: formattedDuration,
            dateTime: fullDate
          },
          action: 'View Details',
          resultId: practiceResultId
        }
      
      case 'MOCK_TEST_COMPLETED':
        const mockMeta = activity.metadata as any
        const mockResultId = activity.related_entity_id
        
        // Handle orphan records: if related_entity_id is null, the test_result was deleted
        if (!mockResultId) {
          // This is an orphan record - the test_result was deleted
          // Format as a "Deleted Test" card with limited information from metadata
          const testDate = (() => {
            try {
              const date = new Date(activity.created_at)
              if (isNaN(date.getTime())) {
                return 'Date not available'
              }
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            } catch {
              return 'Date not available'
            }
          })()
          
          return {
            type: 'Mock Test (Deleted)',
            icon: 'mdi:school-outline',
            iconColor: 'text-gray-400',
            iconBg: 'bg-gray-50',
            title: mockMeta.test_name || 'Mock Test (Deleted)',
            subtitle: 'Original test data has been deleted',
            timestamp: timeStr,
            stats: {
              correct: mockMeta.total_correct || 0,
              incorrect: mockMeta.total_incorrect || 0,
              skipped: mockMeta.total_skipped || 0,
              total: (mockMeta.total_correct || 0) + (mockMeta.total_incorrect || 0) + (mockMeta.total_skipped || 0),
              attempted: ((mockMeta.total_correct || 0) + (mockMeta.total_incorrect || 0)),
              timeSeconds: mockMeta.total_time_taken_seconds || 0,
              formattedDuration: formatSecondsToHumanReadable(mockMeta.total_time_taken_seconds || 0),
              scorePercentage: mockMeta.score_percentage || 0,
              finalScore: mockMeta.total_correct || 0,
              totalMarks: (mockMeta.total_correct || 0) + (mockMeta.total_incorrect || 0) + (mockMeta.total_skipped || 0),
              dateTime: testDate,
              percentile: null,
              rank: null,
              totalParticipants: null,
              isDeleted: true // Flag to indicate this is a deleted test
            },
            action: null, // Disable "View Details" for deleted tests
            resultId: null
          }
        }
        
        // Get enriched history data for this mock test (if available)
        const enrichedData = mockResultId ? enrichedHistoryMap.get(Number(mockResultId)) : null
        
        const totalMockQuestions = (mockMeta.total_correct || 0) + (mockMeta.total_incorrect || 0) + (mockMeta.total_skipped || 0)
        const attemptedMock = totalMockQuestions - (mockMeta.total_skipped || 0)
        const timeInSecondsMock = mockMeta.total_time_taken_seconds || 0
        
        // Format duration using clear, human-readable format (e.g., "1m 30s" or "90s")
        const formattedDurationMock = formatSecondsToHumanReadable(timeInSecondsMock)
        
        // Format date with defensive parsing
        let testDate: string
        try {
          const date = new Date(activity.created_at)
          if (isNaN(date.getTime())) {
            testDate = 'Date not available'
          } else {
            testDate = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          }
        } catch (error) {
          console.error('❌ ActivityFeed: Error formatting mock test date:', error)
          testDate = 'Date not available'
        }
        
        // Get leaderboard data if available
        const finalScore = mockMeta.total_correct || 0
        const totalMarks = totalMockQuestions // Assuming 1 mark per question
        const lbData = mockResultId ? leaderboardData.get(Number(mockResultId)) : null
        
        // enrichedData is already retrieved above from enrichedHistoryMap
        
        return {
          type: 'Mock Test',
          icon: 'mdi:school-outline',
          iconColor: 'text-purple-600',
          iconBg: 'bg-purple-50',
          title: mockMeta.test_name || 'Mock Test',
          subtitle: `Final Score: ${finalScore} / ${totalMarks}`,
          timestamp: timeStr,
          stats: {
            correct: mockMeta.total_correct || 0,
            incorrect: mockMeta.total_incorrect || 0,
            skipped: mockMeta.total_skipped || 0,
            total: totalMockQuestions,
            attempted: attemptedMock,
            timeSeconds: timeInSecondsMock,
            formattedDuration: formattedDurationMock,
            scorePercentage: mockMeta.score_percentage || 0,
            finalScore: finalScore,
            totalMarks: totalMarks,
            dateTime: testDate,
            percentile: lbData?.percentile ?? null,
            rank: lbData?.rank ?? null,
            totalParticipants: lbData?.totalParticipants ?? null,
            isProctored: enrichedData?.isProctored ?? false,
            violationCount: enrichedData?.violationCount ?? 0
          },
          action: 'View Details',
          resultId: mockResultId
        }
      
      case 'QUESTION_BOOKMARKED':
        const bookmarkMeta = activity.metadata as any
        return {
          type: 'Bookmark',
          icon: 'mdi:bookmark-outline',
          iconColor: 'text-orange-600',
          iconBg: 'bg-orange-50',
          title: 'Bookmarked Question',
          subtitle: bookmarkMeta.question_chapter || 'Unknown Chapter',
          timestamp: timeStr,
          stats: null,
          action: null,
          resultId: null
        }
      
      case 'QUESTION_UNBOOKMARKED':
        const unbookmarkMeta = activity.metadata as any
        return {
          type: 'Unbookmark',
          icon: 'mdi:book-open-outline',
          iconColor: 'text-gray-500',
          iconBg: 'bg-gray-50',
          title: 'Unbookmarked Question',
          subtitle: unbookmarkMeta.question_chapter || 'Unknown Chapter',
          timestamp: timeStr,
          stats: null,
          action: null,
          resultId: null
        }
      
      case 'REVIEW_SESSION_COMPLETED':
        const reviewMeta = activity.metadata as any
        return {
          type: 'Review',
          icon: 'mdi:book-refresh-outline',
          iconColor: 'text-green-600',
          iconBg: 'bg-green-50',
          title: 'Completed SRS Review',
          subtitle: `Rating: ${reviewMeta.performance_rating}/4`,
          timestamp: timeStr,
          stats: null,
          action: null,
          resultId: null
        }
      
      default:
        return {
          type: 'Activity',
          icon: 'mdi:information-outline',
          iconColor: 'text-gray-500',
          iconBg: 'bg-gray-50',
          title: activity.activity_type,
          subtitle: '',
          timestamp: timeStr,
          stats: null,
          action: null,
          resultId: null
        }
    }
  }

  // Format activity helper for filtering
  const formatActivityForFilter = (activity: ActivityLogEntry) => {
    const timestamp = new Date(activity.created_at)
    const timeStr = formatTimestamp(activity.created_at)
    
    switch (activity.activity_type) {
      case 'PRACTICE_SESSION_COMPLETED':
      case 'MOCK_TEST_COMPLETED':
        const meta = activity.metadata as any
        return {
          title: meta.test_name || activity.activity_type === 'MOCK_TEST_COMPLETED' ? 'Mock Test' : 'Practice Session',
          type: activity.activity_type === 'MOCK_TEST_COMPLETED' ? 'Mock Test' : 'Practice',
          subtitle: `${meta.score_percentage || 0}% accuracy`
        }
      case 'QUESTION_BOOKMARKED':
      case 'QUESTION_UNBOOKMARKED':
        const bookmarkMeta = activity.metadata as any
        return {
          title: activity.activity_type === 'QUESTION_BOOKMARKED' ? 'Bookmarked Question' : 'Unbookmarked Question',
          type: activity.activity_type === 'QUESTION_BOOKMARKED' ? 'Bookmark' : 'Unbookmark',
          subtitle: bookmarkMeta.question_chapter || 'Unknown Chapter'
        }
      case 'REVIEW_SESSION_COMPLETED':
        const reviewMeta = activity.metadata as any
        return {
          title: 'Completed SRS Review',
          type: 'Review',
          subtitle: `Rating: ${reviewMeta.performance_rating}/4`
        }
      default:
        return {
          title: activity.activity_type,
          type: 'Activity',
          subtitle: ''
        }
    }
  }

  // Filter activities based on selected type
  const filteredActivities = useMemo(() => {
    let filtered = activities

    // Apply type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(activity => activity.activity_type === selectedFilter)
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(activity => {
        const formatted = formatActivityForFilter(activity)
        return (
          formatted.title.toLowerCase().includes(term) ||
          formatted.type.toLowerCase().includes(term) ||
          (formatted.subtitle && formatted.subtitle.toLowerCase().includes(term))
        )
      })
    }

    return filtered
  }, [activities, selectedFilter, searchTerm])

  // Group activities by date - Ground Truth approach: store the full Date object
  const groupedActivities = useMemo(() => {
    return filteredActivities.reduce((acc, activity) => {
      if (!activity.created_at) return acc
      
      // Parse the full ISO string, which correctly creates a local Date object
      const parsedDate = parseISO(activity.created_at)
      if (!isValid(parsedDate)) return acc

      // The key is only for grouping, not for display logic later
      const dateKey = format(startOfDay(parsedDate), 'yyyy-MM-dd')
      
      if (!acc[dateKey]) {
        // When a new group is created, we store the first valid Date object.
        // This object retains the correct local time context (Ground Truth).
        acc[dateKey] = {
          date: startOfDay(parsedDate), // Store the normalized date as Ground Truth
          activities: []
        }
      }

      acc[dateKey].activities.push(activity)
      return acc
    }, {} as Record<string, GroupedActivity>)
  }, [filteredActivities])

  const handleActivityClick = useCallback((formatted: ReturnType<typeof formatActivity>) => {
    console.log('🔍 ActivityFeed: Activity clicked:', {
      title: formatted.title,
      type: formatted.type,
      resultId: formatted.resultId,
      hasResultId: !!formatted.resultId
    })
    
    if (formatted.resultId) {
      console.log('✅ ActivityFeed: Opening modal for resultId:', formatted.resultId)
      setSelectedResultId(formatted.resultId)
    } else {
      console.warn('⚠️ ActivityFeed: No resultId available for this activity')
    }
  }, [])

  // Error boundary - if we somehow get here with invalid data
  useEffect(() => {
    if (!userId) {
      console.error('❌ ActivityFeed: userId is undefined or null')
    }
  }, [userId])

  // Show empty state if no activities
  if (activities.length === 0) {
    return <ActivityEmptyState />
  }
  
  // Safety check for activities
  const safeActivities = activities.filter(activity => {
    if (!activity || !activity.id) {
      console.warn('⚠️ ActivityFeed: Found invalid activity:', activity)
      return false
    }
    return true
  })

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
      role="feed"
      aria-label="Activity timeline"
    >
      {/* Filters and Actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
      >
        <div className="flex-1">
          <ActivityFilters 
            onFilterChange={(filter) => setSelectedFilter(filter)}
            onSearchChange={(term) => setSearchTerm(term)}
          />
        </div>
        <div className="flex gap-2">
          <ActivityExport activities={activities} />
        </div>
      </motion.div>

      {/* Activity List with Timeline */}
      <AnimatePresence mode="wait">
        {Object.keys(groupedActivities).length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center"
          >
            <p className="text-gray-500">No activities match your filters.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {Object.entries(groupedActivities).map(([dateKey, groupData], dateIndex) => (
        <motion.div 
          key={dateKey} 
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: dateIndex * 0.1 }}
        >
          {/* Date Header */}
          <div className="sticky top-0 z-10 mb-3 py-2 bg-white">
            <div className="flex items-center gap-2 px-3">
              <div className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center">
                <Icon icon="mdi:calendar-blank-outline" className="h-4 w-4 text-gray-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-700">
                  {(() => {
                    // Use the Ground Truth Date object directly - no parsing needed!
                    const headerDate = groupData.date
                    
                    // Check if it's today or yesterday
                    if (isToday(headerDate)) {
                      return 'Today'
                    }
                    
                    if (isYesterday(headerDate)) {
                      return 'Yesterday'
                    }
                    
                    // Calculate days difference for relative dates (2-5 days ago)
                    const now = new Date()
                    const differenceInDays = differenceInCalendarDays(now, headerDate)
                    
                    if (differenceInDays > 1 && differenceInDays <= 5) {
                      return `${differenceInDays} days ago`
                    }
                    
                    // Format for dates older than 5 days
                    return format(headerDate, headerDate.getFullYear() !== now.getFullYear() 
                      ? 'MMMM d, yyyy' 
                      : 'MMMM d'
                    )
                  })()}
                </h3>
              </div>
              
              <span className="text-xs text-gray-400">
                {groupData.activities.length}
              </span>
            </div>
          </div>
          
          {/* Timeline Container */}
          <div className="relative ml-6 border-l border-gray-100 pl-2">
            {groupData.activities.map((activity, index) => {
              const formatted = formatActivity(activity)
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                  className="relative mb-2.5 last:mb-0"
                  role="article"
                  aria-label={`Activity: ${formatted.title} on ${formatted.timestamp}`}
                >
                  {/* Timeline Dot */}
                  <div 
                    className={cn(
                      "absolute -left-[26px] top-1 w-2 h-2 rounded-full z-10",
                      formatted.iconBg
                    )}
                  >
                    <div className={cn("absolute top-0.5 left-0.5 w-1 h-1 rounded-full", formatted.iconColor)} />
                  </div>
                  
                  {/* Activity Card */}
                  <div
                    id={`activity-${activity.id}`}
                    className={cn(
                      "bg-white rounded-lg p-3.5 shadow-sm",
                      "transition-shadow duration-150",
                      formatted.resultId && !(formatted.stats as any)?.isDeleted
                        ? "hover:shadow-md cursor-pointer hover:bg-gray-50/50"
                        : "cursor-default"
                    )}
                    onClick={() => {
                      if (formatted.resultId && !(formatted.stats as any)?.isDeleted) {
                        handleActivityClick(formatted)
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div 
                        className={cn(
                          "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
                          formatted.iconBg
                        )}
                      >
                        <Icon icon={formatted.icon} className={cn("h-5 w-5", formatted.iconColor)} />
                      </div>
                      
                      {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className={cn(
                                    "text-sm font-semibold leading-snug",
                                    (formatted.stats as any)?.isDeleted 
                                      ? "text-gray-500 line-through" 
                                      : "text-gray-900"
                                  )}>
                                    {formatted.title}
                                  </h4>
                                  {(formatted.stats as any)?.isDeleted && (
                                    <Badge variant="outline" className="text-xs border-gray-300 text-gray-500">
                                      Deleted
                                    </Badge>
                                  )}
                                  {/* Show violation flag only if test is proctored */}
                                  {formatted.type === 'Mock Test' && (formatted.stats as any)?.isProctored && formatted.resultId && (
                                    <div className="flex items-center gap-1.5">
                                      {(formatted.stats as any)?.violationCount > 0 ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedViolationResultId(formatted.resultId)
                                            setSelectedTestName(formatted.title)
                                          }}
                                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold transition-colors"
                                          title={`${(formatted.stats as any)?.violationCount} violation${(formatted.stats as any)?.violationCount !== 1 ? 's' : ''} detected - Click to view details`}
                                        >
                                          <Icon icon="mdi:flag" className="h-4 w-4" />
                                          <span>{(formatted.stats as any)?.violationCount}</span>
                                        </button>
                                      ) : (
                                        <span
                                          title="Proctored: No violations recorded"
                                          className="text-gray-400"
                                        >
                                          <Icon icon="mdi:flag-outline" className="h-4 w-4" />
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {formatted.subtitle && (
                                  <p className={cn(
                                    "text-xs mt-0.5",
                                    (formatted.stats as any)?.isDeleted 
                                      ? "text-gray-400" 
                                      : "text-gray-500"
                                  )}>
                                    {formatted.subtitle}
                                  </p>
                                )}
                              </div>
                              {formatted.action && formatted.resultId && !(formatted.stats as any)?.isDeleted && (
                                <button
                                  className="flex items-center text-xs text-blue-600 hover:text-blue-700 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleActivityClick(formatted)
                                  }}
                                >
                                  View
                                  <Icon icon="mdi:chevron-right" className="h-3 w-3 ml-0.5" />
                                </button>
                              )}
                            </div>
                        
                        {/* Information-Dense Cards */}
                        {formatted.stats && (
                          <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                            {formatted.type === 'Practice Session' ? (
                              /* Practice Session Layout */
                              <div className="space-y-2">
                                {/* Attempt Breakdown */}
                                <div className="flex items-center gap-3 flex-wrap text-sm">
                                  <div className="flex items-center gap-1.5">
                                    <Icon icon="mdi:check-circle" className="h-5 w-5 text-green-600" />
                                    <span className="font-semibold text-green-600">{formatted.stats.correct}</span>
                                    <span className="text-gray-400">correct</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Icon icon="mdi:close-circle" className="h-5 w-5 text-red-600" />
                                    <span className="font-semibold text-red-600">{formatted.stats.incorrect}</span>
                                    <span className="text-gray-400">incorrect</span>
                                  </div>
                                  {formatted.stats.skipped > 0 && (
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                      <Icon icon="mdi:skip-forward-circle" className="h-5 w-5" />
                                      <span className="font-medium">{formatted.stats.skipped}</span>
                                      <span className="text-gray-400">skipped</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Duration and Total Questions */}
                                <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                                  {formatted.stats.formattedDuration && (
                                    <div className="flex items-center gap-1">
                                      <Icon icon="mdi:timer-outline" className="h-3.5 w-3.5" />
                                      <span>Duration: {formatted.stats.formattedDuration}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Icon icon="mdi:file-question" className="h-3.5 w-3.5" />
                                    <span>{formatted.stats.total} questions total</span>
                                  </div>
                                  {formatted.stats.dateTime && (
                                    <div className="flex items-center gap-1 ml-auto text-gray-400">
                                      <Icon icon="mdi:calendar-outline" className="h-3 w-3" />
                                      <span>{formatted.stats.dateTime}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              /* Mock Test Layout - Information Dense */
                              <div className="space-y-2">
                                {/* Top Row: Performance Metrics */}
                                <div className="flex items-center gap-3 flex-wrap text-sm">
                                  <div className="flex items-center gap-1.5 text-gray-700">
                                    <Icon icon="mdi:trophy-outline" className="h-4 w-4 text-purple-600" />
                                    <span className="font-bold text-purple-600">{formatted.stats.scorePercentage}%</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-gray-700">
                                    <span className="font-semibold">{formatted.stats.finalScore}/{formatted.stats.totalMarks} marks</span>
                                  </div>
                                  {(() => {
                                    const stats = formatted.stats as any
                                    return stats.rank && stats.rank > 0
                                  })() && (
                                    <div className="flex items-center gap-1.5 text-orange-600 font-semibold">
                                      <Icon icon="mdi:podium" className="h-4 w-4" />
                                      <span>#{formatted.stats.rank as any}</span>
                                      {(formatted.stats as any).totalParticipants && (
                                        <span className="text-gray-500 text-xs">/ {(formatted.stats as any).totalParticipants}</span>
                                      )}
                                    </div>
                                  )}
                                  {(() => {
                                    const stats = formatted.stats as any
                                    return stats.percentile !== null && stats.percentile !== undefined
                                  })() && (
                                    <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
                                      <Icon icon="mdi:percent-circle" className="h-4 w-4" />
                                      <span>{(formatted.stats as any).percentile}%ile</span>
                            </div>
                                  )}
                              </div>
                                
                                {/* Attempt Breakdown and Timing */}
                                <div className="flex items-center gap-3 flex-wrap text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Icon icon="mdi:check-circle" className="h-4 w-4 text-green-600" />
                                    <span className="font-semibold text-green-600">{formatted.stats.correct}</span>
                            </div>
                                  <div className="flex items-center gap-1">
                                    <Icon icon="mdi:close-circle" className="h-4 w-4 text-red-600" />
                                    <span className="font-semibold text-red-600">{formatted.stats.incorrect}</span>
                                  </div>
                                  {formatted.stats.skipped > 0 && (
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <Icon icon="mdi:skip-forward-circle" className="h-4 w-4" />
                                      <span className="font-medium">{formatted.stats.skipped}</span>
                                    </div>
                                  )}
                                  {formatted.stats.formattedDuration && (
                                    <div className="flex items-center gap-1">
                                      <Icon icon="mdi:timer-outline" className="h-3.5 w-3.5" />
                                      <span>{formatted.stats.formattedDuration}</span>
                                    </div>
                                  )}
                                  {formatted.stats.dateTime && (
                                    <div className="flex items-center gap-1 text-gray-500">
                                      <Icon icon="mdi:calendar-outline" className="h-3 w-3" />
                                      <span>{formatted.stats.dateTime}</span>
                                    </div>
                                  )}
                                  {/* Violation Flag for Mock Tests - Only show if proctored */}
                                  {formatted.type === 'Mock Test' && (formatted.stats as any)?.isProctored && formatted.resultId && (
                                    <div className="flex items-center gap-1.5 ml-auto">
                                      {(formatted.stats as any)?.violationCount > 0 ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedViolationResultId(Number(formatted.resultId))
                                          }}
                                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold transition-colors"
                                          title={`${(formatted.stats as any)?.violationCount} violation${(formatted.stats as any)?.violationCount !== 1 ? 's' : ''} detected - Click to view details`}
                                        >
                                          <Icon icon="mdi:flag" className="h-4 w-4" />
                                          <span>{(formatted.stats as any)?.violationCount}</span>
                                        </button>
                                      ) : (
                                        <span
                                          title="Proctored: No violations recorded"
                                          className="text-gray-400"
                                        >
                                          <Icon icon="mdi:flag-outline" className="h-4 w-4" />
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!formatted.stats && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
                            <Icon icon="mdi:clock-outline" className="h-3 w-3" />
                            <span>{formatted.timestamp}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      ))}

      {/* Load More Button */}
      {hasMore && (
        <motion.div 
          className="flex justify-center pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            size="sm"
            className="min-w-[120px] gap-2"
          >
            {loading ? (
              <>
                <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Load More
                <Icon icon="mdi:chevron-down" className="h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Detailed Session Modal */}
      <AnimatePresence>
        {selectedResultId && (
          <DetailedSessionModal
            resultId={selectedResultId}
            isOpen={!!selectedResultId}
            onClose={() => setSelectedResultId(null)}
          />
        )}
      </AnimatePresence>

      {/* Violation Details Modal */}
      {selectedViolationResultId && (
        <ViolationDetailsModal
          testResultId={selectedViolationResultId}
          isOpen={!!selectedViolationResultId}
          onClose={() => {
            setSelectedViolationResultId(null)
            setSelectedTestName('')
          }}
          testName={selectedTestName}
        />
      )}
    </motion.div>
  )
}

// Export as ActivityFeed for backward compatibility
export { ActivityFeed_V2 as ActivityFeed }
export type { ActivityFeed_V2_Props as ActivityFeedProps }
