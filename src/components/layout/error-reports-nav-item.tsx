'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMobile } from '@/lib/contexts/mobile-context'
import { cn } from '@/lib/utils'
import { getNewErrorReportsCount } from '@/lib/actions/error-reports'
import { AlertTriangle } from 'lucide-react'

export function ErrorReportsNavItem() {
  const pathname = usePathname()
  const { isMobile } = useMobile()
  const [newReportsCount, setNewReportsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const isActive = pathname === '/reports'

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await getNewErrorReportsCount()
        setNewReportsCount(count)
      } catch (error) {
        console.error('Error fetching new reports count:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCount()
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <Link
      href="/reports"
      className={cn(
        'group relative flex items-center transition-all duration-200 ease-out transform-gpu',
        'hover:scale-[1.01] active:scale-[0.99]',
        isMobile 
          ? 'rounded-xl px-3 py-2.5 text-sm' 
          : 'rounded-xl px-4 py-3 text-sm',
        isActive
          ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/25'
          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:shadow-md'
      )}
    >
      {/* Ultra-Premium Active Indicator */}
      {isActive && (
        <div className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full bg-white/90 shadow-sm",
          isMobile ? "h-6 w-1" : "h-8 w-1"
        )} />
      )}
      
      {/* Compact Mobile Icon */}
      <AlertTriangle className={cn(
        'transition-all duration-200',
        isMobile ? 'mr-2 h-4 w-4' : 'mr-3 h-5 w-5',
        isActive 
          ? 'text-white' 
          : 'text-slate-400 group-hover:text-white group-hover:scale-105'
      )} />
      
      {/* Ultra-Premium Text */}
      <span className={cn(
        'font-medium tracking-wide flex-1 truncate',
        isMobile ? 'text-sm' : 'text-sm',
        isActive ? 'font-semibold' : 'font-medium'
      )}>
        {isMobile ? 'Reports' : 'Error Reports'}
      </span>
      
      {/* Premium Notification Badge */}
      {!loading && newReportsCount > 0 && (
        <div className="relative">
          <span className={cn(
            'inline-flex items-center rounded-full bg-red-500 font-bold text-white shadow-md animate-pulse',
            isMobile ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs'
          )}>
            {newReportsCount}
          </span>
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-full bg-red-500/50 blur-sm animate-ping" />
        </div>
      )}
      
      {/* Subtle Active Glow */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600/20 to-orange-600/20 blur-sm -z-10" />
      )}
    </Link>
  )
}
