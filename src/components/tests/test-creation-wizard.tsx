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
      {/* Premium Glassmorphism Header - Hidden in edit mode step 3 */}
      {!(isEditMode && currentStep === 3) && (
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-2xl shadow-blue-500/5 w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 pointer-events-none"></div>
          <div className="relative px-4 sm:px-6 py-4 sm:py-6 max-w-none mx-auto w-full">
            <div className="flex items-center justify-between w-full">
              {/* Left Section - Back Button & Title */}
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                {currentStep > 1 && currentStep !== 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    className="group relative overflow-hidden flex-shrink-0 h-10 w-10 p-0 bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 hover:border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
                    title="Go back"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                    <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-purple-600 group-hover:scale-110 transition-all duration-300 relative z-10" />
                  </Button>
                )}
                
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl blur-sm opacity-60"></div>
                    <div className="relative flex-shrink-0 p-3 rounded-2xl bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 shadow-lg">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent tracking-tight">
                      {isEditMode ? 'Edit Mock Test' : 'Create Mock Test'}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 font-medium mt-1">
                      {currentStep === 1 && 'Design your test blueprint'}
                      {currentStep === 2 && 'Review and refine questions'}
                      {currentStep === 3 && 'Set rules and publish'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right Section - Primary Action */}
              <div className="flex-shrink-0 ml-4">
                {currentStep === 1 && (
                  <Button 
                    onClick={handleNext} 
                    disabled={totalQuestions === 0 || isGenerating}
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-6 py-3 h-10 min-w-[140px] rounded-2xl hover:scale-105 disabled:hover:scale-100"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 relative z-10"></div>
                        <span className="text-sm font-semibold relative z-10">Generating...</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline text-sm font-semibold relative z-10">Next: Review & Refine</span>
                        <span className="sm:hidden text-sm font-semibold relative z-10">Next</span>
                        <ArrowRight className="h-4 w-4 ml-2 relative z-10" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Optimized Main Content */}
      <div className="w-full px-2 sm:px-3 lg:px-4 pb-2 sm:pb-3 lg:pb-4">
        <div className="max-w-none mx-auto w-full">

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Step 1: Test Blueprint - Mobile-Optimized Premium Design */}
        {currentStep === 1 && (
          <div className="space-y-3 sm:space-y-4 lg:space-y-6 w-full max-w-full">
            {/* Mobile-Optimized Blueprint Summary */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-indigo-400/20 rounded-xl sm:rounded-2xl lg:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 pointer-events-none"></div>
              <div className="relative bg-white/70 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl border border-white/30 shadow-2xl shadow-blue-500/10 hover:shadow-3xl hover:shadow-blue-500/20 transition-all duration-500 p-3 sm:p-4 lg:p-6 xl:p-8 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg sm:rounded-xl lg:rounded-2xl blur-sm opacity-60 pointer-events-none"></div>
                      <div className="relative p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 shadow-lg">
                        <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">Test Blueprint</h3>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium mt-0.5 sm:mt-1">Design by chapter and difficulty</p>
                    </div>
                  </div>
                  <div className="relative self-start sm:self-auto mt-2 sm:mt-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg sm:rounded-xl lg:rounded-2xl blur-sm opacity-60 pointer-events-none"></div>
                    <div className="relative px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg sm:rounded-xl lg:rounded-2xl border border-blue-200/50 shadow-lg">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Total: </span>
                      <span className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-blue-600">{totalQuestions}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-Optimized Chapter Selection */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6 w-full">
              {chapters.map((chapter) => {
                const chState = blueprint[chapter.name] || {}
                const rules = chState.rules || []
                const selectedCount = (chState.random || 0) + rules.reduce((sum, r) => sum + (r.quantity || 0), 0)
                
                return (
                  <details key={chapter.name} className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl border border-white/30 shadow-2xl shadow-purple-500/10 hover:shadow-3xl hover:shadow-purple-500/20 transition-all duration-500 w-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 via-indigo-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <summary className="relative cursor-pointer flex items-center justify-between p-3 sm:p-4 lg:p-6 xl:p-8 hover:bg-gradient-to-r hover:from-white/50 hover:to-blue-50/30 transition-all duration-300 touch-manipulation">
                      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg sm:rounded-xl lg:rounded-2xl blur-sm opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                          <div className="relative p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600 group-hover:text-blue-600 transition-colors duration-300" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg xl:text-xl truncate">{chapter.name}</h3>
                          <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium mt-0.5 sm:mt-1">{chapter.available} questions available</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 ml-2 sm:ml-3 lg:ml-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg sm:rounded-xl lg:rounded-2xl blur-sm opacity-60 pointer-events-none"></div>
                          <div className="relative px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg sm:rounded-xl lg:rounded-2xl border border-blue-200/50 shadow-lg">
                            <span className="text-xs sm:text-sm lg:text-base font-bold text-blue-600">
                              {selectedCount}
                            </span>
                          </div>
                        </div>
                        <div className="relative w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 group-hover:from-blue-200 group-hover:via-indigo-200 group-hover:to-purple-200 group-hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg group-hover:shadow-xl">
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-600" />
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
    </div>
  )
}
