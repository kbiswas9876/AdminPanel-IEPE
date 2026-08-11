'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({ children, delay = 0, duration = 300, className }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

interface SlideInProps {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  className?: string
}

export function SlideIn({ children, direction = 'up', delay = 0, duration = 300, className }: SlideInProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return 'translateY(20px)'
        case 'down':
          return 'translateY(-20px)'
        case 'left':
          return 'translateX(20px)'
        case 'right':
          return 'translateX(-20px)'
        default:
          return 'translateY(20px)'
      }
    }
    return 'translate(0, 0)'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-300 ease-out',
        className
      )}
      style={{
        transform: getTransform(),
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  )
}

interface ScaleInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function ScaleIn({ children, delay = 0, duration = 300, className }: ScaleInProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-300 ease-out',
        className
      )}
      style={{
        transform: isVisible ? 'scale(1)' : 'scale(0.9)',
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  )
}

interface StaggerProps {
  children: React.ReactNode[]
  staggerDelay?: number
  className?: string
}

export function Stagger({ children, staggerDelay = 100, className }: StaggerProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn key={index} delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  )
}

interface HoverScaleProps {
  children: React.ReactNode
  scale?: number
  duration?: number
  className?: string
}

export function HoverScale({ children, scale = 1.05, duration = 200, className }: HoverScaleProps) {
  return (
    <div
      className={cn(
        'transition-transform duration-200 ease-out hover:scale-105',
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transform: 'scale(1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `scale(${scale})`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {children}
    </div>
  )
}

interface HoverGlowProps {
  children: React.ReactNode
  color?: string
  intensity?: number
  className?: string
}

export function HoverGlow({ children, color = 'blue', intensity = 0.5, className }: HoverGlowProps) {
  const colorClasses = {
    blue: 'hover:shadow-blue-500/50',
    green: 'hover:shadow-green-500/50',
    purple: 'hover:shadow-purple-500/50',
    red: 'hover:shadow-red-500/50',
    yellow: 'hover:shadow-yellow-500/50'
  }

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        `hover:shadow-lg ${colorClasses[color as keyof typeof colorClasses]}`,
        className
      )}
      style={{
        boxShadow: '0 0 0 0 transparent',
        transition: 'box-shadow 0.3s ease-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 20px ${intensity * 100}% var(--${color}-500)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 0 0 0 transparent'
      }}
    >
      {children}
    </div>
  )
}

interface PulseProps {
  children: React.ReactNode
  duration?: number
  className?: string
}

export function Pulse({ children, duration = 1000, className }: PulseProps) {
  return (
    <div
      className={cn(
        'animate-pulse',
        className
      )}
      style={{
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  )
}

interface BounceProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function Bounce({ children, delay = 0, className }: BounceProps) {
  return (
    <div
      className={cn(
        'animate-bounce',
        className
      )}
      style={{
        animationDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

interface ShakeProps {
  children: React.ReactNode
  trigger?: boolean
  className?: string
}

export function Shake({ children, trigger = false, className }: ShakeProps) {
  return (
    <div
      className={cn(
        'transition-transform duration-200',
        trigger ? 'animate-shake' : '',
        className
      )}
    >
      {children}
    </div>
  )
}

// Custom CSS animations (add these to your global CSS)
export const animationStyles = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
  }
  
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
  }
  
  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }
`
