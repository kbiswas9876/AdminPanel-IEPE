'use client'

import { useState, useEffect } from 'react'
import { Clock, User, BookOpen, TestTube, Bookmark, MessageSquare, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow, format } from 'date-fns'

interface ActivityItem {
  id: string
  type: 'login' | 'test_attempt' | 'bookmark' | 'comment' | 'registration' | 'approval' | 'suspension'
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

interface ActivityTimelineProps {
  userId?: string
  limit?: number
  showFilters?: boolean
}

const ACTIVITY_ICONS = {
  login: User,
  test_attempt: TestTube,
  bookmark: Bookmark,
  comment: MessageSquare,
  registration: User,
  approval: User,
  suspension: AlertCircle
}

const ACTIVITY_COLORS = {
  login: 'bg-blue-100 text-blue-800',
  test_attempt: 'bg-green-100 text-green-800',
  bookmark: 'bg-yellow-100 text-yellow-800',
  comment: 'bg-purple-100 text-purple-800',
  registration: 'bg-gray-100 text-gray-800',
  approval: 'bg-green-100 text-green-800',
  suspension: 'bg-red-100 text-red-800'
}

export function ActivityTimeline({ 
  userId, 
  limit = 20, 
  showFilters = true 
}: ActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const params = new URLSearchParams({
          limit: limit.toString(),
          ...(userId && { userId }),
          ...(filter !== 'all' && { type: filter })
        })
        
        const response = await fetch(`/api/students/activity?${params}`)
        if (!response.ok) {
          throw new Error('Failed to fetch activity data')
        }
        
        const data = await response.json()
        setActivities(data.activities || [])
        setHasMore(data.hasMore || false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [userId, limit, filter])

  const loadMore = async () => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: activities.length.toString(),
        ...(userId && { userId }),
        ...(filter !== 'all' && { type: filter })
      })
      
      const response = await fetch(`/api/students/activity?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch more activities')
      }
      
      const data = await response.json()
      setActivities(prev => [...prev, ...(data.activities || [])])
      setHasMore(data.hasMore || false)
    } catch (err) {
      console.error('Error loading more activities:', err)
    }
  }

  const getActivityIcon = (type: string) => {
    const IconComponent = ACTIVITY_ICONS[type as keyof typeof ACTIVITY_ICONS] || Clock
    return IconComponent
  }

  const getActivityColor = (type: string) => {
    return ACTIVITY_COLORS[type as keyof typeof ACTIVITY_COLORS] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Activities</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
        {showFilters && (
          <div className="flex gap-2 mt-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'login' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('login')}
            >
              Logins
            </Button>
            <Button
              variant={filter === 'test_attempt' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('test_attempt')}
            >
              Tests
            </Button>
            <Button
              variant={filter === 'bookmark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('bookmark')}
            >
              Bookmarks
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Found</h3>
            <p className="text-gray-500">
              {userId ? 'This user has no recent activity.' : 'No recent activity to display.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type)
              const colorClass = getActivityColor(activity.type)
              
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            
            {hasMore && (
              <div className="text-center pt-4">
                <Button variant="outline" onClick={loadMore}>
                  Load More Activities
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
