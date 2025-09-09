'use client'

import { useState, useEffect, useMemo } from 'react'
import { getChapterQuestionCount, getChaptersWithTags, generateTestPaperFromBlueprint, regenerateSingleQuestion } from '@/lib/actions/tests'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
// Card components removed - not used in this component
import { ArrowRight, FileText } from 'lucide-react'
// Link removed - not used in this component
import type { TestQuestionSlot, ChapterInfo, BlueprintRule, ChapterBlueprint, TestBlueprint } from '@/lib/types'
import type { Test } from '@/lib/supabase/admin'
import { ReviewRefineInterface } from './review-refine-interface'
import { TestFinalizationStage, type TestFormData, type PublishData } from './test-finalization-stage'
import { saveTest } from '@/lib/actions/tests'

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
  const [currentStep, setCurrentStep] = useState(isEditMode ? 2 : 1)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Step 1: Test Blueprint
  const [chapters, setChapters] = useState<ChapterInfo[]>([])
  const [blueprint, setBlueprint] = useState<BlueprintState>(initialData?.blueprint || {})
  const difficultyLevels: string[] = ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard']

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

  const setChapterRandom = (chapterName: string, value: number) => {
    setBlueprint((prev) => {
      const current = prev[chapterName] || {}
      return {
        ...prev,
        [chapterName]: {
          ...current,
          random: Math.max(0, value || 0)
        }
      }
    })
  }

  const addRule = (chapterName: string) => {
    setBlueprint((prev) => {
      const current = prev[chapterName] || {}
      const currentRules = current.rules || []
      return {
        ...prev,
        [chapterName]: {
          ...current,
          rules: [...currentRules, { tag: null, difficulty: null, quantity: 0 } as BlueprintRule]
        }
      }
    })
  }

  const updateRule = (chapterName: string, index: number, patch: Partial<BlueprintRule>) => {
    setBlueprint((prev) => {
      const current = prev[chapterName] || {}
      const currentRules = current.rules || []
      const next = [...currentRules]
      next[index] = { ...next[index], ...patch }
      return {
        ...prev,
        [chapterName]: {
          ...current,
          rules: next
        }
      }
    })
  }

  const removeRule = (chapterName: string, index: number) => {
    setBlueprint((prev) => {
      const current = prev[chapterName] || {}
      const currentRules = current.rules || []
      const next = currentRules.filter((_, i) => i !== index)
      return {
        ...prev,
        [chapterName]: {
          ...current,
          rules: next
        }
      }
    })
  }

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
    <div className="min-h-screen">
      {/* Unified Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="mobile-text-lg font-bold text-gray-900 tracking-tight">
                    {isEditMode ? 'Edit Mock Test' : 'Create Mock Test'}
                  </h2>
                  <p className="mobile-text-sm text-gray-600 font-medium">
                    {currentStep === 1 && 'Design your test blueprint'}
                    {currentStep === 2 && 'Review and refine questions'}
                    {currentStep === 3 && 'Set rules and publish'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  className="hover:bg-gray-50 transition-colors duration-200 touch-target w-full sm:w-auto"
                >
                  <span className="hidden sm:inline">← Previous</span>
                  <span className="sm:hidden">← Back</span>
                </Button>
              )}
              
              {currentStep === 1 && (
                <Button 
                  onClick={handleNext} 
                  disabled={totalQuestions === 0 || isGenerating}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span className="hidden sm:inline">Generating Questions...</span>
                      <span className="sm:hidden">Generating...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Next: Review & Refine</span>
                      <span className="sm:hidden">Next</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6">

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Step 1: Test Blueprint */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 bg-gradient-to-r from-gray-50/50 to-white/50 border-b border-gray-100/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="mobile-text-lg font-bold text-gray-900 tracking-tight">
                    Test Blueprint
                  </h2>
                  <p className="mobile-text-sm text-gray-600 font-medium">
                    Design your blueprint by chapter and difficulty
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center sm:justify-end">
                <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Total Questions</span>
                  <span className="ml-2 text-base sm:text-lg font-bold text-blue-600">{totalQuestions}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">

              <div className="space-y-4">
                {chapters.map((chapter) => {
                  const chState = blueprint[chapter.name] || {}
                  const rules = chState.rules || []
                  const selectedCount = (chState.random || 0) + rules.reduce((sum, r) => sum + (r.quantity || 0), 0)
                  
                  return (
                    <details key={chapter.name} className="group border border-gray-200/50 rounded-xl overflow-hidden bg-white/50 hover:bg-white/80 transition-all duration-200">
                      <summary className="cursor-pointer flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50/50 transition-colors duration-200">
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-200">
                            <FileText className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">{chapter.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 font-medium">{chapter.available} questions available</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 ml-2">
                          <div className="px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
                            <span className="text-xs sm:text-sm font-semibold text-blue-600">
                              {selectedCount} selected
                            </span>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-gray-200 group-hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center">
                            <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors duration-200">+</span>
                          </div>
                        </div>
                      </summary>

                      <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100/50">
                        <div className="space-y-4 sm:space-y-6">
                          {/* A) Quantity (Simple Mode) */}
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-gray-700">Random questions from this chapter</Label>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="w-20 sm:w-24 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mobile-input"
                                value={(chState.random ?? 0).toString()}
                                onChange={(e) => {
                                  const digitsOnly = e.target.value.replace(/[^0-9]/g, '')
                                  const num = Math.min(Math.max(parseInt(digitsOnly || '0', 10), 0), chapter.available)
                                  setChapterRandom(chapter.name, num)
                                }}
                              />
                              <span className="text-xs sm:text-sm text-gray-600 font-medium">0 - {chapter.available}</span>
                            </div>
                          </div>

                          {/* B) Ultra-Granular Rule Builder */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-semibold text-gray-700">Custom Rules</Label>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => addRule(chapter.name)}
                                className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200"
                              >
                                + Add Custom Rule
                              </Button>
                            </div>
                            {rules.length === 0 ? (
                              <div className="p-4 text-center bg-gray-50/50 rounded-lg border border-gray-200/50">
                                <p className="text-sm text-gray-600 font-medium">No custom rules added.</p>
                                <p className="text-xs text-gray-500 mt-1">Add specific difficulty or tag-based rules</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {rules.map((rule, idx) => (
                                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-4 bg-white/80 rounded-lg border border-gray-200/50 shadow-sm">
                                <div className="md:col-span-5">
                                  <Label className="text-xs">Tag</Label>
                                  <Select value={rule.tag ?? 'any'} onValueChange={(v) => updateRule(chapter.name, idx, { tag: v === 'any' ? null : v })}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Any Tag" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="any">Any Tag</SelectItem>
                                      {chapter.tags.filter(Boolean).map((t: string) => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="md:col-span-5">
                                  <Label className="text-xs">Difficulty</Label>
                                  <Select value={rule.difficulty ?? 'any'} onValueChange={(v) => updateRule(chapter.name, idx, { difficulty: v === 'any' ? null : v })}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Any Difficulty" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="any">Any Difficulty</SelectItem>
                                      {difficultyLevels.map((d) => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="md:col-span-2">
                                  <Label className="text-xs">Qty</Label>
                                  <Input type="number" min={0} value={rule.quantity} onChange={(e) => updateRule(chapter.name, idx, { quantity: Number(e.target.value) })} />
                                </div>
                                <div className="md:col-span-12 flex justify-end">
                                  <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => removeRule(chapter.name, idx)}>🗑️ Remove</Button>
                                </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </details>
                )
              })}

              {chapters.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No chapters found. Please add some questions first.</p>
                </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Step 2: Review & Refine */}
      {currentStep === 2 && (
        <ReviewRefineInterface
          questions={reviewQuestions}
          onQuestionsChange={setReviewQuestions}
          onRegenerate={handleRegenerateAt}
          onEdit={(index) => {
            // Placeholder for edit functionality
            console.log('Edit question at index:', index)
          }}
          // onPrevious removed - not used in ReviewRefineInterface
          onNext={() => setCurrentStep(3)}
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
  )
}
