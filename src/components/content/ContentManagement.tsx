'use client'

import React from 'react'
import { FilterBar } from '@/components/filters/FilterBar'
import { QuestionExplorer } from '@/components/questions/QuestionExplorer'
import { useFilterSync } from '@/hooks/useFilterSync'

export function ContentManagement() {
  // Initialize URL synchronization
  useFilterSync()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground">
          Browse and manage questions with advanced filtering options.
        </p>
      </div>

      <FilterBar />
      <QuestionExplorer />
    </div>
  )
}
