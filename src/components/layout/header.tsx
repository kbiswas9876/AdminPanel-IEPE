'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { LogOut, User, Bell, AlertTriangle, UserPlus, FileText } from 'lucide-react'

// Mock notification data - in a real app, this would come from your backend
const mockNotifications = [
  {
    id: 1,
    type: 'user_registration',
    title: 'New User Registration',
    message: 'John Doe has registered and is awaiting approval',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false
  },
  {
    id: 2,
    type: 'error_report',
    title: 'Error Report Submitted',
    message: 'Critical error reported in Mock Test #123',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false
  },
  {
    id: 3,
    type: 'question_added',
    title: 'New Question Added',
    message: '5 new questions added to Mathematics category',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    read: true
  }
]

export function Header() {
  const { user, signOut } = useAuth()
  const [notifications, setNotifications] = useState(mockNotifications)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    await signOut()
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

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
        return <FileText className="h-4 w-4 text-green-600" />
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
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/60 sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Welcome back, {user?.email?.split('@')[0]}
              </h2>
              <p className="text-xs text-gray-500 font-medium">Administrator</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Enhanced Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative h-10 w-10 rounded-xl hover:bg-gray-100/80 transition-all duration-200 hover:scale-105"
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
              <div className="absolute right-0 top-12 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
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
                          onClick={() => markAsRead(notification.id)}
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
          
          {/* Enhanced Logout Button */}
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all duration-200 hover:scale-105 border-gray-200/60"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}


