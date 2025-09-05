'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getChapterQuestionCount, getChaptersWithTags, generateTestPaperFromBlueprint, regenerateSingleQuestion } from '@/lib/actions/tests'
import type { TestBlueprint } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Plus, Minus, FileText, Settings, RefreshCw, Pencil } from 'lucide-react'
import Link from 'next/link'
import type { Question } from '@/lib/supabase/admin'
import { MasterQuestionBankModal } from './master-question-bank-modal'

type RuleRow = { tag: string | null; difficulty: string | null; quantity: number }
type BlueprintState = Record<string, {
  random?: number
  rules?: RuleRow[]
}>

export function TestCreationWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Step 1: Test Blueprint
  const [chapters, setChapters] = useState<Array<{ name: string; available: number; tags: string[]; difficultyCounts: Record<string, number> }>>([])
  const [blueprint, setBlueprint] = useState<BlueprintState>({})
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
  
  // Step 2: Test Rules
  const [testName, setTestName] = useState('')
  const [testDescription, setTestDescription] = useState('')
  const [totalTimeMinutes, setTotalTimeMinutes] = useState(120)
  const [marksPerCorrect, setMarksPerCorrect] = useState(1)
  const [negativeMarksPerIncorrect, setNegativeMarksPerIncorrect] = useState(0.25)

  // Stage 2: Review & Refine
  const [reviewQuestions, setReviewQuestions] = useState<Array<{
    chapter_name: string
    source_type: 'random' | 'tag' | 'difficulty'
    source_value?: string
    question: Question
  }>>([])
  const [overrideIndex, setOverrideIndex] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

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
          rules: [...currentRules, { tag: null, difficulty: null, quantity: 0 }]
        }
      }
    })
  }

  const updateRule = (chapterName: string, index: number, patch: Partial<RuleRow>) => {
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
      setLoading(true)
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
        .finally(() => setLoading(false))
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
    const newQ = await regenerateSingleQuestion({
      chapter_name: slot.chapter_name,
      source_type: slot.source_type,
      source_value: slot.source_value,
      exclude_ids: exclude,
    })
    if (newQ) {
      const copy = [...reviewQuestions]
      copy[index] = { ...slot, question: newQ }
      setReviewQuestions(copy)
    }
  }

  const handleOverrideAt = (index: number) => {
    setOverrideIndex(index)
    setModalOpen(true)
  }

  const handleSelectOverride = (q: Question) => {
    if (overrideIndex == null) return
    const slot = reviewQuestions[overrideIndex]
    const copy = [...reviewQuestions]
    copy[overrideIndex] = { ...slot, question: q }
    setReviewQuestions(copy)
    setOverrideIndex(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
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
                            type="number"
                            min={0}
                            max={chapter.available}
                            value={chState.random ?? 0}
                            onChange={(e) => setChapterRandom(chapter.name, Number(e.target.value))}
                            className="w-32"
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
                                      {chapter.tags.map((t) => (
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Review & Refine</span>
            </CardTitle>
            <CardDescription>
              Review generated questions, regenerate individual items, or manually override.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                {reviewQuestions.length === 0 ? (
                  <p className="text-sm text-gray-600">No questions generated yet.</p>
                ) : (
                  Object.entries(
                    reviewQuestions.reduce((acc: Record<string, typeof reviewQuestions>, item) => {
                      const key = item.chapter_name || 'Uncategorized'
                      if (!acc[key]) acc[key] = []
                      acc[key].push(item)
                      return acc
                    }, {})
                  ).map(([chapter, items]) => (
                    <div key={chapter} className="border rounded-lg">
                      <div className="px-4 py-2 border-b bg-gray-50 font-medium">{chapter}</div>
                      <div className="divide-y">
                        {items.map((slot) => {
                          const index = reviewQuestions.indexOf(slot)
                          const q = slot.question
                          return (
                            <div key={index} className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="pr-4">
                                  <div className="text-sm text-gray-500 mb-1">
                                    Source: {slot.source_type}{slot.source_value ? ` / ${slot.source_value}` : ''}
                                  </div>
                                  <div className="font-medium mb-2">{q.question_id} — {q.chapter_name}</div>
                                  <div className="prose prose-sm max-w-none mb-2">{q.question_text}</div>
                                  <ul className="text-sm text-gray-800 mb-2 list-disc pl-5">
                                    {q.options && (
                                      <>
                                        <li>A. {q.options.a}</li>
                                        <li>B. {q.options.b}</li>
                                        <li>C. {q.options.c}</li>
                                        <li>D. {q.options.d}</li>
                                      </>
                                    )}
                                  </ul>
                                  <div className="text-sm mb-2">Correct: <span className="font-semibold uppercase">{q.correct_option}</span></div>
                                  <div className="text-xs text-gray-600">
                                    Book: {q.book_source} • No: {q.question_number_in_book ?? '-'} • Difficulty: {(q as any).difficulty ?? '-'}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Tags: {(q.admin_tags || []).join(', ') || '-'}
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                  <Button variant="outline" size="sm" onClick={() => handleRegenerateAt(index)}>
                                    <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleOverrideAt(index)}>
                                    <Pencil className="h-4 w-4 mr-1" /> Manual Override
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Current Selection</h3>
                <div className="text-sm text-gray-700">Total Questions: {reviewQuestions.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <div>
          {currentStep === 2 && (
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
        </div>
        
        <div className="flex space-x-4">
          <Link href="/tests">
            <Button variant="outline">Cancel</Button>
          </Link>
          
          {currentStep === 1 ? (
            <Button onClick={handleNext} disabled={totalQuestions === 0}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={() => console.log('Proceed to rules with question IDs:', reviewQuestions.map((s) => s.question.id))}
              disabled={loading || reviewQuestions.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next: Set Rules & Publish
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      <MasterQuestionBankModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleSelectOverride}
        initialChapter={overrideIndex != null ? reviewQuestions[overrideIndex]?.chapter_name : undefined}
      />
    </div>
  )
}
