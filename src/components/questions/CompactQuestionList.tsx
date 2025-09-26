'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronRight,
  BookOpen,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { UIQuestion } from '@/lib/types'
import { UniversalContentRenderer } from '@/components/editors/UniversalContentRenderer'

interface CompactQuestionListProps {
  questions: UIQuestion[]
  selectedQuestions: Set<number>
  onSelectQuestion: (questionId: number) => void
  onQuestionClick: (question: UIQuestion) => void
  activeQuestionId?: number | null
  // Pagination props
  totalPages?: number
  currentPage?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export function CompactQuestionList({
  questions,
  selectedQuestions,
  onSelectQuestion,
  onQuestionClick,
  activeQuestionId,
  totalPages,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange
}: CompactQuestionListProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'easy-moderate':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'moderate-hard':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Question List */}
      <div className="flex-1 overflow-y-auto space-y-2 p-4">
        {questions.map((question) => {
          if (!question.id) return null
          
          const isSelected = selectedQuestions.has(question.id)
          const isActive = activeQuestionId === question.id

          return (
            <div 
              key={question.id}
              className={cn(
                "group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer",
                isActive && "ring-2 ring-blue-500/30 border-blue-300 bg-blue-50/20",
                isSelected && "border-blue-300 bg-blue-50/10"
              )}
              onClick={() => onQuestionClick(question)}
            >
              {/* Selection indicator */}
              {isActive && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl"></div>
              )}
              
              <div className="p-4">
                {/* Top Row: Checkbox, ID, and Question Text */}
                <div className="flex items-start gap-3 mb-3">
                  {/* Selection Checkbox */}
                  <div 
                    className="flex-shrink-0 mt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelectQuestion(question.id!)}
                      className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  </div>
                  
                  {/* Question ID */}
                  <div className="flex-shrink-0">
                    <div className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-mono font-medium text-slate-600">
                      #{question.id}
                    </div>
                  </div>
                  
                  {/* Question Text */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 leading-relaxed line-clamp-2 group-hover:text-blue-700 transition-colors duration-200">
                      <UniversalContentRenderer text={question.question_text} />
                    </div>
                  </div>
                  
                  {/* Navigation Arrow */}
                  <div className="flex-shrink-0 mt-1">
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors duration-200" />
                  </div>
                </div>
                
                {/* Bottom Row: Metadata */}
                <div className="flex items-center justify-between">
                  {/* Book/Chapter Info */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg">
                      <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                      <div className="text-xs font-medium text-slate-700 truncate max-w-[120px]" title={question.book_source}>
                        {question.book_source}
                      </div>
                    </div>
                    
                    {question.chapter_name && (
                      <div className="text-xs text-slate-600 font-medium truncate max-w-[100px]" title={question.chapter_name}>
                        {question.chapter_name}
                      </div>
                    )}
                  </div>
                  
                  {/* Difficulty Badge */}
                  {question.difficulty && (
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs px-2 py-1 rounded-lg font-medium", getDifficultyColor(question.difficulty))}
                    >
                      {question.difficulty}
                    </Badge>
                  )}
                </div>
                
                {/* Tags */}
                {question.admin_tags && question.admin_tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {question.admin_tags.slice(0, 2).map((tag, tagIndex) => (
                      <span 
                        key={tagIndex} 
                        className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200/50 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {question.admin_tags.length > 2 && (
                      <span className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200/50 font-medium">
                        +{question.admin_tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Pagination Controls */}
      {totalPages && totalPages > 1 && onPageChange && (
        <div className="flex-shrink-0 border-t border-slate-200/60 bg-gradient-to-r from-white via-slate-50/30 to-white p-4">
          <div className="flex items-center justify-between">
            {/* Page Info */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </div>
              {total && (
                <div className="text-sm text-slate-600">
                  {((currentPage || 1) - 1) * (pageSize || 10) + 1}-{Math.min((currentPage || 1) * (pageSize || 10), total)} of {total}
                </div>
              )}
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center gap-2">
              {/* First page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-all duration-200"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              
              {/* Previous page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange((currentPage || 1) - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {(() => {
                  const pages = []
                  const maxVisiblePages = 3
                  let startPage = Math.max(1, (currentPage || 1) - Math.floor(maxVisiblePages / 2))
                  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
                  
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1)
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    const isActive = i === currentPage
                    pages.push(
                      <Button
                        key={`page-${i}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => onPageChange(i)}
                        className={`h-8 w-8 p-0 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        {i}
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
                onClick={() => onPageChange((currentPage || 1) + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              {/* Last page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-all duration-200"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
