'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Calendar, FileText, BarChart3, Tag, Layers, Eye } from 'lucide-react'
import { UnifiedPublishModal, type UnifiedPublishData } from './unified-publish-modal'
import { saveTestFromForm } from '@/lib/actions/tests'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { TestQuestionSlot } from '@/lib/types'
import { TestPreviewModal } from './test-preview-modal'

interface TestFinalizationStageProps {
  questions: TestQuestionSlot[]
  onPrevious: () => void
  onSave: (testData: TestFormData) => Promise<void>
  onPublish: (testData: TestFormData, publishData: PublishData) => Promise<void>
  initialTestData?: {
    name: string
    description?: string
    total_time_minutes: number
    marks_per_correct: number
    negative_marks_per_incorrect: number
    result_policy?: 'instant' | 'scheduled'
    result_release_at?: string | null
  }
  isEditMode?: boolean
  testId?: number
  globalMarkingRules: {
    marksPerCorrect: number
    penaltyPerIncorrect: number
  }
}

export interface TestFormData {
  name: string
  description: string
  totalTimeMinutes: number
  allowPausing: boolean
  showInQuestionTimer: boolean
  isDynamicallyShuffled?: boolean
  isProctored: boolean
}

// Legacy interface - keeping for backward compatibility
export interface PublishData {
  startTime: string
  endTime: string
  resultPolicy: 'instant' | 'scheduled' | 'perpetual'
  resultReleaseAt?: string
}

export function TestFinalizationStage({
  questions,
  onPrevious,
  initialTestData,
  isEditMode,
  testId,
  globalMarkingRules
}: TestFinalizationStageProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<TestFormData>({
    name: initialTestData?.name || '',
    description: initialTestData?.description || '',
    totalTimeMinutes: initialTestData?.total_time_minutes || 120,
    allowPausing: false, // Default to strict mode for new tests
    showInQuestionTimer: false, // Default to strict mode for new tests
    isProctored: false // Default to non-proctored mode
  })
  
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [isLoadingTestData, setIsLoadingTestData] = useState(false)

  // Fetch existing test data when in edit mode
  useEffect(() => {
    if (isEditMode && testId) {
      console.log(`🔍 Edit mode detected for test ID: ${testId}`)
      setIsLoadingTestData(true)
      
      const fetchTestData = async () => {
        try {
          // Dynamically import the server action
          const { getTestDetailsForEdit } = await import('@/lib/actions/tests')
          const testDetails = await getTestDetailsForEdit(testId)
          
          if (testDetails && testDetails.test) {
            const test = testDetails.test
            console.log('✅ Test data fetched successfully:', test)
            
            // Populate form state with fetched data
            setFormData({
              name: test.name || '',
              description: test.description || '',
              totalTimeMinutes: test.total_time_minutes || 120,
              allowPausing: test.allow_pausing || false,
              showInQuestionTimer: test.show_in_question_timer || false,
              isDynamicallyShuffled: test.is_dynamically_shuffled || false,
              isProctored: test.is_proctored || false
            })
            
            console.log('✅ Form data populated with:', {
              name: test.name,
              description: test.description,
              totalTimeMinutes: test.total_time_minutes,
              allowPausing: test.allow_pausing,
              showInQuestionTimer: test.show_in_question_timer,
              isDynamicallyShuffled: test.is_dynamically_shuffled,
              isProctored: test.is_proctored
            })
          } else {
            console.warn('⚠️ No test data found for test ID:', testId)
            toast.error('Failed to load test data. Please try again.')
          }
        } catch (error) {
          console.error('❌ Error fetching test data:', error)
          toast.error('Failed to load test data. Please try again.')
        } finally {
          setIsLoadingTestData(false)
        }
      }
      
      fetchTestData()
    }
  }, [isEditMode, testId])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Test name is required'
    }
    
    if (formData.totalTimeMinutes <= 0) {
      newErrors.totalTimeMinutes = 'Total time must be greater than 0'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveAsDraft = async () => {
    if (!validateForm()) return
    setIsSaving(true)
    const fd = new FormData()
    if (isEditMode && typeof testId === 'number') {
      fd.append('testId', String(testId))
    }
    fd.append('name', formData.name)
    fd.append('description', formData.description)
    fd.append('total_time_minutes', String(formData.totalTimeMinutes))
    fd.append('marks_per_correct', String(1)) // Default values - will be overridden by global rules
    fd.append('negative_marks_per_incorrect', String(0.25))
    fd.append('result_policy', 'instant')
    fd.append('allow_pausing', String(formData.allowPausing))
    fd.append('show_in_question_timer', String(formData.showInQuestionTimer))
    fd.append('is_proctored', String(formData.isProctored))
    fd.append('result_release_at', '')
    fd.append('status', 'draft')
    fd.append('is_dynamically_shuffled', String(Boolean(formData.isDynamicallyShuffled)))
    const questionsPayload = questions.map((slot) => {
      const q = slot.question
      const normalizedOptions = Object.fromEntries(Object.entries(q.options || {}).map(([k, v]) => [String(k).toUpperCase(), v]))
      const basePayload: any = {}
      
      if (typeof q.id === 'number') {
        basePayload.id = q.id
        basePayload.override = {
            question_text: q.question_text,
            options: normalizedOptions,
            correct_option: (q.correct_option || '').toString().toUpperCase(),
            solution_text: q.solution_text ?? null
          }
      } else {
        basePayload.new = {
          question_text: q.question_text,
          options: normalizedOptions,
          correct_option: (q.correct_option || '').toString().toUpperCase(),
          solution_text: q.solution_text || null,
          book_source: q.book_source,
          chapter_name: q.chapter_name,
          difficulty: q.difficulty || null,
          admin_tags: q.admin_tags || []
        }
      }
      
      // Add custom marking if it exists
      if (slot.customMarking) {
        basePayload.customMarking = slot.customMarking
      }
      
      return basePayload
    })
    fd.append('questions_payload', JSON.stringify(questionsPayload))
    const res = await saveTestFromForm(fd)
    setIsSaving(false)
    if (!res.success) {
      toast.error(res.message || (isEditMode ? 'Failed to update draft' : 'Failed to save draft'))
      return
    }
    toast.success(isEditMode ? 'Draft updated successfully!' : 'Test saved as draft successfully!')
    setTimeout(() => router.push('/tests'), 1500)
  }

  const handlePublishClick = () => {
    if (!validateForm()) return
    setShowPublishModal(true)
  }

  const handlePublishConfirm = async (publishData: UnifiedPublishData) => {
    setIsSaving(true)
    const fd = new FormData()
    if (isEditMode && typeof testId === 'number') {
      fd.append('testId', String(testId))
    }
    fd.append('name', formData.name)
    fd.append('description', formData.description)
    fd.append('total_time_minutes', String(formData.totalTimeMinutes))
    fd.append('marks_per_correct', String(1)) // Default values - will be overridden by global rules
    fd.append('negative_marks_per_incorrect', String(0.25))
    fd.append('result_policy', publishData.resultPolicy)
    fd.append('result_release_at', publishData.resultPolicy === 'scheduled' ? (publishData.resultReleaseAt || '') : '')
    fd.append('status', 'scheduled')
    fd.append('start_time', publishData.startTime)
    fd.append('end_time', publishData.schedulingMode === 'perpetual' ? '' : publishData.endTime)
    fd.append('is_perpetual', String(publishData.schedulingMode === 'perpetual'))
    fd.append('allow_pausing', String(formData.allowPausing))
    fd.append('show_in_question_timer', String(formData.showInQuestionTimer))
    fd.append('is_proctored', String(formData.isProctored))
    fd.append('is_dynamically_shuffled', String(Boolean(formData.isDynamicallyShuffled)))
    const questionsPayload = questions.map((slot) => {
      const q = slot.question
      const normalizedOptions = Object.fromEntries(Object.entries(q.options || {}).map(([k, v]) => [String(k).toUpperCase(), v]))
      const basePayload: any = {}
      
      if (typeof q.id === 'number') {
        basePayload.id = q.id
        basePayload.override = {
            question_text: q.question_text,
            options: normalizedOptions,
            correct_option: (q.correct_option || '').toString().toUpperCase(),
            solution_text: q.solution_text ?? null
          }
      } else {
        basePayload.new = {
          question_text: q.question_text,
          options: normalizedOptions,
          correct_option: (q.correct_option || '').toString().toUpperCase(),
          solution_text: q.solution_text || null,
          book_source: q.book_source,
          chapter_name: q.chapter_name,
          difficulty: q.difficulty || null,
          admin_tags: q.admin_tags || []
        }
      }
      
      // Add custom marking if it exists
      if (slot.customMarking) {
        basePayload.customMarking = slot.customMarking
      }
      
      return basePayload
    })
    fd.append('questions_payload', JSON.stringify(questionsPayload))
    const res = await saveTestFromForm(fd)
    setIsSaving(false)
    setShowPublishModal(false)
    if (!res.success) {
      toast.error(res.message || (isEditMode ? 'Failed to update & publish' : 'Failed to publish test'))
      return
    }
    toast.success(isEditMode ? 'Test updated & scheduled successfully!' : 'Your test has been published successfully!')
    setTimeout(() => router.push('/tests'), 1500)
  }

  const updateFormData = (field: keyof TestFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Generate test blueprint summary
  const generateBlueprintSummary = () => {
    const chapterBreakdown: Record<string, { total: number; difficulties: Record<string, number>; tags: Record<string, number> }> = {}
    
    questions.forEach((slot) => {
      const chapter = slot.chapter_name
      const difficulty = slot.question.difficulty || 'Unknown'
      const tags = slot.question.admin_tags || []
      
      if (!chapterBreakdown[chapter]) {
        chapterBreakdown[chapter] = { total: 0, difficulties: {}, tags: {} }
      }
      
      chapterBreakdown[chapter].total++
      chapterBreakdown[chapter].difficulties[difficulty] = (chapterBreakdown[chapter].difficulties[difficulty] || 0) + 1
      
      tags.forEach(tag => {
        chapterBreakdown[chapter].tags[tag] = (chapterBreakdown[chapter].tags[tag] || 0) + 1
      })
    })
    
    return chapterBreakdown
  }

  // Calculate total marks for the test
  const calculateTotalMarks = () => {
    return questions.reduce((total, slot) => {
      // Use custom marking if available, otherwise use global defaults
      const marksPerCorrect = slot.customMarking?.marksPerCorrect ?? globalMarkingRules.marksPerCorrect
      return total + marksPerCorrect
    }, 0)
  }

  const blueprintSummary = generateBlueprintSummary()
  const totalQuestions = questions.length
  const customMarkingCount = questions.filter(q => q.customMarking).length

  // Show loading state while fetching test data in edit mode
  if (isLoadingTestData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading test data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Apple-Inspired Clean Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-lg">
        <div className="px-6 py-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Test Summary & Publication
                </h1>
                <p className="text-gray-600 font-medium mt-1">
                  Review your test blueprint and finalize publication
                </p>
              </div>
            </div>
              <Button 
                variant="outline" 
                onClick={onPrevious}
              className="h-11 px-6 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Review
              </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Test Blueprint Summary - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-gray-200/60 rounded-2xl overflow-hidden bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b border-gray-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Test Blueprint Summary</CardTitle>
                    <CardDescription className="text-gray-600 font-medium">
                      Comprehensive overview of your test composition
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Chapter Breakdown - Compact Table */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Chapter Breakdown</h4>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Chapter</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Questions</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Difficulty</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tags</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {Object.entries(blueprintSummary).map(([chapter, data]) => (
                              <tr key={chapter} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                  <span className="font-medium text-gray-900">{chapter}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {data.total}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(data.difficulties).map(([difficulty, count]) => (
                                      <span key={difficulty} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                        {difficulty}: {count}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-1">
                                    {Object.keys(data.tags).length > 0 ? (
                                      Object.entries(data.tags).map(([tag, count]) => (
                                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                                          {tag}: {count}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-xs text-gray-400">No tags</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  {/* Overall Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total Questions</p>
                          <p className="text-2xl font-bold text-blue-900">{totalQuestions}</p>
              </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Tag className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-emerald-600">Custom Marking</p>
                          <p className="text-2xl font-bold text-emerald-900">{customMarkingCount}</p>
            </div>
          </div>
        </div>

                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Layers className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-purple-600">Chapters</p>
                          <p className="text-2xl font-bold text-purple-900">{Object.keys(blueprintSummary).length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Details & Publication - Right Column */}
          <div className="space-y-6">
            <Card className="border border-gray-200/60 rounded-2xl overflow-hidden bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50/50 to-slate-50/50 border-b border-gray-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Test Details</CardTitle>
                    <CardDescription className="text-gray-600 font-medium">
                      Essential test information
              </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Test Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Enter test name"
                    className="h-12 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl text-base transition-all duration-200"
                    />
                  {errors.name && (
                    <p className="text-sm text-red-600 font-medium">{errors.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Enter test description"
                    className="min-h-[100px] border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl text-base transition-all duration-200"
                    />
            </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Total Time (minutes)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.totalTimeMinutes}
                      onChange={(e) => updateFormData('totalTimeMinutes', Number(e.target.value))}
                    placeholder="120"
                    className="h-12 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl text-base transition-all duration-200"
                    />
                  {errors.totalTimeMinutes && (
                    <p className="text-sm text-red-600 font-medium">{errors.totalTimeMinutes}</p>
                  )}
                </div>

                {/* Test Experience Settings */}
                <div className="space-y-4 rounded-lg border border-gray-200 p-4 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Layers className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Test Experience Settings</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Configure the interface and rules students will experience during the test.
                  </p>

                  {/* Allow Pausing Toggle */}
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 bg-white shadow-sm">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold text-gray-900">Allow Pausing</Label>
                      <p className="text-xs text-gray-600">
                        If enabled, students will see a pause button and can resume the test later.
                      </p>
                    </div>
                    <Switch
                      checked={formData.allowPausing}
                      onCheckedChange={(checked) => updateFormData('allowPausing', checked)}
                    />
                  </div>

                  {/* Show In-Question Timer Toggle */}
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 bg-white shadow-sm">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold text-gray-900">Show In-Question Timer</Label>
                      <p className="text-xs text-gray-600">
                        If enabled, a separate timer for each question will be displayed.
                      </p>
                    </div>
                    <Switch
                      checked={formData.showInQuestionTimer}
                      onCheckedChange={(checked) => updateFormData('showInQuestionTimer', checked)}
                    />
                  </div>

                  {/* Dynamic Per-User Shuffling Toggle */}
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 bg-white shadow-sm">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold text-gray-900">Enable Dynamic Per-User Shuffling</Label>
                      <p className="text-xs text-gray-600">
                        Each student sees a unique question and option order.
                      </p>
                    </div>
                    <Switch
                      checked={Boolean(formData.isDynamicallyShuffled)}
                      onCheckedChange={(checked) => updateFormData('isDynamicallyShuffled', checked)}
                    />
                  </div>

                  {/* Enable Proctoring Toggle */}
                  <div className="flex items-center justify-between rounded-lg border-2 border-blue-200 p-4 bg-blue-50/50 shadow-sm">
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold text-gray-900">Enable Proctoring</Label>
                      <p className="text-xs text-gray-600">
                        When enabled, forces students into a secure, fullscreen environment with violation detection and disables the browser's back button.
                      </p>
                    </div>
                    <Switch
                      checked={formData.isProctored}
                      onCheckedChange={(checked) => updateFormData('isProctored', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Total Marks</Label>
                  <div className="h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center">
                    <span className="text-lg font-bold text-gray-900">{calculateTotalMarks()}</span>
                    <span className="text-sm text-gray-500 ml-2">marks</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Calculated from {totalQuestions} questions with custom and default marking rules
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Publication Actions */}
            <Card className="border border-gray-200/60 rounded-2xl overflow-hidden bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-b border-gray-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Save className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Publication</CardTitle>
                    <CardDescription className="text-gray-600 font-medium">
                      Save or publish your test
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
            <Button
              onClick={() => setShowPreviewModal(true)}
              variant="outline"
              className="w-full h-12 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 hover:text-blue-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 font-medium"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Test
            </Button>

            <Button
              onClick={handleSaveAsDraft}
              disabled={isSaving}
                  className="w-full h-12 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      {isEditMode ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditMode ? 'Update Draft' : 'Save as Draft'}
                    </>
                  )}
            </Button>
            
            <Button
              onClick={handlePublishClick}
              disabled={isSaving}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
                  <Calendar className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update & Publish' : 'Publish Test'}
            </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Unified Publish Modal */}
      <UnifiedPublishModal
        open={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={handlePublishConfirm}
        isProcessing={isSaving}
        mode="new"
      />

      {/* Test Preview Modal */}
      <TestPreviewModal
        open={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        testName={formData.name || "Test Preview"}
        description={formData.description}
        totalTimeMinutes={formData.totalTimeMinutes}
        marksPerCorrect={globalMarkingRules.marksPerCorrect}
        penaltyPerIncorrect={globalMarkingRules.penaltyPerIncorrect}
        questions={questions}
      />
    </div>
  )
}