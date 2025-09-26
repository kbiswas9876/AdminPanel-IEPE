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
import { CompactQuestionList } from '../questions/CompactQuestionList'
import { QuestionPreviewPanel } from '../questions/QuestionPreviewPanel'
import { useQuestionsData } from '@/hooks/useQuestionsData'
import { useFilterStore } from '@/stores/filterStore'
import { searchQuestions } from '@/lib/actions/tests'
import type { Question, UIQuestion } from '@/lib/types'
import { Check, X, Filter, FileQuestion, RefreshCw, List, Eye } from 'lucide-react'
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
  const [activeQuestion, setActiveQuestion] = useState<UIQuestion | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'preview'>('list')
  
  // Use the filter store and questions data hook
  const { 
    questions, 
    isLoading, 
    error, 
    total, 
    totalPages, 
    currentPage, 
    pageSize, 
    isFetching,
    refetch
  } = useQuestionsData()

  // Reset selection when modal opens
  useEffect(() => {
    if (open) {
      setSelectedQuestions(new Set())
      setActiveQuestion(null)
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

  const handleQuestionClick = (question: UIQuestion) => {
    setActiveQuestion(question)
    // On mobile, switch to preview view when a question is selected
    if (window.innerWidth < 1024) {
      setMobileView('preview')
    }
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
        <DialogHeader className="p-6 pb-4 border-b border-slate-200/60 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                <FileQuestion className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {title}
                </DialogTitle>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-slate-600">
                    {total.toLocaleString()} {total === 1 ? 'question' : 'questions'} available
                  </span>
                  {multiSelect && selectedQuestions.size > 0 && (
                    <>
                      <span className="text-slate-400">•</span>
                      <span className="text-sm font-medium text-blue-600">
                        {selectedQuestions.size} selected
                      </span>
                    </>
                  )}
                  {isFetching && (
                    <>
                      <span className="text-slate-400">•</span>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
                        <span className="text-xs text-blue-600">Updating...</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile View Toggle */}
              <div className="lg:hidden flex items-center bg-white rounded-xl border border-slate-200 shadow-sm p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileView('list')}
                  className={`h-8 px-3 rounded-lg transition-all duration-200 ${
                    mobileView === 'list' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileView('preview')}
                  className={`h-8 px-3 rounded-lg transition-all duration-200 ${
                    mobileView === 'preview' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 rounded-xl font-medium text-slate-700 shadow-sm hover:shadow transition-all duration-200"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-10 w-10 rounded-xl hover:bg-slate-100 transition-all duration-200 flex items-center justify-center group"
              >
                <X className="h-5 w-5 text-slate-500 group-hover:text-slate-700 transition-colors duration-200" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Filter Bar */}
          {showFilters && (
            <div className="flex-shrink-0 border-b border-slate-200/60 bg-white">
              <div className="w-full">
                <FilterBar compact />
              </div>
            </div>
          )}

          {/* Question Library Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-900">Question Library</h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-8 px-3 text-sm font-medium hover:bg-slate-100 rounded-lg transition-all duration-200"
                  >
                    {isAllSelected ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              </div>
              <div className="text-sm text-slate-600">
                {currentPage > 0 && totalPages > 0 && (
                  <span>Page {currentPage} of {totalPages}</span>
                )}
              </div>
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="flex-1 flex min-h-0 lg:flex-row flex-col">
            {/* Left Panel - Question List (50% on large screens, full width on mobile) */}
            <div className={`lg:w-1/2 w-full lg:border-r border-b lg:border-b-0 border-slate-200/60 flex flex-col ${
              mobileView === 'list' ? 'lg:flex flex' : 'lg:flex hidden'
            }`}>
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading questions...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="text-red-500 mb-4">
                      <X className="h-8 w-8 mx-auto" />
                    </div>
                    <p className="text-red-600 mb-4">Failed to load questions</p>
                    <Button onClick={() => refetch()} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : questions.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="text-slate-400 mb-4">
                      <FileQuestion className="h-8 w-8 mx-auto" />
                    </div>
                    <p className="text-slate-600">No questions found</p>
                  </div>
                </div>
              ) : (
                <CompactQuestionList
                  questions={questions}
                  selectedQuestions={selectedQuestions}
                  onSelectQuestion={handleSelectQuestion}
                  onQuestionClick={handleQuestionClick}
                  activeQuestionId={activeQuestion?.id}
                  totalPages={totalPages}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  total={total}
                  onPageChange={(page) => {
                    // Use the filter store to change page
                    const { setPage } = useFilterStore.getState()
                    setPage(page)
                  }}
                />
              )}
            </div>

            {/* Right Panel - Question Preview (50% on large screens, full width on mobile) */}
            <div className={`lg:w-1/2 w-full lg:h-full h-1/2 flex flex-col ${
              mobileView === 'preview' ? 'lg:flex flex' : 'lg:flex hidden'
            }`}>
              <QuestionPreviewPanel 
                question={activeQuestion}
                onEdit={(question) => {
                  // Handle edit - could open edit modal or navigate
                  console.log('Edit question:', question.id)
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-slate-200/60 bg-gradient-to-r from-white via-slate-50/30 to-white">
          <div className="flex items-center gap-2">
            {selectedQuestions.size > 0 && (
              <span className="text-sm text-slate-600">
                {selectedQuestions.size} question{selectedQuestions.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 rounded-xl font-medium text-slate-700 shadow-sm hover:shadow transition-all duration-200"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            
            <Button
              onClick={handleConfirmSelection}
              disabled={selectedQuestions.size === 0 || (!multiSelect && selectedQuestions.size > 1)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-700/25 transition-all duration-200"
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
