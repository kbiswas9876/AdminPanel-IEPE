'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { QuestionExplorer } from '../shared/question-explorer'
import { InPlaceQuestionEditor } from '../shared/in-place-question-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'
import { finalizeImport } from '@/lib/actions/bulk-import'
import { toast } from 'sonner'
import type { Question } from '@/lib/types'

export function ImportReviewInterface() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [stagedQuestions, setStagedQuestions] = useState<Question[]>([])
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string | number>>(new Set())
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  // Load staged questions from URL params or localStorage
  useEffect(() => {
    const questionsParam = searchParams.get('questions')
    if (questionsParam) {
      try {
        const questions = JSON.parse(decodeURIComponent(questionsParam))
        setStagedQuestions(questions)
      } catch (error) {
        console.error('Failed to parse questions from URL:', error)
        toast.error('Failed to load staged questions')
        router.push('/content')
      }
    } else {
      // Try to load from localStorage as fallback
      const stored = localStorage.getItem('stagedImportQuestions')
      if (stored) {
        try {
          const questions = JSON.parse(stored)
          setStagedQuestions(questions)
        } catch (error) {
          console.error('Failed to parse questions from localStorage:', error)
          toast.error('Failed to load staged questions')
          router.push('/content')
        }
      } else {
        toast.error('No staged questions found')
        router.push('/content')
      }
    }
  }, [searchParams, router])

  const handleQuestionEdit = (question: Question) => {
    // Start in-place editing for staged question
    setEditingQuestion(question)
  }

  const handleQuestionAction = (question: Question, action: string) => {
    if (action === 'edit') {
      handleQuestionEdit(question)
    }
  }

  const handleQuestionSave = (updatedQuestion: Question) => {
    // Update the question in the staged questions array
    setStagedQuestions(prev => 
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    )
    setEditingQuestion(null)
    toast.success('Question updated in import batch')
  }

  const handleQuestionEditCancel = () => {
    setEditingQuestion(null)
  }

  const handleQuestionDelete = (question: Question) => {
    // Remove question from staged list
    setStagedQuestions(prev => prev.filter(q => q.id !== question.id))
    toast.success('Question removed from import batch')
  }

  const handleBulkDelete = (questions: Question[]) => {
    // Remove multiple questions from staged list
    const questionIds = questions.map(q => q.id)
    setStagedQuestions(prev => prev.filter(q => !questionIds.includes(q.id)))
    setSelectedQuestions(new Set())
    toast.success(`${questions.length} questions removed from import batch`)
  }

  const handleSelectionChange = (selected: Set<string | number>) => {
    setSelectedQuestions(selected)
  }

  const handleFinalizeImport = async () => {
    if (stagedQuestions.length === 0) {
      toast.error('No questions to import')
      return
    }

    setIsFinalizing(true)
    
    try {
      const result = await finalizeImport(stagedQuestions)
      
      if (result.success) {
        toast.success(result.message)
        // Clear localStorage
        localStorage.removeItem('stagedImportQuestions')
        // Redirect to content management
        router.push('/content')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error finalizing import:', error)
      toast.error('An unexpected error occurred while importing questions')
    } finally {
      setIsFinalizing(false)
    }
  }

  const handleCancelImport = () => {
    // Clear localStorage
    localStorage.removeItem('stagedImportQuestions')
    // Redirect back to content management
    router.push('/content')
  }

  if (stagedQuestions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancelImport}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Content Management
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Import Review
          </h1>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Questions to Review
              </h3>
              <p className="text-gray-600">
                No staged questions were found. Please go back and upload your CSV file again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancelImport}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel Import
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Review & Finalize Import
            </h1>
            <p className="text-gray-600">
              Review and edit your questions before importing them into the database.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {stagedQuestions.length} question{stagedQuestions.length !== 1 ? 's' : ''} ready to import
            </p>
            {selectedQuestions.size > 0 && (
              <p className="text-sm text-blue-600">
                {selectedQuestions.size} selected
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Import Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Import Summary
          </CardTitle>
          <CardDescription>
            Review the questions below. You can edit, delete, or make any changes before finalizing the import.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {stagedQuestions.length}
              </div>
              <div className="text-sm text-blue-700">
                Total Questions
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {stagedQuestions.filter(q => q.question_text && q.question_text.trim()).length}
              </div>
              <div className="text-sm text-green-700">
                With Question Text
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">
                {stagedQuestions.filter(q => q.options && Object.keys(q.options).length > 0).length}
              </div>
              <div className="text-sm text-purple-700">
                With Options
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Explorer with Editing Capabilities */}
      <div className="flex-1 min-h-0">
        {editingQuestion ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Edit Staged Question</h2>
              <button
                onClick={handleQuestionEditCancel}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← Back to Review
              </button>
            </div>
            <InPlaceQuestionEditor
              question={editingQuestion}
              onSave={handleQuestionSave}
              onCancel={handleQuestionEditCancel}
              isStaged={true}
            />
          </div>
        ) : (
          <QuestionExplorer
            actionType="edit"
            onQuestionEdit={handleQuestionEdit}
            onQuestionDelete={handleQuestionDelete}
            onQuestionBulkDelete={handleBulkDelete}
            onQuestionAction={handleQuestionAction}
            title=""
            showHeader={false}
            multiSelect={true}
            selectedQuestions={selectedQuestions}
            onSelectionChange={handleSelectionChange}
            stagedQuestions={stagedQuestions}
          />
        )}
      </div>

      {/* Finalize Import Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Ready to Import?
              </h3>
              <p className="text-sm text-gray-600">
                Once you finalize the import, {stagedQuestions.length} question{stagedQuestions.length !== 1 ? 's' : ''} will be added to your question bank.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleCancelImport}
                disabled={isFinalizing}
              >
                Cancel Import
              </Button>
              <Button
                onClick={handleFinalizeImport}
                disabled={isFinalizing || stagedQuestions.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {isFinalizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalize & Import {stagedQuestions.length} Question{stagedQuestions.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
