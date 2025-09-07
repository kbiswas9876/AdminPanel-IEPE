'use client'

import { useState } from 'react'
import { QuestionExplorer } from '../shared/question-explorer'
import { BulkDeleteDialog } from './bulk-delete-dialog'
import type { Question } from '@/lib/types'

export function ContentManagement() {
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string | number>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [questionsToDelete, setQuestionsToDelete] = useState<Question[]>([])

  const handleQuestionEdit = (question: Question) => {
    // Navigate to edit page
    window.location.href = `/content/edit/${question.id}`
  }

  const handleQuestionDelete = (question: Question) => {
    // This will be handled by the DeleteQuestionDialog within the QuestionExplorer
    console.log('Question deleted:', question)
  }

  const handleBulkDelete = (questions: Question[]) => {
    setQuestionsToDelete(questions)
    setBulkDeleteOpen(true)
  }

  const handleSelectionChange = (selected: Set<string | number>) => {
    setSelectedQuestions(selected)
  }

  const handleBulkDeleteComplete = () => {
    // Clear selection after successful deletion
    setSelectedQuestions(new Set())
    setQuestionsToDelete([])
  }

  return (
    <>
      <QuestionExplorer
        actionType="edit"
        onQuestionEdit={handleQuestionEdit}
        onQuestionDelete={handleQuestionDelete}
        onQuestionBulkDelete={handleBulkDelete}
        title="Content Management"
        showHeader={false}
        multiSelect={true}
        selectedQuestions={selectedQuestions}
        onSelectionChange={handleSelectionChange}
      />
      
      <BulkDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        questions={questionsToDelete}
        onDeleted={handleBulkDeleteComplete}
      />
    </>
  )
}
