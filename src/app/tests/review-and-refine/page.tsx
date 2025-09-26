'use client'

import ReviewRefineInterface from '@/components/tests/review-refine-interface'
import { useTestCreationStore } from '@/stores/testCreationStore'
import { convertQuestionsToSlots } from '@/components/tests/utils/convertQuestionsToSlots'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

  return (
    <div className="min-h-screen bg-gray-50/30">
      <ReviewRefineInterface
        questions={questionSlots}
        onQuestionsChange={(slots) => {
          const newQuestions = slots.map((slot) => slot.question)
          setSelectedQuestions(newQuestions)
          setQuestionsFromModal(newQuestions)
        }}
        onRegenerate={() => {}}
        onEdit={() => {}}
        onNext={() => {}}
        isQuestionBankMode
      />
    </div>
  )
}

