'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen,
  Tag,
  Clock,
  CheckCircle,
  CheckCircle2,
  FileQuestion,
  Eye,
  Edit,
  Target,
  ListChecks,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UIQuestion } from '@/lib/types'
import { UniversalContentRenderer } from '@/components/editors/UniversalContentRenderer'
import { QuestionEditForm } from './QuestionEditForm'

interface QuestionPreviewPanelProps {
  question: UIQuestion | null
  onEdit?: (question: UIQuestion) => void
}

export function QuestionPreviewPanel({ 
  question, 
  onEdit 
}: QuestionPreviewPanelProps) {
  const [showSolution, setShowSolution] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<UIQuestion | null>(question)
  const router = useRouter()

  // Sync currentQuestion with question prop
  useEffect(() => {
    setCurrentQuestion(question)
  }, [question])

  if (!question) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="text-center max-w-md">
          {/* Placeholder Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-slate-300/20">
              <FileQuestion className="h-10 w-10 text-slate-400" />
            </div>
            {/* Floating elements */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full shadow-lg shadow-blue-400/30 animate-pulse"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full shadow-lg shadow-purple-400/30 animate-pulse delay-700"></div>
          </div>
          
          <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            Select a question to preview
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Choose any question from the list to view its full details, including the complete question text, options, correct answer, and explanation.
          </p>
        </div>
      </div>
    )
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

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-50/30 to-white">
      {isEditing ? (
        // Edit Mode
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Editing Mode</span>
            </div>
            <QuestionEditForm
              question={question}
              onSave={(updatedQuestion) => {
                setCurrentQuestion(updatedQuestion)
                setIsEditing(false)
                if (onEdit) {
                  onEdit(updatedQuestion)
                }
              }}
              onCancel={() => {
                setIsEditing(false)
                setCurrentQuestion(question) // Reset to original
              }}
            />
          </div>
        </div>
      ) : (
        // Preview Mode
        <>
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-slate-200/60 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl text-sm font-mono font-medium text-slate-600 shadow-sm">
              #{currentQuestion?.id}
            </div>
            {currentQuestion?.difficulty && (
              <Badge 
                variant="outline" 
                className={cn("text-sm px-3 py-1.5 rounded-xl font-medium", getDifficultyColor(currentQuestion.difficulty))}
              >
                {currentQuestion.difficulty}
              </Badge>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (onEdit) {
                onEdit(question)
              } else {
                // Start editing mode
                setIsEditing(true)
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 rounded-xl font-medium text-slate-700 shadow-sm hover:shadow transition-all duration-200"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
        
        {/* Question Text */}
        <div className="prose prose-slate max-w-none">
          <div className="text-lg font-medium text-slate-900 leading-relaxed">
            <UniversalContentRenderer text={currentQuestion?.question_text || ''} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Options */}
        {currentQuestion?.options && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200/60 mb-4">
              <ListChecks className="h-4 w-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Options</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['A', 'B', 'C', 'D'].map((optionKey, index) => {
                const optionText = currentQuestion?.options?.[optionKey.toLowerCase() as keyof typeof currentQuestion.options] || ''
                const isCorrect = currentQuestion?.correct_option?.toUpperCase() === optionKey.toUpperCase()
                
                return (
                  <div
                    key={optionKey}
                    className={cn(
                      "flex items-center justify-between gap-2 p-3 rounded-lg border transition-all duration-200",
                      isCorrect
                        ? "bg-emerald-50 border-emerald-200 shadow-sm"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold",
                          isCorrect
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        )}>
                          {optionKey}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="prose prose-sm max-w-none">
                          {optionText ? (
                            <UniversalContentRenderer text={String(optionText)} />
                          ) : (
                            <span className="text-slate-400 italic text-xs">No option text</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isCorrect && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">Correct</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Solution - Collapsible */}
        {currentQuestion?.solution_text && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                Solution
              </h4>
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
                <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
                  <UniversalContentRenderer text={currentQuestion?.solution_text || ''} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metadata - Multi-column Grid Layout */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileQuestion className="h-4 w-4 text-slate-600" />
            Details
          </h4>
          
          {/* Grid Layout - 2 columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* Book Source */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Source
              </div>
              <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <BookOpen className="h-3 w-3 text-slate-500 flex-shrink-0" />
                {currentQuestion?.book_source}
              </div>
            </div>

            {/* Chapter */}
            {currentQuestion?.chapter_name && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Chapter
                </div>
                <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <Tag className="h-3 w-3 text-slate-500 flex-shrink-0" />
                  {currentQuestion?.chapter_name}
                </div>
              </div>
            )}

            {/* Created Date */}
            {currentQuestion?.created_at && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Created
                </div>
                <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <Clock className="h-3 w-3 text-slate-500 flex-shrink-0" />
                  {new Date(currentQuestion.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}

            {/* Difficulty */}
            {currentQuestion?.difficulty && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Difficulty
                </div>
                <div className="text-sm font-medium text-slate-900">
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs px-2 py-1 rounded-lg font-medium", getDifficultyColor(currentQuestion.difficulty))}
                  >
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {currentQuestion?.admin_tags && currentQuestion.admin_tags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Tag className="h-3 w-3" />
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {currentQuestion.admin_tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 font-medium hover:bg-blue-100/50 transition-all duration-200"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  )
}
