'use client'

import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/lib/supabase/admin'

export interface RealtimeUserUpdate {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  user: UserProfile
  timestamp: Date
}

export class UserSubscriptionManager {
  private supabase = createClient()
  private channel: any = null
  private isSubscribed = false

  async subscribe(
    onUserUpdate: (update: RealtimeUserUpdate) => void,
    onConnectionChange?: (connected: boolean) => void
  ) {
    if (this.isSubscribed) {
      console.warn('Already subscribed to user updates')
      return
    }

    try {
      this.channel = this.supabase
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
            
            onUserUpdate(update)
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status)
          
          switch (status) {
            case 'SUBSCRIBED':
              this.isSubscribed = true
              onConnectionChange?.(true)
              break
            case 'CHANNEL_ERROR':
              this.isSubscribed = false
              onConnectionChange?.(false)
              break
            case 'TIMED_OUT':
              this.isSubscribed = false
              onConnectionChange?.(false)
              break
            case 'CLOSED':
              this.isSubscribed = false
              onConnectionChange?.(false)
              break
            default:
              this.isSubscribed = false
              onConnectionChange?.(false)
          }
        })

      return this.channel
    } catch (error) {
      console.error('Failed to subscribe to user updates:', error)
      onConnectionChange?.(false)
      throw error
    }
  }

  async unsubscribe() {
    if (this.channel && this.isSubscribed) {
      try {
        await this.supabase.removeChannel(this.channel)
        this.isSubscribed = false
        this.channel = null
        console.log('Unsubscribed from user updates')
      } catch (error) {
        console.error('Failed to unsubscribe from user updates:', error)
      }
    }
  }

  getConnectionStatus() {
    return this.isSubscribed ? 'connected' : 'disconnected'
  }
}

// Singleton instance
export const userSubscriptionManager = new UserSubscriptionManager()