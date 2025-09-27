'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getChapterQuestionCount, getChaptersWithTags, generateTestPaperFromBlueprint } from '@/lib/actions/tests'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/section-header'
import { ArrowLeft } from 'lucide-react'
import type { TestQuestionSlot, ChapterInfo, BlueprintRule, ChapterBlueprint, TestBlueprint } from '@/lib/types'
import type { Test } from '@/lib/supabase/admin'
import { TestCreationOptionsModal } from './test-creation-options-modal'
import { TwoColumnBlueprintBuilder } from './two-column-blueprint-builder'
import type { Question } from '@/lib/types'

type BlueprintState = Record<string, ChapterBlueprint>

interface TestCreationWizardProps {
  initialData?: {
    test: Test
    questions: TestQuestionSlot[]
    blueprint: TestBlueprint
  }
  isEditMode?: boolean
  testId?: number
}

export function TestCreationWizard({ 
  initialData, 
  isEditMode = false, 
  testId 
}: TestCreationWizardProps = {}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1) // Always start with step 1 (blueprint configuration)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showOptionsModal, setShowOptionsModal] = useState(false) // Don't show options modal by default
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])
  const [creationMethod, setCreationMethod] = useState<'blueprint' | 'question-bank' | null>('blueprint') // Default to blueprint
  const [isNavigatingToEdit, setIsNavigatingToEdit] = useState(false)

  // Handle edit mode - navigate directly to Review & Refine page
  useEffect(() => {
    if (isEditMode && initialData?.questions) {
      setIsNavigatingToEdit(true)
      
      // Store the existing test questions in localStorage for the Review & Refine page
      const questions = initialData.questions.map(slot => slot.question)
      localStorage.setItem('selectedTestQuestions', JSON.stringify(questions))
      
      // Store the test ID for the finalization page
      if (testId) {
        localStorage.setItem('editingTestId', testId.toString())
      }
      
      // Navigate to the unified Review & Refine page
      router.push('/tests/review-and-refine')
    }
  }, [isEditMode, initialData, router, testId])
  
  // Step 1: Test Blueprint
  const [chapters, setChapters] = useState<ChapterInfo[]>([])
  const [blueprint, setBlueprint] = useState<BlueprintState>(initialData?.blueprint || {})
  const difficultyLevels: string[] = ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard']

  // Handle options modal
  const handleBlueprintSelect = () => {
    setCreationMethod('blueprint')
    setShowOptionsModal(false)
    setCurrentStep(1) // Go to blueprint step
  }

  const handleQuestionBankSelect = (questions: Question[]) => {
    setCreationMethod('question-bank')
    setSelectedQuestions(questions)
    setShowOptionsModal(false)
    
    // Store the selected questions in localStorage for the Review & Refine page
    localStorage.setItem('selectedTestQuestions', JSON.stringify(questions))
    
    // Navigate to the Review & Refine page
    router.push('/tests/review-and-refine')
  }

  const handleModalClose = () => {
    setShowOptionsModal(false)
    // If no method was selected and we're not in edit mode, redirect back to tests page
    if (!creationMethod && !isEditMode) {
      router.push('/tests')
    }
  }

  // Convert Question[] to TestQuestionSlot[]
  const convertQuestionsToSlots = (questions: Question[]): TestQuestionSlot[] => {
    return questions.map(question => ({
      question,
      source_type: 'custom' as const,
      chapter_name: question.chapter_name,
      source_value: null,
      tempId: `custom-${question.id}-${Date.now()}`
    }))
  }

  const totalQuestions = useMemo(() => {
    let total = 0
    for (const chapterName of Object.keys(blueprint)) {
      const ch = blueprint[chapterName]
      if (!ch) continue
      total += ch.random || 0
      if (Array.isArray(ch.rules)) {
        total += ch.rules.reduce((sum, r) => sum + (r.quantity || 0), 0)
      }
    }
    return total
  }, [blueprint])
  

  // Store generated questions for potential use
  const [reviewQuestions, setReviewQuestions] = useState<TestQuestionSlot[]>(initialData?.questions || [])

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const chaptersWithTags = await getChaptersWithTags()
        const chaptersWithCounts = await Promise.all(
          chaptersWithTags.map(async (item) => {
            const count = await getChapterQuestionCount(item.chapter_name)
            return { name: item.chapter_name, available: count, tags: item.tags }
          })
        )
        setChapters(chaptersWithCounts)
      } catch (err) {
        setError('Failed to load chapters')
        console.error('Error:', err)
      }
    }

    fetchChapters()
  }, [])


  const handleNext = () => {
    if (currentStep === 1) {
      // Log the blueprint for now; the next stage wiring will be added later
      console.log('Blueprint:', blueprint)
      if (totalQuestions === 0) {
        setError('Please select at least one question for your test')
        return
      }
      setIsGenerating(true)
      setError(null)
      
      generateTestPaperFromBlueprint(blueprint)
        .then((slots) => {
          // Convert GeneratedTestSlot to TestQuestionSlot
          const convertedSlots: TestQuestionSlot[] = slots.map(slot => ({
            ...slot,
            source_type: slot.source_type === 'rule' ? 'tag' : slot.source_type
          }))
          setReviewQuestions(convertedSlots)
          
          // Store the generated questions in localStorage for the unified Review & Refine page
          const questions = convertedSlots.map(slot => slot.question)
          localStorage.setItem('selectedTestQuestions', JSON.stringify(questions))
          
          // Navigate to the unified Review & Refine page
          router.push('/tests/review-and-refine')
          setError(null)
        })
        .catch((err) => {
          console.error('Failed to generate test paper:', err)
          setError('Failed to generate test paper')
        })
        .finally(() => {
          setIsGenerating(false)
        })
      return
    }
  }



  return (
    <div className="w-full h-screen flex flex-col">
      {/* Test Creation Options Modal */}
      <TestCreationOptionsModal
        open={showOptionsModal}
        onClose={handleModalClose}
        onBlueprintSelect={handleBlueprintSelect}
        onQuestionBankSelect={handleQuestionBankSelect}
      />

      {/* Show loading state when modal is open - this should be the only content */}
      {showOptionsModal && (
        <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading test creation options...</p>
          </div>
        </div>
      )}
      {!showOptionsModal && (
        <>
          {/* Show loading state when navigating to edit mode */}
          {isNavigatingToEdit ? (
            <div className="flex-1 overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading test editor...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Main Content */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full">

                {/* Step 1: Test Blueprint - Two-Column Blueprint Builder */}
                {currentStep === 1 && !showOptionsModal && (
          <div className="w-full h-full">
            <TwoColumnBlueprintBuilder
              chapters={chapters}
              blueprint={blueprint}
              onBlueprintChange={setBlueprint}
              onNext={handleNext}
              isGenerating={isGenerating}
              error={error}
            />
          </div>
        )}



                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
