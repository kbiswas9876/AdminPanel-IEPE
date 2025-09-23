'use client'

// Apple's signature transition system with enhanced robustness
export class AppleTransitions {
  private static instance: AppleTransitions
  private transitionQueue: Map<string, boolean> = new Map()
  private performanceObserver: PerformanceObserver | null = null

  static getInstance(): AppleTransitions {
    if (!AppleTransitions.instance) {
      AppleTransitions.instance = new AppleTransitions()
    }
    return AppleTransitions.instance
  }

  // Apple's signature timing functions - smooth and gentle
  static readonly EASING = {
    // iOS 17+ spring animation curve - gentle
    spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
    // macOS Ventura+ timing - smooth
    smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
    // iOS 16+ bounce - gentle
    bounce: 'cubic-bezier(0.16, 1, 0.3, 1)',
    // Quick transitions - smooth
    snappy: 'cubic-bezier(0.16, 1, 0.3, 1)',
    // Apple's signature ease - smooth
    ease: 'cubic-bezier(0.16, 1, 0.3, 1)'
  } as const

  // Apple's signature durations - smooth and gentle
  static readonly DURATIONS = {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '250ms',
    spring: '300ms'
  } as const

  // Enhanced transition states
  static readonly STATES = {
    IDLE: 'idle',
    PREPARING: 'preparing',
    EXITING: 'exiting',
    ENTERING: 'entering',
    ENTERED: 'entered'
  } as const

  // Initialize performance monitoring
  initPerformanceMonitoring(): void {
    if (typeof window === 'undefined') return

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name.includes('transition')) {
            const duration = entry.duration
            if (duration > 300) {
              console.warn(`Slow transition detected: ${entry.name} took ${duration.toFixed(2)}ms`)
            }
          }
        })
      })
      this.performanceObserver.observe({ entryTypes: ['measure'] })
    } catch (error) {
      console.warn('Performance monitoring not supported:', error)
    }
  }

  // Start transition timing
  startTransition(transitionId: string): void {
    this.transitionQueue.set(transitionId, true)
    performance.mark(`transition-${transitionId}-start`)
  }

  // End transition timing
  endTransition(transitionId: string): void {
    if (!this.transitionQueue.has(transitionId)) return

    performance.mark(`transition-${transitionId}-end`)
    performance.measure(
      `transition-${transitionId}`,
      `transition-${transitionId}-start`,
      `transition-${transitionId}-end`
    )
    
    this.transitionQueue.delete(transitionId)
  }

  // Smooth morph transition styles
  getTransitionStyles(
    state: string,
    options: {
      duration?: string
      easing?: string
      reducedMotion?: boolean
    } = {}
  ): React.CSSProperties {
    const { duration = AppleTransitions.DURATIONS.normal, easing, reducedMotion = false } = options

    if (reducedMotion) {
      return {
        transition: 'none',
        opacity: 1,
        transform: 'translateX(0) scale(1)',
        filter: 'blur(0)'
      }
    }

    const baseStyles: React.CSSProperties = {
      transitionProperty: 'opacity, transform, filter',
      transitionDuration: duration,
      transitionTimingFunction: easing || AppleTransitions.EASING.smooth,
      willChange: 'transform, opacity, filter',
      backfaceVisibility: 'hidden',
      perspective: '1000px',
      transformStyle: 'preserve-3d'
    }

    switch (state) {
      case AppleTransitions.STATES.PREPARING:
        return {
          ...baseStyles,
          opacity: 1,
          transform: 'translateX(0) scale(1)',
          filter: 'blur(0)'
        }
      
      case AppleTransitions.STATES.EXITING:
        return {
          ...baseStyles,
          opacity: 0,
          transform: 'translateX(-30px) scale(0.98)',
          filter: 'blur(1px)',
          transitionDuration: '250ms',
          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }
      
      case AppleTransitions.STATES.ENTERING:
        return {
          ...baseStyles,
          opacity: 0,
          transform: 'translateX(30px) scale(1.02)',
          filter: 'blur(1px)',
          transitionDuration: '300ms',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }
      
      case AppleTransitions.STATES.ENTERED:
        return {
          ...baseStyles,
          opacity: 1,
          transform: 'translateX(0) scale(1)',
          filter: 'blur(0)'
        }
      
      default:
        return baseStyles
    }
  }

  // Smooth morph animation classes
  getAnimationClasses(
    state: string,
    options: {
      reducedMotion?: boolean
      variant?: 'spring' | 'slide' | 'fade'
    } = {}
  ): string {
    const { reducedMotion = false, variant = 'fade' } = options

    if (reducedMotion) {
      return 'opacity-100 scale-100 translate-x-0 blur-0'
    }

    const baseClasses = 'will-change-transform transform-gpu backface-visibility-hidden gpu-accelerated'

    switch (state) {
      case AppleTransitions.STATES.PREPARING:
        return `${baseClasses} opacity-100 scale-100 translate-x-0 blur-0`
      
      case AppleTransitions.STATES.EXITING:
        return `${baseClasses} opacity-0 scale-[0.98] -translate-x-8 blur-[1px]`
      
      case AppleTransitions.STATES.ENTERING:
        return `${baseClasses} opacity-0 scale-[1.02] translate-x-8 blur-[1px]`
      
      case AppleTransitions.STATES.ENTERED:
        return `${baseClasses} opacity-100 scale-100 translate-x-0 blur-0`
      
      default:
        return `${baseClasses} opacity-100 scale-100 translate-x-0 blur-0`
    }
  }

  // Enhanced transition handler with Apple's signature timing
  createTransitionHandler(
    pathname: string,
    previousPathname: React.MutableRefObject<string>,
    setTransitionState: (state: string) => void,
    setIsTransitioning: (transitioning: boolean) => void,
    options: {
      reducedMotion?: boolean
      variant?: 'spring' | 'slide' | 'fade'
    } = {}
  ) {
    const { reducedMotion = false, variant = 'spring' } = options

    return () => {
      if (reducedMotion) {
        setTransitionState(AppleTransitions.STATES.ENTERED)
        return
      }

      if (previousPathname.current !== pathname) {
        const transitionId = `transition-${Date.now()}`
        this.startTransition(transitionId)
        
        setIsTransitioning(true)
        
        // Smooth morph transition sequence
        setTransitionState(AppleTransitions.STATES.PREPARING)
        
        // Gentle morph timing
        setTimeout(() => {
          setTransitionState(AppleTransitions.STATES.EXITING)
          
          // Smooth morph: 250ms exit, 300ms enter
          setTimeout(() => {
            setTransitionState(AppleTransitions.STATES.ENTERING)
            
            // Double RAF for ultra-smooth morph
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setTransitionState(AppleTransitions.STATES.ENTERED)
                setIsTransitioning(false)
                this.endTransition(transitionId)
              })
            })
          }, 250) // Gentle exit timing
        }, 12) // Minimal delay for smooth morph
        
        previousPathname.current = pathname
      }
    }
  }

  // Cleanup
  cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
    }
    this.transitionQueue.clear()
  }
}

// Export singleton instance
export const appleTransitions = AppleTransitions.getInstance()

// Utility functions for common Apple transitions
export const appleTransitionUtils = {
  // Get reduced motion preference
  getReducedMotionPreference(): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  // Get Apple-inspired hover styles
  getHoverStyles(): React.CSSProperties {
    return {
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      transform: 'translateY(-1px) scale(1.01)',
      boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1)'
    }
  },

  // Get Apple-inspired focus styles
  getFocusStyles(): React.CSSProperties {
    return {
      transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
      transform: 'scale(1.02)'
    }
  },

  // Get Apple's signature blur effects
  getBlurStyles(intensity: 'light' | 'medium' | 'heavy' = 'medium'): React.CSSProperties {
    const blurValues = {
      light: '10px',
      medium: '20px',
      heavy: '40px'
    }

    return {
      backdropFilter: `blur(${blurValues[intensity]})`,
      WebkitBackdropFilter: `blur(${blurValues[intensity]})`
    }
  }
}
