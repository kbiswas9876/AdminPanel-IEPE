'use client'

import { useState, useEffect } from 'react'
import { CompactFilterBar } from '../content/compact-filter-bar'
import { ExpandableQuestionList } from '../content/expandable-question-list'
import { useQuestions } from '@/lib/contexts/questions-context'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
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
  onQuestionAction?: (question: Question, action: string) => void
  
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
  
  // Staged questions (for import review)
  stagedQuestions?: Question[]
  
  // Editing state
  editingQuestionId?: number | null
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
  stagedQuestions,
  editingQuestionId = null,
}: QuestionExplorerProps) {
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [filteredTotal, setFilteredTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Use questions context for caching
  const { 
    questions: cachedQuestions, 
    totalCount: cachedTotalCount,
    isLoading: contextLoading,
    error: contextError,
    fetchQuestions,
    refreshQuestions,
    isStale,
    getCachedQuestions
  } = useQuestions()

  // Use staged questions if provided, otherwise use filtered questions or cached questions
  const displayQuestions = stagedQuestions || filteredQuestions.length > 0 ? filteredQuestions : cachedQuestions
  const displayTotal = stagedQuestions ? stagedQuestions.length : (filteredQuestions.length > 0 ? filteredTotal : cachedTotalCount)
  
  // Pass cached questions as filteredData when no filters are applied to ensure expanded state preservation
  const effectiveFilteredData = stagedQuestions ? undefined : (filteredQuestions.length > 0 ? filteredQuestions : cachedQuestions)
  const effectiveFilteredTotal = stagedQuestions ? undefined : (filteredQuestions.length > 0 ? filteredTotal : cachedTotalCount)
  
  // Load cached questions on mount if not using staged questions and no filters applied
  useEffect(() => {
    if (!stagedQuestions && filteredQuestions.length === 0 && cachedQuestions.length === 0) {
      fetchQuestions()
    }
  }, [stagedQuestions, filteredQuestions.length, cachedQuestions.length, fetchQuestions])

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
    // Refresh the cached questions
    refreshQuestions()
  }
  
  const handleManualRefresh = async () => {
    setRefreshKey(prev => prev + 1)
    setFilteredQuestions([])
    setFilteredTotal(0)
    await refreshQuestions()
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
          {!stagedQuestions && (
            <div className="flex items-center gap-2">
              {isStale() && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  Data may be outdated
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={contextLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${contextLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Compact Filter Bar - Only show if not using staged questions */}
      {!stagedQuestions && (
        <div className="flex-shrink-0 mb-4">
          <CompactFilterBar 
            onFiltersApplied={handleFiltersApplied}
            onLoadingChange={handleLoadingChange}
          />
        </div>
      )}

      {/* Expandable Question List - Flexible Height with Scrolling */}
      <div className="flex-1 min-h-0">
        <ExpandableQuestionList 
          key={refreshKey}
          filteredData={effectiveFilteredData}
          filteredTotal={effectiveFilteredTotal}
          loading={loading || contextLoading}
          error={error || contextError}
          onQuestionDeleted={handleQuestionDeleted}
          actionType={actionType}
          onQuestionAction={handleQuestionAction}
          multiSelect={multiSelect}
          selectedQuestions={selectedQuestions}
          onSelectionChange={onSelectionChange}
          onMultiSelect={handleMultiSelect}
          onBulkDelete={handleBulkDelete}
          isStagedMode={!!stagedQuestions}
          editingQuestionId={editingQuestionId}
        />
      </div>
    </div>
  )
}
