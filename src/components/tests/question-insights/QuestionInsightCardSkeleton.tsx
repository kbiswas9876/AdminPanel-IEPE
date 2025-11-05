'use client'

import React from 'react'

export default function QuestionInsightCardSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm animate-pulse">
      {/* Question Number */}
      <div className="mb-4">
        <div className="h-8 w-16 bg-slate-200 rounded-md mb-3"></div>
        {/* Question Text Lines */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-4/6"></div>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-lg border border-slate-200"></div>
        ))}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
        <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
      </div>

      {/* Statistics */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-4">
          <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
          <div className="h-8 w-28 bg-slate-200 rounded-lg"></div>
          <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
          <div className="h-8 w-36 bg-slate-200 rounded-lg"></div>
          <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-200 rounded-full mb-2"></div>
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-slate-200 rounded"></div>
        <div className="h-4 w-20 bg-slate-200 rounded"></div>
      </div>
    </div>
  )
}

