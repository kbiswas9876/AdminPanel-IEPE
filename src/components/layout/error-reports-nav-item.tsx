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
    <div className="relative group">
      <Link
        href="/reports"
        className={cn(
          'group relative flex items-center transition-all duration-200 ease-out',
          isMobile 
            ? 'rounded-lg px-ios-md py-ios-md text-body touch-target' 
            : 'rounded-lg px-4 py-4 text-sm',
          isActive
            ? isMobile 
              ? 'bg-red-500 text-white shadow-sm' 
              : 'bg-red-600 text-white shadow-lg'
            : isMobile
              ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              : 'text-slate-300 hover:bg-slate-700/40 hover:text-white'
        )}
      >
        {/* Clean Icon Container */}
        <div className={cn(
          'flex items-center justify-center rounded-md transition-all duration-200 ease-out',
          isMobile 
            ? 'w-8 h-8 mr-3' 
            : 'w-9 h-9 mr-4',
          isActive 
            ? isMobile 
              ? 'bg-white/20 shadow-sm' 
              : 'bg-white/20 shadow-sm'
            : isMobile
              ? 'bg-slate-100 group-hover:bg-slate-200'
              : 'bg-slate-700/50 group-hover:bg-slate-600/60'
        )}>
          <AlertTriangle className={cn(
            'transition-all duration-200 ease-out',
            'h-4 w-4',
            isActive 
              ? 'text-white' 
              : isMobile
                ? 'text-slate-600 group-hover:text-slate-800'
                : 'text-slate-400 group-hover:text-white'
          )} />
        </div>
        
        {/* Clean Text Content */}
        <div className="flex-1 min-w-0 transition-all duration-200 ease-out opacity-100 translate-x-0">
          <div className={cn(
            'font-medium tracking-wide truncate transition-all duration-200',
            isMobile ? 'text-body' : 'text-base',
            isActive ? 'font-semibold' : 'font-medium'
          )}>
            {isMobile ? 'Reports' : 'Error Reports'}
          </div>
          {!isMobile && (
            <div className={cn(
              'text-xs transition-colors duration-200 truncate',
              isActive 
                ? 'text-red-100' 
                : 'text-slate-500 group-hover:text-slate-300'
            )}>
              System monitoring
            </div>
          )}
        </div>
        
        {/* Clean Notification Badge */}
        {!loading && newReportsCount > 0 && (
          <div className="relative">
            <span className={cn(
              'inline-flex items-center rounded-full bg-red-500 font-bold text-white shadow-sm',
              isMobile ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs'
            )}>
              {newReportsCount}
            </span>
          </div>
        )}
      </Link>
    </div>
  )
}
