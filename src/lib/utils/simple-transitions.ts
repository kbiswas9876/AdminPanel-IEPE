'use client'

// Simple, Apple-inspired transition system
export class SimpleTransitions {
  private static instance: SimpleTransitions
  private isReducedMotion: boolean = false

  static getInstance(): SimpleTransitions {
    if (!SimpleTransitions.instance) {
      SimpleTransitions.instance = new SimpleTransitions()
    }
    return SimpleTransitions.instance
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  }

  // Apple's signature easing curves
  static readonly EASING = {
    // iOS 17+ spring animation curve
    spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
    // macOS Ventura+ timing
    smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
    // Quick transitions
    snappy: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Apple's signature ease
    ease: 'cubic-bezier(0.16, 1, 0.3, 1)'
  } as const

  // Apple's signature durations
  static readonly DURATIONS = {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '250ms'
  } as const

  // Get tab transition styles
  getTabTransitionStyles(isActive: boolean): React.CSSProperties {
    if (this.isReducedMotion) {
      return {
        opacity: 1,
        transform: 'translateY(0)',
        transition: 'none'
      }
    }

    return {
      opacity: isActive ? 1 : 0,
      transform: isActive ? 'translateY(0)' : 'translateY(8px)',
      transition: `opacity ${SimpleTransitions.DURATIONS.normal} ${SimpleTransitions.EASING.smooth}, transform ${SimpleTransitions.DURATIONS.normal} ${SimpleTransitions.EASING.smooth}`,
      willChange: 'opacity, transform',
      backfaceVisibility: 'hidden'
    }
  }

  // Get tab transition classes
  getTabTransitionClasses(isActive: boolean): string {
    if (this.isReducedMotion) {
      return 'opacity-100 translate-y-0'
    }

    const baseClasses = 'will-change-transform backface-visibility-hidden'
    
    if (isActive) {
      return `${baseClasses} opacity-100 translate-y-0`
    } else {
      return `${baseClasses} opacity-0 translate-y-2`
    }
  }

  // Get page transition styles
  getPageTransitionStyles(isEntering: boolean): React.CSSProperties {
    if (this.isReducedMotion) {
      return {
        opacity: 1,
        transform: 'translateY(0)',
        transition: 'none'
      }
    }

    return {
      opacity: isEntering ? 1 : 0,
      transform: isEntering ? 'translateY(0)' : 'translateY(12px)',
      transition: `opacity ${SimpleTransitions.DURATIONS.normal} ${SimpleTransitions.EASING.smooth}, transform ${SimpleTransitions.DURATIONS.normal} ${SimpleTransitions.EASING.smooth}`,
      willChange: 'opacity, transform',
      backfaceVisibility: 'hidden'
    }
  }

  // Get page transition classes
  getPageTransitionClasses(isEntering: boolean): string {
    if (this.isReducedMotion) {
      return 'opacity-100 translate-y-0'
    }

    const baseClasses = 'will-change-transform backface-visibility-hidden'
    
    if (isEntering) {
      return `${baseClasses} opacity-100 translate-y-0`
    } else {
      return `${baseClasses} opacity-0 translate-y-3`
    }
  }

  // Get hover styles
  getHoverStyles(): React.CSSProperties {
    if (this.isReducedMotion) {
      return {}
    }

    return {
      transition: `transform ${SimpleTransitions.DURATIONS.fast} ${SimpleTransitions.EASING.smooth}`,
      transform: 'translateY(-1px)',
      willChange: 'transform'
    }
  }

  // Get focus styles
  getFocusStyles(): React.CSSProperties {
    if (this.isReducedMotion) {
      return {
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)'
      }
    }

    return {
      transition: `transform ${SimpleTransitions.DURATIONS.fast} ${SimpleTransitions.EASING.smooth}`,
      transform: 'scale(1.02)',
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
      willChange: 'transform'
    }
  }
}

// Export singleton instance
export const simpleTransitions = SimpleTransitions.getInstance()

// Utility functions
export const transitionUtils = {
  // Get reduced motion preference
  getReducedMotionPreference(): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  // Get Apple-inspired blur effects
  getBlurStyles(intensity: 'light' | 'medium' | 'heavy' = 'medium'): React.CSSProperties {
    const blurValues = {
      light: '8px',
      medium: '16px',
      heavy: '24px'
    }

    return {
      backdropFilter: `blur(${blurValues[intensity]})`,
      WebkitBackdropFilter: `blur(${blurValues[intensity]})`
    }
  }
}
