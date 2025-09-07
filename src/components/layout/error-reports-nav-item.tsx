'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getNewErrorReportsCount } from '@/lib/actions/error-reports'
import { AlertTriangle } from 'lucide-react'

export function ErrorReportsNavItem() {
  const pathname = usePathname()
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
        'group relative flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ease-out',
        'hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]',
        isActive
          ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/25'
          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white/90 shadow-sm" />
      )}
      
      <AlertTriangle className={cn(
        'mr-3 h-5 w-5 transition-all duration-200',
        isActive 
          ? 'text-white' 
          : 'text-slate-400 group-hover:text-white group-hover:scale-110'
      )} />
      
      <span className="font-medium tracking-wide flex-1">Error Reports</span>
      
      {/* Enhanced notification badge */}
      {!loading && newReportsCount > 0 && (
        <div className="relative">
          <span className="inline-flex items-center rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-lg animate-pulse">
            {newReportsCount}
          </span>
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-full bg-red-500/50 blur-sm animate-ping" />
        </div>
      )}
      
      {/* Subtle glow effect for active item */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600/20 to-orange-600/20 blur-sm -z-10" />
      )}
    </Link>
  )
}
