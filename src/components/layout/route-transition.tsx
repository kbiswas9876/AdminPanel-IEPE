"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { appleTransitions, appleTransitionUtils } from '@/lib/utils/apple-transitions'

interface RouteTransitionProps {
  children: React.ReactNode
  variant?: 'spring' | 'slide' | 'fade'
}

export function RouteTransition({ children, variant = 'fade' }: RouteTransitionProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [transitionState, setTransitionState] = useState<string>('entered')
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const previousPathname = useRef(pathname)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const rafRef = useRef<number | undefined>(undefined)

  // Detect if user prefers reduced motion
  const prefersReducedMotion = useMemo(() => {
    return appleTransitionUtils.getReducedMotionPreference()
  }, [])

  // Initialize performance monitoring
  useEffect(() => {
    appleTransitions.initPerformanceMonitoring()
    return () => appleTransitions.cleanup()
  }, [])

  // Preload function for instant navigation
  const preloadRoute = useCallback((href: string) => {
    if (typeof window !== 'undefined') {
      router.prefetch(href)
    }
  }, [router])

  // Enhanced transition handler using Apple's signature system
  const handleTransition = useCallback(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false)
      setTransitionState('entered')
      return
    }

    const transitionHandler = appleTransitions.createTransitionHandler(
      pathname,
      previousPathname,
      setTransitionState,
      setIsTransitioning,
      { reducedMotion: prefersReducedMotion, variant }
    )

    transitionHandler()
  }, [pathname, isFirstLoad, isTransitioning, prefersReducedMotion, variant])

  useEffect(() => {
    handleTransition()
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [handleTransition])

  // Get Apple-inspired animation classes
  const getAnimationClasses = () => {
    return appleTransitions.getAnimationClasses(transitionState, {
      reducedMotion: prefersReducedMotion,
      variant
    })
  }

  // Get Apple-inspired transition styles
  const getTransitionStyles = () => {
    return appleTransitions.getTransitionStyles(transitionState, {
      reducedMotion: prefersReducedMotion
    })
  }

  return (
    <div
      key={pathname}
      className={`
        ${getAnimationClasses()}
        smooth-morph-transition
      `}
      style={getTransitionStyles()}
    >
      {children}
    </div>
  )
}
