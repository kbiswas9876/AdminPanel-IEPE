'use client'

import { Skeleton } from '@/components/ui/skeleton'

interface UserTableSkeletonProps {
  rows?: number
  showCheckbox?: boolean
}

export function UserTableSkeleton({ rows = 5, showCheckbox = true }: UserTableSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
          {showCheckbox && (
            <Skeleton className="h-4 w-4 rounded" />
          )}
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function UserRowSkeleton({ showCheckbox = true }: { showCheckbox?: boolean }) {
  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg">
      {showCheckbox && (
        <Skeleton className="h-4 w-4 rounded" />
      )}
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-3 w-[150px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}