'use client'

import React from 'react'
import { Card, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonLoader() {
  return (
    <div className="h-full flex flex-col overflow-visible relative">
      {/* Premium Header Skeleton */}
      <div className="flex-shrink-0 bg-gradient-to-r from-white via-slate-50/30 to-white backdrop-blur-xl border-b border-slate-200/60 px-6 py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse">
                <div className="h-5 w-5 bg-slate-300 rounded"></div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 rounded-lg" />
                <Skeleton className="h-3 w-24 rounded-lg" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
            <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Skeleton className="h-4 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Premium Question Cards Skeleton */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-b from-slate-50/30 to-white">
        <div className="space-y-3">
          {/* Selection Bar Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-4 w-32 rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-6 rounded-lg" />
                <Skeleton className="h-3 w-6 rounded-lg" />
                <Skeleton className="h-3 w-6 rounded-lg" />
              </div>
            </div>
          </div>
          
          {/* Question Cards */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-pulse"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animationDuration: '2s'
                }}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-8 w-12 rounded-xl" />
                    <Skeleton className="h-8 w-20 rounded-xl" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <Skeleton className="h-9 w-9 rounded-xl" />
                  </div>
                </div>
                
                {/* Question Content */}
                <div className="mb-4 space-y-2">
                  <Skeleton className="h-5 w-full rounded-lg" />
                  <Skeleton className="h-5 w-4/5 rounded-lg" />
                  <Skeleton className="h-5 w-3/5 rounded-lg" />
                </div>
                
                {/* Metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-3 w-20 rounded-lg" />
                    </div>
                    <Skeleton className="h-3 w-24 rounded-lg" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-16 rounded-xl" />
                    <Skeleton className="h-7 w-14 rounded-xl" />
                    <Skeleton className="h-7 w-18 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Pagination Skeleton */}
      <div className="flex-shrink-0 bg-gradient-to-r from-white via-slate-50/50 to-white border-t border-slate-200/60 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Skeleton className="h-4 w-20 rounded-lg" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-8 rounded-lg" />
              <Skeleton className="h-10 w-20 rounded-xl" />
              <Skeleton className="h-3 w-8 rounded-lg" />
            </div>
          </div>
          
          <div className="p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
