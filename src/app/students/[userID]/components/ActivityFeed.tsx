'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { getStudentActivityFeed } from '@/lib/actions/studentAnalyticsActions'
import type { ActivityLogEntry, ActivityFeedResponse, ActivityType } from '@/lib/types/analytics'
import { DetailedSessionModal } from './DetailedSessionModal'
import { ActivityFeedSkeleton } from './ActivityFeedSkeleton'
import { ActivityEmptyState } from './ActivityEmptyState'
import { ActivityFilters } from './ActivityFilters'
import { ActivityExport } from './ActivityExport'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatTimestamp, formatDateHeader } from '@/lib/utils/activity-utils'

interface ActivityFeedProps {
  userId: string
  initialData: ActivityFeedResponse
}

export function ActivityFeed({ userId, initialData }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>(initialData.entries)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialData.current_page < initialData.total_pages)
  const [loading, setLoading] = useState(false)
  const [selectedResultId, setSelectedResultId] = useState<number | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<'all' | ActivityType>('all')
  const [searchTerm, setSearchTerm] = useState('')

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

  // Format activity display
  const formatActivity = (activity: ActivityLogEntry) => {
    const timestamp = new Date(activity.created_at)
    const timeStr = formatTimestamp(activity.created_at)
    
    switch (activity.activity_type) {
      case 'PRACTICE_SESSION_COMPLETED':
        const meta = activity.metadata as any
        const practiceResultId = activity.related_entity_id
        
        if (!practiceResultId) {
          console.warn('⚠️ ActivityFeed: PRACTICE_SESSION_COMPLETED missing related_entity_id', {
            activity_id: activity.id,
            metadata: meta
          })
        }
        
        const totalQuestions = (meta.total_correct || 0) + (meta.total_incorrect || 0) + (meta.total_skipped || 0)
        const attempted = totalQuestions - (meta.total_skipped || 0)
        const timeInSeconds = meta.total_time_taken_seconds || 0
        const timeInMinutes = timeInSeconds ? Math.floor(timeInSeconds / 60) : 0
        const timeInHours = timeInMinutes ? Math.floor(timeInMinutes / 60) : 0
        
        // Format date and time
        const fullDate = new Date(activity.created_at).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
        
        // Format duration properly
        let formattedDuration = ''
        if (timeInSeconds > 0) {
          const hours = Math.floor(timeInSeconds / 3600)
          const minutes = Math.floor((timeInSeconds % 3600) / 60)
          const seconds = timeInSeconds % 60
          
          if (hours > 0) {
            formattedDuration = `${hours}h ${minutes}m ${seconds}s`
          } else if (minutes > 0) {
            formattedDuration = `${minutes}m ${seconds}s`
          } else {
            formattedDuration = `${seconds}s`
          }
        }
        
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
        
        if (!mockResultId) {
          console.warn('⚠️ ActivityFeed: MOCK_TEST_COMPLETED missing related_entity_id', {
            activity_id: activity.id,
            metadata: mockMeta
          })
        }
        
        const totalMockQuestions = (mockMeta.total_correct || 0) + (mockMeta.total_incorrect || 0) + (mockMeta.total_skipped || 0)
        const attemptedMock = totalMockQuestions - (mockMeta.total_skipped || 0)
        const timeInSecondsMock = mockMeta.total_time_taken_seconds || 0
        
        // Format duration for mock test
        let formattedDurationMock = ''
        if (timeInSecondsMock > 0) {
          const hours = Math.floor(timeInSecondsMock / 3600)
          const minutes = Math.floor((timeInSecondsMock % 3600) / 60)
          const seconds = timeInSecondsMock % 60
          
          if (hours > 0) {
            formattedDurationMock = `${hours}h ${minutes}m`
          } else if (minutes > 0) {
            formattedDurationMock = `${minutes}m ${seconds}s`
          } else {
            formattedDurationMock = `${seconds}s`
          }
        }
        
        // Format date
        const testDate = new Date(activity.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
        
        // For mock tests, need to calculate percentile and rank
        // These would be fetched from the database or calculated
        // For now, setting to null to be populated later
        const finalScore = mockMeta.total_correct || 0
        const totalMarks = totalMockQuestions // Assuming 1 mark per question
        
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
            percentile: null, // To be fetched from database
            rank: null, // To be fetched from database
            totalParticipants: null // To be fetched from database
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

  // Group activities by date
  const groupedActivities = useMemo(() => 
    filteredActivities.reduce((acc, activity) => {
      try {
        const date = new Date(activity.created_at).toLocaleDateString()
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(activity)
      } catch (error) {
        console.error('❌ ActivityFeed: Error grouping activity:', activity.id, error)
      }
      return acc
    }, {} as Record<string, ActivityLogEntry[]>)
  , [filteredActivities])

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

      {Object.keys(groupedActivities).map((date, dateIndex) => (
        <motion.div 
          key={date} 
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
                  {date === new Date().toLocaleDateString() ? 'Today' : formatDateHeader(date)}
                </h3>
              </div>
              
              <span className="text-xs text-gray-400">
                {groupedActivities[date].length}
              </span>
            </div>
          </div>
          
          {/* Timeline Container */}
          <div className="relative ml-6 border-l border-gray-100 pl-2">
            {groupedActivities[date].map((activity, index) => {
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
                      "hover:shadow-md transition-shadow duration-150 cursor-pointer",
                      formatted.resultId && "hover:bg-gray-50/50"
                    )}
                    onClick={() => formatted.resultId && handleActivityClick(formatted)}
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
                            <h4 className="text-sm font-semibold text-gray-900 leading-snug">
                              {formatted.title}
                            </h4>
                            {formatted.subtitle && (
                              <p className="text-xs text-gray-500 mt-0.5">{formatted.subtitle}</p>
                            )}
                          </div>
                          {formatted.action && formatted.resultId && (
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
                                  <div className="flex items-center gap-1.5 text-gray-700">
                                    <Icon icon="mdi:check-circle" className="h-4 w-4 text-green-600" />
                                    <span className="font-semibold">{formatted.stats.correct}</span>
                                    <span className="text-gray-400">correct</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-gray-700">
                                    <Icon icon="mdi:close-circle" className="h-4 w-4 text-red-600" />
                                    <span className="font-semibold">{formatted.stats.incorrect}</span>
                                    <span className="text-gray-400">incorrect</span>
                                  </div>
                                  {formatted.stats.skipped > 0 && (
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                      <Icon icon="mdi:skip-forward" className="h-4 w-4" />
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
                                {/* Performance Metrics */}
                                <div className="flex items-center gap-3 flex-wrap text-sm">
                                  <div className="flex items-center gap-1.5 text-gray-700">
                                    <Icon icon="mdi:trophy-outline" className="h-4 w-4 text-purple-600" />
                                    <span className="font-bold text-purple-600">Score: {formatted.stats.finalScore}/{formatted.stats.totalMarks}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-gray-700">
                                    <Icon icon="mdi:chart-line" className="h-4 w-4 text-blue-600" />
                                    <span className="font-semibold">{formatted.stats.scorePercentage}%</span>
                                  </div>
                                  {formatted.stats.percentile !== null && (
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                      <Icon icon="mdi:percent-circle" className="h-4 w-4" />
                                      <span>{formatted.stats.percentile} percentile</span>
                                    </div>
                                  )}
                                  {formatted.stats.rank !== null && (
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                      <Icon icon="mdi:podium" className="h-4 w-4" />
                                      <span>Rank #{formatted.stats.rank}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Attempt Breakdown and Timing */}
                                <div className="flex items-center gap-3 flex-wrap text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Icon icon="mdi:check-circle" className="h-3.5 w-3.5 text-green-600" />
                                    <span>{formatted.stats.correct}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Icon icon="mdi:close-circle" className="h-3.5 w-3.5 text-red-600" />
                                    <span>{formatted.stats.incorrect}</span>
                                  </div>
                                  {formatted.stats.skipped > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Icon icon="mdi:skip-forward" className="h-3.5 w-3.5" />
                                      <span>{formatted.stats.skipped}</span>
                                    </div>
                                  )}
                                  {formatted.stats.formattedDuration && (
                                    <div className="flex items-center gap-1">
                                      <Icon icon="mdi:timer-outline" className="h-3.5 w-3.5" />
                                      <span>{formatted.stats.formattedDuration}</span>
                                    </div>
                                  )}
                                  {formatted.stats.dateTime && (
                                    <div className="flex items-center gap-1 ml-auto text-gray-500">
                                      <Icon icon="mdi:calendar-outline" className="h-3 w-3" />
                                      <span>{formatted.stats.dateTime}</span>
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
    </motion.div>
  )
}

