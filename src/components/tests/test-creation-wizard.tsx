'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getChapterNames, getChapterQuestionCount, createTest } from '@/lib/actions/tests'
import type { TestBlueprint } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Plus, Minus, FileText, Settings } from 'lucide-react'
import Link from 'next/link'

export function TestCreationWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Step 1: Test Blueprint
  const [chapters, setChapters] = useState<Array<{ name: string; available: number; selected: number }>>([])
  const [totalQuestions, setTotalQuestions] = useState(0)
  
  // Step 2: Test Rules
  const [testName, setTestName] = useState('')
  const [testDescription, setTestDescription] = useState('')
  const [totalTimeMinutes, setTotalTimeMinutes] = useState(120)
  const [marksPerCorrect, setMarksPerCorrect] = useState(1)
  const [negativeMarksPerIncorrect, setNegativeMarksPerIncorrect] = useState(0.25)

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const chapterNames = await getChapterNames()
        const chaptersWithCounts = await Promise.all(
          chapterNames.map(async (name) => {
            const count = await getChapterQuestionCount(name)
            return { name, available: count, selected: 0 }
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

  useEffect(() => {
    const total = chapters.reduce((sum, chapter) => sum + chapter.selected, 0)
    setTotalQuestions(total)
  }, [chapters])

  const updateChapterCount = (index: number, newCount: number) => {
    if (newCount < 0 || newCount > chapters[index].available) return
    
    const updatedChapters = [...chapters]
    updatedChapters[index].selected = newCount
    setChapters(updatedChapters)
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (totalQuestions === 0) {
        setError('Please select at least one question for your test')
        return
      }
    }
    setCurrentStep(2)
    setError(null)
  }

  const handlePrevious = () => {
    setCurrentStep(1)
    setError(null)
  }

  const handleCreateTest = async () => {
    if (!testName.trim()) {
      setError('Test name is required')
      return
    }

    if (totalQuestions === 0) {
      setError('Please select at least one question for your test')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const blueprint: TestBlueprint[] = chapters
        .filter(chapter => chapter.selected > 0)
        .map(chapter => ({
          chapter_name: chapter.name,
          question_count: chapter.selected
        }))

      const result = await createTest({
        name: testName.trim(),
        description: testDescription.trim() || undefined,
        total_time_minutes: totalTimeMinutes,
        marks_per_correct: marksPerCorrect,
        negative_marks_per_incorrect: negativeMarksPerIncorrect,
        blueprint
      })

      if (result.success) {
        router.push('/tests')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('An unexpected error occurred while creating the test')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
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
              Select how many questions you want from each chapter. Total questions selected: <strong>{totalQuestions}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chapters.map((chapter, index) => (
                <div key={chapter.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{chapter.name}</h3>
                    <p className="text-sm text-gray-500">
                      {chapter.available} questions available
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateChapterCount(index, chapter.selected - 1)}
                      disabled={chapter.selected <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">
                      {chapter.selected}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateChapterCount(index, chapter.selected + 1)}
                      disabled={chapter.selected >= chapter.available}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
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

      {/* Step 2: Test Rules */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Test Rules & Settings</span>
            </CardTitle>
            <CardDescription>
              Configure the test parameters and scoring system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="test-name">Test Name *</Label>
                  <Input
                    id="test-name"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g., SSC CGL Tier-I Full Mock - 05"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="total-time">Total Time (minutes) *</Label>
                  <Input
                    id="total-time"
                    type="number"
                    value={totalTimeMinutes}
                    onChange={(e) => setTotalTimeMinutes(Number(e.target.value))}
                    min="1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="marks-correct">Marks per Correct Answer *</Label>
                  <Input
                    id="marks-correct"
                    type="number"
                    step="0.25"
                    value={marksPerCorrect}
                    onChange={(e) => setMarksPerCorrect(Number(e.target.value))}
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="marks-incorrect">Negative Marks per Incorrect Answer *</Label>
                  <Input
                    id="marks-incorrect"
                    type="number"
                    step="0.25"
                    value={negativeMarksPerIncorrect}
                    onChange={(e) => setNegativeMarksPerIncorrect(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="test-description">Description (Optional)</Label>
                <Textarea
                  id="test-description"
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                  placeholder="Brief description of the test..."
                  rows={3}
                />
              </div>
              
              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Test Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total Questions:</span>
                    <span className="ml-2 font-medium">{totalQuestions}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-2 font-medium">{totalTimeMinutes} min</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Score:</span>
                    <span className="ml-2 font-medium">{totalQuestions * marksPerCorrect}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Negative Marking:</span>
                    <span className="ml-2 font-medium">{negativeMarksPerIncorrect > 0 ? 'Yes' : 'No'}</span>
                  </div>
                </div>
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
              onClick={handleCreateTest} 
              disabled={loading || !testName.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Generate & Save as Draft'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
