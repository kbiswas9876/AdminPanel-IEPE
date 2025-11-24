'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { toast } from 'sonner'

export function QuestionExplorer() {
  const router = useRouter()
  const { 
    questions, 
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

  const { setPage, setPageSize } = useFilterStore()
  
  // Selection state
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  // Selection helpers
  const isAllSelected = questions.length > 0 && selectedQuestions.size === questions.length
  const isPartiallySelected = selectedQuestions.size > 0 && selectedQuestions.size < questions.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedQuestions(new Set())
    } else {
      setSelectedQuestions(new Set(questions.map(q => q.id).filter(id => id !== undefined)))
    }
  }

  const handleSelectQuestion = (questionId: number) => {
    const newSelected = new Set(selectedQuestions)
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId)
    } else {
      newSelected.add(questionId)
    }
    setSelectedQuestions(newSelected)
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

  if (isLoading) {
    return <SkeletonLoader />
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load questions. {error?.message || 'Unknown error occurred.'}
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

  const renderPaginationButton = (page: number, icon?: React.ReactNode, label?: string, key?: string) => {
    const isActive = page === currentPage
    const isDisabled = page < 1 || page > totalPages

    return (
      <Button
        key={key || `btn-${page}`}
        variant={isActive ? "default" : "outline"}
        size="sm"
        onClick={() => goToPage(page)}
        disabled={isDisabled}
        className={`h-8 w-8 p-0 transition-all duration-200 ${
          isActive 
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
            : 'border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 hover:text-blue-800'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
      >
        {icon || label || page}
      </Button>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Ultra-Compact Results Header */}
      <div className="flex-shrink-0 flex items-center justify-between py-2 px-3 border-b bg-gray-50/50">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold">
            Questions ({total.toLocaleString()})
          </h2>
          {isFetching && (
            <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
          
          {/* Selection Controls */}
          {questions.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-7 px-2 text-xs"
              >
                {isAllSelected ? (
                  <CheckSquare className="h-3 w-3 mr-1" />
                ) : isPartiallySelected ? (
                  <CheckSquare className="h-3 w-3 mr-1 opacity-50" />
                ) : (
                  <Square className="h-3 w-3 mr-1" />
                )}
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </Button>
              
              {selectedQuestions.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="h-7 px-2 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {isDeleting ? 'Deleting...' : `Delete (${selectedQuestions.size})`}
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {startItem.toLocaleString()}-{endItem.toLocaleString()} of {total.toLocaleString()}
          </span>
          <Button 
            onClick={() => refetch()} 
            variant="ghost" 
            size="sm"
            disabled={isFetching}
            className="h-7 w-7 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Questions Table */}
      {questions.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          <CompactQuestionTable
            questions={questions}
            selectedQuestions={selectedQuestions}
            onSelectQuestion={handleSelectQuestion}
            onSelectAll={handleSelectAll}
            onQuestionUpdate={(_updatedQuestion) => {
              // Handle question update if needed
              refetch()
            }}
            isAllSelected={isAllSelected}
            isPartiallySelected={isPartiallySelected}
          />
        </div>
      ) : (
        /* No Questions Found State */
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Questions Found
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {isLoading ? (
              "Loading questions..."
            ) : hasActiveFilters ? (
              "No questions match your current filters. Try adjusting your search criteria or clearing the filters."
            ) : (
              "You haven't added any questions yet. Start by adding your first question or importing questions in bulk."
            )}
          </p>
          <div className="flex gap-3">
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={() => {
                  // Clear all filters by reloading the page
                  window.location.reload()
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
            <Button 
              onClick={() => {
                router.push('/content/new')
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Question
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                router.push('/content/bulk-upload-new')
              }}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Bulk Import
            </Button>
          </div>
        </div>
      )}

      {/* Premium Pagination */}
      <div className="flex-shrink-0 flex items-center justify-between py-3 px-4 border-t bg-gradient-to-r from-gray-50 to-blue-50/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          
          {/* Clean Per Page Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Per Page:</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-8 w-16 text-xs font-medium bg-white border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                {pageSizeOptions.map(option => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-xs font-medium hover:bg-gray-50 focus:bg-gray-50 transition-colors duration-150"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 shadow-sm p-1">
            {/* First page */}
            {renderPaginationButton(1, <ChevronsLeft className="h-3 w-3" />, undefined, "first-page")}
            
            {/* Previous page */}
            {renderPaginationButton(currentPage - 1, <ChevronLeft className="h-3 w-3" />, undefined, "prev-page")}
            
            {/* Page numbers */}
            {(() => {
              const pages = []
              const maxVisiblePages = 5
              let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
              const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
              
              // Adjust start page if we're near the end
              if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1)
              }
              
              // Add ellipsis if needed
              if (startPage > 1) {
                pages.push(
                  <span key="ellipsis-start" className="px-2 text-muted-foreground">
                    ...
                  </span>
                )
              }
              
              // Add page numbers
              for (let i = startPage; i <= endPage; i++) {
                pages.push(renderPaginationButton(i, undefined, undefined, `page-${i}`))
              }
              
              // Add ellipsis if needed
              if (endPage < totalPages) {
                pages.push(
                  <span key="ellipsis-end" className="px-2 text-muted-foreground">
                    ...
                  </span>
                )
              }
              
              return pages
            })()}
            
            {/* Next page */}
            {renderPaginationButton(currentPage + 1, <ChevronRight className="h-3 w-3" />, undefined, "next-page")}
            
            {/* Last page */}
            {renderPaginationButton(totalPages, <ChevronsRight className="h-3 w-3" />, undefined, "last-page")}
          </div>
        )}
      </div>
    </div>
  )
}
