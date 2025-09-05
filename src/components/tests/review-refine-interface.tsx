'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Shuffle, RotateCcw, Pencil, Edit3 } from 'lucide-react'
import { InlineMath, BlockMath } from 'react-katex'
import type { Question, TestQuestionSlot } from '@/lib/types'
import { EnhancedMasterQuestionBankModal } from './enhanced-master-question-bank-modal'

interface ReviewRefineInterfaceProps {
  questions: TestQuestionSlot[]
  onQuestionsChange: (questions: TestQuestionSlot[]) => void
  onRegenerate: (index: number) => void
  onEdit: (index: number) => void
  onPrevious: () => void
  onNext: () => void
}

export function ReviewRefineInterface({
  questions,
  onQuestionsChange,
  onRegenerate,
  onEdit,
  onPrevious,
  onNext
}: ReviewRefineInterfaceProps) {
  const [shuffleOptions, setShuffleOptions] = useState(false)
  const [overrideIndex, setOverrideIndex] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleShuffleQuestions = () => {
    const shuffled = [...questions]
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    onQuestionsChange(shuffled)
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

  const renderMathContent = (text: string) => {
    // Check if text contains LaTeX math delimiters
    if (text.includes('$') || text.includes('\\(') || text.includes('\\[')) {
      // Simple detection for inline math (single $) vs block math ($$ or \[)
      if (text.includes('$$') || text.includes('\\[')) {
        return <BlockMath math={text.replace(/\$\$/g, '').replace(/\\\[/g, '').replace(/\\\]/g, '')} />
      } else {
        return <InlineMath math={text.replace(/\$/g, '')} />
      }
    }
    return <span>{text}</span>
  }

  const getOptionLabel = (option: string) => {
    return option.charAt(0).toUpperCase()
  }


  return (
    <div className="max-w-6xl mx-auto">
      {/* Global Control Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-gray-900">Review & Refine Test Paper</h1>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShuffleQuestions}
                  className="hover:bg-blue-50 hover:border-blue-300"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Shuffle Questions
                </Button>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Shuffle Options</label>
                  <button
                    onClick={() => setShuffleOptions(!shuffleOptions)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      shuffleOptions ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        shuffleOptions ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onPrevious}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous: Edit Blueprint
              </Button>
              <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
                Next: Set Rules & Publish
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Live Preview - Test Paper
          </h2>
          <p className="text-sm text-gray-600">
            This preview shows exactly how students will see the test. All mathematical content is rendered using KaTeX.
          </p>
        </div>

        {/* Questions List */}
        <div className="space-y-8">
          {questions.map((item, index) => {
            const q = item.question
            const options = q.options || {}
            const optionKeys = Object.keys(options) as Array<keyof typeof options>
            
            return (
              <Card key={index} className="border-l-4 border-l-blue-500 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Question Content */}
                    <div className="flex-1">
                      {/* Question Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                          Q. {index + 1}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {item.chapter_name}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.source_type}
                            {item.source_value && `: ${item.source_value}`}
                          </Badge>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="mb-6">
                        <div className="prose prose-lg max-w-none">
                          {renderMathContent(q.question_text)}
                        </div>
                      </div>

                      {/* Options */}
                      <div className="space-y-3 mb-6">
                        {optionKeys.map((optionKey) => {
                          const optionText = options[optionKey]
                          const isCorrect = q.correct_option === optionKey
                          
                          return (
                            <div
                              key={optionKey}
                              className={`flex items-start space-x-3 p-3 rounded-lg border ${
                                isCorrect 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                isCorrect
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {getOptionLabel(optionKey)}
                                {isCorrect && (
                                  <span className="ml-1 text-green-600">✓</span>
                                )}
                              </div>
                              <div className="flex-1 prose prose-sm max-w-none">
                                {renderMathContent(optionText)}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Admin Metadata */}
                      <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-1">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    </div>

                    {/* Per-Question Control Deck */}
                    <div className="flex-shrink-0 w-16">
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRegenerate(index)}
                          className="h-10 w-10 p-0"
                          title="Regenerate Question"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOverride(index)}
                          className="h-10 w-10 p-0"
                          title="Manual Override"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(index)}
                          className="h-10 w-10 p-0"
                          title="Edit In-Place"
                        >
                          <Edit3 className="h-4 w-4" />
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
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">Test Summary</h3>
              <p className="text-sm text-blue-700">
                Total Questions: {questions.length} | 
                Shuffle Questions: Available | 
                Shuffle Options: {shuffleOptions ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className="text-sm text-blue-600">
              Ready for final review
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Master Question Bank Modal */}
      <EnhancedMasterQuestionBankModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setOverrideIndex(null)
        }}
        onSelect={handleSelectOverride}
        initialChapter={overrideIndex !== null ? questions[overrideIndex]?.chapter_name : undefined}
      />
    </div>
  )
}
