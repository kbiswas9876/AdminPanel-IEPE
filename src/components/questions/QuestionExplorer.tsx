'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useQuestionsData } from '@/hooks/useQuestionsData'
import { useFilterStore } from '@/stores/filterStore'
import { CompactQuestionTable } from './CompactQuestionTable'
import { SkeletonLoader } from './SkeletonLoader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  RefreshCw, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  CheckSquare,
  Square,
  FileQuestion,
  X,
  Plus,
  Upload,
  Settings
} from 'lucide-react'
import { deleteMultipleQuestions } from '@/lib/actions/questions'
import type { UIQuestion } from '@/lib/types'
import { toast } from 'sonner'

interface QuestionExplorerProps {
  selectedQuestions?: Set<number>
  onSelectQuestion?: (questionId: number) => void
  onSelectAll?: () => void
  isAllSelected?: boolean
  isPartiallySelected?: boolean
  showSelectionControls?: boolean
  questions?: UIQuestion[]
  loading?: boolean
  error?: string | null
}

export function QuestionExplorer({
  selectedQuestions: externalSelectedQuestions,
  onSelectQuestion: externalOnSelectQuestion,
  onSelectAll: externalOnSelectAll,
  isAllSelected: externalIsAllSelected,
  isPartiallySelected: externalIsPartiallySelected,
  showSelectionControls = false,
  questions: externalQuestions,
  loading: externalLoading,
  error: externalError
}: QuestionExplorerProps = {}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    questions: hookQuestions,
    total,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    hasActiveFilters,
    totalPages,
    currentPage,
    pageSize
  } = useQuestionsData()

  // Use external data if provided, otherwise use hook data
  const questions = externalQuestions || hookQuestions
  const loading = externalLoading !== undefined ? externalLoading : isLoading
  const errorState = externalError || error

  const { setPage, setPageSize } = useFilterStore()
  
  // Selection state - use external if provided, otherwise internal
  const [internalSelectedQuestions, setInternalSelectedQuestions] = useState<Set<number>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  
  const selectedQuestions = externalSelectedQuestions || internalSelectedQuestions
  const setSelectedQuestions = externalOnSelectQuestion ? 
    (newSet: Set<number>) => {
      // If external handler provided, call it for each question
      if (externalOnSelectQuestion) {
        newSet.forEach(id => externalOnSelectQuestion(id))
      }
    } : 
    setInternalSelectedQuestions
  
  // State for preserving context after edit
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null)
  const [shouldPreserveContext, setShouldPreserveContext] = useState(false)

  // Selection helpers
  const isAllSelected = externalIsAllSelected !== undefined ? externalIsAllSelected : (questions.length > 0 && selectedQuestions.size === questions.length)
  const isPartiallySelected = externalIsPartiallySelected !== undefined ? externalIsPartiallySelected : (selectedQuestions.size > 0 && selectedQuestions.size < questions.length)

  const handleSelectAll = () => {
    if (externalOnSelectAll) {
      externalOnSelectAll()
    } else {
      if (isAllSelected) {
        setInternalSelectedQuestions(new Set())
      } else {
        const ids = (questions as UIQuestion[]).map((q) => q.id).filter((id): id is number => id !== undefined)
        setInternalSelectedQuestions(new Set(ids))
      }
    }
  }

  const handleSelectQuestion = (questionId: number) => {
    if (externalOnSelectQuestion) {
      externalOnSelectQuestion(questionId)
    } else {
      const newSelected = new Set(selectedQuestions)
      if (newSelected.has(questionId)) {
        newSelected.delete(questionId)
      } else {
        newSelected.add(questionId)
      }
      setInternalSelectedQuestions(newSelected)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedQuestions.size === 0) {
      toast.error('No questions selected for deletion')
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteMultipleQuestions(Array.from(selectedQuestions))
      
      if (result.success) {
        toast.success(result.message)
        setSelectedQuestions(new Set())
        refetch() // Refresh the questions list
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error deleting questions:', error)
      toast.error('Failed to delete questions')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return <SkeletonLoader />
  }

  if (isError || errorState) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {(() => {
              const msg = typeof errorState === 'string' 
                ? errorState 
                : (error instanceof Error ? error.message : 'Failed to load questions. Unknown error occurred.')
              return <>Failed to load questions. {msg}</>
            })()}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {hasActiveFilters ? 'No questions found' : 'No questions available'}
        </h3>
        <p className="text-muted-foreground mb-4">
          {hasActiveFilters 
            ? 'Try adjusting your filters or search terms to find more questions.'
            : 'There are no questions in the database yet.'
          }
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  // Pagination helpers
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, total)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPage(page)
    }
  }

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize, 10))
  }

  const pageSizeOptions = [
    { value: '5', label: '5' },
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '30', label: '30' },
    { value: '50', label: '50' },
    { value: '100', label: '100' }
  ]


  return (
    <div className="h-full flex flex-col overflow-visible relative">
      {/* Premium Mobile-Optimized Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-white via-slate-50/30 to-white backdrop-blur-xl border-b border-slate-200/60 px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                <FileQuestion className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent truncate">
                  Question Library
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 truncate">
                  {total.toLocaleString()} {total === 1 ? 'question' : 'questions'} available
                </p>
              </div>
            </div>
            {isFetching && (
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-50 rounded-full border border-blue-100">
                <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin text-blue-600" />
                <span className="text-xs font-medium text-blue-700 hidden sm:inline">Updating...</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Selection Controls - Always show when questions exist */}
            {questions.length > 0 && (
              <div className="flex items-center gap-1 sm:gap-2 p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-10 sm:h-9 px-3 sm:px-3 text-sm font-medium hover:bg-slate-100 rounded-lg transition-all duration-200 touch-target flex-1 sm:flex-initial"
                >
                  {isAllSelected ? (
                    <CheckSquare className="h-4 w-4 mr-1.5 sm:mr-2 text-blue-600" />
                  ) : isPartiallySelected ? (
                    <CheckSquare className="h-4 w-4 mr-1.5 sm:mr-2 opacity-50" />
                  ) : (
                    <Square className="h-4 w-4 mr-1.5 sm:mr-2" />
                  )}
                  <span className="hidden xs:inline">{isAllSelected ? 'Deselect All' : 'Select All'}</span>
                  <span className="xs:hidden">{isAllSelected ? 'Deselect' : 'Select'}</span>
                </Button>
                
                {selectedQuestions.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                    className="h-10 sm:h-9 px-3 sm:px-3 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 shadow-lg shadow-red-500/25 touch-target flex-1 sm:flex-initial"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5 sm:mr-2" />
                    <span className="hidden xs:inline">{isDeleting ? 'Deleting...' : `Delete ${selectedQuestions.size}`}</span>
                    <span className="xs:hidden">{isDeleting ? '...' : selectedQuestions.size}</span>
                  </Button>
                )}
              </div>
            )}
            
            {/* Status Info */}
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm ml-auto">
              <div className="text-xs font-medium text-slate-600 text-center sm:text-left">
                <span className="hidden sm:inline">{startItem.toLocaleString()}-{endItem.toLocaleString()} of {total.toLocaleString()}</span>
                <span className="sm:hidden">{currentPage}/{totalPages}</span>
              </div>
              <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>
              <Button 
                onClick={() => refetch()} 
                variant="ghost" 
                size="sm"
                disabled={isFetching}
                className="h-9 w-9 p-0 hover:bg-slate-100 rounded-lg transition-all duration-200 touch-target"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin text-blue-600' : 'text-slate-500 hover:text-slate-700'}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Mobile-Optimized Questions Display */}
      {questions.length > 0 ? (
        <div className="flex-1 overflow-y-auto px-0 py-4 bg-gradient-to-b from-slate-50/30 to-white">
          <div className="max-w-full">
            <CompactQuestionTable
              questions={questions}
              selectedQuestions={selectedQuestions}
              onSelectQuestion={handleSelectQuestion}
              onSelectAll={handleSelectAll}
              onQuestionUpdate={(updatedQuestion) => {
                // CRITICAL FIX: Context-aware state invalidation
                setExpandedQuestionId(updatedQuestion.id || null)
                setShouldPreserveContext(true)
                
                // Invalidate the specific query for the current page
                // This forces a re-fetch of the correct, sorted data for the page the user is on
                queryClient.invalidateQueries({
                  queryKey: ['questions'],
                  exact: false
                }).then(() => {
                  setShouldPreserveContext(false)
                })
              }}
              isAllSelected={isAllSelected}
              isPartiallySelected={isPartiallySelected}
              expandedQuestionId={expandedQuestionId}
              shouldPreserveContext={shouldPreserveContext}
            />
          </div>
        </div>
      ) : (
        /* Premium Empty State with Apple-inspired design */
        <div className="flex-1 flex flex-col items-center justify-center px-0 py-20 bg-gradient-to-b from-slate-50/30 to-white">
          <div className="max-w-md mx-auto text-center">
            {/* Animated Icon */}
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mb-4 mx-auto shadow-xl shadow-slate-300/20 backdrop-blur-sm border border-white/50">
                <FileQuestion className="h-12 w-12 text-slate-400" />
              </div>
              {/* Floating elements for visual interest */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full shadow-lg shadow-blue-400/30 animate-pulse"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full shadow-lg shadow-purple-400/30 animate-pulse delay-700"></div>
            </div>
            
            <h3 className="text-2xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
              {hasActiveFilters ? 'No matching questions' : 'Your question library awaits'}
            </h3>
            <p className="text-slate-600 leading-relaxed mb-8">
              {isLoading ? (
                "Loading your questions..."
              ) : hasActiveFilters ? (
                "We couldn't find any questions matching your current filters. Try adjusting your search criteria or start fresh."
              ) : (
                "Transform your content creation with our intuitive question management system. Start building your library today."
              )}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    window.location.reload()
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 rounded-xl font-medium text-slate-700 shadow-sm hover:shadow transition-all duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear all filters
                </Button>
              )}
              <Button 
                onClick={() => router.push('/content/new')}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-700/25 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create your first question
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/content/bulk-upload-new')}
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 rounded-xl font-medium text-slate-700 shadow-sm hover:shadow transition-all duration-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import in bulk
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Apple-Inspired Mobile-Optimized Pagination */}
      {questions.length > 0 && (
        <div className="flex-shrink-0 bg-gradient-to-r from-white via-slate-50/50 to-white border-t border-slate-200/60 px-0 py-1.5 sm:py-2 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            {/* Page Info */}
            <div className="flex flex-col xs:flex-row items-center gap-2 xs:gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2 xs:py-2.5 bg-white rounded-xl xs:rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm"></div>
                <span className="text-xs xs:text-sm font-medium text-slate-700">
                  <span className="hidden xs:inline">Page {currentPage} of {totalPages}</span>
                  <span className="xs:hidden">{currentPage}/{totalPages}</span>
                </span>
              </div>
              
              {/* Items per page */}
              <div className="flex items-center gap-2 xs:gap-3">
                <span className="text-xs xs:text-sm font-medium text-slate-600 hidden xs:inline">Show</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="h-9 xs:h-10 w-16 xs:w-20 text-xs xs:text-sm font-medium bg-white border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200 shadow-sm touch-target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-2xl p-1">
                    {pageSizeOptions.map(option => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="text-xs xs:text-sm font-medium hover:bg-slate-50 focus:bg-slate-50 rounded-xl transition-colors duration-150 m-1 touch-target"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs xs:text-sm font-medium text-slate-600 hidden xs:inline">items</span>
              </div>
            </div>
            
            {/* Mobile-Optimized Navigation Controls */}
            <div className="flex items-center gap-1 xs:gap-2 p-1 xs:p-1.5 bg-white rounded-xl xs:rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
              {/* First page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="h-9 w-9 xs:h-10 xs:w-10 p-0 rounded-lg xs:rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-all duration-200 touch-target flex-shrink-0"
              >
                <ChevronsLeft className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
              </Button>
              
              {/* Previous page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 w-9 xs:h-10 xs:w-10 p-0 rounded-lg xs:rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-all duration-200 touch-target flex-shrink-0"
              >
                <ChevronLeft className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
              </Button>
              
              {/* Mobile-Optimized Page numbers */}
              <div className="flex items-center gap-0.5 xs:gap-1">
                {(() => {
                  const pages = []
                  // Reduce visible pages on mobile
                  const maxVisiblePages = 5
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
                  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
                  
                  // Adjust start page if we're near the end
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1)
                  }
                  
                  // Add ellipsis if needed
                  if (startPage > 2) {
                    pages.push(
                      <Button
                        key="page-1"
                        variant="ghost"
                        size="sm"
                        onClick={() => goToPage(1)}
                        className="h-9 w-9 xs:h-10 xs:w-10 p-0 rounded-lg xs:rounded-xl hover:bg-slate-100 text-xs xs:text-sm font-medium transition-all duration-200 touch-target flex-shrink-0"
                      >
                        1
                      </Button>
                    )
                    if (startPage > 3) {
                      pages.push(
                        <span key="ellipsis-start" className="px-1 text-slate-400 text-xs font-medium">
                          •••
                        </span>
                      )
                    }
                  }
                  
                  // Add page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    const isActive = i === currentPage
                    pages.push(
                      <Button
                        key={`page-${i}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => goToPage(i)}
                        className={`h-9 w-9 xs:h-10 xs:w-10 p-0 rounded-lg xs:rounded-xl text-xs xs:text-sm font-medium transition-all duration-200 touch-target flex-shrink-0 ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25 hover:shadow-xl' 
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        {i}
                      </Button>
                    )
                  }
                  
                  // Add ellipsis if needed
                  if (endPage < totalPages - 1) {
                    if (endPage < totalPages - 2) {
                      pages.push(
                        <span key="ellipsis-end" className="px-1 text-slate-400 text-xs font-medium">
                          •••
                        </span>
                      )
                    }
                    pages.push(
                      <Button
                        key={`page-${totalPages}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => goToPage(totalPages)}
                        className="h-9 w-9 xs:h-10 xs:w-10 p-0 rounded-lg xs:rounded-xl hover:bg-slate-100 text-xs xs:text-sm font-medium transition-all duration-200 touch-target flex-shrink-0"
                      >
                        {totalPages}
                      </Button>
                    )
                  }
                  
                  return pages
                })()}
              </div>
              
              {/* Next page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 w-9 xs:h-10 xs:w-10 p-0 rounded-lg xs:rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-all duration-200 touch-target flex-shrink-0"
              >
                <ChevronRight className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
              </Button>
              
              {/* Last page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-9 w-9 xs:h-10 xs:w-10 p-0 rounded-lg xs:rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-all duration-200 touch-target flex-shrink-0"
              >
                <ChevronsRight className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
