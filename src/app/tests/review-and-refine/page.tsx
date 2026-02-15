'use client'

import ReviewRefineInterface from '@/components/tests/review-refine-interface'
import { useTestCreationStore } from '@/stores/testCreationStore'
import { convertQuestionsToSlots } from '@/components/tests/utils/convertQuestionsToSlots'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { regenerateSingleQuestion } from '@/lib/actions/tests'
import type { Question } from '@/lib/types'

export default function ReviewAndRefinePage() {
  const { selectedQuestions, setSelectedQuestions } = useTestCreationStore()
  const [questionsFromModal, setQuestionsFromModal] = useState<Question[]>([])
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(true)
  const [globalMarkingRules, setGlobalMarkingRules] = useState({
    marksPerCorrect: 1,
    penaltyPerIncorrect: 0.25
  })
  const router = useRouter()

  // Load questions from localStorage if they exist (from the new modal)
  useEffect(() => {
    const storedQuestions = localStorage.getItem('selectedTestQuestions')
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
    // Mark loading as complete after attempting to load from localStorage
    setIsLoadingFromStorage(false)
  }, [setSelectedQuestions])

  // Use questions from modal if available, otherwise use store
  const questionsToUse = questionsFromModal.length > 0 ? questionsFromModal : selectedQuestions
  const questionSlots = convertQuestionsToSlots(questionsToUse)

  useEffect(() => {
    // Only redirect if we've finished loading from localStorage and there are still no questions
    if (!isLoadingFromStorage && questionsToUse.length === 0) {
      // Redirect back to tests page if no questions are selected
      router.push('/tests')
    }
  }, [questionsToUse.length, router, isLoadingFromStorage])

  const handleRegenerate = async (index: number) => {
    // For blueprint-generated questions, we need to regenerate based on the original criteria
    // For now, we'll implement a simple regeneration that replaces the question
    // This could be enhanced to store the original blueprint criteria
    const currentQuestion = questionsToUse[index]
    if (!currentQuestion) return

    try {
      // For simplicity, we'll just regenerate from the same chapter
      // In a more advanced implementation, we'd store the original blueprint criteria
      const newQuestion = await regenerateSingleQuestion({
        chapter_name: currentQuestion.chapter_name,
        source_type: 'random',
        exclude_ids: questionsToUse.map(q => q.id as number).filter(Boolean)
      })
      
      if (newQuestion) {
        const updatedQuestions = [...questionsToUse]
        updatedQuestions[index] = newQuestion
        setQuestionsFromModal(updatedQuestions)
        setSelectedQuestions(updatedQuestions)
      }
    } catch (error) {
      console.error('Failed to regenerate question:', error)
    }
  }

  // Show loading state while loading from localStorage
  if (isLoadingFromStorage) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <ReviewRefineInterface
        questions={questionSlots}
        onQuestionsChange={(slots) => {
          console.log('🔄 onQuestionsChange called with slots:', slots)
          // Preserve custom marking data by storing it on the question object
          const newQuestions = slots.map((slot) => {
            const question = { ...slot.question }
            if (slot.customMarking) {
              (question as any).customMarking = slot.customMarking
            }
            return question
          })
          console.log('💾 Updated questions with custom marking:', newQuestions)
          setSelectedQuestions(newQuestions)
          setQuestionsFromModal(newQuestions)
        }}
        onRegenerate={handleRegenerate}
        onEdit={() => {}}
        onNext={() => {
          // Store global marking rules in localStorage for the finalization page
          localStorage.setItem('globalMarkingRules', JSON.stringify(globalMarkingRules))
          // Navigate to the finalization stage
          router.push('/tests/finalize')
        }}
        isQuestionBankMode
        globalMarkingRules={globalMarkingRules}
        onGlobalMarkingRulesChange={setGlobalMarkingRules}
      />
    </div>
  )
}

