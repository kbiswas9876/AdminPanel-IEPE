'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface MobileContextType {
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

const MobileContext = createContext<MobileContextType | undefined>(undefined)

export function MobileProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      setIsDesktop(width >= 1024)
      
      // Close sidebar on mobile when screen size changes
      if (width >= 1024) {
        setIsSidebarOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isSidebarOpen) {
        const target = event.target as Element
        const sidebar = document.querySelector('[data-sidebar]')
        const hamburger = document.querySelector('[data-hamburger]')
        
        if (sidebar && !sidebar.contains(target) && !hamburger?.contains(target)) {
          setIsSidebarOpen(false)
        }
      }
    }

    if (isMobile) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile, isSidebarOpen])

  return (
    <MobileContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        isMobile,
        isTablet,
        isDesktop,
      }}
    >
      {children}
    </MobileContext.Provider>
  )
}

export function useMobile() {
  const context = useContext(MobileContext)
  if (context === undefined) {
    throw new Error('useMobile must be used within a MobileProvider')
  }
  return context
}
