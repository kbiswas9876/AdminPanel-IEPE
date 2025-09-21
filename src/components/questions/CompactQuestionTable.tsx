'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  ChevronUp,
  ChevronRight, 
  Edit, 
  BookOpen,
  Tag,
  Calendar,
  Hash,
  Info,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UIQuestion } from '@/lib/types'
import { UniversalContentRenderer } from '@/components/editors/UniversalContentRenderer'
import { QuestionEditForm } from './QuestionEditForm'

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
                      className="flex-1 min-w-0 text-sm font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                      title={question.question_text}
                      onClick={() => toggleExpansion(question.id!)}
                    >
                      <UniversalContentRenderer text={question.question_text} />
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

              {/* Premium Expanded Content - Centered Card */}
              {(isExpanded || isEditing) && (
                <div className="px-6 py-8 bg-slate-50/50 border-b">
                  {isEditing ? (
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
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
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-lg transition-shadow duration-150">
                      {/* Premium Header with Enhanced Question ID Badge */}
                      <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/20">
                              <span className="text-white text-sm font-black tracking-tight">#{question.id}</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-2 border-white shadow-sm"></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Question Details</h3>
                              <div className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-full">
                                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Active</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Complete question information and metadata</p>
                          </div>
                        </div>
                      </div>

                      <div className="px-8 py-6 space-y-8">
                        {/* Question Text - Clean Typography */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
                            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Question</h4>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <div className="text-lg font-medium text-gray-900 leading-relaxed">
                              <UniversalContentRenderer text={question.question_text} />
                            </div>
                          </div>
                        </div>

                        {/* Options - Clean Vertical List */}
                        {question.options && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-sm"></div>
                              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Options</h4>
                            </div>
                            <div className="space-y-3">
                              {Object.entries(question.options).map(([key, value], index) => (
                                <div 
                                  key={key} 
                                  className={`group relative p-4 rounded-lg border transition-colors duration-150 ${
                                    question.correct_option === key 
                                      ? 'bg-green-50 border-green-200 shadow-sm' 
                                      : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-start gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                                      question.correct_option === key 
                                        ? 'bg-green-500 text-white shadow-sm' 
                                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                    }`}>
                                      {String.fromCharCode(65 + index)}
                                    </div>
                                    <div className="flex-1 text-base text-gray-700 leading-relaxed">
                                      <UniversalContentRenderer text={value} />
                                    </div>
                                    {question.correct_option === key && (
                                      <div className="flex-shrink-0 mt-1">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Solution - Clean Collapsible */}
                        {question.solution_text && (
                          <div className="space-y-4">
                            <button
                              onClick={() => toggleSection(`solution-${question.id}`)}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-colors duration-150 group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full shadow-sm"></div>
                                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">Solution</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 font-medium">
                                  {collapsedSections.has(`solution-${question.id}`) ? 'Show' : 'Hide'}
                                </span>
                                {collapsedSections.has(`solution-${question.id}`) ? (
                                  <ChevronDown className="h-4 w-4 text-gray-600 group-hover:text-gray-700" />
                                ) : (
                                  <ChevronUp className="h-4 w-4 text-gray-600 group-hover:text-gray-700" />
                                )}
                              </div>
                            </button>
                            {!collapsedSections.has(`solution-${question.id}`) && (
                              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 animate-in fade-in-0 duration-200">
                                <div className="text-base text-gray-700 leading-relaxed font-mono">
                                  <UniversalContentRenderer text={question.solution_text} />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Horizontal Metadata Bar */}
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-3 h-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-sm"></div>
                            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Metadata</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <BookOpen className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="text-gray-500">Book</span>
                                <p className="font-medium text-gray-900 truncate">{question.book_source}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Tag className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="text-gray-500">Chapter</span>
                                <p className="font-medium text-gray-900">{question.chapter_name}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Hash className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="text-gray-500">Difficulty</span>
                                <p className="font-medium text-gray-900">{question.difficulty || 'N/A'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="text-gray-500">Date</span>
                                <p className="font-medium text-gray-900">{formatDate(question.created_at)}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Exam & Tags Row */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap items-center gap-4">
                              {question.exam_metadata && (
                                <div className="flex items-center gap-2">
                                  <Info className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm text-gray-500">Exam:</span>
                                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {question.exam_metadata}
                                  </span>
                                </div>
                              )}
                              
                              {question.admin_tags && question.admin_tags.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <Tag className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-500">Tags:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {question.admin_tags.map((tag, index) => (
                                      <span key={index} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
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
