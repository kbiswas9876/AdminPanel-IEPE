'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
  size = 'md'
}: SectionHeaderProps) {
  const sizeClasses = {
    sm: {
      title: "text-lg font-bold",
      subtitle: "text-sm",
      spacing: "mb-4"
    },
    md: {
      title: "text-xl font-bold", 
      subtitle: "text-sm",
      spacing: "mb-6"
    },
    lg: {
      title: "text-2xl font-bold",
      subtitle: "text-base", 
      spacing: "mb-8"
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={cn("flex items-start justify-between", currentSize.spacing, className)}>
      <div className="flex-1 min-w-0">
        <h1 className={cn(
          "text-gray-900 tracking-tight",
          currentSize.title
        )}>
          {title}
        </h1>
        {subtitle && (
          <p className={cn(
            "text-gray-600 mt-1",
            currentSize.subtitle
          )}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      {breadcrumb && (
        <div className="mb-4">
          {breadcrumb}
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-gray-600 mt-2">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex-shrink-0 ml-6">
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
