'use client'

import { useState, useEffect, useMemo } from 'react'
import { getChapterQuestionCount, getChaptersWithTags, generateTestPaperFromBlueprint, regenerateSingleQuestion } from '@/lib/actions/tests'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ArrowRight, ArrowLeft, FileText, BookOpen, Plus, Settings, Target, Zap, Hash, Trash2, Tag, Award, Sparkles } from 'lucide-react'
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
    <div className="w-full">
      {/* Premium Mobile Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between w-full">
            {/* Left Section - Back Button & Title */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="flex-shrink-0 h-8 w-8 p-0 hover:bg-gray-50 transition-colors duration-200"
                  title="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 shadow-sm">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                    {isEditMode ? 'Edit Mock Test' : 'Create Mock Test'}
                  </h1>
                  <p className="text-xs text-gray-600 font-medium">
                    {currentStep === 1 && 'Design your test blueprint'}
                    {currentStep === 2 && 'Review and refine questions'}
                    {currentStep === 3 && 'Set rules and publish'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right Section - Primary Action */}
            <div className="flex-shrink-0 ml-3">
              {currentStep === 1 && (
                <Button 
                  onClick={handleNext} 
                  disabled={totalQuestions === 0 || isGenerating}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs px-3 py-2 h-8 min-w-[120px]"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
                      <span className="text-xs font-medium">Generating...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline text-xs font-medium">Next: Review & Refine</span>
                      <span className="sm:hidden text-xs font-medium">Next</span>
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Perfectly Aligned with Header */}
      <div className="w-full px-4 sm:px-6 pb-4">

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Step 1: Test Blueprint - Premium Design */}
        {currentStep === 1 && (
          <div className="space-y-4 w-full max-w-full">
            {/* Ultra-Premium Blueprint Summary */}
            <div className="bg-gradient-to-r from-white to-blue-50/30 rounded-xl border border-gray-200/50 shadow-lg p-5 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-md">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Test Blueprint</h3>
                    <p className="text-sm text-gray-600 font-medium">Design by chapter and difficulty</p>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 shadow-sm">
                  <span className="text-sm font-medium text-gray-700">Total: </span>
                  <span className="text-lg font-bold text-blue-600">{totalQuestions}</span>
                </div>
              </div>
            </div>

            {/* Ultra-Premium Chapter Selection */}
            <div className="space-y-4 w-full">
              {chapters.map((chapter) => {
                const chState = blueprint[chapter.name] || {}
                const rules = chState.rules || []
                const selectedCount = (chState.random || 0) + rules.reduce((sum, r) => sum + (r.quantity || 0), 0)
                
                return (
                  <details key={chapter.name} className="group border border-gray-200/50 rounded-xl overflow-hidden bg-white hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300 w-full">
                    <summary className="cursor-pointer flex items-center justify-between p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-300">
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 shadow-md group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:shadow-lg transition-all duration-300">
                          <BookOpen className="h-5 w-5 text-purple-600 group-hover:text-blue-600 transition-colors duration-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 text-base truncate">{chapter.name}</h3>
                          <p className="text-sm text-gray-600 font-medium">{chapter.available} questions available</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 shadow-sm">
                          <span className="text-sm font-bold text-blue-600">
                            {selectedCount}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 group-hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-md group-hover:shadow-lg">
                          <Plus className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                    </summary>

                    <div className="p-3 bg-gray-50/50 border-t border-gray-100/50">
                      <div className="space-y-3">
                        {/* Premium Random Questions Input */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="p-1 rounded-md bg-gradient-to-br from-green-100 to-emerald-100">
                              <Zap className="h-3 w-3 text-green-600" />
                            </div>
                            <Label className="text-xs font-bold text-gray-700">Random questions</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              className="w-16 h-8 text-xs transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={(chState.random ?? 0).toString()}
                              onChange={(e) => {
                                const digitsOnly = e.target.value.replace(/[^0-9]/g, '')
                                const num = Math.min(Math.max(parseInt(digitsOnly || '0', 10), 0), chapter.available)
                                setChapterRandom(chapter.name, num)
                              }}
                            />
                            <span className="text-xs text-gray-600 font-medium">0-{chapter.available}</span>
                          </div>
                        </div>

                        {/* Premium Custom Rules */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="p-1 rounded-md bg-gradient-to-br from-orange-100 to-amber-100">
                                <Settings className="h-3 w-3 text-orange-600" />
                              </div>
                              <Label className="text-xs font-bold text-gray-700">Custom Rules</Label>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => addRule(chapter.name)}
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200 text-xs h-8 px-3 shadow-sm hover:shadow-md"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1.5" />
                              <span className="font-semibold">Add Rule</span>
                            </Button>
                          </div>
                          {rules.length === 0 ? (
                            <div className="p-4 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 shadow-sm">
                              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                                <Sparkles className="h-6 w-6 text-gray-500" />
                              </div>
                              <p className="text-sm font-medium text-gray-600">No custom rules added</p>
                              <p className="text-xs text-gray-500 mt-1">Add specific question selection criteria</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {rules.map((rule, idx) => (
                                <div key={idx} className="bg-gradient-to-r from-white to-gray-50/50 rounded-xl border border-gray-200/50 shadow-sm p-4 hover:shadow-md transition-all duration-200">
                                  {/* Rule Header */}
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                        <Hash className="h-3 w-3 text-blue-600" />
                                      </div>
                                      <span className="text-sm font-bold text-gray-700">Rule #{idx + 1}</span>
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => removeRule(chapter.name, idx)}
                                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  
                                  {/* Form Controls Grid */}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Tag Selection */}
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 bg-gradient-to-br from-purple-100 to-pink-100 rounded-md flex items-center justify-center">
                                          <Tag className="h-3 w-3 text-purple-600" />
                                        </div>
                                        <Label className="text-xs font-bold text-gray-700">Tag</Label>
                                      </div>
                                      <Select value={rule.tag ?? 'any'} onValueChange={(v) => updateRule(chapter.name, idx, { tag: v === 'any' ? null : v })}>
                                        <SelectTrigger className="w-full h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                                          <SelectValue placeholder="Any" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="any">Any</SelectItem>
                                          {chapter.tags.filter(Boolean).map((t: string) => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Difficulty Selection */}
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 bg-gradient-to-br from-orange-100 to-amber-100 rounded-md flex items-center justify-center">
                                          <Award className="h-3 w-3 text-orange-600" />
                                        </div>
                                        <Label className="text-xs font-bold text-gray-700">Difficulty</Label>
                                      </div>
                                      <Select value={rule.difficulty ?? 'any'} onValueChange={(v) => updateRule(chapter.name, idx, { difficulty: v === 'any' ? null : v })}>
                                        <SelectTrigger className="w-full h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                                          <SelectValue placeholder="Any" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="any">Any</SelectItem>
                                          {difficultyLevels.map((d) => (
                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Quantity Input */}
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 bg-gradient-to-br from-green-100 to-emerald-100 rounded-md flex items-center justify-center">
                                          <Hash className="h-3 w-3 text-green-600" />
                                        </div>
                                        <Label className="text-xs font-bold text-gray-700">Quantity</Label>
                                      </div>
                                      <Input 
                                        type="number" 
                                        min={0} 
                                        value={rule.quantity} 
                                        onChange={(e) => updateRule(chapter.name, idx, { quantity: Number(e.target.value) })}
                                        className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                        placeholder="0"
                                      />
                                    </div>
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
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Chapters Available</h3>
                  <p className="text-gray-500 font-medium">Please add some questions first to create your test blueprint.</p>
                </div>
              )}
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
