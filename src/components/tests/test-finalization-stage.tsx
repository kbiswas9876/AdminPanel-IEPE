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
    <div className="max-w-4xl mx-auto transition-opacity duration-300 animate-in fade-in">

      {/* Test Summary */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900">Test Summary</h3>
            <p className="text-sm text-blue-700">
              {questions.length} questions ready for finalization
            </p>
          </div>
          <div className="text-sm text-blue-600">
            {isEditMode ? 'Ready to update' : 'Ready to publish'}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Finalize Test Details</span>
          </CardTitle>
          <CardDescription>
            Set the essential rules for your test. You can choose result release while publishing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* A) Basic Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="test-name">Test Name *</Label>
                <Input
                  id="test-name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Enter test name..."
                  className={errors.name ? 'border-red-300' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-description">Description (Optional)</Label>
                <Textarea
                  id="test-description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Enter test description..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* B) Scoring & Timing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Scoring & Timing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="total-time">Total Time (minutes) *</Label>
                <Input
                  id="total-time"
                  type="number"
                  min="1"
                  value={formData.totalTimeMinutes}
                  onChange={(e) => updateFormData('totalTimeMinutes', Number(e.target.value))}
                  className={errors.totalTimeMinutes ? 'border-red-300' : ''}
                />
                {errors.totalTimeMinutes && (
                  <p className="text-sm text-red-600">{errors.totalTimeMinutes}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="marks-correct">Marks per Correct Answer *</Label>
                <Input
                  id="marks-correct"
                  type="number"
                  step="0.25"
                  min="0"
                  value={formData.marksPerCorrect}
                  onChange={(e) => updateFormData('marksPerCorrect', Number(e.target.value))}
                  className={errors.marksPerCorrect ? 'border-red-300' : ''}
                />
                {errors.marksPerCorrect && (
                  <p className="text-sm text-red-600">{errors.marksPerCorrect}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="negative-marks">Negative Marks per Incorrect *</Label>
                <Input
                  id="negative-marks"
                  type="number"
                  step="0.25"
                  min="0"
                  value={formData.negativeMarksPerIncorrect}
                  onChange={(e) => updateFormData('negativeMarksPerIncorrect', Number(e.target.value))}
                  className={errors.negativeMarksPerIncorrect ? 'border-red-300' : ''}
                />
                {errors.negativeMarksPerIncorrect && (
                  <p className="text-sm text-red-600">{errors.negativeMarksPerIncorrect}</p>
                )}
              </div>
            </div>
          </div>

          {/* Publishing options moved to Publish modal */}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous: Review & Refine
        </Button>
        
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={handleSaveAsDraft}
            disabled={isSaving}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Draft' : 'Save as Draft')}</span>
          </Button>
          
          <Button
            onClick={handlePublishClick}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
          >
            <Clock className="h-4 w-4" />
            <span>{isEditMode ? 'Update & Publish' : 'Publish Test'}</span>
          </Button>
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
