'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useNavigationBlocker } from '@/lib/contexts/navigation-blocker-context'

interface UseUnsavedChangesProps {
  hasUnsavedChanges: boolean
  onNavigationAttempt?: () => void
}

/**
 * Hook to prevent accidental navigation when there are unsaved changes
 * Shows a browser confirmation dialog before allowing navigation
 */
export function useUnsavedChanges({ 
  hasUnsavedChanges, 
  onNavigationAttempt 
}: UseUnsavedChangesProps) {
  const router = useRouter()
  const isNavigatingRef = useRef(false)
  const { setHasUnsavedChanges, confirmNavigation: globalConfirmNavigation } = useNavigationBlocker()

  // Prevent browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isNavigatingRef.current) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Prevent navigation via back/forward buttons and programmatic navigation
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges && !isNavigatingRef.current) {
        e.preventDefault()
        const confirmed = window.confirm(
          'You have unsaved changes. Are you sure you want to leave? All changes will be lost.'
        )
        
        if (!confirmed) {
          // Push the current state back to prevent navigation
          window.history.pushState(null, '', window.location.href)
        } else {
          isNavigatingRef.current = true
          onNavigationAttempt?.()
        }
      }
    }

    // Push initial state to enable popstate detection
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [hasUnsavedChanges, onNavigationAttempt])

  // Sync local state with global context
  useEffect(() => {
    setHasUnsavedChanges(hasUnsavedChanges)
  }, [hasUnsavedChanges, setHasUnsavedChanges])

  const confirmNavigation = useCallback(async (message?: string) => {
    const confirmed = await globalConfirmNavigation(message)
    
    if (confirmed) {
      isNavigatingRef.current = true
      onNavigationAttempt?.()
    }
    
    return confirmed
  }, [globalConfirmNavigation, onNavigationAttempt])

  return { confirmNavigation, isNavigatingRef }
}

