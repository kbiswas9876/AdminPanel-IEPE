'use client'

import { useState, useEffect, useMemo } from 'react'
import { getChapterQuestionCount, getChaptersWithTags, generateTestPaperFromBlueprint, regenerateSingleQuestion } from '@/lib/actions/tests'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'
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
      generateTestPaperFromBlueprint(blueprint)
        .then((slots) => {
          setReviewQuestions(slots)
          setCurrentStep(2)
          setError(null)
        })
        .catch((err) => {
          console.error('Failed to generate test paper:', err)
          setError('Failed to generate test paper')
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
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator - hidden during Review & Refine per new UX */}
      {currentStep !== 2 && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className={`text-sm font-medium ${
                currentStep >= 1 ? 'text-blue-600' : 'text-gray-600'
              }`}>
                Test Blueprint
              </span>
            </div>
            
            <div className="flex-1 h-0.5 bg-gray-200 mx-4">
              <div className={`h-full transition-all duration-300 ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
              }`} style={{ width: currentStep >= 2 ? '100%' : '0%' }} />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className={`text-sm font-medium ${
                currentStep >= 2 ? 'text-blue-600' : 'text-gray-600'
              }`}>
                Test Rules
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Step 1: Test Blueprint */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Test Blueprint</span>
            </CardTitle>
            <CardDescription>
              Design your blueprint by chapter. Total questions selected: <strong>{totalQuestions}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Sticky total summary */}
            <div className="sticky top-0 z-10 mb-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border rounded-md p-3 flex items-center justify-between">
              <span className="text-sm text-gray-700">Total Questions Selected</span>
              <span className="font-semibold">{totalQuestions}</span>
            </div>

            <div className="space-y-4">
              {chapters.map((chapter) => {
                const chState = blueprint[chapter.name] || {}
                const rules = chState.rules || []
                return (
                  <details key={chapter.name} className="border rounded-lg p-4">
                    <summary className="cursor-pointer flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{chapter.name}</h3>
                        <p className="text-sm text-gray-500">{chapter.available} questions available</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        Selected: {(chState.random || 0) + rules.reduce((sum, r) => sum + (r.quantity || 0), 0)}
                      </div>
                    </summary>

                    <div className="mt-4 space-y-6">
                      {/* A) Quantity (Simple Mode) */}
                      <div className="space-y-2">
                        <Label>Random questions from this chapter</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={(chState.random ?? 0).toString()}
                            onChange={(e) => {
                              const digitsOnly = e.target.value.replace(/[^0-9]/g, '')
                              const num = Math.min(Math.max(parseInt(digitsOnly || '0', 10), 0), chapter.available)
                              setChapterRandom(chapter.name, num)
                            }}
                            className="w-24"
                          />
                          <span className="text-sm text-gray-500">0 - {chapter.available}</span>
                        </div>
                      </div>

                      {/* B) Ultra-Granular Rule Builder */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Custom Rules</Label>
                          <Button variant="outline" size="sm" onClick={() => addRule(chapter.name)}>+ Add Custom Rule</Button>
                        </div>
                        {rules.length === 0 ? (
                          <p className="text-sm text-gray-500">No custom rules added.</p>
                        ) : (
                          <div className="space-y-2">
                            {rules.map((rule, idx) => (
                              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center border rounded-md p-2">
                                <div className="md:col-span-5">
                                  <Label className="text-xs">Tag</Label>
                                  <Select value={rule.tag ?? 'any'} onValueChange={(v) => updateRule(chapter.name, idx, { tag: v === 'any' ? null : v })}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Any Tag" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="any">Any Tag</SelectItem>
                                      {chapter.tags.filter(Boolean).map((t) => (
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
          </CardContent>
        </Card>
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
          onPrevious={handlePrevious}
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

      {/* Navigation Buttons - Only for Step 1 */}
      {currentStep === 1 && (
        <div className="flex justify-between mt-8">
          <div></div>
          
          <div className="flex space-x-4">
            <Link href="/tests">
              <Button variant="outline">Cancel</Button>
            </Link>
            
            <Button onClick={handleNext} disabled={totalQuestions === 0}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}


    </div>
  )
}
