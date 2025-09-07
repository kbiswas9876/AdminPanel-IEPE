'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Save, XCircle } from 'lucide-react'
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

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Edit Question {isStaged ? '(Staged)' : ''}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="question_id">Question ID</Label>
            <Input
              id="question_id"
              value={formData.question_id}
              onChange={(e) => handleInputChange('question_id', e.target.value)}
              placeholder="e.g., Q001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book_source">Book Source</Label>
            <Input
              id="book_source"
              value={formData.book_source}
              onChange={(e) => handleInputChange('book_source', e.target.value)}
              placeholder="e.g., NCERT Class 10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="chapter_name">Chapter Name</Label>
            <Input
              id="chapter_name"
              value={formData.chapter_name}
              onChange={(e) => handleInputChange('chapter_name', e.target.value)}
              placeholder="e.g., Light - Reflection and Refraction"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="question_number_in_book">Question Number in Book</Label>
            <Input
              id="question_number_in_book"
              type="number"
              value={formData.question_number_in_book || ''}
              onChange={(e) => handleInputChange('question_number_in_book', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="e.g., 15"
            />
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <Label htmlFor="question_text">Question Text</Label>
          <Textarea
            id="question_text"
            value={formData.question_text}
            onChange={(e) => handleInputChange('question_text', e.target.value)}
            placeholder="Enter the question text with LaTeX formatting..."
            className="min-h-[100px]"
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Options</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Option
            </Button>
          </div>
          
          <div className="space-y-2">
            {optionKeys.map((key) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-8 text-sm font-medium text-gray-600">
                  ({key.toUpperCase()})
                </div>
                <Input
                  value={options[key]}
                  onChange={(e) => handleOptionChange(key, e.target.value)}
                  placeholder={`Option ${key.toUpperCase()}`}
                  className="flex-1"
                />
                {optionKeys.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(key)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Correct Option */}
        <div className="space-y-2">
          <Label htmlFor="correct_option">Correct Option</Label>
          <Select
            value={formData.correct_option || ''}
            onValueChange={(value) => handleInputChange('correct_option', value)}
          >
            <SelectTrigger>
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

        {/* Solution Text */}
        <div className="space-y-2">
          <Label htmlFor="solution_text">Solution Text</Label>
          <Textarea
            id="solution_text"
            value={formData.solution_text || ''}
            onChange={(e) => handleInputChange('solution_text', e.target.value)}
            placeholder="Enter the solution with LaTeX formatting..."
            className="min-h-[100px]"
          />
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={formData.difficulty || ''}
            onValueChange={(value) => handleInputChange('difficulty', value)}
          >
            <SelectTrigger>
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
          <Label htmlFor="admin_tags">Admin Tags</Label>
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
          />
          {adminTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {adminTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-600"
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
          <Label htmlFor="exam_metadata">Exam Metadata</Label>
          <Textarea
            id="exam_metadata"
            value={formData.exam_metadata || ''}
            onChange={(e) => handleInputChange('exam_metadata', e.target.value)}
            placeholder="Additional exam-related information..."
            className="min-h-[60px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
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
