'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  BookOpen,
  Tag,
  Calendar,
  Hash
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UIQuestion } from '@/lib/types'
import { LatexRenderer } from '@/lib/utils/latex-renderer'
import { QuestionEditForm } from './QuestionEditForm'

interface CompactQuestionTableProps {
  questions: UIQuestion[]
  selectedQuestions: Set<number>
  onSelectQuestion: (questionId: number) => void
  onSelectAll: () => void
  onQuestionUpdate: (updatedQuestion: UIQuestion) => void
  isAllSelected: boolean
  isPartiallySelected: boolean
}

export function CompactQuestionTable({
  questions,
  selectedQuestions,
  onSelectQuestion,
  onSelectAll,
  onQuestionUpdate,
  isAllSelected,
  isPartiallySelected
}: CompactQuestionTableProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null)

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 border-b text-xs font-medium text-gray-600">
        <div className="col-span-1">
          <Checkbox
            checked={isAllSelected}
            ref={(el) => {
              if (el) (el as HTMLInputElement).indeterminate = isPartiallySelected
            }}
            onCheckedChange={onSelectAll}
          />
        </div>
        <div className="col-span-1">ID</div>
        <div className="col-span-4">Question</div>
        <div className="col-span-2">Book/Chapter</div>
        <div className="col-span-1">Difficulty</div>
        <div className="col-span-1">Tags</div>
        <div className="col-span-1">Date</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Table Body */}
      <div className="divide-y">
        {questions.map((question) => {
          if (!question.id) return null
          
          const isExpanded = expandedQuestions.has(question.id)
          const isSelected = selectedQuestions.has(question.id)
          const isEditing = editingQuestion === question.id

          return (
            <div key={question.id} className="group">
              {/* Main Row */}
              <div className={cn(
                "grid grid-cols-12 gap-2 px-3 py-2 hover:bg-gray-50 transition-colors",
                isSelected && "bg-blue-50",
                isEditing && "bg-green-50"
              )}>
                {/* Checkbox */}
                <div className="col-span-1 flex items-center">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelectQuestion(question.id!)}
                  />
                </div>

                {/* ID */}
                <div className="col-span-1 flex items-center text-sm text-gray-600">
                  <Hash className="h-3 w-3 mr-1" />
                  {question.id}
                </div>

                {/* Question Text */}
                <div className="col-span-4 flex items-center">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpansion(question.id!)}
                      className="p-0.5 h-5 w-5"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs line-clamp-1 whitespace-pre-wrap">
                        <LatexRenderer text={question.question_text} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book/Chapter */}
                <div className="col-span-2 flex items-center text-xs text-gray-600">
                  <div className="flex items-center gap-1 min-w-0">
                    <BookOpen className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{question.book_source}</span>
                  </div>
                  <div className="flex items-center gap-1 ml-2 min-w-0">
                    <Tag className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{question.chapter_name}</span>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="col-span-1 flex items-center">
                  {question.difficulty && (
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getDifficultyColor(question.difficulty))}
                    >
                      {question.difficulty}
                    </Badge>
                  )}
                </div>

                {/* Tags */}
                <div className="col-span-1 flex items-center">
                  {question.admin_tags && question.admin_tags.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {question.admin_tags.length}
                    </Badge>
                  )}
                </div>

                {/* Date */}
                <div className="col-span-1 flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(question.created_at)}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingQuestion(question.id!)}
                    className="h-5 w-5 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 py-3 bg-gray-50/50 border-b">
                  {isEditing ? (
                    <QuestionEditForm
                      question={question}
                      onSave={(updatedQuestion) => {
                        onQuestionUpdate(updatedQuestion)
                        setEditingQuestion(null)
                      }}
                      onCancel={() => setEditingQuestion(null)}
                    />
                  ) : (
                    <div className="space-y-3">
                      {/* Options */}
                      {question.options && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Options:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(question.options).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-2 p-2 bg-white rounded border">
                                <Badge variant={question.correct_option === key ? "default" : "outline"}>
                                  {key}
                                </Badge>
                                <div className="text-sm whitespace-pre-wrap">
                                  <LatexRenderer text={value} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Solution */}
                      {question.solution_text && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Solution:</h4>
                          <div className="p-3 bg-green-50 rounded border text-sm whitespace-pre-wrap">
                            <LatexRenderer text={question.solution_text} />
                          </div>
                        </div>
                      )}
                      
                      {/* Tags */}
                      {question.admin_tags && question.admin_tags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Tags:</h4>
                          <div className="flex flex-wrap gap-1">
                            {question.admin_tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
