'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRight, Pencil, Edit3, Trash2, ChevronDown, Plus, Eye, EyeOff, Settings, Sparkles, Layers, RefreshCw, FileText, CheckCircle2, BarChart3, Award, Star, Shield, Zap as Lightning, Wand2, Palette, Code, Eye as Preview, Save, X, BookOpen, AlertCircle } from 'lucide-react'
import { SmartLatexRenderer } from './smart-latex-renderer'
import type { Question, TestQuestionSlot } from '@/lib/types'
import { UnifiedQuestionBankModal } from './unified-question-bank-modal'

interface ReviewRefineInterfaceProps {
  questions: TestQuestionSlot[]
  onQuestionsChange: (questions: TestQuestionSlot[]) => void
  onRegenerate: (index: number) => void
  onEdit: (index: number) => void
  onNext: () => void
}

export function ReviewRefineInterface({
  questions,
  onQuestionsChange,
  onRegenerate,
  onEdit,
  onNext
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

  const removeEditOption = (key: string) => {
    if (!editForm) return
    const keys = Object.keys(editForm.options)
    if (keys.length <= 2) return // Keep at least 2 options
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [key]: _, ...rest } = editForm.options
    setEditForm({
      ...editForm,
      options: rest,
      correct_option: editForm.correct_option === key ? Object.keys(rest).sort()[0] : editForm.correct_option
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

  const renderMathContent = (text: string) => <SmartLatexRenderer text={text} />

  const getOptionLabel = (option: string) => {
    return option.charAt(0).toUpperCase()
  }


  return (
    <div className="w-full">
      {/* Ultra-Premium Mobile Header */}
      <div className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-gray-200/60 shadow-lg">
        <div className="px-3 sm:px-4 py-3 sm:py-5 max-w-7xl mx-auto">
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
            <div className="flex-shrink-0 ml-2 sm:ml-4 flex items-center gap-2 sm:gap-3">
              <Button 
                onClick={() => setChooseOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 h-8 sm:h-10 rounded-lg sm:rounded-xl font-semibold group"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="hidden sm:inline">Add Question</span>
                <span className="sm:hidden">Add</span>
              </Button>
              
              <Button 
                onClick={onNext}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 h-8 sm:h-10 rounded-lg sm:rounded-xl font-semibold group"
              >
                <span className="hidden sm:inline">Next Step</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </div>
          
          {/* Premium Action Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200/60">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Premium Shuffle Button */}
              <Button 
                onClick={handleShuffleQuestions}
                disabled={isShuffling}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 h-8 sm:h-10 rounded-lg sm:rounded-xl font-semibold group w-full sm:w-auto"
              >
                {isShuffling ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1.5 sm:mr-2"></div>
                    <span className="hidden sm:inline">Shuffling...</span>
                    <span className="sm:hidden">Shuffling</span>
                  </>
                ) : (
                  <>
                    <Lightning className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 group-hover:rotate-12 transition-transform duration-200" />
                    <span className="hidden sm:inline">Shuffle Questions</span>
                    <span className="sm:hidden">Shuffle</span>
                  </>
                )}
              </Button>
              
              {/* Ultra-Premium Toggle Switch */}
              <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-gray-50/80 to-blue-50/40 rounded-xl sm:rounded-2xl border border-gray-200/60 shadow-lg w-full sm:w-auto">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-sm">
                    <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-gray-800">Shuffle Options</span>
                    <p className="text-xs text-gray-600 hidden sm:block">Randomize option order</p>
                  </div>
                </div>
                
                {/* Premium Toggle Switch */}
                <button
                  onClick={() => setShuffleOptions(!shuffleOptions)}
                  className={`relative inline-flex h-6 w-12 sm:h-7 sm:w-14 items-center rounded-full transition-all duration-300 shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200/50 ${
                    shuffleOptions 
                      ? 'bg-gradient-to-r from-emerald-400 to-green-500 shadow-emerald-200' 
                      : 'bg-gray-300 shadow-gray-200'
                  }`}
                  aria-pressed={shuffleOptions}
                >
                  <span
                    className={`inline-block h-5 w-5 sm:h-6 sm:w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                      shuffleOptions ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="p-3 sm:p-4">
        <div className="max-w-7xl mx-auto">
        {/* Ultra-Premium Questions List */}
        <div className="space-y-4 sm:space-y-6">
          {questions.map((item, index) => {
            const q = item.question
            const options = q.options || {}
            // Filter out empty options to avoid displaying placeholder options
            const optionKeys = Object.keys(options).filter(key => options[key] && options[key].trim()) as Array<keyof typeof options>
            
            return (
              <Card key={index} className="group border border-gray-200/60 rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 hover:scale-[1.005] sm:hover:scale-[1.01]">
                <CardContent className="p-4 sm:p-6">
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
                      <div className="space-y-4 sm:space-y-6">
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 shadow-sm">
                                  <FileText className="h-4 w-4 text-purple-600" />
                                </div>
                                <Label className="text-sm font-bold text-gray-800">Question Text</Label>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPreview({ ...showPreview, question: !showPreview.question })}
                                className="flex items-center gap-2 text-sm h-9 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                {showPreview.question ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                {showPreview.question ? 'Hide Preview' : 'Show Preview'}
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                                <Textarea
                                  value={editForm.question_text}
                                  onChange={(e) => setEditForm({ ...editForm, question_text: e.target.value })}
                                  className="mt-1 text-sm border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl"
                                  rows={4}
                                  placeholder="Enter your question text here..."
                                />
                              </div>
                              {showPreview.question && (
                                <div className="border border-gray-200/60 rounded-2xl p-4 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-sm">
                                  <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Live Preview
                                  </div>
                                  <div className="prose prose-sm max-w-none">
                                    <SmartLatexRenderer text={editForm.question_text} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 shadow-sm">
                                  <Award className="h-4 w-4 text-orange-600" />
                                </div>
                                <Label className="text-sm font-bold text-gray-800">Answer Options</Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowPreview({ ...showPreview, options: !showPreview.options })}
                                  className="flex items-center gap-2 text-sm h-8 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                  {showPreview.options ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                  {showPreview.options ? 'Hide' : 'Show'} Preview
                                </Button>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={addEditOption}
                                className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200 text-sm h-9 px-4 rounded-xl shadow-sm hover:shadow-md"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Option
                              </Button>
                            </div>
                            <div className="space-y-4">
                                {Object.keys(editForm.options).sort().map((k) => (
                                <div key={k} className="space-y-3">
                                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50/80 to-blue-50/30 rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm">
                                      {k.toUpperCase()}
                                    </div>
                                    <Input
                                      value={editForm.options[k]}
                                      onChange={(e) => setEditForm({ ...editForm, options: { ...editForm.options, [k]: e.target.value } })}
                                      placeholder={`Option ${k.toUpperCase()}`}
                                      className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl border-gray-300"
                                    />
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => removeEditOption(k)}
                                      className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                                      title="Delete Option"
                                      disabled={Object.keys(editForm.options).length <= 2}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  {showPreview.options && editForm.options[k] && (
                                    <div className="ml-14 p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 rounded-xl border border-blue-200/60 shadow-sm">
                                      <div className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                                        <Eye className="h-3 w-3" />
                                        Live Preview
                              </div>
                                      <div className="prose prose-sm max-w-none">
                                          <SmartLatexRenderer text={editForm.options[k]} />
                                  </div>
                                </div>
                              )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Correct Answer Section - Ultra Premium */}
                          <div className="mb-8 p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-3xl border border-slate-200/60 shadow-xl hover:shadow-2xl transition-all duration-500">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 shadow-lg">
                                <CheckCircle2 className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <Label className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                  Correct Answer
                                  <div className="px-2 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                                    REQUIRED
                                  </div>
                                </Label>
                                <p className="text-sm text-slate-600 font-medium">Select the correct option for this question</p>
                              </div>
                            </div>
                            <Select
                              value={editForm.correct_option}
                              onValueChange={(v) => setEditForm({ ...editForm, correct_option: v })}
                            >
                              <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                                <SelectValue placeholder="Choose the correct answer..." />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl border-2 border-slate-200 shadow-2xl bg-white/95 backdrop-blur-md">
                                {Object.keys(editForm.options).sort().map((k) => (
                                  <SelectItem key={k} value={k} className="font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl mx-2 my-1">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-700 rounded-xl flex items-center justify-center text-sm font-bold">
                                        {k.toUpperCase()}
                                      </div>
                                      <span>Option {k.toUpperCase()}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Solution Section - Ultra Premium */}
                          <div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50/80 to-pink-50/60 rounded-3xl border border-indigo-200/60 shadow-2xl hover:shadow-3xl transition-all duration-700 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-8">
                              <div className="flex items-center gap-5">
                                <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl">
                                  <Star className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <Label className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                    Solution Explanation
                                    <div className="px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200 shadow-sm">
                                      OPTIONAL
                                    </div>
                                  </Label>
                                  <p className="text-sm text-slate-600 font-medium mt-1">Provide detailed solution with LaTeX mathematical expressions</p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPreview({ ...showPreview, solution: !showPreview.solution })}
                                className="flex items-center gap-3 text-sm h-12 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-indigo-200 hover:border-indigo-300 text-indigo-700 hover:text-indigo-800 bg-white/80 hover:bg-indigo-50/80 backdrop-blur-sm font-semibold"
                              >
                                {showPreview.solution ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                {showPreview.solution ? 'Hide Preview' : 'Show Preview'}
                              </Button>
                            </div>
                            
                            <div className="space-y-6">
                              <div className="relative">
                                <Textarea
                                  value={editForm.solution_text}
                                  onChange={(e) => setEditForm({ ...editForm, solution_text: e.target.value })}
                                  className="w-full border-2 border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 resize-none bg-white/90 backdrop-blur-sm text-slate-700 placeholder-slate-400"
                                  rows={6}
                                  placeholder="Enter your solution explanation here... 

💡 Pro Tips:
• Use LaTeX for math: $x^2 + y^2 = z^2$
• Use \\frac{a}{b} for fractions
• Use \\sqrt{x} for square roots
• Use \\pi, \\alpha, \\beta for Greek letters"
                                />
                                <div className="absolute top-3 right-3 p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl shadow-sm">
                                  <Code className="h-4 w-4 text-indigo-600" />
                                </div>
                              </div>
                              
                              {showPreview.solution && editForm.solution_text && (
                                <div className="w-full border-2 border-indigo-200/60 rounded-3xl p-8 bg-gradient-to-br from-white/95 to-indigo-50/40 shadow-2xl backdrop-blur-md">
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 shadow-lg">
                                      <Eye className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <span className="text-lg font-bold text-slate-800">Live Preview</span>
                                    <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                                      RENDERED
                                    </div>
                                  </div>
                                  <div className="prose prose-lg max-w-none text-slate-800 leading-relaxed">
                                    <SmartLatexRenderer text={editForm.solution_text} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 pt-4 border-t border-gray-200/60">
                            <Button 
                              onClick={saveEdit} 
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-6 py-2.5 h-11 rounded-xl font-semibold group"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                              Save Changes
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={cancelEdit}
                              className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 hover:text-gray-800 px-6 py-2.5 h-11 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
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
                                <div className="prose prose-xs sm:prose-lg max-w-none text-gray-800 leading-relaxed">
                                  {renderMathContent(q.solution_text)}
                                </div>
                              </div>
                            )}
                            </div>
                          )}
                        </>
                      )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        </div>

        {/* Ultra-Premium Summary */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-purple-50/50 rounded-xl sm:rounded-2xl border border-blue-200/60 shadow-lg sm:shadow-xl">
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
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white/60 rounded-lg sm:rounded-xl border border-purple-200/40 shadow-sm">
                  <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                    <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-600">Options</p>
                    <p className="text-base sm:text-lg font-bold text-purple-800">{shuffleOptions ? 'On' : 'Off'}</p>
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

  const save = () => {
    if (!validate()) return
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
  }

  return (
    <div className="flex flex-col h-full">
      {/* Ultra-Premium Header */}
      <div className="flex-shrink-0 p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 shadow-lg">
              <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
      </div>
      <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Create New Question</h3>
              <p className="text-xs sm:text-sm text-gray-600">Design a custom question with LaTeX support</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Form Inputs */}
          <div className="space-y-4 sm:space-y-6">
            {/* Question Text Section */}
            <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm font-semibold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                  Question Text *
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(prev => ({ ...prev, question: !prev.question }))}
                  className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs text-gray-600 hover:text-gray-800"
                >
                  {showPreview.question ? <EyeOff className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" /> : <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" />}
                  <span className="hidden sm:inline">{showPreview.question ? 'Hide Preview' : 'Show Preview'}</span>
                  <span className="sm:hidden">{showPreview.question ? 'Hide' : 'Show'}</span>
                </Button>
        </div>
              <Textarea 
                rows={3} 
                value={questionText} 
                onChange={(e) => setQuestionText(e.target.value)}
                className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg sm:rounded-xl text-sm"
                placeholder="Enter your question text. Use $...$ for inline math and $$...$$ for block math..."
              />
              {errors.questionText && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.questionText}
              </p>}
              
              {/* Question Preview - Mobile Only */}
              {showPreview.question && questionText && (
                <div className="sm:hidden p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200/60 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-800">Question Preview</span>
                  </div>
                  <div className="prose prose-xs max-w-none text-gray-800">
                    <SmartLatexRenderer text={questionText} />
                  </div>
                </div>
              )}
            </div>

            {/* Options Section */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm font-semibold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                  <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                  Answer Options *
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(prev => ({ ...prev, options: !prev.options }))}
                  className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs text-gray-600 hover:text-gray-800"
                >
                  {showPreview.options ? <EyeOff className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" /> : <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" />}
                  <span className="hidden sm:inline">{showPreview.options ? 'Hide Preview' : 'Show Preview'}</span>
                  <span className="sm:hidden">{showPreview.options ? 'Hide' : 'Show'}</span>
                </Button>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {Object.entries(options).map(([key, value]) => (
                  <div key={key} className="flex gap-1.5 sm:gap-2 items-start">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-sm">
                      <span className="text-xs sm:text-sm font-bold text-blue-700">{key}</span>
                    </div>
                    <Input 
                      value={value} 
                      onChange={(e) => setOptions({ ...options, [key]: e.target.value })}
                      className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm"
                      placeholder={`Option ${key}...`}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeOption(key)} 
                      className="h-8 w-8 sm:h-10 sm:w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  onClick={addOption} 
                  className="w-full h-8 sm:h-10 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg text-gray-600 hover:text-blue-600 text-sm"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> 
                  <span className="hidden sm:inline">Add Option</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
              {errors.options && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.options}
              </p>}
              
              {/* Options Preview - Mobile Only */}
              {showPreview.options && Object.values(options).some(opt => opt.trim()) && (
                <div className="sm:hidden p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200/60 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Award className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs font-semibold text-green-800">Options Preview</span>
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(options).map(([key, value]) => (
                      value.trim() && (
                        <div key={key} className="flex items-start gap-2 p-1.5 bg-white/60 rounded-md">
                          <div className="flex-shrink-0 w-5 h-5 rounded-md bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-green-700">{key}</span>
                          </div>
                          <div className="flex-1 prose prose-xs max-w-none text-gray-800">
                            <SmartLatexRenderer text={value} />
                          </div>
                          {correct === key && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>

          {/* Correct Option Section */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-semibold text-gray-800 flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
              Correct Answer *
            </Label>
            <Select value={correct} onValueChange={(v) => setCorrect(v)}>
              <SelectTrigger className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-sm">
                <SelectValue placeholder="Select correct option" />
              </SelectTrigger>
            <SelectContent>
                {Object.keys(options).map((k) => (
                  <SelectItem key={k} value={k} className="font-medium text-sm">
                    Option {k}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
            {errors.correct && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.correct}
            </p>}
        </div>

            {/* Solution Section */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm font-semibold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                  <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                  Solution (Optional)
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(prev => ({ ...prev, solution: !prev.solution }))}
                  className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs text-gray-600 hover:text-gray-800"
                >
                  {showPreview.solution ? <EyeOff className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" /> : <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" />}
                  <span className="hidden sm:inline">{showPreview.solution ? 'Hide Preview' : 'Show Preview'}</span>
                  <span className="sm:hidden">{showPreview.solution ? 'Hide' : 'Show'}</span>
                </Button>
              </div>
              <Textarea 
                rows={2} 
                value={solution} 
                onChange={(e) => setSolution(e.target.value)}
                className="resize-none border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg sm:rounded-xl text-sm"
                placeholder="Enter the solution explanation. Use LaTeX for mathematical expressions..."
              />
              
              {/* Solution Preview - Mobile Only */}
              {showPreview.solution && solution && (
                <div className="sm:hidden p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200/60 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Star className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-800">Solution Preview</span>
                  </div>
                  <div className="prose prose-xs max-w-none text-gray-800">
                    <SmartLatexRenderer text={solution} />
                  </div>
                </div>
              )}
            </div>

            {/* Metadata Section */}
            <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg sm:rounded-xl border border-gray-200/60">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                <span className="text-xs sm:text-sm font-semibold text-gray-800">Question Metadata</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs font-medium text-gray-600">Chapter Name</Label>
                  <Input 
                    value={chapter} 
                    onChange={(e) => setChapter(e.target.value)} 
                    placeholder="e.g., Algebra, Geometry"
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v)}>
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Easy','Easy-Moderate','Moderate','Moderate-Hard','Hard'].map((d) => (
                        <SelectItem key={d} value={d} className="text-sm">{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-600">Admin Tags (comma separated)</Label>
                <Input 
                  value={tags} 
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., geometry, algebra, trigonometry"
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Live Preview (Desktop Only) */}
          <div className="hidden lg:block space-y-4 sm:space-y-6">
            <div className="sticky top-2 sm:top-4">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <Preview className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                <span className="text-xs sm:text-sm font-semibold text-gray-800">Live Preview</span>
              </div>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Question Preview */}
              {showPreview.question && questionText && (
                <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl border border-blue-200/60 shadow-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                    <span className="text-xs sm:text-sm font-semibold text-blue-800">Question Preview</span>
                  </div>
                  <div className="prose prose-xs sm:prose-sm max-w-none text-gray-800">
                    <SmartLatexRenderer text={questionText} />
                  </div>
                </div>
              )}

              {/* Options Preview */}
              {showPreview.options && Object.values(options).some(opt => opt.trim()) && (
                <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl border border-green-200/60 shadow-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                    <span className="text-xs sm:text-sm font-semibold text-green-800">Options Preview</span>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    {Object.entries(options).map(([key, value]) => (
                      value.trim() && (
                        <div key={key} className="flex items-start gap-2 sm:gap-3 p-1.5 sm:p-2 bg-white/60 rounded-md sm:rounded-lg">
                          <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-green-700">{key}</span>
                          </div>
                          <div className="flex-1 prose prose-xs max-w-none text-gray-800">
                            <SmartLatexRenderer text={value} />
                          </div>
                          {correct === key && (
                            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Solution Preview */}
              {showPreview.solution && solution && (
                <div className="p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg sm:rounded-xl border border-amber-200/60 shadow-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                    <span className="text-xs sm:text-sm font-semibold text-amber-800">Solution Preview</span>
                  </div>
                  <div className="prose prose-xs sm:prose-sm max-w-none text-gray-800">
                    <SmartLatexRenderer text={solution} />
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!questionText && !Object.values(options).some(opt => opt.trim()) && !solution && (
                <div className="p-6 sm:p-8 text-center bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg sm:rounded-xl border border-gray-200/60">
                  <Code className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm text-gray-600">Start typing to see live preview</p>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ultra-Premium Action Buttons - Fixed at Bottom */}
      <div className="flex-shrink-0 p-4 sm:p-6 pt-3 sm:pt-4 border-t border-gray-200/60 bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
            <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">LaTeX math supported: $inline$ and $$block$$</span>
            <span className="sm:hidden">LaTeX supported</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1 sm:flex-none h-8 sm:h-10 px-4 sm:px-6 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={save} 
              className="flex-1 sm:flex-none h-8 sm:h-10 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1.5 sm:gap-2 text-sm"
            >
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Save Question to Test</span>
              <span className="sm:hidden">Save</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
