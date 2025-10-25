'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  ChevronDown,
  ChevronRight,
  Edit,
  BookOpen,
  ChevronDown as ChevronDownIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UIQuestion } from '@/lib/types'
import { UniversalContentRenderer } from '@/components/editors/UniversalContentRenderer'
import { QuestionEditForm } from './QuestionEditForm'
import { CompactQuestionDetails } from './CompactQuestionDetails'
import { updateQuestionInPlace } from '@/lib/actions/questions'
import { toast } from 'sonner'

interface CompactQuestionTableProps {
  questions: UIQuestion[]
  selectedQuestions: Set<number>
  onSelectQuestion: (questionId: number) => void
  onSelectAll: () => void
  onQuestionUpdate: (updatedQuestion: UIQuestion) => void
  isAllSelected: boolean
  isPartiallySelected: boolean
  expandedQuestionId?: number | null
  shouldPreserveContext?: boolean
}

export function CompactQuestionTable({
  questions,
  selectedQuestions,
  onSelectQuestion,
  onSelectAll,
  onQuestionUpdate,
  isAllSelected,
  isPartiallySelected,
  expandedQuestionId,
  shouldPreserveContext
}: CompactQuestionTableProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [animatingQuestions, setAnimatingQuestions] = useState<Set<number>>(new Set())
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null)

  // Difficulty options for quick edit
  const DIFFICULTY_OPTIONS = [
    { value: 'Easy', label: 'Easy' },
    { value: 'Easy-Moderate', label: 'Easy-Moderate' },
    { value: 'Moderate', label: 'Moderate' },
    { value: 'Moderate-Hard', label: 'Moderate-Hard' },
    { value: 'Hard', label: 'Hard' }
  ] as const

  // Handle quick difficulty update with optimistic UI
  const handleQuickDifficultyUpdate = async (question: UIQuestion, newDifficulty: string) => {
    if (!question.id) return

    // Close the popover immediately
    setOpenPopoverId(null)

    // Store original difficulty for rollback
    const originalDifficulty = question.difficulty

    try {
      // Optimistic update - immediately update the UI
      const updatedQuestion = { ...question, difficulty: newDifficulty as any }
      onQuestionUpdate(updatedQuestion)

      // Call API to update in database
      const result = await updateQuestionInPlace({
        ...question,
        difficulty: newDifficulty as any
      })

      if (result.success) {
        // Show subtle success toast
        toast.success(`Difficulty updated to ${newDifficulty}`, { duration: 1500 })
      } else {
        // Rollback on API failure
        const rollbackQuestion = { ...question, difficulty: originalDifficulty }
        onQuestionUpdate(rollbackQuestion)
        toast.error(result.message || 'Failed to update difficulty', { duration: 3000 })
      }
    } catch (error) {
      // Rollback on unexpected error
      const rollbackQuestion = { ...question, difficulty: originalDifficulty }
      onQuestionUpdate(rollbackQuestion)
      console.error('Error updating difficulty:', error)
      toast.error('Failed to update difficulty. Please try again.', { duration: 3000 })
    }
  }

  // Auto-expand edited question when context should be preserved
  useEffect(() => {
    if (shouldPreserveContext && expandedQuestionId) {
      setExpandedQuestions(prev => new Set([...prev, expandedQuestionId]))
    }
  }, [shouldPreserveContext, expandedQuestionId])

  const toggleExpansion = (questionId: number) => {
    const isCurrentlyExpanded = expandedQuestions.has(questionId)
    
    if (isCurrentlyExpanded) {
      // Start collapse animation
      setAnimatingQuestions(prev => new Set([...prev, questionId]))
      
      // Remove from expanded after animation
      setTimeout(() => {
        setExpandedQuestions(prev => {
          const newSet = new Set(prev)
          newSet.delete(questionId)
          return newSet
        })
        setAnimatingQuestions(prev => {
          const newSet = new Set(prev)
          newSet.delete(questionId)
          return newSet
        })
      }, 300) // Match the animation duration
    } else {
      // Expand immediately
      setExpandedQuestions(prev => new Set([...prev, questionId]))
    }
  }

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

  // Section collapsing is currently not used in this table

  // Date formatting helper not used in this table currently

  return (
    <div className="w-full space-y-4">
      {/* Premium Card Grid */}
      <div className="space-y-4">
        {/* Questions */}
        {questions.map((question, index) => {
          if (!question.id) return null
          
          const isExpanded = expandedQuestions.has(question.id)
          const isSelected = selectedQuestions.has(question.id)
          const isEditing = editingQuestion === question.id

          return (
            <div 
              key={question.id} 
              className="group relative"
            >
              {/* Premium Question Card */}
              <div className={cn(
                "relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300 ease-out hover:-translate-y-0.5",
                isSelected && "ring-2 ring-blue-500/20 border-blue-300 bg-blue-50/30 shadow-lg",
                isEditing && "ring-2 ring-green-500/20 border-green-300 bg-green-50/30 shadow-lg"
              )}>
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                )}
                {isEditing && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                )}
                
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Selection Checkbox */}
                      <div className="flex-shrink-0">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onSelectQuestion(question.id!)}
                          className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </div>
                      
                      {/* Question ID Badge */}
                      <div className="flex-shrink-0">
                        <div className="px-3 py-1.5 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl text-xs font-mono font-medium text-slate-600 shadow-sm">
                          #{question.id}
                        </div>
                      </div>
                      
                      {/* Interactive Difficulty Badge */}
                      {question.difficulty && (
                        <Popover 
                          open={openPopoverId === question.id} 
                          onOpenChange={(open) => setOpenPopoverId(open ? question.id! : null)}
                        >
                          <PopoverTrigger asChild>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs px-3 py-1.5 rounded-xl font-medium shadow-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-offset-1 hover:ring-blue-300",
                                getDifficultyColor(question.difficulty)
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-1">
                                {question.difficulty}
                                <ChevronDownIcon className="h-3 w-3 opacity-60" />
                              </div>
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-1" align="start">
                            <div className="space-y-1">
                              {DIFFICULTY_OPTIONS.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleQuickDifficultyUpdate(question, option.value)
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-150",
                                    question.difficulty === option.value
                                      ? "bg-blue-50 text-blue-700 font-medium"
                                      : "hover:bg-gray-50 text-gray-700"
                                  )}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingQuestion(question.id!)
                          if (!isExpanded) {
                            toggleExpansion(question.id!)
                          }
                        }}
                        className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100 shadow-sm hover:shadow transition-all duration-200 group/edit"
                      >
                        <Edit className="h-4 w-4 text-slate-600 group-hover/edit:text-slate-800 transition-colors duration-200" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpansion(question.id!)}
                        className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100 shadow-sm hover:shadow transition-all duration-200 group/expand"
                      >
                        <div className={`transition-transform duration-300 ease-out ${
                          isExpanded ? 'rotate-0' : 'rotate-0'
                        }`}>
                          <ChevronDown className={`h-4 w-4 text-slate-600 group-hover/expand:text-slate-800 transition-transform duration-300 ease-out ${
                            isExpanded ? 'rotate-0' : '-rotate-90'
                          }`} />
                        </div>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Question Content */}
                  <div 
                    className="mb-4 cursor-pointer group/content"
                    onClick={() => toggleExpansion(question.id!)}
                  >
                    <div className="text-base font-medium text-slate-900 leading-relaxed group-hover/content:text-blue-700 transition-colors duration-200">
                      <UniversalContentRenderer 
                        text={question.question_text}
                        forceRerender={isExpanded}
                      />
                    </div>
                  </div>
                  
                  {/* Metadata Row */}
                  <div className="flex items-center justify-between">
                    {/* Book/Chapter Info */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl">
                        <BookOpen className="h-4 w-4 text-slate-500" />
                        <div className="text-sm font-medium text-slate-700" title={question.book_source}>
                          {question.book_source.length > 25 
                            ? `${question.book_source.substring(0, 25)}...` 
                            : question.book_source
                          }
                        </div>
                      </div>
                      
                      {question.chapter_name && (
                        <div className="text-sm text-slate-600 font-medium">
                          {question.chapter_name.length > 30 
                            ? `${question.chapter_name.substring(0, 30)}...` 
                            : question.chapter_name
                          }
                        </div>
                      )}
                    </div>
                    
                    {/* Tags */}
                    {question.admin_tags && question.admin_tags.length > 0 && (
                      <div className="flex items-center gap-2 max-w-md">
                        <div className="flex flex-wrap gap-2">
                          {question.admin_tags.slice(0, 3).map((tag, tagIndex) => (
                            <span 
                              key={tagIndex} 
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 font-medium hover:bg-blue-100/50 transition-all duration-200"
                            >
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              {tag}
                            </span>
                          ))}
                          {question.admin_tags.length > 3 && (
                            <span className="inline-flex items-center text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 border border-slate-200/50 font-medium shadow-sm">
                              +{question.admin_tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Content Section */}
                {(isExpanded || isEditing) && (
                  <div className={`border-t border-slate-100 mt-6 pt-6 bg-slate-50/30 -mx-6 px-6 pb-6 rounded-b-2xl transition-all duration-300 ease-out ${
                    animatingQuestions.has(question.id!) 
                      ? 'animate-out slide-out-to-top' 
                      : 'animate-in slide-in-from-top'
                  }`}>
                    {isEditing ? (
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-sm font-medium text-green-700">Editing Mode</span>
                        </div>
                        <QuestionEditForm
                          question={question}
                          onSave={(updatedQuestion) => {
                            onQuestionUpdate(updatedQuestion)
                            setEditingQuestion(null)
                          }}
                          onCancel={() => setEditingQuestion(null)}
                        />
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <CompactQuestionDetails
                          question={question}
                          isExpanded={isExpanded}
                          onToggle={() => toggleExpansion(question.id!)}
                          onEdit={() => setEditingQuestion(question.id!)}
                          actionType="edit"
                          onQuestionAction={(q, action) => {
                            if (action === 'edit') {
                              setEditingQuestion(q.id!)
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
