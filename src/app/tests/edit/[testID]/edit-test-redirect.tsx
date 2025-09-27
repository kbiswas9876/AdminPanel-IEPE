'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Question } from '@/lib/types'

interface EditTestRedirectProps {
  testData: {
    questions: Array<{ question: Question }>
  }
  testId: number
}

export default function EditTestRedirect({ testData, testId }: EditTestRedirectProps) {
  const router = useRouter()

  useEffect(() => {
    // Store the existing test questions in localStorage for the Review & Refine page
    const questions = testData.questions.map(slot => slot.question)
    localStorage.setItem('selectedTestQuestions', JSON.stringify(questions))
    
    // Store the test ID for the finalization page
    localStorage.setItem('editingTestId', testId.toString())
    
    // Navigate to the unified Review & Refine page
    router.push('/tests/review-and-refine')
  }, [testData, testId, router])

  return (
    <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading test editor...</p>
      </div>
    </div>
  )
}
