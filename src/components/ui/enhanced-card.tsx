'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { FadeIn, HoverScale, HoverGlow } from './enhanced-animations'

interface EnhancedCardProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  hover?: 'scale' | 'glow' | 'lift' | 'none'
  animation?: 'fade' | 'slide' | 'scale' | 'none'
  delay?: number
  interactive?: boolean
  loading?: boolean
  error?: boolean
  success?: boolean
  gradient?: boolean
  glass?: boolean
  border?: boolean
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | 'none'
}

export function EnhancedCard({
  children,
  title,
  description,
  className,
  hover = 'scale',
  animation = 'fade',
  delay = 0,
  interactive = false,
  loading = false,
  error = false,
  success = false,
  gradient = false,
  glass = false,
  border = true,
  shadow = 'md'
}: EnhancedCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getHoverClass = () => {
    if (!interactive) return ''
    
    switch (hover) {
      case 'scale':
        return 'hover:scale-105 transition-transform duration-200'
      case 'glow':
        return 'hover:shadow-lg hover:shadow-blue-500/25 transition-shadow duration-200'
      case 'lift':
        return 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200'
      case 'none':
        return ''
      default:
        return 'hover:scale-105 transition-transform duration-200'
    }
  }

  const getAnimationComponent = () => {
    const content = (
      <Card
        className={cn(
          'transition-all duration-200',
          getHoverClass(),
          interactive && 'cursor-pointer',
          loading && 'opacity-50 pointer-events-none',
          error && 'border-red-200 bg-red-50',
          success && 'border-green-200 bg-green-50',
          gradient && 'bg-gradient-to-br from-blue-50 to-indigo-100',
          glass && 'backdrop-blur-sm bg-white/80 border-white/20',
          border && 'border',
          shadow === 'sm' && 'shadow-sm',
          shadow === 'md' && 'shadow-md',
          shadow === 'lg' && 'shadow-lg',
          shadow === 'xl' && 'shadow-xl',
          shadow === 'none' && 'shadow-none',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {title && (
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </CardHeader>
        )}
        <CardContent className={cn(loading && 'relative')}>
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
            </div>
          )}
          {children}
        </CardContent>
      </Card>
    )

    switch (animation) {
      case 'fade':
        return <FadeIn delay={delay}>{content}</FadeIn>
      case 'slide':
        return <HoverScale>{content}</HoverScale>
      case 'scale':
        return <HoverScale>{content}</HoverScale>
      case 'none':
        return content
      default:
        return <FadeIn delay={delay}>{content}</FadeIn>
    }
  }

  return getAnimationComponent()
}

// Specialized card variants
export function StatCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  ...props 
}: EnhancedCardProps & {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
}) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      case 'neutral':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <EnhancedCard {...props}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${getTrendColor()}`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </EnhancedCard>
  )
}

export function FeatureCard({ 
  title, 
  description, 
  icon, 
  action, 
  ...props 
}: EnhancedCardProps & {
  title: string
  description: string
  icon: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <EnhancedCard {...props} interactive>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          {action && (
            <div className="mt-4">
              {action}
            </div>
          )}
        </div>
      </div>
    </EnhancedCard>
  )
}

export function LoadingCard({ ...props }: EnhancedCardProps) {
  return (
    <EnhancedCard {...props} loading>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
      </div>
    </EnhancedCard>
  )
}

export function ErrorCard({ 
  title = 'Error', 
  message, 
  action, 
  ...props 
}: EnhancedCardProps & {
  title?: string
  message: string
  action?: React.ReactNode
}) {
  return (
    <EnhancedCard {...props} error>
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="font-semibold text-red-900 mb-2">{title}</h3>
        <p className="text-sm text-red-700 mb-4">{message}</p>
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    </EnhancedCard>
  )
}

export function SuccessCard({ 
  title = 'Success', 
  message, 
  action, 
  ...props 
}: EnhancedCardProps & {
  title?: string
  message: string
  action?: React.ReactNode
}) {
  return (
    <EnhancedCard {...props} success>
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-semibold text-green-900 mb-2">{title}</h3>
        <p className="text-sm text-green-700 mb-4">{message}</p>
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    </EnhancedCard>
  )
}
