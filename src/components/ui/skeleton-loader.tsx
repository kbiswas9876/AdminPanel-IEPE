'use client'

import { Card, CardContent } from '@/components/ui/card'

interface SkeletonLoaderProps {
  count?: number
}

export function SkeletonLoader({ count = 5 }: SkeletonLoaderProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-indigo-400/5 rounded-xl sm:rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 pointer-events-none"></div>
          <Card className="relative rounded-lg border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Skeleton for checkbox */}
                  <div className="mt-1 flex-shrink-0">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Skeleton for question text */}
                    <div className="space-y-2 mb-3 sm:mb-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                    
                    {/* Skeleton for badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                      <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                      <div className="h-6 bg-gray-200 rounded-full animate-pulse w-24"></div>
                      <div className="h-6 bg-gray-200 rounded-full animate-pulse w-18"></div>
                    </div>
                  </div>
                </div>
                
                {/* Skeleton for action buttons */}
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
