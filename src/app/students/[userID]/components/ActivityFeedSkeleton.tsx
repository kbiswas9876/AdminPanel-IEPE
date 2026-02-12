'use client'

export function ActivityFeedSkeleton() {
  return (
    <div className="space-y-4">
      {/* Date Header Skeleton */}
      <div className="mb-6">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-6 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>

      {/* Activity Cards Skeleton */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
        >
          <div className="flex items-start gap-4">
            {/* Icon Circle */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200" />
            
            {/* Content */}
            <div className="flex-1 space-y-3">
              {/* Title and Badge */}
              <div className="flex items-center justify-between">
                <div className="h-5 w-48 bg-gray-200 rounded" />
                <div className="h-5 w-20 bg-gray-100 rounded" />
              </div>
              
              {/* Subtitle */}
              <div className="h-4 w-32 bg-gray-100 rounded" />
              
              {/* Stats Bar */}
              <div className="flex items-center gap-4 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-px bg-gray-200" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-px bg-gray-200" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
              
              {/* Timestamp */}
              <div className="h-3 w-28 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

