'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TestFinalizationStage, type TestFormData, type PublishData } from '@/components/tests/test-finalization-stage'
import { convertQuestionsToSlots } from '@/components/tests/utils/convertQuestionsToSlots'
import { useTestCreationStore } from '@/stores/testCreationStore'
import { saveTest } from '@/lib/actions/tests'
import type { Question } from '@/lib/types'

export default function TestFinalizePage() {
  const router = useRouter()
  const { selectedQuestions, setSelectedQuestions } = useTestCreationStore()
  const [questionsFromModal, setQuestionsFromModal] = useState<Question[]>([])
  const [editTestId, setEditTestId] = useState<number | undefined>(undefined)

  // Load questions from localStorage if they exist (from the question bank flow or edit flow)
  useEffect(() => {
    const storedQuestions = localStorage.getItem('selectedTestQuestions')
    const storedTestId = localStorage.getItem('editingTestId')
    
    console.log('🔍 Finalize page - localStorage check:', { storedQuestions: !!storedQuestions, storedTestId })
    
    if (storedQuestions) {
      try {
        const parsedQuestions = JSON.parse(storedQuestions)
        setQuestionsFromModal(parsedQuestions)
        setSelectedQuestions(parsedQuestions)
        // Clear the stored questions after loading
        localStorage.removeItem('selectedTestQuestions')
      } catch (error) {
        console.error('Error parsing stored questions:', error)
      }
    }
    
    // Only set editTestId if we have a valid stored test ID
    // This prevents false edit mode detection from stale localStorage data
    if (storedTestId && !isNaN(parseInt(storedTestId))) {
      console.log('🔍 Setting editTestId:', parseInt(storedTestId))
      setEditTestId(parseInt(storedTestId))
      // Clear the stored test ID after loading
      localStorage.removeItem('editingTestId')
    } else {
      console.log('🔍 No valid editTestId found, staying in create mode')
    }
  }, [setSelectedQuestions])

  // Use questions from modal if available, otherwise use store
  const questionsToUse = questionsFromModal.length > 0 ? questionsFromModal : selectedQuestions
  const questionSlots = convertQuestionsToSlots(questionsToUse)

  useEffect(() => {
    if (questionsToUse.length === 0) {
      // Redirect back to tests page if no questions are selected
      router.push('/tests')
    }
  }, [questionsToUse.length, router])

  const handleSave = async (testData: TestFormData) => {
    const questionIds = questionSlots.map((slot) => slot.question.id as number).filter(Boolean)
    
    console.log('🔍 Finalize page - handleSave called:', { 
      editTestId, 
      isEditMode: !!editTestId, 
      questionIdsCount: questionIds.length,
      testName: testData.name 
    })
    
    await saveTest({
      testId: editTestId,
      name: testData.name,
      description: testData.description || undefined,
      total_time_minutes: testData.totalTimeMinutes,
      marks_per_correct: testData.marksPerCorrect,
      negative_marks_per_incorrect: testData.negativeMarksPerIncorrect,
      result_policy: testData.resultPolicy,
      result_release_at: testData.resultPolicy === 'scheduled' ? testData.resultReleaseAt : null,
      question_ids: questionIds,
      publish: null // Save as draft
    })
  }

  const handlePublish = async (testData: TestFormData, publishData: PublishData) => {
    const questionIds = questionSlots.map((slot) => slot.question.id as number).filter(Boolean)
    
    await saveTest({
      testId: editTestId,
      name: testData.name,
      description: testData.description || undefined,
      total_time_minutes: testData.totalTimeMinutes,
      marks_per_correct: testData.marksPerCorrect,
      negative_marks_per_incorrect: testData.negativeMarksPerIncorrect,
      result_policy: publishData.resultPolicy,
      result_release_at: publishData.resultPolicy === 'scheduled' ? publishData.resultReleaseAt : null,
      question_ids: questionIds,
      publish: {
        start_time: publishData.startTime,
        end_time: publishData.endTime
      }
    })
  }

  const handlePrevious = () => {
    // Navigate back to the review and refine page
    router.push('/tests/review-and-refine')
  }

  if (questionsToUse.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test finalization...</p>
        </div>
      </div>
    )
  }

  return (
    <TestFinalizationStage
      questions={questionSlots}
      onPrevious={handlePrevious}
      onSave={handleSave}
      onPublish={handlePublish}
      isEditMode={!!editTestId}
      testId={editTestId}
    />
  )
}
