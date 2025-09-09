'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Save, XCircle, Eye, EyeOff } from 'lucide-react'
import { BookSourceCombobox } from './book-source-combobox'
import { ChapterNameCombobox } from './chapter-name-combobox'
import { SmartLatexRenderer } from '../tests/smart-latex-renderer'
import type { Question } from '@/lib/types'

interface InPlaceQuestionEditorProps {
  question: Question
  onSave: (updatedQuestion: Question) => void
  onCancel: () => void
  isStaged?: boolean // For staged questions in import review
}

export function InPlaceQuestionEditor({ 
  question, 
  onSave, 
  onCancel, 
  isStaged = false 
}: InPlaceQuestionEditorProps) {
  const [formData, setFormData] = useState<Question>(question)
  const [isSaving, setIsSaving] = useState(false)
  const [options, setOptions] = useState<{ [key: string]: string }>({})
  const [adminTags, setAdminTags] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState({
    question: true,
    options: true,
    solution: true
  })

  // Initialize form data when question prop changes
  useEffect(() => {
    setFormData(question)
    
    // Initialize options
    if (question.options) {
      setOptions(question.options)
    } else {
      setOptions({ a: '', b: '', c: '', d: '' })
    }
    
    // Initialize admin tags
    if (question.admin_tags) {
      setAdminTags(question.admin_tags)
    } else {
      setAdminTags([])
    }
  }, [question])

  const handleInputChange = (field: keyof Question, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOptionChange = (optionKey: string, value: string) => {
    setOptions(prev => ({
      ...prev,
      [optionKey]: value
    }))
  }

  const addOption = () => {
    const optionKeys = Object.keys(options)
    const nextKey = String.fromCharCode(97 + optionKeys.length) // a, b, c, d, e, f, etc.
    setOptions(prev => ({
      ...prev,
      [nextKey]: ''
    }))
  }

  const removeOption = (optionKey: string) => {
    if (Object.keys(options).length <= 2) return // Keep at least 2 options
    
    setOptions(prev => {
      const newOptions = { ...prev }
      delete newOptions[optionKey]
      return newOptions
    })
    
    // If we removed the correct option, clear it
    if (formData.correct_option === optionKey) {
      setFormData(prev => ({
        ...prev,
        correct_option: undefined
      }))
    }
  }

  const handleTagInput = (value: string) => {
    if (value.includes(',')) {
      const newTags = value.split(',').map(tag => tag.trim()).filter(Boolean)
      setAdminTags(prev => [...prev, ...newTags])
      setFormData(prev => ({
        ...prev,
        admin_tags: [...prev.admin_tags || [], ...newTags]
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = adminTags.filter(tag => tag !== tagToRemove)
    setAdminTags(newTags)
    setFormData(prev => ({
      ...prev,
      admin_tags: newTags.length > 0 ? newTags : undefined
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Prepare the updated question object
      const updatedQuestion: Question = {
        ...formData,
        options: Object.keys(options).length > 0 ? options : undefined,
        admin_tags: adminTags.length > 0 ? adminTags : undefined
      }
      
      await onSave(updatedQuestion)
    } catch (error) {
      console.error('Error saving question:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const optionKeys = Object.keys(options).sort()

  // Live Preview Component
  const LivePreview = ({ content, type }: { content: string; type: 'question' | 'options' | 'solution' }) => {
    if (!showPreview[type] || !content.trim()) return null
    
    return (
      <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Live Preview:</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(prev => ({ ...prev, [type]: !prev[type] }))}
            className="h-6 w-6 p-0"
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        </div>
        <div className="text-sm">
          <SmartLatexRenderer text={content} />
        </div>
      </div>
    )
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="mobile-text-lg font-bold flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {isStaged ? 'Edit Staged Question' : 'Edit Question'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0 text-white hover:bg-white/20 transition-colors touch-target self-end sm:self-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
          <h3 className="mobile-text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            Basic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Book Source *
              </Label>
              <BookSourceCombobox
                value={formData.book_source}
                onValueChange={(value) => handleInputChange('book_source', value)}
                placeholder="Select book source..."
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Chapter Name *
              </Label>
              <ChapterNameCombobox
                value={formData.chapter_name}
                onValueChange={(value) => handleInputChange('chapter_name', value)}
                placeholder="Select or type chapter name..."
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="question_number_in_book" className="text-sm font-medium text-gray-700">
                Question Number in Book *
              </Label>
              <Input
                id="question_number_in_book"
                type="number"
                value={formData.question_number_in_book || ''}
                onChange={(e) => handleInputChange('question_number_in_book', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g., 15"
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Question Text */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="mobile-text-base font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-green-600 rounded-full"></div>
              Question Content
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(prev => ({ ...prev, question: !prev.question }))}
              className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 touch-target"
            >
              {showPreview.question ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showPreview.question ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="question_text" className="text-sm font-medium text-gray-700">
              Question Text *
            </Label>
            <Textarea
              id="question_text"
              value={formData.question_text}
              onChange={(e) => handleInputChange('question_text', e.target.value)}
              placeholder="Enter the question text with LaTeX formatting..."
              className="mobile-input min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <LivePreview content={formData.question_text} type="question" />
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="mobile-text-base font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
              Answer Options
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(prev => ({ ...prev, options: !prev.options }))}
                className="w-full sm:w-auto text-purple-600 border-purple-200 hover:bg-purple-50 touch-target"
              >
                {showPreview.options ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showPreview.options ? 'Hide Preview' : 'Show Preview'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full sm:w-auto h-9 px-4 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors touch-target"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {optionKeys.map((key) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
                    {key.toUpperCase()}
                  </div>
                  <Input
                    value={options[key]}
                    onChange={(e) => handleOptionChange(key, e.target.value)}
                    placeholder={`Option ${key.toUpperCase()}`}
                    className="mobile-input flex-1 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {optionKeys.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(key)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {showPreview.options && options[key] && (
                  <div className="ml-13 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="text-xs font-medium text-purple-700 mb-1">Preview:</div>
                    <div className="text-sm">
                      <SmartLatexRenderer text={options[key]} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Correct Option */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
          <h3 className="mobile-text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-orange-600 rounded-full"></div>
            Correct Answer
          </h3>
          <div className="space-y-2">
            <Label htmlFor="correct_option" className="text-sm font-medium text-gray-700">
              Correct Option *
            </Label>
            <Select
              value={formData.correct_option || ''}
              onValueChange={(value) => handleInputChange('correct_option', value)}
            >
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <SelectValue placeholder="Select correct option" />
              </SelectTrigger>
              <SelectContent>
                {optionKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    Option {key.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Optional Fields */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
          <h3 className="mobile-text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gray-600 rounded-full"></div>
            Optional Information
          </h3>
          <div className="space-y-4">
            {/* Solution Text */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Label htmlFor="solution_text" className="text-sm font-medium text-gray-700">
                  Solution Text
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(prev => ({ ...prev, solution: !prev.solution }))}
                  className="w-full sm:w-auto text-gray-600 border-gray-200 hover:bg-gray-50 touch-target"
                >
                  {showPreview.solution ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showPreview.solution ? 'Hide Preview' : 'Show Preview'}
                </Button>
              </div>
              <Textarea
                id="solution_text"
                value={formData.solution_text || ''}
                onChange={(e) => handleInputChange('solution_text', e.target.value)}
                placeholder="Enter the solution with LaTeX formatting..."
                className="mobile-input min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
              <LivePreview content={formData.solution_text || ''} type="solution" />
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-sm font-medium text-gray-700">
                Difficulty Level
              </Label>
              <Select
                value={formData.difficulty || ''}
                onValueChange={(value) => handleInputChange('difficulty', value)}
              >
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500">
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Easy-Moderate">Easy-Moderate</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Moderate-Hard">Moderate-Hard</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Admin Tags */}
            <div className="space-y-2">
              <Label htmlFor="admin_tags" className="text-sm font-medium text-gray-700">
                Admin Tags
              </Label>
              <Input
                id="admin_tags"
                placeholder="Enter tags separated by commas..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleTagInput(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
                className="mobile-input transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
              {adminTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {adminTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1 bg-gray-100 text-gray-700">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Exam Metadata */}
            <div className="space-y-2">
              <Label htmlFor="exam_metadata" className="text-sm font-medium text-gray-700">
                Exam Metadata
              </Label>
              <Textarea
                id="exam_metadata"
                value={formData.exam_metadata || ''}
                onChange={(e) => handleInputChange('exam_metadata', e.target.value)}
                placeholder="Additional exam-related information..."
                className="mobile-input min-h-[60px] transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 touch-target"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 touch-target"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
