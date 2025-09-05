'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getNewErrorReportsCount } from '@/lib/actions/error-reports'

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
        'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-gray-800 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      )}
    >
      <span className="mr-3 text-lg">🚨</span>
      <span className="flex-1">Error Reports</span>
      {!loading && newReportsCount > 0 && (
        <span className="ml-2 inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
          {newReportsCount}
        </span>
      )}
    </Link>
  )
}
