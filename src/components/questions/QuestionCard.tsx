'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Tag, 
  Calendar,
  Hash,
  CheckCircle,
  XCircle,
  Edit,
  HelpCircle,
  ListChecks,
  Lightbulb,
  Database,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UIQuestion } from '@/lib/types'
import { LatexRenderer } from '@/lib/utils/latex-renderer'
import { QuestionEditForm } from './QuestionEditForm'

type Question = UIQuestion

interface QuestionCardProps {
  question: Question
  isSelected?: boolean
  onSelect?: () => void
  onQuestionUpdate?: (updatedQuestion: Question) => void
}

export function QuestionCard({ question, isSelected = false, onSelect, onQuestionUpdate }: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(question)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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

  const handleEdit = () => {
    setIsEditing(true)
    setIsExpanded(true) // Auto-expand when editing
  }

  const handleSave = (updatedQuestion: Question) => {
    setCurrentQuestion(updatedQuestion)
    setIsEditing(false)
    if (onQuestionUpdate) {
      onQuestionUpdate(updatedQuestion)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setCurrentQuestion(question) // Reset to original
  }

  return (
    <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.01] rounded-2xl">
      <CardHeader className="pb-4 px-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Selection Checkbox */}
            {onSelect && (
              <div className="pt-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onSelect}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">#{question.id}</span>
                {currentQuestion.difficulty && (
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getDifficultyColor(currentQuestion.difficulty))}
                  >
                    {currentQuestion.difficulty}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 leading-relaxed line-clamp-2 whitespace-pre-wrap">
                <LatexRenderer text={currentQuestion.question_text} />
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 px-6 pb-6 space-y-6 transition-all duration-300 ease-in-out">
          {isEditing ? (
            <QuestionEditForm
              question={currentQuestion}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <>
              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                  <ListChecks className="h-4 w-4 text-slate-500" />
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Options</h4>
                </div>
                <div className="grid gap-3">
              {currentQuestion.options && Object.entries(currentQuestion.options).map(([key, option], index) => (
                <div
                  key={key}
                  className={cn(
                    "p-4 rounded-xl text-base border flex items-start gap-3 transition-all duration-200",
                    key === currentQuestion.correct_option
                      ? "bg-green-50 border-green-300 text-green-700 shadow-sm"
                      : "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100/80"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {key === currentQuestion.correct_option ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 whitespace-pre-wrap">
                    <span className="font-medium mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <LatexRenderer text={option} />
                  </div>
                  {key === currentQuestion.correct_option && (
                    <Badge variant="secondary" className="text-xs">
                      Correct
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          {currentQuestion.solution_text && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                <Lightbulb className="h-4 w-4 text-slate-500" />
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Solution</h4>
              </div>
              <div className="text-base text-slate-700 leading-relaxed p-4 bg-slate-50 rounded-xl whitespace-pre-wrap font-mono border border-slate-200/60">
                <LatexRenderer text={currentQuestion.solution_text} />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
              <Database className="h-4 w-4 text-slate-500" />
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Metadata</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50/80 rounded-xl border border-amber-200/60">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <BookOpen className="h-4 w-4 text-slate-500" />
                <span className="font-medium">Book:</span>
                <span>{currentQuestion.book_source}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Tag className="h-4 w-4 text-slate-500" />
                <span className="font-medium">Chapter:</span>
                <span>{currentQuestion.chapter_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="font-medium">Date:</span>
                <span>{formatDate(currentQuestion.created_at)}</span>
              </div>
              {currentQuestion.exam_metadata && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Info className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Exam:</span>
                  <span className="text-indigo-600 font-medium">{currentQuestion.exam_metadata}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {currentQuestion.admin_tags && currentQuestion.admin_tags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                <Tag className="h-4 w-4 text-slate-500" />
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tags</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentQuestion.admin_tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 transition-colors">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
