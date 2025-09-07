'use client'

import { useState } from 'react'
import { deleteQuestion } from '@/lib/actions/questions'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteQuestionDialogProps {
  questionId: number
  questionText: string
  onDeleted?: () => void
}

export function DeleteQuestionDialog({ questionId, questionText, onDeleted }: DeleteQuestionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [testNames, setTestNames] = useState<string[]>([])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteQuestion(questionId)
      
      if (result.success) {
        toast.success(result.message)
        onDeleted?.()
      } else {
        // Show detailed error dialog for test dependencies
        setErrorMessage(result.message)
        setTestNames(result.testNames || [])
        setShowErrorDialog(true)
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('An unexpected error occurred while deleting the question')
    } finally {
      setIsDeleting(false)
    }
  }

  const truncatedText = questionText.length > 50 
    ? questionText.substring(0, 50) + '...' 
    : questionText

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
              <br />
              <br />
              <strong>Question:</strong> {truncatedText}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog for Test Dependencies */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Cannot Delete Question
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>{errorMessage}</p>
              
              {testNames.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <p className="text-sm font-medium text-amber-800 mb-2">
                    This question is currently used in the following test(s):
                  </p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {testNames.map((testName, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                        {testName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <p className="text-sm text-gray-600">
                To delete this question, you must first remove it from all tests that use it.
                You can do this by editing those tests in the Test Management section.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


