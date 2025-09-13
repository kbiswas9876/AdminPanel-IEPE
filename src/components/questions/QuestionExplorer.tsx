'use client'

import React from 'react'
import { useQuestionsData } from '@/hooks/useQuestionsData'
import { useFilterStore } from '@/stores/filterStore'
import { QuestionCard } from './QuestionCard'
import { SkeletonLoader } from './SkeletonLoader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  RefreshCw, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'

export function QuestionExplorer() {
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

  const { setPage } = useFilterStore()

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

  const renderPaginationButton = (page: number, icon?: React.ReactNode, label?: string) => {
    const isActive = page === currentPage
    const isDisabled = page < 1 || page > totalPages

    return (
      <Button
        variant={isActive ? "default" : "outline"}
        size="sm"
        onClick={() => goToPage(page)}
        disabled={isDisabled}
        className="min-w-[40px]"
      >
        {icon || label || page}
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            Questions ({total.toLocaleString()})
          </h2>
          {isFetching && (
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {startItem.toLocaleString()}-{endItem.toLocaleString()} of {total.toLocaleString()}
          </span>
          <Button 
            onClick={() => refetch()} 
            variant="ghost" 
            size="sm"
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid gap-4">
        {questions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {/* First page */}
            {renderPaginationButton(1, <ChevronsLeft className="h-4 w-4" />)}
            
            {/* Previous page */}
            {renderPaginationButton(currentPage - 1, <ChevronLeft className="h-4 w-4" />)}
            
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
                pages.push(renderPaginationButton(i))
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
            {renderPaginationButton(currentPage + 1, <ChevronRight className="h-4 w-4" />)}
            
            {/* Last page */}
            {renderPaginationButton(totalPages, <ChevronsRight className="h-4 w-4" />)}
          </div>
        </div>
      )}
    </div>
  )
}
