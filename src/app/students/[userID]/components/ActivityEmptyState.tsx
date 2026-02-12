'use client'

import { Clock } from 'lucide-react'

export function ActivityEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {/* Icon Circle */}
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Clock className="h-8 w-8 text-gray-400" />
      </div>
      
      {/* Heading */}
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        No activities yet
      </h3>
      
      {/* Description */}
      <p className="text-sm text-gray-500 max-w-xs">
        Activity will appear here once the student starts practicing or taking tests.
      </p>
    </div>
  )
}

