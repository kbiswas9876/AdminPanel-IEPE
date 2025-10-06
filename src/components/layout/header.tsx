'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useMobile } from '@/lib/contexts/mobile-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Bell, AlertTriangle, UserPlus, BookOpen, TestTube, Loader2, Menu, X, Settings, ChevronDown } from 'lucide-react'
import { getNotifications, markNotificationAsRead, type Notification } from '@/lib/actions/notifications'
import { getCurrentAdminFullProfile, type AdminProfileData } from '@/lib/actions/admin-profile'
import { clearProfileCache } from '@/components/auth/protected-route'

export function Header() {
  const { user, signOut } = useAuth()
  const { isMobile, isSidebarOpen, toggleSidebar } = useMobile()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [adminProfile, setAdminProfile] = useState<AdminProfileData | null>(null)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      // Clear profile cache before signing out
      clearProfileCache()
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Fetch admin profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await getCurrentAdminFullProfile()
      setAdminProfile(profile)
    }
    
    if (user) {
      fetchProfile()
    }
  }, [user])

  // Fetch notifications on component mount and set up polling
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const fetchedNotifications = await getNotifications(10)
        setNotifications(fetchedNotifications)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id)
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      )
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  // const markAsRead = (id: number) => {
  //   setNotifications(prev => 
  //     prev.map(notification => 
  //       notification.id === id 
  //         ? { ...notification, read: true }
  //         : notification
  //     )
  //   )
  // }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
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

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/60 sticky top-0 z-40 smooth-animation">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-4">
          {/* Mobile hamburger menu */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-10 w-10 p-0 hover:bg-gray-100/80 smooth-animation btn-premium touch-target"
              data-hamburger
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5 text-gray-700" />
              ) : (
                <Menu className="h-5 w-5 text-gray-700" />
              )}
            </Button>
          )}
          
          {/* Premium Profile Section */}
          <div className="flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100/80 transition-all duration-200 hover:scale-105 rounded-xl"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-white/20">
                    <AvatarImage src={adminProfile?.profile_picture_url || undefined} alt={adminProfile?.full_name || 'Admin'} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white font-bold">
                      {adminProfile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
                      {adminProfile?.full_name || user?.email?.split('@')[0] || 'Admin'}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                      {adminProfile?.job_title || 'Administrator'}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-64 bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-xl rounded-xl"
              >
                <DropdownMenuLabel className="px-3 py-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={adminProfile?.profile_picture_url || undefined} alt={adminProfile?.full_name || 'Admin'} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white font-bold text-lg">
                        {adminProfile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {adminProfile?.full_name || user?.email?.split('@')[0] || 'Admin'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{adminProfile?.email || user?.email}</p>
                      {adminProfile?.job_title && (
                        <p className="text-xs text-gray-600 font-medium mt-1">{adminProfile.job_title}</p>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200/60" />
                <DropdownMenuItem 
                  onClick={() => router.push('/profile')}
                  className="px-3 py-2 hover:bg-gray-50/80 transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4 mr-2 text-gray-600" />
                  <span className="text-sm">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => router.push('/settings')}
                  className="px-3 py-2 hover:bg-gray-50/80 transition-colors cursor-pointer"
                >
                  <Settings className="h-4 w-4 mr-2 text-gray-600" />
                  <span className="text-sm">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200/60" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="px-3 py-2 hover:bg-red-50/80 hover:text-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-red-600" />
                  ) : (
                    <LogOut className="h-4 w-4 mr-2 text-red-600" />
                  )}
                  <span className="text-sm font-medium">
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Enhanced Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative h-10 w-10 rounded-xl hover:bg-gray-100/80 smooth-animation btn-premium touch-target"
            >
              <Bell className="h-5 w-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center animate-pulse shadow-lg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className={`absolute right-0 top-12 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200 ${
                isMobile ? 'w-72' : 'w-80'
              }`}>
                <div className="p-4 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-medium"
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No notifications</p>
                      <p className="text-sm text-gray-400 mt-1">You&apos;re all caught up!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100/50">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer group ${
                            !notification.read ? 'bg-blue-50/30' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 mt-1 p-2 rounded-lg ${
                              notification.type === 'user_registration' ? 'bg-blue-100' :
                              notification.type === 'error_report' ? 'bg-red-100' :
                              'bg-green-100'
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2 font-medium">
                                    {formatTimestamp(notification.timestamp)}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="flex-shrink-0 ml-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/30 to-white/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                    >
                      View All Notifications
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </header>
  )
}


