'use client'

import { useState, useCallback } from 'react'
import type { UserProfile } from '@/lib/supabase/admin'

interface OptimisticUpdate {
  id: string
  action: 'approve' | 'suspend' | 'promote' | 'delete' | 'reject'
  originalUser: UserProfile
  optimisticUser: UserProfile
  timestamp: Date
}

export function useOptimisticUserAction() {
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const applyOptimisticUpdate = useCallback((
    userId: string,
    action: OptimisticUpdate['action'],
    originalUser: UserProfile,
    serverAction: (userId: string) => Promise<any>
  ) => {
    return new Promise(async (resolve, reject) => {
      let optimisticUpdate: OptimisticUpdate | null = null
      
      try {
        setIsProcessing(true)
        
        // Create optimistic user update
        const optimisticUser: UserProfile = {
          ...originalUser,
          status: action === 'approve' ? 'active' : 
                  action === 'suspend' ? 'suspended' : 
                  action === 'reject' ? 'suspended' : originalUser.status,
          role: action === 'promote' ? 'admin' : originalUser.role,
          updated_at: new Date().toISOString()
        }

        // Add to optimistic updates
        optimisticUpdate = {
          id: `${userId}-${action}-${Date.now()}`,
          action,
          originalUser,
          optimisticUser,
          timestamp: new Date()
        }

        setOptimisticUpdates(prev => [...prev, optimisticUpdate!])

        // Execute server action
        const result = await serverAction(userId)
        
        // Remove optimistic update on success
        setOptimisticUpdates(prev => 
          prev.filter(update => update.id !== optimisticUpdate!.id)
        )

        resolve(result)
      } catch (error) {
        // Rollback optimistic update on error
        if (optimisticUpdate) {
          setOptimisticUpdates(prev => 
            prev.filter(update => update.id !== optimisticUpdate!.id)
          )
        }
        reject(error)
      } finally {
        setIsProcessing(false)
      }
    })
  }, [])

  const approveUser = useCallback(async (
    userId: string,
    user: UserProfile,
    serverAction: (userId: string) => Promise<any>
  ) => {
    return applyOptimisticUpdate(userId, 'approve', user, serverAction)
  }, [applyOptimisticUpdate])

  const suspendUser = useCallback(async (
    userId: string,
    user: UserProfile,
    serverAction: (userId: string) => Promise<any>
  ) => {
    return applyOptimisticUpdate(userId, 'suspend', user, serverAction)
  }, [applyOptimisticUpdate])

  const promoteUser = useCallback(async (
    userId: string,
    user: UserProfile,
    serverAction: (userId: string) => Promise<any>
  ) => {
    return applyOptimisticUpdate(userId, 'promote', user, serverAction)
  }, [applyOptimisticUpdate])

  const deleteUser = useCallback(async (
    userId: string,
    user: UserProfile,
    serverAction: (userId: string) => Promise<any>
  ) => {
    return applyOptimisticUpdate(userId, 'delete', user, serverAction)
  }, [applyOptimisticUpdate])

  const rejectUser = useCallback(async (
    userId: string,
    user: UserProfile,
    serverAction: (userId: string) => Promise<any>
  ) => {
    return applyOptimisticUpdate(userId, 'reject', user, serverAction)
  }, [applyOptimisticUpdate])

  const getOptimisticUser = useCallback((userId: string): UserProfile | null => {
    const update = optimisticUpdates.find(u => u.originalUser.id === userId)
    return update ? update.optimisticUser : null
  }, [optimisticUpdates])

  const clearOptimisticUpdates = useCallback(() => {
    setOptimisticUpdates([])
  }, [])

  return {
    optimisticUpdates,
    isProcessing,
    approveUser,
    suspendUser,
    promoteUser,
    deleteUser,
    rejectUser,
    getOptimisticUser,
    clearOptimisticUpdates
  }
}

// Specialized hook for user approval
export function useOptimisticUserApproval() {
  const { approveUser, isProcessing } = useOptimisticUserAction()
  
  return {
    approveUser,
    isProcessing
  }
}