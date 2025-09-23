'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { simpleTransitions } from '@/lib/utils/simple-transitions'

interface SimplePageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function SimplePageTransition({ children, className }: SimplePageTransitionProps) {
  const pathname = usePathname()
  const [isEntering, setIsEntering] = useState(true)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false)
      return
    }

    // Simple enter animation
    setIsEntering(false)
    const timer = setTimeout(() => {
      setIsEntering(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [pathname, isFirstLoad])

  return (
    <div
      key={pathname}
      className={cn(
        'w-full',
        simpleTransitions.getPageTransitionClasses(isEntering),
        className
      )}
      style={simpleTransitions.getPageTransitionStyles(isEntering)}
    >
      {children}
    </div>
  )
}
