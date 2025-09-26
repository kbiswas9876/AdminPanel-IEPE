'use client'

import ReviewRefineInterface from '@/components/tests/review-refine-interface'
import { useTestCreationStore } from '@/stores/testCreationStore'
import { convertQuestionsToSlots } from '@/components/tests/utils/convertQuestionsToSlots'
import { useEffect } from 'react'

export default function ReviewAndRefinePage() {
  const { selectedQuestions, setSelectedQuestions } = useTestCreationStore()
  const questionSlots = convertQuestionsToSlots(selectedQuestions)

  useEffect(() => {
    if (selectedQuestions.length === 0) {
      // TODO: handle redirect back if no questions are selected
    }
  }, [selectedQuestions])

  return (
    <div className="min-h-screen bg-gray-50/30">
      <ReviewRefineInterface
        questions={questionSlots}
        onQuestionsChange={(slots) => setSelectedQuestions(slots.map((slot) => slot.question))}
        onRegenerate={() => {}}
        onEdit={() => {}}
        onNext={() => {}}
        isQuestionBankMode
      />
    </div>
  )
}

