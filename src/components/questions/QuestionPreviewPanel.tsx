'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen,
  Tag,
  Clock,
  CheckCircle,
  FileQuestion,
  Eye,
  Edit
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UIQuestion } from '@/lib/types'
import { UniversalContentRenderer } from '@/components/editors/UniversalContentRenderer'

interface QuestionPreviewPanelProps {
  question: UIQuestion | null
  onEdit?: (question: UIQuestion) => void
}

export function QuestionPreviewPanel({ 
  question, 
  onEdit 
}: QuestionPreviewPanelProps) {
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
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-slate-200/60 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl text-sm font-mono font-medium text-slate-600 shadow-sm">
              #{question.id}
            </div>
            {question.difficulty && (
              <Badge 
                variant="outline" 
                className={cn("text-sm px-3 py-1.5 rounded-xl font-medium", getDifficultyColor(question.difficulty))}
              >
                {question.difficulty}
              </Badge>
            )}
          </div>
          
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(question)}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 rounded-xl font-medium text-slate-700 shadow-sm hover:shadow transition-all duration-200"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
        
        {/* Question Text */}
        <div className="prose prose-slate max-w-none">
          <div className="text-lg font-medium text-slate-900 leading-relaxed">
            <UniversalContentRenderer text={question.question_text} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Options */}
        {question.options && question.options.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-slate-600" />
              Options
            </h4>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200",
                    option.is_correct 
                      ? "bg-green-50 border-green-200 ring-1 ring-green-300/50" 
                      : "bg-slate-50 border-slate-200"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    option.is_correct 
                      ? "bg-green-500 text-white" 
                      : "bg-slate-300 text-slate-600"
                  )}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div className="flex-1 text-sm text-slate-900 leading-relaxed">
                    <UniversalContentRenderer text={option.option_text} />
                  </div>
                  {option.is_correct && (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        {question.explanation && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4 text-slate-600" />
              Explanation
            </h4>
            <div className="prose prose-slate max-w-none">
              <div className="text-sm text-slate-700 leading-relaxed">
                <UniversalContentRenderer text={question.explanation} />
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileQuestion className="h-4 w-4 text-slate-600" />
            Details
          </h4>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Book Source */}
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-slate-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Source
                </div>
                <div className="text-sm font-medium text-slate-900">
                  {question.book_source}
                </div>
              </div>
            </div>

            {/* Chapter */}
            {question.chapter_name && (
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-slate-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Chapter
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    {question.chapter_name}
                  </div>
                </div>
              </div>
            )}

            {/* Created Date */}
            {question.created_at && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-slate-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Created
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    {new Date(question.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {question.admin_tags && question.admin_tags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Tag className="h-3 w-3" />
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {question.admin_tags.map((tag, index) => (
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
    </div>
  )
}
