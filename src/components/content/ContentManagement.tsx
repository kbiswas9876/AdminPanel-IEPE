'use client'

import React from 'react'
import { FilterBar } from '@/components/filters/FilterBar'
import { QuestionExplorer } from '@/components/questions/QuestionExplorer'
import { useFilterSync } from '@/hooks/useFilterSync'

export function ContentManagement() {
  // Initialize URL synchronization
  useFilterSync()

  return (
    <div className="h-full flex flex-col">
      <div className="mx-auto w-full max-w-7xl px-8 flex-1 flex flex-col gap-6">
        <div className="flex-shrink-0">
          <FilterBar />
        </div>
        <div className="flex-1 min-h-0">
          <QuestionExplorer />
        </div>
      </div>
    </div>
  )
}
