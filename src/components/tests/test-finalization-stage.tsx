'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Calendar, Clock } from 'lucide-react'
import { PublishTestModal } from './publish-test-modal'
import { saveTestFromForm } from '@/lib/actions/tests'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { TestQuestionSlot } from '@/lib/types'

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
}

export interface TestFormData {
  name: string
  description: string
  totalTimeMinutes: number
  marksPerCorrect: number
  negativeMarksPerIncorrect: number
  resultPolicy: 'instant' | 'scheduled'
  resultReleaseAt: string
}

export interface PublishData {
  startTime: string
  endTime: string
  resultPolicy: 'instant' | 'scheduled'
  resultReleaseAt?: string
}

export function TestFinalizationStage({
  questions,
  onPrevious,
  initialTestData,
  isEditMode,
  testId
}: TestFinalizationStageProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<TestFormData>({
    name: initialTestData?.name || '',
    description: initialTestData?.description || '',
    totalTimeMinutes: initialTestData?.total_time_minutes || 120,
    marksPerCorrect: initialTestData?.marks_per_correct || 1,
    negativeMarksPerIncorrect: initialTestData?.negative_marks_per_incorrect || 0.25,
    resultPolicy: initialTestData?.result_policy || 'instant',
    resultReleaseAt: initialTestData?.result_release_at || ''
  })
  
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Test name is required'
    }
    
    if (formData.totalTimeMinutes <= 0) {
      newErrors.totalTimeMinutes = 'Total time must be greater than 0'
    }
    
    if (formData.marksPerCorrect < 0) {
      newErrors.marksPerCorrect = 'Marks per correct answer cannot be negative'
    }
    
    if (formData.negativeMarksPerIncorrect < 0) {
      newErrors.negativeMarksPerIncorrect = 'Negative marks cannot be negative'
    }
    
    if (formData.resultPolicy === 'scheduled' && !formData.resultReleaseAt) {
      newErrors.resultReleaseAt = 'Result release time is required for scheduled results'
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
    fd.append('marks_per_correct', String(formData.marksPerCorrect))
    fd.append('negative_marks_per_incorrect', String(formData.negativeMarksPerIncorrect))
    fd.append('result_policy', 'instant')
    fd.append('result_release_at', '')
    fd.append('status', 'draft')
    const questionsPayload = questions.map((slot) => {
      const q = slot.question
      const normalizedOptions = Object.fromEntries(Object.entries(q.options || {}).map(([k, v]) => [String(k).toUpperCase(), v]))
      if (typeof q.id === 'number') {
        return {
          id: q.id,
          override: {
            question_text: q.question_text,
            options: normalizedOptions,
            correct_option: (q.correct_option || '').toString().toUpperCase(),
            solution_text: q.solution_text ?? null
          }
        }
      }
      return {
        new: {
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

  const handlePublishConfirm = async (publishData: PublishData) => {
    setIsSaving(true)
    const fd = new FormData()
    if (isEditMode && typeof testId === 'number') {
      fd.append('testId', String(testId))
    }
    fd.append('name', formData.name)
    fd.append('description', formData.description)
    fd.append('total_time_minutes', String(formData.totalTimeMinutes))
    fd.append('marks_per_correct', String(formData.marksPerCorrect))
    fd.append('negative_marks_per_incorrect', String(formData.negativeMarksPerIncorrect))
    fd.append('result_policy', publishData.resultPolicy)
    fd.append('result_release_at', publishData.resultPolicy === 'scheduled' ? (publishData.resultReleaseAt || '') : '')
    fd.append('status', 'scheduled')
    fd.append('start_time', publishData.startTime)
    fd.append('end_time', publishData.endTime)
    const questionsPayload = questions.map((slot) => {
      const q = slot.question
      const normalizedOptions = Object.fromEntries(Object.entries(q.options || {}).map(([k, v]) => [String(k).toUpperCase(), v]))
      if (typeof q.id === 'number') {
        return {
          id: q.id,
          override: {
            question_text: q.question_text,
            options: normalizedOptions,
            correct_option: (q.correct_option || '').toString().toUpperCase(),
            solution_text: q.solution_text ?? null
          }
        }
      }
      return {
        new: {
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

  const updateFormData = (field: keyof TestFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen">
      {/* Local Stage Header (non-sticky) */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm w-full">
        <div className="px-4 sm:px-6 py-3 sm:py-5 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  Test Rules & Publishing
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  {questions.length} questions ready for finalization
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={onPrevious}
                className="hover:bg-gray-50 transition-colors duration-200 text-sm w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Previous: Review & Refine</span>
                <span className="sm:hidden">Previous</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Mobile-Optimized Test Summary */}
        <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-200/50 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-bold text-blue-900 tracking-tight">Test Summary</h3>
              <p className="text-xs sm:text-sm text-blue-700 font-medium mt-1">
                {questions.length} questions ready for finalization
              </p>
            </div>
            <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200/50 self-start sm:self-auto cursor-default select-none" role="status" aria-live="polite">
              <span className="text-xs sm:text-sm font-semibold text-blue-700">
                {isEditMode ? 'Ready to update' : 'Ready to publish'}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Main Form */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-gray-200/50 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50/50 to-white/50 border-b border-gray-100/50 p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Finalize Test Details</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-600 font-medium mt-2">
              Set the essential rules for your test. You can choose result release while publishing.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* A) Basic Settings */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                  <Save className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">Basic Settings</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <Label htmlFor="test-name" className="text-sm font-semibold text-gray-700">Test Name *</Label>
                  <Input
                    id="test-name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Enter test name..."
                    className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 font-medium">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="test-description" className="text-sm font-semibold text-gray-700">Description (Optional)</Label>
                  <Textarea
                    id="test-description"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Enter test description..."
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

            {/* B) Scoring & Timing */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">Scoring & Timing</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <Label htmlFor="total-time" className="text-sm font-semibold text-gray-700">Total Time (minutes) *</Label>
                  <Input
                    id="total-time"
                    type="number"
                    min="1"
                    value={formData.totalTimeMinutes}
                    onChange={(e) => updateFormData('totalTimeMinutes', Number(e.target.value))}
                    className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.totalTimeMinutes ? 'border-red-300' : ''}`}
                  />
                  {errors.totalTimeMinutes && (
                    <p className="text-sm text-red-600 font-medium">{errors.totalTimeMinutes}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="marks-correct" className="text-sm font-semibold text-gray-700">Marks per Correct Answer *</Label>
                  <Input
                    id="marks-correct"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    min="0"
                    value={formData.marksPerCorrect}
                    onChange={(e) => updateFormData('marksPerCorrect', Number(e.target.value))}
                    className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.marksPerCorrect ? 'border-red-300' : ''}`}
                  />
                  {errors.marksPerCorrect && (
                    <p className="text-sm text-red-600 font-medium">{errors.marksPerCorrect}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="negative-marks" className="text-sm font-semibold text-gray-700">Penalty per Incorrect Answer *</Label>
                  <Input
                    id="negative-marks"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    min="0"
                    value={formData.negativeMarksPerIncorrect}
                    onChange={(e) => updateFormData('negativeMarksPerIncorrect', Number(e.target.value))}
                    className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.negativeMarksPerIncorrect ? 'border-red-300' : ''}`}
                  />
                  <p className="text-xs text-gray-500">Enter a positive value; the system applies it as a deduction.</p>
                  {errors.negativeMarksPerIncorrect && (
                    <p className="text-sm text-red-600 font-medium">{errors.negativeMarksPerIncorrect}</p>
                  )}
                </div>
              </div>
            </div>

          {/* Publishing options moved to Publish modal */}
        </CardContent>
      </Card>

        {/* Mobile-Optimized Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-6 sm:mt-8">
          <Button 
            variant="outline" 
            onClick={onPrevious}
            className="hover:bg-gray-50 transition-colors duration-200 w-full sm:w-auto text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Previous: Review & Refine</span>
            <span className="sm:hidden">Previous</span>
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleSaveAsDraft}
              disabled={isSaving}
              className="flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors duration-200 text-sm w-full sm:w-auto"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Draft' : 'Save as Draft')}</span>
            </Button>
            
            <Button
              onClick={handlePublishClick}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm w-full sm:w-auto"
            >
              <Clock className="h-4 w-4" />
              <span>{isEditMode ? 'Update & Publish' : 'Publish Test'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Publish Test Modal */}
      <PublishTestModal
        open={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={handlePublishConfirm}
        isProcessing={isSaving}
      />
    </div>
  )
}
