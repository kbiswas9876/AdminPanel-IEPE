'use client'

import { useState } from 'react'
import { CompactFilterBar } from '../content/compact-filter-bar'
import { ExpandableQuestionList } from '../content/expandable-question-list'
import type { Question } from '@/lib/types'

export type QuestionActionType = 'edit' | 'select' | 'select-multiple'

interface QuestionExplorerProps {
  // Action configuration
  actionType: QuestionActionType
  onQuestionSelect?: (question: Question) => void
  onQuestionSelectMultiple?: (questions: Question[]) => void
  onQuestionEdit?: (question: Question) => void
  onQuestionDelete?: (question: Question) => void
  onQuestionBulkDelete?: (questions: Question[]) => void
  
  // UI customization
  title?: string
  showHeader?: boolean
  className?: string
  
  // Multi-select configuration
  multiSelect?: boolean
  selectedQuestions?: Set<string | number>
  onSelectionChange?: (selected: Set<string | number>) => void
  
  // Initial state
  initialFilters?: {
    search?: string
    bookSources?: string[]
    chapters?: string[]
    difficulties?: string[]
    tags?: string[]
  }
}

export function QuestionExplorer({
  actionType,
  onQuestionSelect,
  onQuestionSelectMultiple,
  onQuestionEdit,
  onQuestionDelete,
  onQuestionBulkDelete,
  title = "Question Explorer",
  showHeader = true,
  className = "",
  multiSelect = false,
  selectedQuestions = new Set(),
  onSelectionChange,
}: QuestionExplorerProps) {
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [filteredTotal, setFilteredTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleFiltersApplied = (questions: Question[], total: number) => {
    setFilteredQuestions(questions)
    setFilteredTotal(total)
    setError(null)
  }

  const handleLoadingChange = (isLoading: boolean) => {
    setLoading(isLoading)
  }

  const handleQuestionDeleted = () => {
    // Trigger a refresh by updating the key
    setRefreshKey(prev => prev + 1)
    // Clear filtered data to show all questions again
    setFilteredQuestions([])
    setFilteredTotal(0)
  }

  // Handle different action types
  const handleQuestionAction = (question: Question, action: string) => {
    switch (action) {
      case 'select':
        onQuestionSelect?.(question)
        break
      case 'edit':
        onQuestionEdit?.(question)
        break
      case 'delete':
        onQuestionDelete?.(question)
        break
      default:
        console.warn('Unknown action:', action)
    }
  }

  // Handle multi-select actions
  const handleMultiSelect = (questions: Question[]) => {
    onQuestionSelectMultiple?.(questions)
  }

  // Handle bulk delete actions
  const handleBulkDelete = (questions: Question[]) => {
    onQuestionBulkDelete?.(questions)
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
      )}

      {/* Compact Filter Bar - Fixed Height */}
      <div className="flex-shrink-0 mb-4">
        <CompactFilterBar 
          onFiltersApplied={handleFiltersApplied}
          onLoadingChange={handleLoadingChange}
        />
      </div>

      {/* Expandable Question List - Flexible Height with Scrolling */}
      <div className="flex-1 min-h-0">
        <ExpandableQuestionList 
          key={refreshKey}
          filteredData={filteredQuestions}
          filteredTotal={filteredTotal}
          loading={loading}
          error={error}
          onQuestionDeleted={handleQuestionDeleted}
          actionType={actionType}
          onQuestionAction={handleQuestionAction}
          multiSelect={multiSelect}
          selectedQuestions={selectedQuestions}
          onSelectionChange={onSelectionChange}
          onMultiSelect={handleMultiSelect}
          onBulkDelete={handleBulkDelete}
        />
      </div>
    </div>
  )
}
