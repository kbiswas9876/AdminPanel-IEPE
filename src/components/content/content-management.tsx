'use client'

import { useState } from 'react'
import { QuestionExplorer } from '../shared/question-explorer'
import { BulkDeleteDialog } from './bulk-delete-dialog'
import { InPlaceQuestionEditor } from '../shared/in-place-question-editor'
import { updateQuestionInPlace } from '@/lib/actions/questions'
import { useQuestions } from '@/lib/contexts/questions-context'
import { toast } from 'sonner'
import type { Question } from '@/lib/types'

export function ContentManagement() {
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string | number>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [questionsToDelete, setQuestionsToDelete] = useState<Question[]>([])
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  
  // Use questions context for state management
  const { updateQuestionInCache, removeQuestionFromCache } = useQuestions()

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
      // Optimistic update: Update the cache immediately
      updateQuestionInCache(updatedQuestion)
      
      // Show success message immediately
      toast.success('Question updated successfully!')
      
      // Clear editing state immediately - the expanded state will be preserved
      // by the expanded state preservation logic in ExpandableQuestionList
      setEditingQuestion(null)
      
      // Perform the actual update in the background
      const result = await updateQuestionInPlace(updatedQuestion)
      
      if (!result.success) {
        // If the update failed, revert the optimistic update
        // For now, we'll just show an error message
        // In a more robust implementation, we'd revert the cache
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
    // Optimistically remove from cache
    if (question.id) {
      removeQuestionFromCache(question.id)
    }
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
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg border border-blue-200/50">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Question</h1>
              <p className="text-sm text-gray-600 font-medium mt-1">Make changes to the question details</p>
            </div>
            <button
              onClick={handleQuestionEditCancel}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-all duration-200"
            >
              <span>←</span>
              <span>Back to Content Management</span>
            </button>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-gray-200/50">
            <InPlaceQuestionEditor
              question={editingQuestion}
              onSave={handleQuestionSave}
              onCancel={handleQuestionEditCancel}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-gray-200/50 overflow-hidden">
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
            editingQuestionId={editingQuestion?.id || null}
          />
        </div>
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
