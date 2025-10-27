'use client'

import React from 'react'
import KatexRenderer from '../ui/KatexRenderer'

interface QuestionCardProps {
  questionNumber?: number
  questionText: string
  inQuestionTimer?: number
  isPaused?: boolean
}

/**
 * QuestionCard component
 * Simplified version for Admin Panel - displays question text with LaTeX support
 */
const QuestionCard: React.FC<QuestionCardProps> = ({ questionNumber, questionText, inQuestionTimer, isPaused = false }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="card-header">
        <div className="text-base text-slate-900 dark:text-slate-100 prose prose-lg max-w-none dark:prose-invert" id="question-text">
          <KatexRenderer content={questionText} />
        </div>
        {inQuestionTimer !== undefined && (
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Time: {Math.floor(inQuestionTimer / 60000)}:{String(Math.floor((inQuestionTimer % 60000) / 1000)).padStart(2, '0')}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionCard

