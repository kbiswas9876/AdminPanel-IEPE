'use client'

import { QuestionExplorer } from '../shared/question-explorer'
import type { Question } from '@/lib/types'

export function ContentManagement() {
  const handleQuestionEdit = (question: Question) => {
    // Navigate to edit page
    window.location.href = `/content/edit/${question.id}`
  }

  const handleQuestionDelete = (question: Question) => {
    // This will be handled by the DeleteQuestionDialog within the QuestionExplorer
    console.log('Question deleted:', question)
  }

  return (
    <QuestionExplorer
      actionType="edit"
      onQuestionEdit={handleQuestionEdit}
      onQuestionDelete={handleQuestionDelete}
      title="Content Management"
      showHeader={false}
    />
  )
}
