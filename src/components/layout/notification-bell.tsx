'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  AlertTriangle, 
  UserPlus, 
  BookOpen, 
  TestTube,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  type Notification,
  type NotificationPriority 
} from '@/lib/actions/notifications'
import { useToast } from '@/hooks/use-toast'

interface NotificationBellProps {
  isMobile?: boolean
}

type FilterType = 'all' | 'unread' | 'user_management' | 'content' | 'testing' | 'error' | 'system'
type GroupBy = 'time' | 'type' | 'none'

export function NotificationBell({ isMobile = false }: NotificationBellProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [groupBy, setGroupBy] = useState<GroupBy>('time')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['today']))
  const notificationRef = useRef<HTMLDivElement>(null)
  const previousCountRef = useRef(0)

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const fetchedNotifications = await getNotifications(20)
      const unreadCount = fetchedNotifications.filter(n => !n.read).length
      
      // Show toast for new notifications
      if (previousCountRef.current > 0 && unreadCount > previousCountRef.current) {
        const newNotifications = fetchedNotifications.filter(n => !n.read).slice(0, unreadCount - previousCountRef.current)
        newNotifications.forEach(n => {
          toast({
            title: n.title,
            description: n.message,
            variant: n.priority === 'critical' ? 'destructive' : 'default',
          })
        })
      }
      
      previousCountRef.current = unreadCount
      setNotifications(fetchedNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open notifications with 'n' key
      if (e.key === 'n' && !isOpen && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeElement = document.activeElement as HTMLElement
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault()
          setIsOpen(true)
        }
      }
      
      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }

      // Mark all as read with Shift+A
      if (e.key === 'A' && e.shiftKey && isOpen) {
        e.preventDefault()
        handleMarkAllAsRead()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markNotificationAsRead(notification.id)
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      )
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'user_registration':
        router.push('/students?status=pending')
        break
      case 'error_report':
        if (notification.metadata?.reportId) {
          router.push(`/reports?highlight=${notification.metadata.reportId}`)
        } else {
          router.push('/reports')
        }
        break
      case 'question_added':
        router.push('/content')
        break
      case 'test_published':
        if (notification.metadata?.testId) {
          router.push(`/tests?highlight=${notification.metadata.testId}`)
        } else {
          router.push('/tests')
        }
        break
      default:
        break
    }
    
    setIsOpen(false)
  }

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read)
    if (unreadNotifications.length === 0) return
    
    setMarkingAllRead(true)
    const result = await markAllNotificationsAsRead(unreadNotifications.map(n => n.id))
    
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast({
        title: 'All notifications marked as read',
        description: `${unreadNotifications.length} notifications marked as read`,
      })
    } else {
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive',
      })
    }
    setMarkingAllRead(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="h-4 w-4 text-blue-600" />
      case 'error_report':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'question_added':
        return <BookOpen className="h-4 w-4 text-green-600" />
      case 'test_published':
        return <TestTube className="h-4 w-4 text-purple-600" />
      case 'system_alert':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'critical':
        return 'border-l-4 border-l-red-500 bg-red-50/30'
      case 'high':
        return 'border-l-4 border-l-orange-500 bg-orange-50/30'
      case 'normal':
        return 'border-l-4 border-l-blue-500 bg-blue-50/30'
      case 'low':
        return 'border-l-4 border-l-gray-500 bg-gray-50/30'
      default:
        return ''
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const groupNotifications = (notifications: Notification[]) => {
    if (groupBy === 'none') return { 'All': notifications }
    
    if (groupBy === 'type') {
      const grouped: Record<string, Notification[]> = {}
      notifications.forEach(n => {
        const key = n.category || 'other'
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(n)
      })
      return grouped
    }
    
    // Group by time
    const groups: Record<string, Notification[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    notifications.forEach(n => {
      const timestamp = new Date(n.timestamp)
      if (timestamp >= today) {
        groups.today.push(n)
      } else if (timestamp >= yesterday) {
        groups.yesterday.push(n)
      } else if (timestamp >= weekAgo) {
        groups.thisWeek.push(n)
      } else {
        groups.older.push(n)
      }
    })

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) delete groups[key]
    })

    return groups
  }

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey)
      } else {
        newSet.add(groupKey)
      }
      return newSet
    })
  }

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false
    if (filter !== 'all' && filter !== 'unread' && n.category !== filter) return false
    if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !n.message.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length
  const groupedNotifications = groupNotifications(filteredNotifications)

  return (
    <div className="relative" ref={notificationRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-10 w-10 rounded-xl hover:bg-gray-100/80 smooth-animation btn-premium touch-target"
        aria-label="Notifications"
      >
        <motion.div
          animate={ unreadCount > 0 ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 5 }}
        >
          <Bell className="h-5 w-5 text-gray-700" />
        </motion.div>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-lg"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute right-0 top-12 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden z-50",
              isMobile ? 'w-80' : 'w-96'
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      disabled={markingAllRead}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-medium h-7 px-2"
                    >
                      {markingAllRead ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Check className="h-3 w-3 mr-1" />
                      )}
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {(['all', 'unread', 'error', 'user_management', 'content', 'testing'] as FilterType[]).map(f => (
                  <Button
                    key={f}
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilter(f)}
                    className={cn(
                      "h-7 px-3 text-xs font-medium rounded-full whitespace-nowrap transition-all",
                      filter === f 
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-100" 
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Button>
                ))}
              </div>

              {/* Search */}
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[32rem] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 text-gray-400 mx-auto animate-spin mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No notifications</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchQuery ? 'No results found' : "You're all caught up!"}
                  </p>
                </div>
              ) : (
                <div>
                  {Object.entries(groupedNotifications).map(([groupKey, groupNotifications]) => (
                    <div key={groupKey}>
                      {/* Group Header */}
                      <button
                        onClick={() => toggleGroup(groupKey)}
                        className="w-full flex items-center justify-between px-4 py-2 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                          {groupKey} ({groupNotifications.length})
                        </span>
                        {expandedGroups.has(groupKey) ? (
                          <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                        )}
                      </button>

                      {/* Group Items */}
                      <AnimatePresence>
                        {expandedGroups.has(groupKey) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="divide-y divide-gray-100/50"
                          >
                            {groupNotifications.map((notification, index) => (
                              <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                  "p-4 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer group",
                                  !notification.read && getPriorityColor(notification.priority)
                                )}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex items-start space-x-3">
                                  <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className={cn(
                                      "flex-shrink-0 mt-1 p-2 rounded-lg",
                                      notification.type === 'user_registration' ? 'bg-blue-100' :
                                      notification.type === 'error_report' ? 'bg-red-100' :
                                      notification.type === 'question_added' ? 'bg-green-100' :
                                      notification.type === 'test_published' ? 'bg-purple-100' :
                                      'bg-gray-100'
                                    )}
                                  >
                                    {getNotificationIcon(notification.type)}
                                  </motion.div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                            {notification.title}
                                          </p>
                                          {notification.priority === 'critical' && (
                                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                                              URGENT
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                          {notification.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                          <p className="text-xs text-gray-500 font-medium">
                                            {formatTimestamp(notification.timestamp)}
                                          </p>
                                          {notification.actionable && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                              Actionable
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      {!notification.read && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="flex-shrink-0"
                                        >
                                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                        </motion.div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/30 to-white/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    router.push('/notifications')
                    setIsOpen(false)
                  }}
                  className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium h-8"
                >
                  View All Notifications
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

