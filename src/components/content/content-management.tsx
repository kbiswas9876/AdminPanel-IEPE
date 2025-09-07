'use client'

import { useState } from 'react'
import { QuestionExplorer } from '../shared/question-explorer'
import { BulkDeleteDialog } from './bulk-delete-dialog'
import { InPlaceQuestionEditor } from '../shared/in-place-question-editor'
import { updateQuestionInPlace } from '@/lib/actions/questions'
import { toast } from 'sonner'
import type { Question } from '@/lib/types'

export function ContentManagement() {
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string | number>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [questionsToDelete, setQuestionsToDelete] = useState<Question[]>([])
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  const handleQuestionEdit = (question: Question) => {
    // Start in-place editing
    setEditingQuestion(question)
  }

  const handleQuestionAction = (question: Question, action: string) => {
    if (action === 'edit') {
      handleQuestionEdit(question)
    }
  }

  const handleQuestionSave = async (updatedQuestion: Question) => {
    try {
      const result = await updateQuestionInPlace(updatedQuestion)
      
      if (result.success) {
        toast.success(result.message)
        setEditingQuestion(null)
        // The QuestionExplorer will automatically refresh due to revalidatePath
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error saving question:', error)
      toast.error('An unexpected error occurred while saving the question')
    }
  }

  const handleQuestionEditCancel = () => {
    setEditingQuestion(null)
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
      {editingQuestion ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
            <button
              onClick={handleQuestionEditCancel}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Content Management
            </button>
          </div>
          <InPlaceQuestionEditor
            question={editingQuestion}
            onSave={handleQuestionSave}
            onCancel={handleQuestionEditCancel}
          />
        </div>
      ) : (
        <QuestionExplorer
          actionType="edit"
          onQuestionEdit={handleQuestionEdit}
          onQuestionDelete={handleQuestionDelete}
          onQuestionBulkDelete={handleBulkDelete}
          onQuestionAction={handleQuestionAction}
          title="Content Management"
          showHeader={false}
          multiSelect={true}
          selectedQuestions={selectedQuestions}
          onSelectionChange={handleSelectionChange}
        />
      )}
      
      <BulkDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        questions={questionsToDelete}
        onDeleted={handleBulkDeleteComplete}
      />
    </>
  )
}
