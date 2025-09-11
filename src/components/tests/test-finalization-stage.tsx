'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Calendar, Clock, FileText } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Mobile-Optimized Premium Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-2xl shadow-blue-500/5 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
        <div className="relative px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-6 max-w-none mx-auto w-full">
          <div className="flex flex-col space-y-2 sm:space-y-3 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between w-full">
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg sm:rounded-xl lg:rounded-2xl blur-sm opacity-60"></div>
                <div className="relative p-1.5 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 shadow-lg">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 text-purple-600" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent tracking-tight leading-tight">
                  Test Rules & Publishing
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium mt-0.5 sm:mt-1">
                  {questions.length} questions ready for finalization
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end lg:justify-start mt-2 lg:mt-0">
              <Button 
                variant="outline" 
                onClick={onPrevious}
                className="group relative overflow-hidden bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 hover:border-purple-200 active:scale-95 transition-all duration-300 text-xs sm:text-sm w-full sm:w-auto shadow-lg hover:shadow-xl touch-manipulation h-7 sm:h-8 lg:h-9 xl:h-10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 lg:mr-2 relative z-10" />
                <span className="hidden sm:inline relative z-10">Previous: Review & Refine</span>
                <span className="sm:hidden relative z-10">Previous</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Main Content */}
      <div className="max-w-none mx-auto p-2 sm:p-4 lg:p-6 w-full">
        {/* Mobile-Optimized Test Summary Card */}
        <div className="mb-4 sm:mb-6 lg:mb-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-indigo-400/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative p-3 sm:p-6 lg:p-8 bg-white/70 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl border border-white/30 shadow-2xl shadow-blue-500/10 hover:shadow-3xl hover:shadow-blue-500/20 transition-all duration-500">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                  <div className="p-1 sm:p-1.5 lg:p-2 rounded-md sm:rounded-lg lg:rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-600" />
                  </div>
                  <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent tracking-tight">Test Summary</h3>
                </div>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">
                  {questions.length} questions ready for finalization
                </p>
              </div>
              <div className="relative self-start sm:self-auto mt-2 sm:mt-0">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-lg sm:rounded-xl lg:rounded-2xl blur-sm opacity-60"></div>
                <div className="relative px-2 sm:px-3 lg:px-4 xl:px-6 py-1.5 sm:py-2 lg:py-3 bg-gradient-to-r from-emerald-100 via-green-100 to-teal-100 rounded-lg sm:rounded-xl lg:rounded-2xl border border-emerald-200/50 cursor-default select-none shadow-lg" role="status" aria-live="polite">
                  <span className="text-xs sm:text-sm lg:text-base font-bold text-emerald-700">
                    {isEditMode ? 'Ready to update' : 'Ready to publish'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Main Form Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-indigo-400/10 to-blue-400/10 rounded-xl sm:rounded-2xl lg:rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700"></div>
          <Card className="relative border-0 bg-white/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10 overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-white/90 via-purple-50/50 to-indigo-50/50 border-b border-white/30 p-3 sm:p-4 lg:p-6 xl:p-8">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg sm:rounded-xl lg:rounded-2xl blur-sm opacity-60"></div>
                  <div className="relative p-1.5 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 shadow-lg">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 text-purple-600" />
                  </div>
                </div>
                <span className="text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent tracking-tight">Finalize Test Details</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium mt-1 sm:mt-2 lg:mt-3">
                Set the essential rules for your test. You can choose result release while publishing.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 xl:p-10 space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-10">
            {/* Mobile-Optimized Basic Settings Section */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8">
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-md sm:rounded-lg lg:rounded-xl blur-sm opacity-60"></div>
                  <div className="relative p-1.5 sm:p-2 lg:p-3 rounded-md sm:rounded-lg lg:rounded-xl bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 shadow-lg">
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent tracking-tight">Basic Settings</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
                <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                  <Label htmlFor="test-name" className="text-xs sm:text-sm font-bold text-gray-800 flex items-center space-x-1 sm:space-x-2">
                    <span>Test Name</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Input
                      id="test-name"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      placeholder="Enter test name..."
                      className={`relative bg-white/80 backdrop-blur-sm border-white/30 focus:border-blue-400 focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 rounded-md sm:rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl text-xs sm:text-sm lg:text-base h-8 sm:h-9 lg:h-10 xl:h-11 ${errors.name ? 'border-red-300 ring-2 sm:ring-4 ring-red-500/20' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 rounded-md sm:rounded-lg lg:rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  {errors.name && (
                    <p className="text-xs sm:text-sm text-red-600 font-medium flex items-center space-x-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                  <Label htmlFor="test-description" className="text-xs sm:text-sm font-bold text-gray-800">Description (Optional)</Label>
                  <div className="relative group">
                    <Textarea
                      id="test-description"
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Enter test description..."
                      className="relative bg-white/80 backdrop-blur-sm border-white/30 focus:border-blue-400 focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 rounded-md sm:rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl resize-none text-xs sm:text-sm lg:text-base"
                      rows={2}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 rounded-md sm:rounded-lg lg:rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-Optimized Scoring & Timing Section */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8">
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-md sm:rounded-lg lg:rounded-xl blur-sm opacity-60"></div>
                  <div className="relative p-1.5 sm:p-2 lg:p-3 rounded-md sm:rounded-lg lg:rounded-xl bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 shadow-lg">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-green-900 bg-clip-text text-transparent tracking-tight">Scoring & Timing</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
                <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                  <Label htmlFor="total-time" className="text-xs sm:text-sm font-bold text-gray-800 flex items-center space-x-1 sm:space-x-2">
                    <span>Total Time (minutes)</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Input
                      id="total-time"
                      type="number"
                      min="1"
                      value={formData.totalTimeMinutes}
                      onChange={(e) => updateFormData('totalTimeMinutes', Number(e.target.value))}
                      className={`relative bg-white/80 backdrop-blur-sm border-white/30 focus:border-emerald-400 focus:ring-2 sm:focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 rounded-md sm:rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl text-xs sm:text-sm lg:text-base h-8 sm:h-9 lg:h-10 xl:h-11 ${errors.totalTimeMinutes ? 'border-red-300 ring-2 sm:ring-4 ring-red-500/20' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 rounded-md sm:rounded-lg lg:rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  {errors.totalTimeMinutes && (
                    <p className="text-xs sm:text-sm text-red-600 font-medium flex items-center space-x-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      <span>{errors.totalTimeMinutes}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                  <Label htmlFor="marks-correct" className="text-xs sm:text-sm font-bold text-gray-800 flex items-center space-x-1 sm:space-x-2">
                    <span>Marks per Correct Answer</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Input
                      id="marks-correct"
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      min="0"
                      value={formData.marksPerCorrect}
                      onChange={(e) => updateFormData('marksPerCorrect', Number(e.target.value))}
                      className={`relative bg-white/80 backdrop-blur-sm border-white/30 focus:border-emerald-400 focus:ring-2 sm:focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 rounded-md sm:rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl text-xs sm:text-sm lg:text-base h-8 sm:h-9 lg:h-10 xl:h-11 ${errors.marksPerCorrect ? 'border-red-300 ring-2 sm:ring-4 ring-red-500/20' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 rounded-md sm:rounded-lg lg:rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  {errors.marksPerCorrect && (
                    <p className="text-xs sm:text-sm text-red-600 font-medium flex items-center space-x-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      <span>{errors.marksPerCorrect}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                  <Label htmlFor="negative-marks" className="text-xs sm:text-sm font-bold text-gray-800 flex items-center space-x-1 sm:space-x-2">
                    <span>Penalty per Incorrect Answer</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Input
                      id="negative-marks"
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      min="0"
                      value={formData.negativeMarksPerIncorrect}
                      onChange={(e) => updateFormData('negativeMarksPerIncorrect', Number(e.target.value))}
                      className={`relative bg-white/80 backdrop-blur-sm border-white/30 focus:border-emerald-400 focus:ring-2 sm:focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 rounded-md sm:rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl text-xs sm:text-sm lg:text-base h-8 sm:h-9 lg:h-10 xl:h-11 ${errors.negativeMarksPerIncorrect ? 'border-red-300 ring-2 sm:ring-4 ring-red-500/20' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 rounded-md sm:rounded-lg lg:rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center space-x-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>Enter a positive value; the system applies it as a deduction.</span>
                  </p>
                  {errors.negativeMarksPerIncorrect && (
                    <p className="text-xs sm:text-sm text-red-600 font-medium flex items-center space-x-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      <span>{errors.negativeMarksPerIncorrect}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

          {/* Publishing options moved to Publish modal */}
        </CardContent>
      </Card>
        </div>

        {/* Mobile-Optimized Action Buttons */}
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6 lg:mt-8 xl:mt-10">
          <Button 
            variant="outline" 
            onClick={onPrevious}
            className="group relative overflow-hidden bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 hover:border-purple-200 active:scale-95 transition-all duration-300 text-xs sm:text-sm w-full sm:w-auto shadow-lg hover:shadow-xl touch-manipulation order-2 sm:order-1 h-8 sm:h-9 lg:h-10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 lg:mr-2 relative z-10" />
            <span className="hidden sm:inline relative z-10">Previous: Review & Refine</span>
            <span className="sm:hidden relative z-10">Previous</span>
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 xl:gap-6 w-full sm:w-auto order-1 sm:order-2">
            <Button
              variant="outline"
              onClick={handleSaveAsDraft}
              disabled={isSaving}
              className="group relative overflow-hidden bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 hover:border-blue-200 active:scale-95 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm w-full sm:w-auto shadow-lg hover:shadow-xl touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 h-8 sm:h-9 lg:h-10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <Save className="h-3 w-3 sm:h-4 sm:w-4 relative z-10" />
              <span className="relative z-10">{isSaving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Draft' : 'Save as Draft')}</span>
            </Button>
            
            <Button
              onClick={handlePublishClick}
              disabled={isSaving}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl active:scale-95 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm w-full sm:w-auto touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 h-8 sm:h-9 lg:h-10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 relative z-10" />
              <span className="relative z-10 font-semibold">{isEditMode ? 'Update & Publish' : 'Publish Test'}</span>
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
