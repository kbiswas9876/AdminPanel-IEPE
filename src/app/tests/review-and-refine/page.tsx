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

  return (
    <div className="min-h-screen bg-gray-50/30">
      <ReviewRefineInterface
        questions={questionSlots}
        onQuestionsChange={(slots) => {
          const newQuestions = slots.map((slot) => slot.question)
          setSelectedQuestions(newQuestions)
          setQuestionsFromModal(newQuestions)
        }}
        onRegenerate={handleRegenerate}
        onEdit={() => {}}
        onNext={() => {
          // Navigate to the finalization stage
          router.push('/tests/finalize')
        }}
        isQuestionBankMode
      />
    </div>
  )
}

