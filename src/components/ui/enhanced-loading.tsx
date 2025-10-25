'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  )
}

interface LoadingSkeletonProps {
  className?: string
  lines?: number
}

export function LoadingSkeleton({ className, lines = 1 }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded mb-2"
          style={{
            width: `${Math.random() * 40 + 60}%`
          }}
        />
      ))}
    </div>
  )
}

interface LoadingCardProps {
  className?: string
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn('animate-pulse bg-white rounded-lg border p-4', className)}>
      <div className="flex items-center space-x-3 mb-3">
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  )
}

interface LoadingTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function LoadingTable({ rows = 5, columns = 4, className }: LoadingTableProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-4 py-3 border-b last:border-b-0">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LoadingChartProps {
  className?: string
}

export function LoadingChart({ className }: LoadingChartProps) {
  return (
    <div className={cn('animate-pulse bg-white rounded-lg border p-4', className)}>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="h-48 bg-gray-100 rounded flex items-end justify-between px-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 rounded-t"
            style={{
              height: `${Math.random() * 60 + 20}%`,
              width: '12%'
            }}
          />
        ))}
      </div>
    </div>
  )
}

interface LoadingButtonProps {
  className?: string
  text?: string
}

export function LoadingButton({ className, text = 'Loading...' }: LoadingButtonProps) {
  return (
    <button
      disabled
      className={cn(
        'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md',
        'bg-blue-600 text-white cursor-not-allowed opacity-50',
        className
      )}
    >
      <LoadingSpinner size="sm" className="mr-2" />
      {text}
    </button>
  )
}
