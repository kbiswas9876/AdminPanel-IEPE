'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface PremiumCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'glass'
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  onClick?: () => void
}

export function PremiumCard({
  children,
  className,
  variant = 'default',
  hover = true,
  padding = 'lg',
  rounded = '2xl',
  onClick
}: PremiumCardProps) {
  const baseClasses = "transition-all duration-300 ease-out transform-gpu"
  
  const variantClasses = {
    default: "bg-white border border-gray-200/60 shadow-sm",
    elevated: "bg-white border border-gray-200/60 shadow-lg shadow-gray-500/10",
    outlined: "bg-white border-2 border-gray-200 shadow-none",
    glass: "bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg"
  }
  
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6", 
    lg: "p-8",
    xl: "p-10"
  }
  
  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg", 
    xl: "rounded-xl",
    "2xl": "rounded-2xl"
  }

  const hoverClasses = hover ? "hover:shadow-xl hover:shadow-gray-500/15 hover:-translate-y-1" : ""
  const clickableClasses = onClick ? "cursor-pointer" : ""

  return (
    <div
      onClick={onClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        roundedClasses[rounded],
        hoverClasses,
        clickableClasses,
        className
      )}
    >
      {children}
    </div>
  )
}

// Specialized card components
interface SubjectCardProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  onClick: () => void
  questionsCount?: number
  className?: string
}

export function SubjectCard({ 
  title, 
  subtitle, 
  icon, 
  onClick, 
  questionsCount = 0,
  className 
}: SubjectCardProps) {
  return (
    <PremiumCard
      className={cn("cursor-pointer group", className)}
      onClick={onClick}
      hover={true}
      padding="lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {subtitle}
            </p>
            {questionsCount > 0 && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {questionsCount} questions available
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors duration-200">
            <svg className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>
      </div>
    </PremiumCard>
  )
}

interface EmptyStateCardProps {
  title: string
  description: string
  icon: React.ReactNode
  actionText?: string
  onAction?: () => void
  className?: string
}

export function EmptyStateCard({
  title,
  description,
  icon,
  actionText,
  onAction,
  className
}: EmptyStateCardProps) {
  return (
    <PremiumCard
      className={cn("text-center", className)}
      hover={false}
      padding="xl"
    >
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-6 max-w-sm">
          {description}
        </p>
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            {actionText}
          </button>
        )}
      </div>
    </PremiumCard>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  className
}: StatCardProps) {
  const trendColors = {
    up: "text-green-600 bg-green-100",
    down: "text-red-600 bg-red-100", 
    neutral: "text-gray-600 bg-gray-100"
  }

  return (
    <PremiumCard
      className={cn("relative overflow-hidden", className)}
      hover={true}
      padding="lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
          </p>
          {change && (
            <div className="mt-2">
              <span className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                trendColors[trend]
              )}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            {icon}
          </div>
        </div>
      </div>
    </PremiumCard>
  )
}
