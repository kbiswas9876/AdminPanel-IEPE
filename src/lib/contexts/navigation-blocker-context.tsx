'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog'

interface NavigationBlockerContextType {
  hasUnsavedChanges: boolean
  setHasUnsavedChanges: (value: boolean) => void
  confirmNavigation: (message?: string) => Promise<boolean>
}

const NavigationBlockerContext = createContext<NavigationBlockerContextType>({
  hasUnsavedChanges: false,
  setHasUnsavedChanges: () => {},
  confirmNavigation: async () => true,
})

export function NavigationBlockerProvider({ children }: { children: React.ReactNode }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<{
    resolve: (value: boolean) => void
  } | null>(null)
  const pathname = usePathname()

  // Reset unsaved changes when pathname changes (successful navigation)
  useEffect(() => {
    setHasUnsavedChanges(false)
  }, [pathname])

  const confirmNavigation = useCallback((message?: string) => {
    if (!hasUnsavedChanges) return Promise.resolve(true)
    
    return new Promise<boolean>((resolve) => {
      setPendingNavigation({ resolve })
      setIsDialogOpen(true)
    })
  }, [hasUnsavedChanges])

  const handleConfirm = useCallback(() => {
    setIsDialogOpen(false)
    pendingNavigation?.resolve(true)
    setPendingNavigation(null)
    setHasUnsavedChanges(false)
  }, [pendingNavigation])

  const handleCancel = useCallback(() => {
    setIsDialogOpen(false)
    pendingNavigation?.resolve(false)
    setPendingNavigation(null)
  }, [pendingNavigation])

  return (
    <NavigationBlockerContext.Provider 
      value={{ 
        hasUnsavedChanges, 
        setHasUnsavedChanges, 
        confirmNavigation 
      }}
    >
      {children}
      <UnsavedChangesDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </NavigationBlockerContext.Provider>
  )
}

export function useNavigationBlocker() {
  const context = useContext(NavigationBlockerContext)
  if (!context) {
    throw new Error('useNavigationBlocker must be used within NavigationBlockerProvider')
  }
  return context
}

