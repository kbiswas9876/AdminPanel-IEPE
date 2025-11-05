'use client'

import React from 'react'
import { CheckCircle2, Clock, Users } from 'lucide-react'

interface TestProgressData {
  total_taken: number
  submitted: number
  in_progress: number
}

interface TestProgressCardProps {
  progress?: TestProgressData
  isLoading?: boolean
}

export function TestProgressCard({ progress, isLoading }: TestProgressCardProps) {
  // Show loading skeleton if data is not available
  if (isLoading || !progress) {
    return (
      <div className="py-4 border-t border-gray-100">
        <div className="space-y-3">
          <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex items-center gap-4 text-sm">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate percentages for the progress bar
  const total = progress.total_taken || 0
  const submittedPercent = total > 0 ? (progress.submitted / total) * 100 : 0
  const inProgressPercent = total > 0 ? (progress.in_progress / total) * 100 : 0

  // If no one has taken the test yet, show a message
  if (total === 0) {
    return (
      <div className="py-4 border-t border-gray-100">
        <div className="text-center py-3">
          <p className="text-sm text-gray-500">No attempts yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4 border-t border-gray-100">
      <div className="space-y-3">
        {/* Progress Bar */}
        <div className="relative">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full flex">
              {/* Submitted segment (Green) */}
              {submittedPercent > 0 && (
                <div
                  className="bg-green-500 transition-all duration-300"
                  style={{ width: `${submittedPercent}%` }}
                  title={`${progress.submitted} submitted`}
                />
              )}
              {/* In Progress segment (Blue) */}
              {inProgressPercent > 0 && (
                <div
                  className="bg-blue-500 transition-all duration-300"
                  style={{ width: `${inProgressPercent}%` }}
                  title={`${progress.in_progress} in progress`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          {/* Submitted count */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700 font-medium">
              {progress.submitted} Submitted
            </span>
          </div>

          {/* In Progress count */}
          {progress.in_progress > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">
                {progress.in_progress} In Progress
              </span>
            </div>
          )}

          {/* Total count */}
          <div className="flex items-center gap-2 ml-auto">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {total} Total
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}



