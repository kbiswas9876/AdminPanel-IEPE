'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/lib/supabase/admin'

interface RealtimeUserUpdate {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  user: UserProfile
  timestamp: Date
}

export function useRealtimeUsers(
  onUserUpdate: (update: RealtimeUserUpdate) => void,
  onConnectionChange?: (connected: boolean) => void
) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const handleUserUpdate = useCallback((update: RealtimeUserUpdate) => {
    setLastUpdate(update.timestamp)
    onUserUpdate(update)
  }, [onUserUpdate])

  useEffect(() => {
    const supabase = createClient()
    let reconnectTimeout: NodeJS.Timeout
    
    const setupSubscription = () => {
      // Subscribe to user_profiles table changes
      const channel = supabase
        .channel('user_profiles_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_profiles'
          },
          (payload) => {
            console.log('Real-time user update:', payload)
            
            const update: RealtimeUserUpdate = {
              type: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              user: payload.new as UserProfile || payload.old as UserProfile,
              timestamp: new Date()
            }
            
            handleUserUpdate(update)
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status)
          
          switch (status) {
            case 'SUBSCRIBED':
              setIsConnected(true)
              setConnectionStatus('connected')
              onConnectionChange?.(true)
              break
            case 'CHANNEL_ERROR':
              setIsConnected(false)
              setConnectionStatus('error')
              onConnectionChange?.(false)
              // Attempt to reconnect after 5 seconds
              reconnectTimeout = setTimeout(() => {
                console.log('Attempting to reconnect...')
                setupSubscription()
              }, 5000)
              break
            case 'TIMED_OUT':
              setIsConnected(false)
              setConnectionStatus('disconnected')
              onConnectionChange?.(false)
              // Attempt to reconnect after 3 seconds
              reconnectTimeout = setTimeout(() => {
                console.log('Attempting to reconnect after timeout...')
                setupSubscription()
              }, 3000)
              break
            case 'CLOSED':
              setIsConnected(false)
              setConnectionStatus('disconnected')
              onConnectionChange?.(false)
              // Attempt to reconnect after 2 seconds
              reconnectTimeout = setTimeout(() => {
                console.log('Attempting to reconnect after close...')
                setupSubscription()
              }, 2000)
              break
            default:
              setIsConnected(false)
              setConnectionStatus('connecting')
              onConnectionChange?.(false)
          }
        })
      
      return channel
    }
    
    const channel = setupSubscription()

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      supabase.removeChannel(channel)
    }
  }, [handleUserUpdate, onConnectionChange])

  return {
    isConnected,
    connectionStatus,
    lastUpdate
  }
}

// Hook for managing real-time notifications
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<RealtimeUserUpdate[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const addNotification = useCallback((update: RealtimeUserUpdate) => {
    setNotifications(prev => [update, ...prev.slice(0, 9)]) // Keep last 10
    setUnreadCount(prev => prev + 1)
  }, [])

  const markAsRead = useCallback(() => {
    setUnreadCount(0)
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    clearNotifications
  }
}