'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { deleteMultipleQuestions } from '@/lib/actions/questions'
import { toast } from 'sonner'
import type { Question } from '@/lib/types'

interface BulkDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questions: Question[]
  onDeleted: () => void
}

export function BulkDeleteDialog({ 
  open, 
  onOpenChange, 
  questions, 
  onDeleted 
}: BulkDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (questions.length === 0) return

    setIsDeleting(true)
    
    try {
      const questionIds = questions.map(q => q.id!).filter(id => id != null)
      const result = await deleteMultipleQuestions(questionIds)
      
      if (result.success) {
        toast.success(result.message)
        onDeleted()
        onOpenChange(false)
      } else {
        // Show detailed error message
        if (result.usedInTests && result.usedInTests.length > 0) {
          // Show detailed error about which questions are used in which tests
          const errorDetails = result.usedInTests.map(({ questionId, testNames }) => {
            const question = questions.find(q => q.id === questionId)
            return `Question ${question?.question_id || questionId}: Used in ${testNames.join(', ')}`
          }).join('\n')
          
          toast.error(`${result.message}\n\nDetails:\n${errorDetails}`, {
            duration: 10000, // Show for 10 seconds
          })
        } else {
          toast.error(result.message)
        }
      }
    } catch (error) {
      console.error('Error in bulk delete:', error)
      toast.error('An unexpected error occurred while deleting questions')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Multiple Questions
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to delete <strong>{questions.length}</strong> question{questions.length !== 1 ? 's' : ''}?
            </p>
            <p className="text-sm text-gray-600">
              This action cannot be undone. The system will automatically check if any of these questions are currently used in existing mock tests and prevent their deletion if they are.
            </p>
            {questions.length <= 5 && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium text-gray-700 mb-2">Questions to be deleted:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {questions.map((question) => (
                    <li key={question.id} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      Question {question.question_id} - {question.book_source}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {questions.length} Question{questions.length !== 1 ? 's' : ''}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
