'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getChapterQuestionCount, getChaptersWithTags, generateTestPaperFromBlueprint, regenerateSingleQuestion } from '@/lib/actions/tests'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/section-header'
import { ArrowLeft } from 'lucide-react'
import type { TestQuestionSlot, ChapterInfo, BlueprintRule, ChapterBlueprint, TestBlueprint } from '@/lib/types'
import type { Test } from '@/lib/supabase/admin'
import ReviewRefineInterface from './review-refine-interface'
import { TestFinalizationStage, type TestFormData, type PublishData } from './test-finalization-stage'
import { TestCreationOptionsModal } from './test-creation-options-modal'
import { TwoColumnBlueprintBuilder } from './two-column-blueprint-builder'
import { saveTest } from '@/lib/actions/tests'
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
  const [currentStep, setCurrentStep] = useState(isEditMode ? 2 : 1) // Start with blueprint step for new tests
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showOptionsModal, setShowOptionsModal] = useState(false) // Don't show options modal by default
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])
  const [creationMethod, setCreationMethod] = useState<'blueprint' | 'question-bank' | null>('blueprint') // Default to blueprint
  
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
  

  // Stage 2: Review & Refine
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
          setCurrentStep(2)
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
    setCurrentStep(2)
    setError(null)
  }

  const handlePrevious = () => {
    setCurrentStep(1)
    setError(null)
  }

  const handleRegenerateAt = async (index: number) => {
    const slot = reviewQuestions[index]
    if (!slot) return
    const exclude = reviewQuestions.map((s) => s.question.id as number).filter(Boolean)
    
    // Map the source_type to the expected format
    let sourceType: 'random' | 'rule' = 'random'
    let ruleTag: string | null = null
    let ruleDifficulty: string | null = null
    
    if (slot.source_type === 'tag' && slot.source_value) {
      sourceType = 'rule'
      ruleTag = slot.source_value
    } else if (slot.source_type === 'difficulty' && slot.source_value) {
      sourceType = 'rule'
      ruleDifficulty = slot.source_value
    }
    
    const newQ = await regenerateSingleQuestion({
      chapter_name: slot.chapter_name,
      source_type: sourceType,
      rule_tag: ruleTag,
      rule_difficulty: ruleDifficulty,
      exclude_ids: exclude,
    })
    if (newQ) {
      const copy = [...reviewQuestions]
      copy[index] = { ...slot, question: newQ }
      setReviewQuestions(copy)
    }
  }

  const handleSaveTest = async (testData: TestFormData) => {
    const questionIds = reviewQuestions.map((slot) => slot.question.id as number).filter(Boolean)
    
    await saveTest({
      testId: isEditMode ? testId : undefined,
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

  const handlePublishTest = async (testData: TestFormData, publishData: PublishData) => {
    const questionIds = reviewQuestions.map((slot) => slot.question.id as number).filter(Boolean)
    
    await saveTest({
      testId: isEditMode ? testId : undefined,
      name: testData.name,
      description: testData.description || undefined,
      total_time_minutes: testData.totalTimeMinutes,
      marks_per_correct: testData.marksPerCorrect,
      negative_marks_per_incorrect: testData.negativeMarksPerIncorrect,
      result_policy: testData.resultPolicy,
      result_release_at: testData.resultPolicy === 'scheduled' ? testData.resultReleaseAt : null,
      question_ids: questionIds,
      publish: {
        start_time: publishData.startTime,
        end_time: publishData.endTime
      }
    })
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
          {/* Page Header - Only show for steps 2 and 3, not for step 1 (blueprint builder has its own header) */}
          {currentStep > 1 && !(isEditMode && currentStep === 3) && (
            <PageHeader
              title={isEditMode ? 'Edit Mock Test' : 'Create Mock Test'}
              subtitle={
                currentStep === 2 ? 'Review and refine questions'
                : currentStep === 3 ? 'Set rules and publish'
                : undefined
              }
              actions={
                currentStep > 1 && currentStep !== 3 ? (
                  <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="group relative overflow-hidden h-10 px-4 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                title="Go back"
              >
                <ArrowLeft className="h-4 w-4 mr-2 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                <span className="font-medium">Back</span>
              </Button>
            ) : undefined
          }
          className="mb-8"
        />
      )}

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

      {/* Step 2: Review & Refine */}
      {currentStep === 2 && !showOptionsModal && (
        <ReviewRefineInterface
          questions={creationMethod === 'question-bank' ? convertQuestionsToSlots(selectedQuestions) : reviewQuestions}
          onQuestionsChange={creationMethod === 'question-bank' ? (slots) => setSelectedQuestions(slots.map(slot => slot.question)) : setReviewQuestions}
          onRegenerate={handleRegenerateAt}
          onEdit={(index) => {
            // Placeholder for edit functionality
            console.log('Edit question at index:', index)
          }}
          onNext={() => setCurrentStep(3)}
          isQuestionBankMode={creationMethod === 'question-bank'}
        />
      )}

      {/* Step 3: Finalize & Publish */}
      {currentStep === 3 && (
        <TestFinalizationStage
          questions={reviewQuestions}
          onPrevious={() => setCurrentStep(2)}
          onSave={handleSaveTest}
          onPublish={handlePublishTest}
          initialTestData={isEditMode ? initialData?.test : undefined}
          isEditMode={isEditMode}
          testId={testId}
        />
      )}

        </div>
      </div>
      </>
      )}
    </div>
  )
}
