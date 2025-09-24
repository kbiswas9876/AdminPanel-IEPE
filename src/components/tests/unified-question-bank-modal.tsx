'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { QuestionExplorer } from '../questions/QuestionExplorer'
import { useQuestionsData } from '@/hooks/useQuestionsData'
import { useFilterStore } from '@/stores/filterStore'
import { searchQuestions } from '@/lib/actions/tests'
import type { Question } from '@/lib/types'
import { Check, X, Filter } from 'lucide-react'
import { FilterBar } from '@/components/filters/FilterBar'

interface UnifiedQuestionBankModalProps {
  open: boolean
  onClose: () => void
  onSelect?: (question: Question) => void
  onSelectMultiple?: (questions: Question[]) => void
  initialChapter?: string
  multiSelect?: boolean
  title?: string
}

export function UnifiedQuestionBankModal({ 
  open, 
  onClose, 
  onSelect,
  onSelectMultiple,
  initialChapter,
  multiSelect = false,
  title = "Master Question Bank"
}: UnifiedQuestionBankModalProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  
  // Use the filter store and questions data hook
  const { questions, isLoading, error } = useQuestionsData()

  // Reset selection when modal opens
  useEffect(() => {
    if (open) {
      setSelectedQuestions(new Set())
    }
  }, [open])

  const handleSelectQuestion = (questionId: number) => {
    const newSelected = new Set(selectedQuestions)
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId)
    } else {
      newSelected.add(questionId)
    }
    setSelectedQuestions(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set())
    } else {
      setSelectedQuestions(new Set(questions.map(q => q.id).filter(id => id !== undefined)))
    }
  }

  const handleConfirmSelection = () => {
    if (multiSelect && onSelectMultiple) {
      const selectedQuestionsList = questions.filter(q => q.id !== undefined && selectedQuestions.has(q.id))
      onSelectMultiple(selectedQuestionsList)
    } else if (!multiSelect && onSelect && selectedQuestions.size === 1) {
      const selectedQuestion = questions.find(q => q.id !== undefined && selectedQuestions.has(q.id))
      if (selectedQuestion) {
        onSelect(selectedQuestion)
      }
    }
    onClose()
  }

  const isAllSelected = questions.length > 0 && selectedQuestions.size === questions.length
  const isPartiallySelected = selectedQuestions.size > 0 && selectedQuestions.size < questions.length

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="w-[98vw] sm:max-w-[98vw] lg:max-w-[98vw] h-[98vh] min-h-[900px] max-h-[1400px] flex flex-col p-0"
        showCloseButton={false}
      >
        <DialogHeader className="p-1.5 pb-1 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {title}
              {multiSelect && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({selectedQuestions.size} selected)
                </span>
              )}
            </DialogTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-9 w-9 rounded-xl hover:bg-gray-100 transition-all duration-200 flex items-center justify-center group"
              >
                <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Filter Bar */}
          {showFilters && (
            <div className="flex-shrink-0 border-b border-gray-200 bg-white">
              <div className="w-full">
                <FilterBar compact />
              </div>
            </div>
          )}

          {/* Questions Content */}
          <div className="flex-[3] overflow-y-auto min-h-[600px] p-1.5">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading questions...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-red-500 mb-4">
                    <X className="h-8 w-8 mx-auto" />
                  </div>
                  <p className="text-red-600 mb-4">Failed to load questions</p>
                </div>
              </div>
            ) : questions.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-gray-400 mb-4">
                    <Check className="h-8 w-8 mx-auto" />
                  </div>
                  <p className="text-gray-600">No questions found</p>
                </div>
              </div>
            ) : (
              <QuestionExplorer
                selectedQuestions={selectedQuestions}
                onSelectQuestion={handleSelectQuestion}
                onSelectAll={handleSelectAll}
                isAllSelected={isAllSelected}
                isPartiallySelected={isPartiallySelected}
                showSelectionControls={true}
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex items-center justify-between px-3 py-1.5 border-t bg-gray-50/50">
          <div className="flex items-center gap-2">
            {selectedQuestions.size > 0 && (
              <span className="text-sm text-gray-600">
                {selectedQuestions.size} question{selectedQuestions.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            
            <Button
              onClick={handleConfirmSelection}
              disabled={selectedQuestions.size === 0 || (!multiSelect && selectedQuestions.size > 1)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Check className="h-4 w-4" />
              {multiSelect ? 'Select Questions' : 'Select Question'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
