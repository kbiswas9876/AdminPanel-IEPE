'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getStudentActivityFeed } from '@/lib/actions/studentAnalyticsActions'
import type { ActivityLogEntry, ActivityFeedResponse, ActivityType } from '@/lib/types/analytics'
import { DetailedSessionModal } from './DetailedSessionModal'
import { ActivityFeedSkeleton } from './ActivityFeedSkeleton'
import { ActivityEmptyState } from './ActivityEmptyState'
import { ActivityFilters } from './ActivityFilters'
import { ActivityExport } from './ActivityExport'
import {
  FileText,
  GraduationCap,
  Bookmark,
  BookOpen,
  CheckCircle2,
  XCircle,
  SkipForward,
  Clock,
  Calendar,
  Eye,
  Loader2,
  Info,
  ChevronRight
} from 'lucide-react'
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
        
        return {
          type: 'Practice',
          Icon: FileText,
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          borderColor: 'border-blue-200',
          bgColor: 'bg-blue-50/30',
          title: meta.test_name || 'Practice Session',
          subtitle: `${meta.score_percentage || 0}% accuracy`,
          timestamp: timeStr,
          stats: {
            correct: meta.total_correct || 0,
            incorrect: meta.total_incorrect || 0,
            skipped: meta.total_skipped || 0
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
        
        return {
          type: 'Mock Test',
          Icon: GraduationCap,
          iconColor: 'text-purple-600',
          iconBg: 'bg-purple-100',
          borderColor: 'border-purple-200',
          bgColor: 'bg-purple-50/30',
          title: mockMeta.test_name || 'Mock Test',
          subtitle: `${mockMeta.score_percentage || 0}% accuracy`,
          timestamp: timeStr,
          stats: {
            correct: mockMeta.total_correct || 0,
            incorrect: mockMeta.total_incorrect || 0,
            skipped: mockMeta.total_skipped || 0
          },
          action: 'View Details',
          resultId: mockResultId
        }
      
      case 'QUESTION_BOOKMARKED':
        const bookmarkMeta = activity.metadata as any
        return {
          type: 'Bookmark',
          Icon: Bookmark,
          iconColor: 'text-orange-600',
          iconBg: 'bg-orange-100',
          borderColor: 'border-orange-200',
          bgColor: 'bg-orange-50/30',
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
          Icon: BookOpen,
          iconColor: 'text-gray-600',
          iconBg: 'bg-gray-100',
          borderColor: 'border-gray-200',
          bgColor: 'bg-gray-50/30',
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
          Icon: BookOpen,
          iconColor: 'text-green-600',
          iconBg: 'bg-green-100',
          borderColor: 'border-green-200',
          bgColor: 'bg-green-50/30',
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
          Icon: Info,
          iconColor: 'text-gray-600',
          iconBg: 'bg-gray-100',
          borderColor: 'border-gray-200',
          bgColor: 'bg-gray-50/30',
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
      className="space-y-6 md:space-y-8"
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
          <div className="sticky top-0 z-10 mb-4 md:mb-6 py-3 md:py-4 bg-gradient-to-b from-gray-50 to-transparent rounded-lg md:rounded-xl">
            <div className="flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2">
              <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg ring-2 md:ring-4 ring-blue-50">
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                  {date === new Date().toLocaleDateString() ? 'Today' : formatDateHeader(date)}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                  {groupedActivities[date].length} {groupedActivities[date].length === 1 ? 'activity' : 'activities'}
                </p>
              </div>
              
              <Badge variant="secondary" className="ml-auto px-2 py-1 md:px-3 text-xs font-medium hidden sm:flex">
                {groupedActivities[date].length}
              </Badge>
            </div>
          </div>
          
          {/* Timeline Container */}
          <div className="relative ml-6 md:ml-8 border-l-2 border-gray-200 pl-2 md:pl-3">
            {groupedActivities[date].map((activity, index) => {
              const formatted = formatActivity(activity)
              const Icon = formatted.Icon
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.2, 
                    ease: [0.4, 0, 0.2, 1],
                    delay: index * 0.05 
                  }}
                  className="relative mb-6 md:mb-8 last:mb-0 group"
                  role="article"
                  aria-label={`Activity: ${formatted.title} on ${formatted.timestamp}`}
                  aria-describedby={`activity-${activity.id}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleActivityClick(formatted)
                    }
                  }}
                >
                  {/* Timeline Dot */}
                  <motion.div 
                    className={cn(
                      "absolute -left-[33px] md:-left-[43px] top-0 w-4 h-4 md:w-5 md:h-5 rounded-full ring-2 md:ring-4 ring-white shadow-md md:shadow-lg transition-all z-10",
                      formatted.iconBg,
                      "group-hover:scale-110 group-hover:shadow-xl"
                    )}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <Icon className={cn("h-2.5 w-2.5 md:h-3 md:w-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", formatted.iconColor)} />
                  </motion.div>
                  
                  {/* Connecting Line */}
                  {index < groupedActivities[date].length - 1 && (
                    <div className="absolute -left-[28px] md:-left-[36px] top-6 md:top-8 w-0.5 h-12 md:h-16 bg-gradient-to-b from-gray-200 to-gray-100" />
                  )}
                  
                  {/* Activity Card */}
                  <motion.div
                    id={`activity-${activity.id}`}
                    className={cn(
                      "bg-white rounded-xl md:rounded-2xl border shadow-sm p-4 md:p-5",
                      "hover:shadow-lg transition-all duration-300 cursor-pointer group",
                      "hover:-translate-y-1 border-l-4",
                      formatted.borderColor,
                      "focus-within:ring-2 focus-within:ring-blue-500/20"
                    )}
                    onClick={() => handleActivityClick(formatted)}
                    whileHover={{ 
                      scale: 1.01,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                    }}
                    whileTap={{ scale: 0.99 }}
                    whileFocus={{ 
                      scale: 1.02,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      outline: "2px solid #3b82f6",
                      outlineOffset: "2px"
                    }}
                    layout
                    transition={{
                      layout: { duration: 0.3 },
                      default: { duration: 0.2 }
                    }}
                  >
                    <div className="flex items-start gap-3 md:gap-5">
                      {/* Icon Circle */}
                      <motion.div 
                        className={cn(
                          "flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md",
                          formatted.iconBg
                        )}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className={cn("h-6 w-6 md:h-7 md:w-7", formatted.iconColor)} />
                      </motion.div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 md:gap-4">
                          <div className="flex-1 space-y-1 md:space-y-2 min-w-0">
                            <h4 className="text-base md:text-lg font-bold text-gray-900 leading-tight truncate">
                              {formatted.title}
                            </h4>
                            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                              <Badge 
                                variant="secondary" 
                                className="text-xs font-medium px-2 md:px-2.5 py-0.5"
                              >
                                {formatted.type}
                              </Badge>
                              <span className="text-xs text-gray-500 flex items-center gap-1 md:gap-1.5">
                                <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                {formatted.timestamp}
                              </span>
                            </div>
                          </div>
                          {formatted.action && formatted.resultId && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-50 hidden md:flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1.5" />
                              <span className="hidden lg:inline">View Details</span>
                              <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Subtitle */}
                        {formatted.subtitle && (
                          <p className="text-sm text-gray-600 font-medium">{formatted.subtitle}</p>
                        )}
                        
                        {/* Stats Bar */}
                        {formatted.stats && (
                          <div className="flex items-center gap-2 md:gap-4 px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-lg md:rounded-xl border border-gray-100 flex-wrap">
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <div className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-green-100">
                                <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600" />
                              </div>
                              <span className="text-xs md:text-sm font-semibold text-gray-900 whitespace-nowrap">
                                {formatted.stats.correct} correct
                              </span>
                            </div>
                            <Separator orientation="vertical" className="h-4 md:h-6" />
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <div className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-red-100">
                                <XCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-600" />
                              </div>
                              <span className="text-xs md:text-sm font-semibold text-gray-900 whitespace-nowrap">
                                {formatted.stats.incorrect} incorrect
                              </span>
                            </div>
                            {formatted.stats.skipped > 0 && (
                              <>
                                <Separator orientation="vertical" className="h-4 md:h-6" />
                                <div className="flex items-center gap-1.5 md:gap-2">
                                  <div className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-gray-100">
                                    <SkipForward className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500" />
                                  </div>
                                  <span className="text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">
                                    {formatted.stats.skipped} skipped
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Hover indicator with animation */}
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 rounded-b-2xl"
                      initial={false}
                      animate={{ 
                        opacity: 0,
                        scaleX: 0
                      }}
                      whileHover={{
                        opacity: 1,
                        scaleX: 1,
                        transition: { duration: 0.3 }
                      }}
                    />
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      ))}

      {/* Load More Button */}
      {hasMore && (
        <motion.div 
          className="flex justify-center pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            size="lg"
            className="min-w-[160px] gap-2 hover:gap-3 transition-all duration-300 hover:shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Load More
                <ChevronRight className="h-5 w-5" />
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

