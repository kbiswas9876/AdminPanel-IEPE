'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRight, Shuffle, RotateCcw, Pencil, Edit3, Trash2, ChevronDown, Plus, Eye, EyeOff } from 'lucide-react'
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
    <div className="min-h-screen">
      {/* Premium Global Control Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100">
                  <Edit3 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    Review & Refine
                  </h2>
                  <p className="text-sm text-gray-600 font-medium">
                    {questions.length} questions ready for review
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setChooseOpen(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Question
              </Button>
              
              <Button 
                onClick={handleShuffleQuestions}
                disabled={isShuffling}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isShuffling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Shuffling...
                  </>
                ) : (
                  <>
                    <Shuffle className="h-4 w-4 mr-2" />
                    Shuffle Questions
                  </>
                )}
              </Button>
              
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50/80 rounded-lg border border-gray-200/50">
                <span className="text-sm font-semibold text-gray-700">Shuffle Options</span>
                <button
                  onClick={() => setShuffleOptions(!shuffleOptions)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                    shuffleOptions ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gray-300'
                  }`}
                  aria-pressed={shuffleOptions}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                      shuffleOptions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <Button 
                onClick={onNext}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Next: Set Rules & Publish
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((item, index) => {
            const q = item.question
            const options = q.options || {}
            // Filter out empty options to avoid displaying placeholder options
            const optionKeys = Object.keys(options).filter(key => options[key] && options[key].trim()) as Array<keyof typeof options>
            
            return (
              <Card key={index} className="group border border-gray-200/50 rounded-xl overflow-hidden bg-white/80 hover:bg-white shadow-sm hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Question Content */}
                    <div className="flex-1">
                      {/* Question Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                            <span className="text-lg font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                              Question {index + 1}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
                            <span className="text-sm font-semibold text-blue-600">
                              {item.chapter_name}
                            </span>
                          </div>
                          <div className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200/50">
                            <span className="text-sm font-medium text-gray-600">
                              {item.source_type}
                              {item.source_value && `: ${item.source_value}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      {editingIndex === index && editForm ? (
                        <div className="space-y-6">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm">Question Text</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPreview({ ...showPreview, question: !showPreview.question })}
                                className="flex items-center gap-2"
                              >
                                {showPreview.question ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                {showPreview.question ? 'Hide Preview' : 'Show Preview'}
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div>
                                <Textarea
                                  value={editForm.question_text}
                                  onChange={(e) => setEditForm({ ...editForm, question_text: e.target.value })}
                                  className="mt-1"
                                  rows={5}
                                  placeholder="Enter your question text here..."
                                />
                              </div>
                              {showPreview.question && (
                                <div className="border rounded-lg p-4 bg-gray-50">
                                  <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
                                  <div className="prose prose-sm max-w-none">
                                    <SmartLatexRenderer text={editForm.question_text} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Label className="text-sm">Options</Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowPreview({ ...showPreview, options: !showPreview.options })}
                                  className="flex items-center gap-2"
                                >
                                  {showPreview.options ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  {showPreview.options ? 'Hide Preview' : 'Show Preview'}
                                </Button>
                              </div>
                              <Button variant="outline" size="sm" onClick={addEditOption}>+ Add Option</Button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                {Object.keys(editForm.options).sort().map((k) => (
                                  <div key={k} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                                      {k.toUpperCase()}
                                    </div>
                                    <Input
                                      value={editForm.options[k]}
                                      onChange={(e) => setEditForm({ ...editForm, options: { ...editForm.options, [k]: e.target.value } })}
                                      placeholder={`Option ${k.toUpperCase()}`}
                                      className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => removeEditOption(k)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                                      title="Delete Option"
                                      disabled={Object.keys(editForm.options).length <= 2}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              {showPreview.options && (
                                <div className="border rounded-lg p-4 bg-gray-50">
                                  <div className="text-sm font-medium text-gray-700 mb-3">Options Preview:</div>
                                  <div className="space-y-2">
                                    {Object.keys(editForm.options).sort().map((k) => (
                                      <div key={k} className="flex items-start gap-2">
                                        <span className="font-semibold text-blue-600 min-w-[20px]">{k.toUpperCase()})</span>
                                        <div className="prose prose-sm max-w-none flex-1">
                                          <SmartLatexRenderer text={editForm.options[k]} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm">Correct Option</Label>
                              <Select
                                value={editForm.correct_option}
                                onValueChange={(v) => setEditForm({ ...editForm, correct_option: v })}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select correct option" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(editForm.options).sort().map((k) => (
                                    <SelectItem key={k} value={k}>{k}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label className="text-sm">Solution</Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowPreview({ ...showPreview, solution: !showPreview.solution })}
                                  className="flex items-center gap-2"
                                >
                                  {showPreview.solution ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  {showPreview.solution ? 'Hide Preview' : 'Show Preview'}
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                  <Textarea
                                    value={editForm.solution_text}
                                    onChange={(e) => setEditForm({ ...editForm, solution_text: e.target.value })}
                                    className="mt-1"
                                    rows={3}
                                    placeholder="Enter solution explanation here..."
                                  />
                                </div>
                                {showPreview.solution && (
                                  <div className="border rounded-lg p-4 bg-gray-50">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Solution Preview:</div>
                                    <div className="prose prose-sm max-w-none">
                                      <SmartLatexRenderer text={editForm.solution_text} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Button onClick={saveEdit} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                            <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Question Text */}
                          <div className="mb-8 p-6 bg-gradient-to-r from-gray-50/50 to-white/50 rounded-xl border border-gray-100/50">
                            <div className="prose prose-lg max-w-none text-gray-800">
                              {renderMathContent(q.question_text)}
                            </div>
                          </div>

                          {/* Options */}
                          <div className="space-y-4 mb-8">
                            {optionKeys.map((optionKey) => {
                              const optionText = options[optionKey]
                              const isCorrect = q.correct_option === optionKey
                              
                              return (
                                <div
                                  key={optionKey}
                                  className={`flex items-start space-x-4 p-4 rounded-xl border transition-all duration-200 ${
                                    isCorrect 
                                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50 shadow-sm' 
                                      : 'bg-white/80 border-gray-200/50 hover:bg-gray-50/50'
                                  }`}
                                >
                                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                                    isCorrect
                                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 shadow-sm'
                                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                                  }`}>
                                    {getOptionLabel(String(optionKey))}
                                    {isCorrect && (
                                      <span className="ml-1 text-green-600">✓</span>
                                    )}
                                  </div>
                                  <div className="flex-1 prose prose-sm max-w-none text-gray-800">
                                    {renderMathContent(String(optionText))}
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Admin Metadata */}
                          <div className="bg-gradient-to-r from-gray-50/50 to-white/50 rounded-xl p-6 border border-gray-100/50">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div>
                                <span className="font-medium">Source:</span> {q.book_source || '—'}
                              </div>
                              <div>
                                <span className="font-medium">Original No:</span> {q.question_number_in_book || '—'}
                              </div>
                              <div>
                                <span className="font-medium">Difficulty:</span> {(q as unknown as { difficulty?: string }).difficulty || '—'}
                              </div>
                              <div>
                                <span className="font-medium">Tags:</span> {(q.admin_tags || []).join(', ') || '—'}
                              </div>
                            </div>
                          </div>

                          {/* Expandable Solution Viewer */}
                          {q.solution_text && (
                            <div className="mt-4">
                              <button
                                type="button"
                                onClick={() => handleToggleSolution(q.id || q.question_id || index)}
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                              >
                                <ChevronDown 
                                  className={`h-4 w-4 transition-transform duration-200 ${
                                    expandedSolutionIds.has(q.id || q.question_id || index) ? 'rotate-180' : ''
                                  }`} 
                                />
                                {expandedSolutionIds.has(q.id || q.question_id || index) ? 'Hide Solution' : 'View Solution'}
                              </button>
                              
                              <div 
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                  expandedSolutionIds.has(q.id || q.question_id || index) 
                                    ? 'max-h-96 opacity-100 mt-3' 
                                    : 'max-h-0 opacity-0'
                                }`}
                              >
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <h5 className="font-medium text-blue-900 mb-2">Solution:</h5>
                                  <div className="prose prose-sm max-w-none text-blue-800">
                                    <SmartLatexRenderer text={q.solution_text} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Per-Question Control Deck */}
                    <div className="flex-shrink-0 w-20">
                      <div className="flex flex-col space-y-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRegenerate(index)}
                          className="h-12 w-12 p-0 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-200"
                          title="Regenerate Question"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOverride(index)}
                          className="h-12 w-12 p-0 hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all duration-200"
                          title="Manual Override"
                        >
                          <Pencil className="h-4 w-4" />
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
                          className="h-12 w-12 p-0 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-all duration-200"
                          title="Edit In-Place"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(index)}
                          className="h-12 w-12 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200"
                          title="Delete Question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-200/50 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-blue-900 tracking-tight">Test Summary</h3>
              <p className="text-sm text-blue-700 font-medium mt-1">
                Total Questions: {questions.length} | 
                Shuffle Questions: Available | 
                Shuffle Options: {shuffleOptions ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200/50">
              <span className="text-sm font-semibold text-blue-600">
                Ready for final review
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

      {/* Choice modal */}
      {chooseOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-md shadow-lg w-[90vw] max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Add Question</h3>
            <div className="grid grid-cols-1 gap-3">
              <Button onClick={() => { setChooseOpen(false); setCreateOpen(true) }}>✏️ Write a New Question</Button>
              <Button variant="outline" onClick={() => { setChooseOpen(false); setModalOpen(true); setOverrideIndex(questions.length) }}>📚 Add from Question Bank</Button>
            </div>
            <div className="mt-4 text-right">
              <Button variant="outline" onClick={() => setChooseOpen(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Create Question Modal (simple version) */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white w-[95vw] max-w-3xl rounded-md shadow-lg p-4">
            <CreateQuestionForm
              onCancel={() => setCreateOpen(false)}
              onSave={(newQ) => {
                handleCreateQuestion(newQ)
                setCreateOpen(false)
              }}
            />
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Create New Question</h3>
      <div>
        <Label>Question Text <span className="text-red-600">*</span></Label>
        <Textarea rows={5} className="mt-1" value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
        {errors.questionText && <p className="text-xs text-red-600 mt-1">{errors.questionText}</p>}
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label>Options <span className="text-red-600">*</span></Label>
          <Button variant="outline" size="sm" onClick={addOption}>+ Add Option</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {Object.keys(options).sort().map((k) => (
            <div key={k} className="flex items-center gap-2">
              <span className="w-6 font-semibold">{k}.</span>
              <Input value={options[k]} onChange={(e) => setOptions({ ...options, [k]: e.target.value })} />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => removeOption(k)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                title="Delete Option"
                disabled={Object.keys(options).length <= 2}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        {errors.options && <p className="text-xs text-red-600 mt-1">{errors.options}</p>}
        <div className="mt-3">
          <Label>Correct Option <span className="text-red-600">*</span></Label>
          <Select value={correct} onValueChange={setCorrect}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Pick" /></SelectTrigger>
            <SelectContent>
              {Object.keys(options).sort().map((k) => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.correct && <p className="text-xs text-red-600 mt-1">{errors.correct}</p>}
        </div>
      </div>
      <div>
        <Label>Solution (optional)</Label>
        <Textarea rows={3} className="mt-1" value={solution} onChange={(e) => setSolution(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label>Chapter Name (optional)</Label>
          <Input value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="e.g., Algebra, Geometry" />
        </div>
        <div>
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {['Easy','Easy-Moderate','Moderate','Moderate-Hard','Hard'].map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Admin Tags (comma separated)</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={save} className="bg-blue-600 hover:bg-blue-700">Save Question to Test</Button>
      </div>
    </div>
  )
}
