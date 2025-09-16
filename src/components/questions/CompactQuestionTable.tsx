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
  Hash,
  Eye,
  EyeOff
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
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

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

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
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

              {/* Premium Expanded Content - Floating Card */}
              {isExpanded && (
                <div className="px-4 py-4 bg-gradient-to-br from-gray-50 to-blue-50/30 border-b">
                  {isEditing ? (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
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
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                      {/* Premium Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">📘</span>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-base">Question Details</h3>
                            <p className="text-blue-100 text-xs">ID: {question.id}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Question Text */}
                        <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            Question
                          </h4>
                          <div className="text-xs leading-relaxed whitespace-pre-wrap">
                            <LatexRenderer text={question.question_text} />
                          </div>
                        </div>

                        {/* Options - Premium Pill Design */}
                        {question.options && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                              Options
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {Object.entries(question.options).map(([key, value], index) => (
                                <div 
                                  key={key} 
                                  className={`group relative p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                                    question.correct_option === key 
                                      ? 'bg-green-50 border-green-200 shadow-sm' 
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                      question.correct_option === key 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                                    }`}>
                                      {String.fromCharCode(65 + index)}
                                    </div>
                                    <div className="flex-1 text-xs whitespace-pre-wrap">
                                      <LatexRenderer text={value} />
                                    </div>
                                    {question.correct_option === key && (
                                      <div className="absolute top-1 right-1">
                                        <Badge className="bg-green-500 text-white text-xs px-1 py-0">
                                          ✓
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Solution - Collapsible */}
                        {question.solution_text && (
                          <div>
                            <button
                              onClick={() => toggleSection(`solution-${question.id}`)}
                              className="w-full flex items-center justify-between p-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 hover:border-purple-300 transition-all duration-200 group"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                                <span className="text-xs font-semibold text-gray-700">Solution</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-purple-600 font-medium">
                                  {collapsedSections.has(`solution-${question.id}`) ? 'Show' : 'Hide'}
                                </span>
                                {collapsedSections.has(`solution-${question.id}`) ? (
                                  <Eye className="h-3 w-3 text-purple-600 group-hover:text-purple-700" />
                                ) : (
                                  <EyeOff className="h-3 w-3 text-purple-600 group-hover:text-purple-700" />
                                )}
                              </div>
                            </button>
                            {!collapsedSections.has(`solution-${question.id}`) && (
                              <div className="mt-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                                <div className="text-xs leading-relaxed whitespace-pre-wrap font-mono">
                                  <LatexRenderer text={question.solution_text} />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Metadata Section - Collapsible */}
                        <div className="bg-gray-50 rounded-lg">
                          <button
                            onClick={() => toggleSection(`metadata-${question.id}`)}
                            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200 hover:border-orange-300 transition-all duration-200 group"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                              <span className="text-xs font-semibold text-gray-700">Metadata</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-orange-600 font-medium">
                                {collapsedSections.has(`metadata-${question.id}`) ? 'Show' : 'Hide'}
                              </span>
                              {collapsedSections.has(`metadata-${question.id}`) ? (
                                <Eye className="h-3 w-3 text-orange-600 group-hover:text-orange-700" />
                              ) : (
                                <EyeOff className="h-3 w-3 text-orange-600 group-hover:text-orange-700" />
                              )}
                            </div>
                          </button>
                          {!collapsedSections.has(`metadata-${question.id}`) && (
                            <div className="p-3 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-3 w-3 text-blue-600" />
                              <div>
                                <p className="text-xs text-gray-500">Book</p>
                                <p className="text-xs font-medium">{question.book_source}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Hash className="h-3 w-3 text-green-600" />
                              <div>
                                <p className="text-xs text-gray-500">Chapter</p>
                                <p className="text-xs font-medium">{question.chapter_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Tag className="h-3 w-3 text-purple-600" />
                              <div>
                                <p className="text-xs text-gray-500">Difficulty</p>
                                <p className="text-xs font-medium">{question.difficulty || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-orange-600" />
                              <div>
                                <p className="text-xs text-gray-500">Date</p>
                                <p className="text-xs font-medium">{formatDate(question.created_at)}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Exam Metadata */}
                          {question.exam_metadata && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                <span className="text-xs font-medium text-gray-600">Exam Metadata</span>
                              </div>
                              <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-200">
                                <p className="text-xs font-medium text-indigo-800">{question.exam_metadata}</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Tags */}
                          {question.admin_tags && question.admin_tags.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Tag className="h-3 w-3 text-gray-600" />
                                <span className="text-xs font-medium text-gray-600">Tags</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {question.admin_tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs bg-white border-gray-300 hover:bg-gray-50 px-2 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                            </div>
                          )}
                        </div>
                      </div>
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
