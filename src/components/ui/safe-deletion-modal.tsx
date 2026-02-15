'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  AlertTriangle, 
  Trash2, 
  Shield, 
  CheckCircle, 
  XCircle,
  FileQuestion,
  TestTube,
  Loader2
} from 'lucide-react'
import { analyzeQuestionsForDeletion, deleteQuestionsDirectly } from '@/lib/actions/questions'
import { toast } from 'sonner'

interface Question {
  id: number
  question_text: string
}

interface UsageInfo {
  questionId: number
  testNames: string[]
}

interface SafeDeletionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questions: Question[]
  selectedQuestionIds: number[]
  onDeleted: () => void
}

interface DeletionAnalysis {
  safeToDelete: Question[]
  usedInTests: { question: Question; testNames: string[] }[]
  canProceed: boolean
  totalSafeCount: number
  totalUsedCount: number
}

export function SafeDeletionModal({
  open,
  onOpenChange,
  questions,
  selectedQuestionIds,
  onDeleted
}: SafeDeletionModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [analysis, setAnalysis] = useState<DeletionAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Analyze questions when modal opens
  useEffect(() => {
    if (open && selectedQuestionIds.length > 0) {
      analyzeQuestions()
    }
  }, [open, selectedQuestionIds])

  const analyzeQuestions = async () => {
    console.log('🔍 SafeDeletionModal: Starting analysis')
    console.log('📋 Questions prop:', questions.length, 'questions')
    console.log('🎯 Selected question IDs:', selectedQuestionIds)
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      // Get selected questions
      const selectedQuestions = questions.filter(q => selectedQuestionIds.includes(q.id))
      console.log('📝 Filtered selected questions:', selectedQuestions.length, 'questions')
      console.log('📝 Selected questions details:', selectedQuestions.map(q => ({ id: q.id, text: q.question_text?.substring(0, 50) + '...' })))
      
      // Use dedicated analysis function (doesn't attempt deletion)
      console.log('🚀 Calling analyzeQuestionsForDeletion with IDs:', selectedQuestionIds)
      const analysisResult = await analyzeQuestionsForDeletion(selectedQuestionIds)
      console.log('📊 Analysis result received:', analysisResult)
      
      // Convert analysis result to component format
      const usedInTests: { question: Question; testNames: string[] }[] = []
      const safeToDelete: Question[] = []
      
      // Map the analysis results to our component state
      analysisResult.usedInTests.forEach(({ questionId, testNames }) => {
        const question = selectedQuestions.find(q => q.id === questionId)
        if (question) {
          usedInTests.push({ question, testNames })
        }
      })
      
      analysisResult.safeToDelete.forEach(questionId => {
        const question = selectedQuestions.find(q => q.id === questionId)
        if (question) {
          safeToDelete.push(question)
        }
      })
      
      setAnalysis({
        safeToDelete,
        usedInTests,
        canProceed: analysisResult.canProceed,
        totalSafeCount: analysisResult.totalSafeCount,
        totalUsedCount: analysisResult.totalUsedCount
      })
    } catch (error) {
      console.error('Error analyzing questions:', error)
      setError('Failed to analyze questions. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleConfirmDeletion = async () => {
    console.log('🗑️ SafeDeletionModal: Starting deletion process')
    console.log('📊 Current analysis state:', analysis)
    
    if (!analysis || !analysis.canProceed || analysis.totalSafeCount === 0) {
      console.log('❌ Cannot proceed with deletion - analysis not ready or no safe questions')
      return
    }
    
    setIsDeleting(true)
    try {
      const safeQuestionIds = analysis.safeToDelete.map(q => q.id)
      console.log('✅ Safe question IDs for deletion:', safeQuestionIds)
      
      // Only attempt to delete the questions that were confirmed as safe
      console.log('🚀 Calling deleteQuestionsDirectly with IDs:', safeQuestionIds)
      const result = await deleteQuestionsDirectly(safeQuestionIds)
      console.log('📊 Deletion result received:', result)
      
      if (result.success) {
        toast.success(`Successfully deleted ${analysis.totalSafeCount} question${analysis.totalSafeCount !== 1 ? 's' : ''}`)
        onDeleted()
        onOpenChange(false)
      } else {
        // This should not happen since we only delete safe questions
        // But handle it gracefully if it does
        toast.error(`Unexpected error: ${result.message}`)
      }
    } catch (error) {
      console.error('Error deleting questions:', error)
      toast.error('Failed to delete questions. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const truncateText = (text: string, maxLength: number = 60) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl blur-md opacity-20" />
              <div className="relative bg-gradient-to-br from-red-500 to-orange-600 rounded-xl p-2 shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Safe Deletion Analysis
              </DialogTitle>
              <DialogDescription className="text-gray-600 font-medium">
                Analyzing {selectedQuestionIds.length} selected question{selectedQuestionIds.length !== 1 ? 's' : ''} for safe deletion
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isAnalyzing && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-gray-600 font-medium">Analyzing question usage...</p>
                <p className="text-sm text-gray-500">Checking mock test dependencies</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {analysis && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {analysis.totalSafeCount > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Safe to Delete</span>
                    </div>
                    <p className="text-sm text-green-700">
                      {analysis.totalSafeCount} question{analysis.totalSafeCount !== 1 ? 's' : ''} can be safely removed
                    </p>
                  </div>
                )}

                {analysis.totalUsedCount > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <span className="font-semibold text-amber-800">In Use</span>
                    </div>
                    <p className="text-sm text-amber-700">
                      {analysis.totalUsedCount} question{analysis.totalUsedCount !== 1 ? 's' : ''} currently used in mock tests
                    </p>
                  </div>
                )}
              </div>

              {/* Used in Tests Details */}
              {analysis.usedInTests.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TestTube className="h-5 w-5 text-amber-600" />
                    <span className="font-semibold text-amber-800">Questions Currently in Use</span>
                  </div>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {analysis.usedInTests.map(({ question, testNames }) => (
                      <div key={question.id} className="bg-white rounded-lg p-3 border border-amber-200">
                        <div className="flex items-start gap-2">
                          <FileQuestion className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              #{question.id}: {truncateText(question.question_text)}
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              Used in: {testNames.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safe to Delete Details */}
              {analysis.safeToDelete.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Safe to Delete</span>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {analysis.safeToDelete.map((question) => (
                      <div key={question.id} className="bg-white rounded-lg p-2 border border-green-200">
                        <p className="text-sm text-gray-900">
                          #{question.id}: {truncateText(question.question_text, 50)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      {analysis.canProceed 
                        ? `Ready to delete ${analysis.totalSafeCount} question${analysis.totalSafeCount !== 1 ? 's' : ''}. This action cannot be undone.`
                        : 'No questions can be deleted as all are currently in use by mock tests.'
                      }
                    </p>
                    {analysis.totalUsedCount > 0 && (
                      <p className="text-xs text-blue-700 mt-1">
                        Remove questions from mock tests first to delete them.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
            className="px-6 py-2 border border-gray-200/50 hover:border-gray-300/50 bg-white/80 hover:bg-gray-50 transition-all duration-200 rounded-xl font-medium"
          >
            Cancel
          </Button>
          
          {analysis && analysis.canProceed && (
            <Button
              onClick={handleConfirmDeletion}
              disabled={isDeleting}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {analysis.totalSafeCount} Question{analysis.totalSafeCount !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
