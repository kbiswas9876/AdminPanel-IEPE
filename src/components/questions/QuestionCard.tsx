'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Tag, 
  Calendar,
  Hash,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UIQuestion } from '@/lib/types'
import { LatexRenderer } from '@/lib/utils/latex-renderer'

type Question = UIQuestion

interface QuestionCardProps {
  question: Question
}

export function QuestionCard({ question }: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">#{question.id}</span>
              {question.difficulty && (
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getDifficultyColor(question.difficulty))}
                >
                  {question.difficulty}
                </Badge>
              )}
            </div>
            <h3 className="font-medium text-sm leading-relaxed line-clamp-2">
              <LatexRenderer text={question.question_text} />
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Options */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Options:</h4>
            <div className="grid gap-2">
              {question.options && Object.entries(question.options).map(([key, option], index) => (
                <div
                  key={key}
                  className={cn(
                    "p-3 rounded-lg text-sm border flex items-start gap-3",
                    key === question.correct_option
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-muted/50 border-border"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {key === question.correct_option ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <LatexRenderer text={option} />
                  </div>
                  {key === question.correct_option && (
                    <Badge variant="secondary" className="text-xs">
                      Correct
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          {question.solution_text && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Solution:</h4>
              <div className="text-sm text-muted-foreground leading-relaxed p-3 bg-muted/30 rounded-lg">
                <LatexRenderer text={question.solution_text} />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{question.book_source}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              <span>{question.chapter_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(question.created_at)}</span>
            </div>
          </div>

          {/* Tags */}
          {question.admin_tags && question.admin_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {question.admin_tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
