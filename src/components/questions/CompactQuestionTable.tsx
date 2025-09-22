'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown,
  ChevronRight,
  Edit,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UIQuestion } from '@/lib/types'
import { UniversalContentRenderer } from '@/components/editors/UniversalContentRenderer'
import { QuestionEditForm } from './QuestionEditForm'
import { CompactQuestionDetails } from './CompactQuestionDetails'

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

  // Auto-expand edited question when context should be preserved
  useEffect(() => {
    if (shouldPreserveContext && expandedQuestionId) {
      setExpandedQuestions(prev => new Set([...prev, expandedQuestionId]))
    }
  }, [shouldPreserveContext, expandedQuestionId])

  const toggleExpansion = (questionId: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
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
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 border-b text-xs font-medium text-gray-600">
        <div className="col-span-1 flex justify-center items-center">
          <Checkbox
            checked={isAllSelected}
            ref={(el) => {
              if (el) (el as HTMLInputElement).indeterminate = isPartiallySelected
            }}
            onCheckedChange={onSelectAll}
            className="h-4 w-4"
          />
        </div>
        <div className="col-span-1 flex items-center justify-center">ID</div>
        <div className="col-span-4 flex items-center">Question</div>
        <div className="col-span-2 flex items-center">Book/Chapter</div>
        <div className="col-span-1 flex items-center justify-center">Difficulty</div>
        <div className="col-span-2 flex items-center">Tags</div>
        <div className="col-span-1 flex items-center justify-end">Actions</div>
      </div>

      {/* Table Body */}
      <div className="divide-y">
        {questions.map((question, index) => {
          if (!question.id) return null
          
          const isExpanded = expandedQuestions.has(question.id)
          const isSelected = selectedQuestions.has(question.id)
          const isEditing = editingQuestion === question.id

          return (
            <div key={question.id} className="group">
              {/* Main Row */}
              <div className={cn(
                "grid grid-cols-12 gap-2 px-4 py-4 transition-colors duration-150 rounded-lg mx-2 min-h-[72px]",
                index % 2 === 0 ? "bg-white" : "bg-slate-50/30",
                "hover:bg-slate-50/60",
                isSelected && "bg-blue-50/80 shadow-sm border-l-4 border-blue-400",
                isEditing && "bg-green-50/80 shadow-sm border-l-4 border-green-400"
              )}>
                {/* Checkbox */}
                <div className="col-span-1 flex items-center justify-center">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelectQuestion(question.id!)}
                    className="h-4 w-4"
                  />
                </div>

                {/* ID */}
                <div className="col-span-1 flex items-center justify-center text-xs text-gray-500">
                  <span className="font-mono font-light">#{question.id}</span>
                </div>

                {/* Question Text - Single Line Preview */}
                <div className="col-span-4 flex items-center">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpansion(question.id!)}
                      className="p-1 h-6 w-6 hover:bg-slate-100 transition-colors flex-shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-600" />
                      )}
                    </Button>
                    <div 
                      className="flex-1 min-w-0 text-sm font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                      title={question.question_text}
                      onClick={() => toggleExpansion(question.id!)}
                    >
                      <div className="whitespace-pre-wrap">
                        <UniversalContentRenderer text={question.question_text} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book/Chapter - Two-Line Display */}
                <div className="col-span-2 flex items-start text-xs text-gray-600">
                  <div className="flex flex-col gap-1 min-w-0 w-full">
                    <div className="flex items-center gap-1 min-w-0">
                      <BookOpen className="h-3 w-3 flex-shrink-0 mt-0.5" />
                      <span className="truncate font-medium text-gray-900" title={question.book_source}>
                        {question.book_source.length > 20 
                          ? `${question.book_source.substring(0, 20)}...` 
                          : question.book_source
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0 ml-4">
                      <span className="text-gray-500 text-xs">
                        {question.chapter_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="col-span-1 flex items-center justify-center">
                  {question.difficulty && (
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs px-2 py-1 rounded-full", getDifficultyColor(question.difficulty))}
                    >
                      {question.difficulty === 'Easy-Moderate' ? 'E' : 
                       question.difficulty === 'Moderate' ? 'M' : 
                       question.difficulty === 'Moderate-Hard' ? 'MH' : 
                       question.difficulty === 'Hard' ? 'H' : question.difficulty}
                    </Badge>
                  )}
                </div>

                {/* Tags - Premium Pill Design */}
                <div className="col-span-2 flex items-start">
                  {question.admin_tags && question.admin_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-w-full">
                      {question.admin_tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 shadow-sm hover:bg-blue-100/50 transition-colors duration-150"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                          {tag}
                        </span>
                      ))}
                      {question.admin_tags.length > 3 && (
                        <span className="inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border border-gray-200/50 shadow-sm">
                          +{question.admin_tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingQuestion(question.id!)
                      // Ensure the question is expanded when editing
                      if (!isExpanded) {
                        toggleExpansion(question.id!)
                      }
                    }}
                    className="h-5 w-5 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Compact Question Details */}
              {(isExpanded || isEditing) && (
                <div className="border-t border-gray-200">
                  {isEditing ? (
                    <div className="p-6">
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
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
