'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRight, Pencil, Edit3, Trash2, ChevronDown, Plus, Eye, EyeOff, Sparkles, Layers, RefreshCw, FileText, CheckCircle2, BarChart3, Award, Star, Shield, Zap as Lightning, Wand2, Palette, Save, X, BookOpen, AlertCircle, Info, ToggleLeft, ToggleRight } from 'lucide-react'
import { UniversalContentRenderer } from '../editors/UniversalContentRenderer'
import { ClientOnlyAdvancedTipTapEditor } from '@/components/editors/ClientOnlyAdvancedTipTapEditor'
import { LivePreviewRenderer } from '@/components/editors/LivePreviewRenderer'
import type { Question, TestQuestionSlot } from '@/lib/types'
import { UnifiedQuestionBankModal } from './unified-question-bank-modal'

interface ReviewRefineInterfaceProps {
  questions: TestQuestionSlot[]
  onQuestionsChange: (questions: TestQuestionSlot[]) => void
  onRegenerate: (index: number) => void
  onEdit: (index: number) => void
  onNext: () => void
  isQuestionBankMode?: boolean
}

export default function ReviewRefineInterface({
  questions,
  onQuestionsChange,
  onRegenerate,
  onEdit,
  onNext,
  isQuestionBankMode: _isQuestionBankMode = false
}: ReviewRefineInterfaceProps) {
  const [shuffleOptions, setShuffleOptions] = useState(false)
  const [overrideIndex, setOverrideIndex] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [chooseOpen, setChooseOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<{
    question_text: string
    options: Record<string, string>
    correct_option: string
    solution_text: string
  } | null>(null)
  const [expandedSolutionIds, setExpandedSolutionIds] = useState<Set<string | number>>(new Set())
  const [showPreview, setShowPreview] = useState({
    question: true,
    options: true,
    solution: true
  })
  const [isShuffling, setIsShuffling] = useState(false)

  const handleShuffleQuestions = async () => {
    setIsShuffling(true)
    
    // Add a small delay for better UX feedback
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const shuffled = [...questions]
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    onQuestionsChange(shuffled)
    
    setIsShuffling(false)
  }

  const handleOverride = (index: number) => {
    setOverrideIndex(index)
    setModalOpen(true)
  }

  const handleSelectOverride = (question: Question) => {
    if (overrideIndex !== null) {
      const updatedQuestions = [...questions]
      updatedQuestions[overrideIndex] = {
        ...updatedQuestions[overrideIndex],
        question: question
      }
      onQuestionsChange(updatedQuestions)
    }
    setOverrideIndex(null)
    setModalOpen(false)
  }

  const handleSelectMultiple = (selectedQuestions: Question[]) => {
    const newSlots: TestQuestionSlot[] = selectedQuestions.map(q => ({
      question: q,
      source_type: 'custom',
      chapter_name: q.chapter_name,
      source_value: q.question_id
    }))
    onQuestionsChange([...(questions || []), ...newSlots])
    setOverrideIndex(null)
    setModalOpen(false)
  }

  const handleCreateQuestion = (q: Question) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
    const slot: TestQuestionSlot = {
      question: q,
      source_type: 'custom',
      chapter_name: q.chapter_name,
      tempId
    }
    onQuestionsChange([...(questions || []), slot])
  }

  const beginEdit = (index: number) => {
    const q = questions[index].question
    const opts = (q.options || {}) as Record<string, string>
    
    // Debug: Log the original options to see what we're working with
    console.log('Original question options:', opts)
    
    // Only merge with defaults if the question has fewer than 4 options
    // Otherwise, use the existing options as-is
    let mergedOptions = opts
    if (Object.keys(opts).length < 4) {
      const defaultOptions = { A: '', B: '', C: '', D: '' }
      mergedOptions = { ...defaultOptions, ...opts }
    }
    
    console.log('Merged options for edit form:', mergedOptions)
    
    setEditingIndex(index)
    setEditForm({
      question_text: q.question_text || '',
      options: mergedOptions,
      correct_option: (q.correct_option as string) || 'A',
      solution_text: q.solution_text || ''
    })
  }

  const cancelEdit = () => {
    console.log('Cancelling edit, cleaning state')
    setEditingIndex(null)
    setEditForm(null)
  }

  const saveEdit = () => {
    if (editingIndex === null || !editForm) return
    
    console.log('Saving edit with options:', editForm.options)
    
    const updated = [...questions]
    const current = updated[editingIndex]
    updated[editingIndex] = {
      ...current,
      question: {
        ...current.question,
        question_text: editForm.question_text,
        options: { ...editForm.options },
        correct_option: editForm.correct_option,
        solution_text: editForm.solution_text
      }
    }
    onQuestionsChange(updated)
    cancelEdit()
    
    console.log('Edit saved and state cleaned')
  }

  const addEditOption = () => {
    if (!editForm) return
    const keys = Object.keys(editForm.options).sort()
    const last = keys[keys.length - 1]
    const nextChar = String.fromCharCode(last.charCodeAt(0) + 1)
    setEditForm({
      ...editForm,
      options: { ...editForm.options, [nextChar]: '' }
    })
  }

  

  const handleToggleSolution = (questionId: string | number) => {
    setExpandedSolutionIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const handleDelete = (index: number) => {
    const questionNumber = index + 1
    const confirmed = window.confirm(
      `Are you sure you want to remove Question ${questionNumber} from the test?\n\nThis action cannot be undone.`
    )
    
    if (confirmed) {
      const updatedQuestions = questions.filter((_, i) => i !== index)
      onQuestionsChange(updatedQuestions)
      
      // If we're currently editing the deleted question, cancel the edit
      if (editingIndex === index) {
        cancelEdit()
      }
      // If we're editing a question that comes after the deleted one, adjust the index
      else if (editingIndex !== null && editingIndex > index) {
        setEditingIndex(editingIndex - 1)
      }
    }
  }

  const renderMathContent = (text: string) => <UniversalContentRenderer text={text} />

  const getOptionLabel = (option: string) => {
    return option.charAt(0).toUpperCase()
  }


  return (
    <div className="w-full">
      {/* Ultra-Premium Mobile Header */}
      <div className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-gray-200/60 shadow-lg">
        <div className="px-3 sm:px-4 py-3 sm:py-5 max-w-none mx-auto w-full">
          {/* Main Header Row */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            {/* Left Section - Title & Status */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="flex-shrink-0 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 shadow-lg">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight mb-1">
                    Review & Refine
                  </h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200/50">
                    <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
                    <span className="text-xs sm:text-sm font-semibold text-blue-700">{questions.length} questions</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200/50">
                    <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600" />
                    <span className="text-xs sm:text-sm font-semibold text-green-700">Ready</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Section - Primary Actions */}
            <div className="flex-shrink-0 ml-4 sm:ml-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Button 
                onClick={() => setChooseOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3 h-10 sm:h-11 rounded-xl font-semibold group order-1 sm:order-1"
              >
                <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="hidden sm:inline">Add Question</span>
                <span className="sm:hidden">Add</span>
              </Button>
              
              <Button 
                onClick={onNext}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3 h-10 sm:h-11 rounded-xl font-semibold group order-2 sm:order-2"
              >
                <span className="hidden sm:inline">Next Step</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </div>
          
          {/* Premium Action Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-gray-200/60">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-4 w-full sm:w-auto">
              {/* Premium Shuffle Button */}
              <Button 
                onClick={handleShuffleQuestions}
                disabled={isShuffling}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-5 py-3 h-11 rounded-xl font-semibold group w-full sm:w-auto"
              >
                {isShuffling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span className="hidden sm:inline">Shuffling...</span>
                    <span className="sm:hidden">Shuffling</span>
                  </>
                ) : (
                  <>
                    <Lightning className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                    <span className="hidden sm:inline">Shuffle Questions</span>
                    <span className="sm:hidden">Shuffle</span>
                  </>
                )}
              </Button>
              
              {/* New Modern Shuffle Options Toggle */}
              <div className="flex items-center justify-between w-full sm:w-auto bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 shadow-lg p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <RefreshCw className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Shuffle Options</p>
                    <p className="text-xs text-gray-500 hidden sm:block">Randomize answer order</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShuffleOptions(!shuffleOptions)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  style={{
                    backgroundColor: shuffleOptions ? '#3b82f6' : '#d1d5db'
                  }}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform"
                    style={{
                      transform: shuffleOptions ? 'translateX(1.25rem)' : 'translateX(0.125rem)'
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="px-3 sm:px-4">
        <div className="max-w-none mx-auto w-full">
        {/* Ultra-Premium Questions List */}
        <div className="space-y-4 sm:space-y-6 pt-3 sm:pt-4 -mx-3 sm:-mx-4">
          {questions.map((item, index) => {
            const q = item.question
            const options = q.options || {}
            // Filter out empty options to avoid displaying placeholder options
            const optionKeys = Object.keys(options).filter(key => options[key] && options[key].trim()) as Array<keyof typeof options>
            
            return (
              <Card key={index} className="group border border-gray-200/60 rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 hover:scale-[1.005] sm:hover:scale-[1.01]">
                <CardContent className="py-4 sm:py-6 px-3 sm:px-4">
                  {/* Ultra-Premium Question Header */}
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight mb-1 sm:mb-2">
                              Question {index + 1}
                            </h3>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200/50 shadow-sm">
                            <Layers className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
                            <span className="text-xs sm:text-sm font-semibold text-blue-700">{item.chapter_name}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-gray-50 to-slate-50 rounded-full border border-gray-200/50 shadow-sm">
                            <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-600" />
                            <span className="text-xs sm:text-sm font-semibold text-gray-700">{item.source_type}</span>
                            {item.source_value && <span className="text-xs text-gray-500">: {item.source_value}</span>}
                        </div>
                          </div>
                          </div>
                        </div>
                    
                    {/* Ultra-Premium Action Buttons */}
                    <div className="flex items-center gap-0.5 sm:gap-2 ml-1 sm:ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRegenerate(index)}
                        className="h-7 w-7 sm:h-9 sm:w-9 p-0 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 rounded-md sm:rounded-xl shadow-sm hover:shadow-md group"
                        title="Regenerate Question"
                      >
                        <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 group-hover:rotate-180 transition-transform duration-300" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOverride(index)}
                        className="h-7 w-7 sm:h-9 sm:w-9 p-0 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 rounded-md sm:rounded-xl shadow-sm hover:shadow-md group"
                        title="Override with Bank Question"
                      >
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform duration-200" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (editingIndex === index) {
                            cancelEdit()
                          } else {
                            beginEdit(index)
                          }
                          onEdit(index)
                        }}
                        className="h-7 w-7 sm:h-9 sm:w-9 p-0 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200 rounded-md sm:rounded-xl shadow-sm hover:shadow-md group"
                        title="Edit Question"
                      >
                        <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform duration-200" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(index)}
                        className="h-7 w-7 sm:h-9 sm:w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 rounded-md sm:rounded-xl shadow-sm hover:shadow-md group"
                        title="Delete Question"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform duration-200" />
                      </Button>
                      </div>
                  </div>
                  {/* Ultra-Premium Question Content */}
                  <div className="space-y-4 sm:space-y-6">
                      {editingIndex === index && editForm ? (
                      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                        {/* Premium Header */}
                        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Edit3 className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Edit Question</h3>
                                <p className="text-sm text-gray-600 font-medium">Professional editor with live preview</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPreview({ ...showPreview, question: !showPreview.question })}
                                className="gap-2 hover:bg-slate-50 transition-colors"
                                title="Toggle live preview"
                              >
                                {showPreview.question ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                {showPreview.question ? 'Hide preview' : 'Show preview'}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="p-8 space-y-8">
                          {/* Section 1: Question Text with Live Preview */}
                          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-green-50/30">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <FileText className="h-4 w-4 text-green-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900">Question Text</h4>
                              </div>
                            </div>
                            <div className="p-6">
                              <ClientOnlyAdvancedTipTapEditor
                                value={editForm.question_text}
                                onChange={(value: string) => setEditForm({ ...editForm, question_text: value })}
                                placeholder="Enter your question text here (supports LaTeX math and images)..."
                                showToolbar={true}
                              />
                              
                              {/* Live Preview for Question Text */}
                              {showPreview.question && editForm.question_text && (
                                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Eye className="h-4 w-4 text-slate-600" />
                                    <span className="text-sm font-medium text-slate-700">Live preview</span>
                                  </div>
                                  <div className="prose prose-sm max-w-none">
                                    <LivePreviewRenderer content={editForm.question_text} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Section 2: Options with Live Preview */}
                          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-purple-50/30">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Award className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <h4 className="text-lg font-semibold text-gray-900">Answer Options</h4>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowPreview({ ...showPreview, options: !showPreview.options })}
                                    className="gap-2 hover:bg-slate-50 transition-colors"
                                    title="Toggle options preview"
                                  >
                                    {showPreview.options ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    {showPreview.options ? 'Hide preview' : 'Show preview'}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={addEditOption}
                                    className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Option
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(editForm.options).sort().map((k) => (
                                  <div key={k} className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">A</span>
                                      Option {k.toUpperCase()}
                                    </label>
                                    <Input
                                      value={editForm.options[k]}
                                      onChange={(e) => setEditForm({ ...editForm, options: { ...editForm.options, [k]: e.target.value } })}
                                      placeholder={`Option ${k.toUpperCase()}`}
                                      className="border-slate-200 focus:border-blue-300 transition-colors"
                                    />
                                    
                                    {/* Live Preview for Option */}
                                    {showPreview.options && editForm.options[k] && (
                                      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Eye className="h-3 w-3 text-slate-600" />
                                          <span className="text-xs font-medium text-slate-700">Preview</span>
                                        </div>
                                        <div className="prose prose-xs max-w-none">
                                          <UniversalContentRenderer text={editForm.options[k]} />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Section 3: Correct Answer */}
                          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-emerald-50/30">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900">Correct Answer</h4>
                              </div>
                            </div>
                            <div className="p-6">
                              <Select
                                value={editForm.correct_option}
                                onValueChange={(v) => setEditForm({ ...editForm, correct_option: v })}
                              >
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors">
                                  <SelectValue placeholder="Choose the correct answer..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                  {Object.keys(editForm.options).sort().map((k) => (
                                    <SelectItem key={k} value={k} className="font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">
                                          {k.toUpperCase()}
                                        </div>
                                        <span>Option {k.toUpperCase()}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Section 4: Solution with Live Preview */}
                          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-orange-50/30">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Star className="h-4 w-4 text-orange-600" />
                                  </div>
                                  <h4 className="text-lg font-semibold text-gray-900">Solution Explanation</h4>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowPreview({ ...showPreview, solution: !showPreview.solution })}
                                  className="gap-2 hover:bg-slate-50 transition-colors"
                                  title="Toggle solution preview"
                                >
                                  {showPreview.solution ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  {showPreview.solution ? 'Hide preview' : 'Show preview'}
                                </Button>
                              </div>
                            </div>
                            <div className="p-6">
                              <ClientOnlyAdvancedTipTapEditor
                                value={editForm.solution_text}
                                onChange={(value: string) => setEditForm({ ...editForm, solution_text: value })}
                                placeholder="Enter your solution explanation here (supports LaTeX math and images)..."
                                showToolbar={true}
                              />
                              
                              {/* Live Preview for Solution */}
                              {showPreview.solution && editForm.solution_text && (
                                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Eye className="h-4 w-4 text-slate-600" />
                                    <span className="text-sm font-medium text-slate-700">Live preview</span>
                                  </div>
                                  <div className="prose prose-sm max-w-none">
                                    <LivePreviewRenderer content={editForm.solution_text} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                            <Button 
                              variant="outline" 
                              onClick={cancelEdit}
                              className="border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-800 px-6 py-2.5 h-11 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={saveEdit} 
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2.5 h-11 rounded-xl font-semibold group"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                              Save Changes
                            </Button>
                          </div>
                        </div>
                        </div>
                      ) : (
                        <div>
                        {/* Ultra-Premium Question Text */}
                        <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-br from-gray-50/80 via-white/50 to-blue-50/30 rounded-xl sm:rounded-2xl border border-gray-200/60 shadow-lg">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 shadow-sm">
                              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-gray-800">Question</h4>
                          </div>
                          <div className="prose prose-xs sm:prose-lg max-w-none text-gray-800 leading-relaxed">
                              {renderMathContent(q.question_text)}
                            </div>
                          </div>

                        {/* Ultra-Premium Options */}
                        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                            {optionKeys.map((optionKey) => {
                              const optionText = options[optionKey]
                              const isCorrect = q.correct_option === optionKey
                              
                              return (
                                <div
                                  key={optionKey}
                                className={`flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 hover:shadow-md ${
                                    isCorrect 
                                      ? 'bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-green-300/60 shadow-lg' 
                                      : 'bg-white/90 border-gray-200/60 hover:bg-gray-50/80'
                                  }`}
                                >
                                <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-sm sm:text-lg font-bold transition-all duration-300 shadow-sm ${
                                    isCorrect
                                      ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-800 shadow-green-200'
                                      : 'bg-gradient-to-br from-gray-100 to-slate-200 text-gray-700'
                                  }`}>
                                    {getOptionLabel(String(optionKey))}
                                    {isCorrect && (
                                    <span className="ml-0.5 sm:ml-1 text-green-600 text-xs sm:text-sm">✓</span>
                                    )}
                                  </div>
                                  <div className="flex-1 prose prose-xs sm:prose-lg max-w-none text-gray-800 leading-relaxed">
                                    {renderMathContent(String(optionText))}
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                        {/* Ultra-Premium Admin Metadata */}
                        <div className="bg-gradient-to-br from-gray-50/80 via-white/60 to-slate-50/40 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-200/60 shadow-lg mb-4 sm:mb-6">
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-100 to-gray-100 shadow-sm">
                              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-gray-800">Question Details</h4>
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 sm:gap-1.5">
                                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500" />
                                  <span className="text-xs font-semibold text-gray-600">Source</span>
                              </div>
                                <p className="text-xs sm:text-sm text-gray-800 truncate font-medium">{q.book_source || '—'}</p>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 sm:gap-1.5">
                                  <BarChart3 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500" />
                                  <span className="text-xs font-semibold text-gray-600">Number</span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-800 truncate font-medium">{q.question_number_in_book || '—'}</p>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 sm:gap-1.5">
                                  <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500" />
                                  <span className="text-xs font-semibold text-gray-600">Difficulty</span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-800 truncate font-medium">{(q as unknown as { difficulty?: string }).difficulty || '—'}</p>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 sm:gap-1.5">
                                  <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500" />
                                  <span className="text-xs font-semibold text-gray-600">Tags</span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-800 truncate font-medium">{(q.admin_tags || []).join(', ') || '—'}</p>
                              </div>
                            </div>
                          </div>

                        {/* Ultra-Premium Solution Box */}
                        {q.solution_text && (
                          <div className="mt-6">
                            <button
                              type="button"
                              onClick={() => handleToggleSolution(q.id || q.question_id || index)}
                              className="flex items-center gap-3 text-sm text-amber-700 hover:text-amber-800 font-semibold transition-all duration-200 w-full justify-between p-4 bg-gradient-to-r from-amber-50/80 to-orange-50/60 rounded-2xl border border-amber-200/60 hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-orange-100/60 hover:shadow-md"
                            >
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 shadow-sm">
                                  <Star className="h-4 w-4 text-amber-600" />
                                </div>
                                <span>View Solution</span>
                              </div>
                              <ChevronDown 
                                className={`h-4 w-4 transition-transform duration-200 ${
                                  expandedSolutionIds.has(q.id || q.question_id || index) ? 'rotate-180' : ''
                                }`} 
                              />
                            </button>
                            
                            {expandedSolutionIds.has(q.id || q.question_id || index) && (
                              <div className="mt-4 p-5 bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-red-50/40 rounded-2xl border border-amber-200/60 shadow-lg">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                  <span className="text-sm font-bold text-amber-800">Solution</span>
                                </div>
                                <div className="prose prose-xs max-w-none text-gray-800 leading-relaxed">
                                  <div className="text-sm font-medium [&_*]:text-sm [&_*]:leading-relaxed [&_p]:mb-2 [&_p]:last:mb-0 [&_strong]:font-semibold [&_em]:italic">
                                    {renderMathContent(q.solution_text)}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        </div>
                      )}
                    </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Ultra-Premium Summary */}
        <div className="mt-6 sm:mt-8 py-4 sm:py-6 px-3 sm:px-4 bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-purple-50/50 rounded-xl sm:rounded-2xl border border-blue-200/60 shadow-lg sm:shadow-xl -mx-3 sm:-mx-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-blue-900 tracking-tight">Test Summary</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white/60 rounded-lg sm:rounded-xl border border-blue-200/40 shadow-sm">
                  <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                  </div>
            <div>
                    <p className="text-xs font-semibold text-blue-600">Total Questions</p>
                    <p className="text-base sm:text-lg font-bold text-blue-800">{questions.length}</p>
            </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white/60 rounded-lg sm:rounded-xl border border-green-200/40 shadow-sm">
                  <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-green-100 to-emerald-100">
                    <Lightning className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-green-600">Shuffle</p>
                    <p className="text-base sm:text-lg font-bold text-green-800">Available</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white/60 rounded-lg sm:rounded-xl border border-blue-200/40 shadow-sm">
                  <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                    <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-600">Options</p>
                    <p className="text-base sm:text-lg font-bold text-blue-800">{shuffleOptions ? 'On' : 'Off'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl sm:rounded-2xl border border-green-200/60 shadow-lg">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <span className="text-xs sm:text-sm font-bold text-green-800">
                Ready to Proceed
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Question Explorer Modal */}
      <UnifiedQuestionBankModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setOverrideIndex(null)
        }}
        onSelect={handleSelectOverride}
        onSelectMultiple={handleSelectMultiple}
        initialChapter={overrideIndex !== null ? questions[overrideIndex]?.chapter_name : undefined}
        multiSelect={overrideIndex === questions.length}
        title={overrideIndex === questions.length ? "Add Questions from Bank" : "Select Replacement Question"}
      />

      {/* Ultra-Premium Choice Modal */}
      {chooseOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200/60 w-full max-w-md sm:max-w-lg my-4 sm:my-8">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Add New Question</h3>
                  <p className="text-xs sm:text-sm text-blue-100">Choose how you&apos;d like to add a question</p>
                </div>
              </div>
            </div>

            {/* Premium Content */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* Write New Question Option */}
              <Button 
                onClick={() => { setChooseOpen(false); setCreateOpen(true) }}
                className="w-full h-14 sm:h-16 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 sm:gap-4 group"
              >
                <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <Wand2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm sm:text-base">Write a New Question</div>
                  <div className="text-xs sm:text-sm text-purple-100">Create a custom question with LaTeX support</div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Add from Question Bank Option */}
              <Button 
                variant="outline"
                onClick={() => { setChooseOpen(false); setModalOpen(true); setOverrideIndex(questions.length) }}
                className="w-full h-14 sm:h-16 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-3 sm:gap-4 group"
              >
                <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm sm:text-base text-gray-800">Add from Question Bank</div>
                  <div className="text-xs sm:text-sm text-gray-600">Select from existing questions in the database</div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:translate-x-1 group-hover:text-gray-600 transition-all" />
              </Button>
            </div>

            {/* Premium Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200/60 rounded-b-xl sm:rounded-b-2xl flex justify-end">
              <Button 
                variant="ghost"
                onClick={() => setChooseOpen(false)}
                className="h-8 sm:h-10 px-4 sm:px-6 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ultra-Premium Create Question Modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl sm:max-w-6xl rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200/60 my-4 sm:my-8 min-h-[90vh] max-h-[95vh] flex flex-col">
            <div className="flex-1 overflow-y-auto">
            <CreateQuestionForm
              onCancel={() => setCreateOpen(false)}
              onSave={(newQ) => {
                handleCreateQuestion(newQ)
                setCreateOpen(false)
              }}
            />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CreateQuestionForm({ onCancel, onSave }: { onCancel: () => void; onSave: (q: Question) => void }) {
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState<Record<string, string>>({ A: '', B: '', C: '', D: '' })
  const [correct, setCorrect] = useState('A')
  const [solution, setSolution] = useState('')
  const [chapter, setChapter] = useState('')
  const [difficulty, setDifficulty] = useState('Moderate')
  const [tags, setTags] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState({
    question: true,
    options: true,
    solution: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addOption = () => {
    const keys = Object.keys(options).sort()
    const last = keys[keys.length - 1]
    const nextChar = String.fromCharCode(last.charCodeAt(0) + 1)
    setOptions({ ...options, [nextChar]: '' })
  }

  const removeOption = (key: string) => {
    const keys = Object.keys(options)
    if (keys.length <= 2) return // Keep at least 2 options
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [key]: _, ...rest } = options
    setOptions(rest)
    
    // If we deleted the correct option, set it to the first remaining option
    if (correct === key) {
      const remainingKeys = Object.keys(rest).sort()
      setCorrect(remainingKeys[0])
    }
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!questionText.trim()) errs.questionText = 'Question text is required'
    const keys = Object.keys(options)
    if (keys.length < 2) errs.options = 'At least two options are required'
    for (const k of keys) {
      if (!String(options[k]).trim()) { errs.options = 'Options cannot be empty'; break }
    }
    if (!keys.includes(correct)) errs.correct = 'Correct option must be one of the options'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const save = async () => {
    if (!validate()) return
    
    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()
      const q: Question = {
        id: undefined,
        created_at: now,
        question_id: `TEMP-${Date.now()}`,
        book_source: 'Manual', // Default for manually created questions
        chapter_name: chapter.trim() || 'General', // Use provided chapter or default
        question_number_in_book: null,
        question_text: questionText,
        options,
        correct_option: correct,
        solution_text: solution,
        exam_metadata: null,
        admin_tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        difficulty: difficulty as 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard'
      }
      onSave(q)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30">
      {/* iOS-Inspired Header */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Question</h2>
              <p className="text-sm text-gray-600 font-medium">Design a custom question with LaTeX support</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-10 w-10 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Single Column Layout with Previews Below Each Editor */}
            <div className="space-y-8">
              {/* Question Text Section */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Question Text</h3>
                        <p className="text-sm text-gray-600">Enter your question with LaTeX support</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreview(prev => ({ ...prev, question: !prev.question }))}
                      className="h-9 px-4 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      {showPreview.question ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showPreview.question ? 'Hide Preview' : 'Show Preview'}
                    </Button>
                  </div>
                </div>
                <div className="p-8">
                  <ClientOnlyAdvancedTipTapEditor
                    value={questionText}
                    onChange={(value: string) => setQuestionText(value)}
                    placeholder="Enter your question text. Use $...$ for inline math and $$...$$ for block math..."
                    showToolbar={true}
                  />
                  {errors.questionText && (
                    <div className="mt-3 flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">{errors.questionText}</span>
                    </div>
                  )}
                  
                  {/* Question Text Preview */}
                  {showPreview.question && questionText && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/60">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-800">Question Preview</span>
                      </div>
                      <div className="prose prose-sm max-w-none text-gray-800">
                        <LivePreviewRenderer content={questionText} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Options Section */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-green-50/50 to-emerald-50/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                        <Award className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Answer Options</h3>
                        <p className="text-sm text-gray-600">Add multiple choice options</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreview(prev => ({ ...prev, options: !prev.options }))}
                      className="h-9 px-4 rounded-xl hover:bg-green-50 transition-colors"
                    >
                      {showPreview.options ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showPreview.options ? 'Hide Preview' : 'Show Preview'}
                    </Button>
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  {Object.entries(options).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-sm">
                        <span className="text-lg font-bold text-blue-700">{key}</span>
                      </div>
                      <Input 
                        value={value} 
                        onChange={(e) => setOptions({ ...options, [key]: e.target.value })}
                        className="flex-1 h-12 border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 rounded-2xl text-base transition-all duration-200"
                        placeholder={`Option ${key}...`}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeOption(key)} 
                        className="h-12 w-12 rounded-2xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    onClick={addOption} 
                    className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 rounded-2xl text-gray-600 hover:text-green-600 text-base font-medium transition-all duration-200"
                  >
                    <Plus className="h-5 w-5 mr-3" /> 
                    Add Option
                  </Button>
                  {errors.options && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">{errors.options}</span>
                    </div>
                  )}
                  
                  {/* Options Preview */}
                  {showPreview.options && Object.values(options).some(opt => opt.trim()) && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/60">
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-800">Options Preview</span>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(options).map(([key, value]) => (
                          value.trim() && (
                            <div key={key} className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                              <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                <span className="text-xs font-bold text-green-700">{key}</span>
                              </div>
                              <div className="flex-1 prose prose-sm max-w-none text-gray-800">
                                <LivePreviewRenderer content={value} />
                              </div>
                              {correct === key && (
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Correct Answer Section */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Correct Answer</h3>
                      <p className="text-sm text-gray-600">Select the correct option</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <Select value={correct} onValueChange={(v) => setCorrect(v)}>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 rounded-2xl text-base transition-all duration-200">
                      <SelectValue placeholder="Select correct option" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-200 shadow-xl">
                      {Object.keys(options).map((k) => (
                        <SelectItem key={k} value={k} className="text-base font-medium rounded-xl">
                          Option {k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.correct && (
                    <div className="mt-3 flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">{errors.correct}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Solution Section */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-orange-50/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                        <Star className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Solution (Optional)</h3>
                        <p className="text-sm text-gray-600">Add explanation for the answer</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreview(prev => ({ ...prev, solution: !prev.solution }))}
                      className="h-9 px-4 rounded-xl hover:bg-amber-50 transition-colors"
                    >
                      {showPreview.solution ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showPreview.solution ? 'Hide Preview' : 'Show Preview'}
                    </Button>
                  </div>
                </div>
                <div className="p-8">
                  <ClientOnlyAdvancedTipTapEditor
                    value={solution}
                    onChange={(value: string) => setSolution(value)}
                    placeholder="Enter the solution explanation. Use LaTeX for mathematical expressions..."
                    showToolbar={true}
                  />
                  
                  {/* Solution Preview */}
                  {showPreview.solution && solution && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/60">
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-800">Solution Preview</span>
                      </div>
                      <div className="prose prose-sm max-w-none text-gray-800">
                        <LivePreviewRenderer content={solution} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Section */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-gray-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <Info className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Question Metadata</h3>
                      <p className="text-sm text-gray-600">Additional information about the question</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">Chapter Name</Label>
                      <Input 
                        value={chapter} 
                        onChange={(e) => setChapter(e.target.value)} 
                        placeholder="e.g., Algebra, Geometry"
                        className="h-12 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-2xl text-base transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">Difficulty Level</Label>
                      <Select value={difficulty} onValueChange={(v) => setDifficulty(v)}>
                        <SelectTrigger className="h-12 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-2xl text-base transition-all duration-200">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-200 shadow-xl">
                          {['Easy','Easy-Moderate','Moderate','Moderate-Hard','Hard'].map((d) => (
                            <SelectItem key={d} value={d} className="text-base font-medium rounded-xl">{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">Admin Tags (comma separated)</Label>
                    <Input 
                      value={tags} 
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., geometry, algebra, trigonometry"
                      className="h-12 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-2xl text-base transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* iOS-Inspired Action Buttons */}
      <div className="flex-shrink-0 px-6 py-5 border-t border-gray-200/60 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Palette className="h-4 w-4" />
            <span>LaTeX math supported: $inline$ and $$block$$</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="h-12 px-8 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-2xl text-base font-medium transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={save}
              disabled={isSubmitting}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Question to Test
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
