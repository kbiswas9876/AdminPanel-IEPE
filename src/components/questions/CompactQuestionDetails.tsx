'use client'

import React, { useState, memo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  ChevronUp, 
  Hash, 
  BookOpen, 
  Target, 
  Calendar,
  Tag,
  CheckCircle2,
  Circle,
  Maximize2,
  Minimize2,
  Edit,
  Trash2
} from 'lucide-react'
import { UniversalContentRenderer } from '@/components/editors/UniversalContentRenderer'
import { Question } from '@/lib/types'

interface CompactQuestionDetailsProps {
  question: Question
  isExpanded: boolean
  onToggle: () => void
  onEdit?: () => void
  onDelete?: () => void
  actionType?: 'edit' | 'select' | 'select-multiple'
  onQuestionAction?: (question: Question, action: string) => void
  isSelected?: boolean
  onSelectionChange?: (question: Question) => void
}

export const CompactQuestionDetails = memo(function CompactQuestionDetails({
  question,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  actionType = 'edit',
  onQuestionAction,
  isSelected = false,
  onSelectionChange
}: CompactQuestionDetailsProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [showSolution, setShowSolution] = useState(false)

  // Handle escape key to close zoom
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZoomed) {
        setIsZoomed(false)
      }
    }

    if (isZoomed) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isZoomed])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'easy-moderate':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'moderate':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'moderate-hard':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'hard':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      
      // Check if date is valid and not in the future
      if (isNaN(date.getTime()) || date > now) {
        return 'Invalid date'
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch (_error) {
      return 'Invalid date'
    }
  }

  const optionKeys = ['A', 'B', 'C', 'D']
  const options = {
    A: question.options?.a || '',
    B: question.options?.b || '',
    C: question.options?.c || '',
    D: question.options?.d || '',
  }

  const containerClasses = isZoomed 
    ? 'fixed inset-0 z-50 bg-white overflow-auto animate-in fade-in-0 duration-300' 
    : 'transition-all duration-300 ease-in-out'

  return (
    <div className={containerClasses}>
      {/* Header - Compact and Clean */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 transition-colors duration-200"
          >
            <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform duration-300 ease-out ${
              isExpanded ? 'rotate-180' : 'rotate-0'
            }`} />
          </Button>
          
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">#{question.question_id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 hover:bg-gray-100 transition-colors duration-200"
          >
            {isZoomed ? (
              <Minimize2 className="h-4 w-4 text-gray-600" />
            ) : (
              <Maximize2 className="h-4 w-4 text-gray-600" />
            )}
          </Button>
          
          {/* Close button for zoomed view */}
          {isZoomed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsZoomed(false)}
              className="p-2 hover:bg-gray-100 transition-colors duration-200"
            >
              <span className="text-gray-600 text-sm">Close</span>
            </Button>
          )}
        </div>
      </div>

      {/* Question Content - Compact Layout */}
      {isExpanded && (
        <div className="p-4 space-y-6 animate-in slide-in-from-top-2 duration-300">
          {/* Question Text */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Question
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="prose prose-sm max-w-none">
                <UniversalContentRenderer text={question.question_text} />
              </div>
            </div>
          </div>

          {/* Options - Two Column Layout */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Circle className="h-4 w-4 text-blue-600" />
              Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {optionKeys.map((optionKey) => {
                const optionText = options[optionKey as keyof typeof options]
                const isCorrect = question.correct_option?.toUpperCase() === optionKey.toUpperCase()
                
                return (
                  <div
                    key={optionKey}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
                      isCorrect
                        ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                        : 'bg-white border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {optionKey}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="prose prose-sm max-w-none">
                        {optionText ? (
                          <UniversalContentRenderer text={String(optionText)} />
                        ) : (
                          <span className="text-gray-400 italic">No option text provided</span>
                        )}
                      </div>
                    </div>
                    {isCorrect && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Solution - Collapsible */}
          {question.solution_text && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  Solution
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSolution(!showSolution)}
                  className="group relative bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm hover:shadow-md transition-all duration-200 font-medium rounded-lg px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                      showSolution ? 'bg-green-500' : 'bg-slate-400'
                    }`}></div>
                    {showSolution ? 'Hide Solution' : 'Show Solution'}
                  </div>
                </Button>
              </div>
              {showSolution && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 animate-in slide-in-from-top-2 duration-200 ease-out">
                  <div className="prose prose-xs max-w-none text-slate-700 leading-relaxed">
                    <div className="text-sm font-medium text-slate-800 [&_*]:text-sm [&_*]:leading-relaxed [&_p]:mb-2 [&_p]:last:mb-0 [&_strong]:font-semibold [&_em]:italic">
                      <UniversalContentRenderer text={question.solution_text} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metadata - Two Column Layout */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-600" />
              Metadata
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* Left Column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-600">Book:</span>
                      <div className="font-medium text-gray-900">{question.book_source}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-600">Chapter:</span>
                      <div className="font-medium text-gray-900">{question.chapter_name}</div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${
                        question.difficulty?.toLowerCase() === 'easy' ? 'bg-emerald-500' :
                        question.difficulty?.toLowerCase() === 'moderate' ? 'bg-amber-500' :
                        question.difficulty?.toLowerCase() === 'hard' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`} />
                    </div>
                    <div>
                      <span className="text-gray-600">Difficulty:</span>
                      <div className="font-medium text-gray-900">
                        {question.difficulty || <span className="text-gray-400 italic">Not specified</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <div className="font-medium text-gray-900">
                        {formatDate(question.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Tags */}
              {question.admin_tags && question.admin_tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {question.admin_tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-white">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
            {actionType === 'edit' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
            
            {actionType === 'select' && (
              <Button
                size="sm"
                onClick={() => onQuestionAction?.(question, 'select')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Select Question
              </Button>
            )}
            
            {actionType === 'select-multiple' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelectionChange?.(question)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  {isSelected ? 'Selected' : 'Select'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
})
