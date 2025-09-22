'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Filter,
  Eye,
  Plus,
  X
} from 'lucide-react'
import { UnifiedQuestionBankModal } from './unified-question-bank-modal'
import type { Question } from '@/lib/types'

interface TestCreationOptionsModalProps {
  open: boolean
  onClose: () => void
  onBlueprintSelect?: () => void
  onQuestionBankSelect?: (questions: Question[]) => void
}

export function TestCreationOptionsModal({ 
  open, 
  onClose, 
  onBlueprintSelect,
  onQuestionBankSelect 
}: TestCreationOptionsModalProps) {
  const [showQuestionBank, setShowQuestionBank] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const handleBlueprintSelect = () => {
    onBlueprintSelect?.()
    onClose()
  }

  const handleQuestionBankSelect = () => {
    setShowQuestionBank(true)
  }

  const handleQuestionsSelected = (questions: Question[]) => {
    setSelectedQuestions(questions)
    setShowQuestionBank(false)
    setShowPreview(true)
  }

  const handleConfirmQuestions = () => {
    onQuestionBankSelect?.(selectedQuestions)
    onClose()
  }

  const removeQuestion = (questionId: number) => {
    setSelectedQuestions(prev => prev.filter(q => q.id !== questionId))
  }

  const resetSelection = () => {
    setSelectedQuestions([])
    setShowPreview(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent 
          className="w-[90vw] sm:max-w-4xl h-[80vh] flex flex-col overflow-hidden"
          showCloseButton={false}
        >
          <DialogHeader className="pb-6 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-0 right-0 h-8 w-8 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </Button>
            <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create New Test
            </DialogTitle>
            <p className="text-center text-gray-600 mt-2">
              Choose how you&apos;d like to create your test
            </p>
          </DialogHeader>

          <div className="flex-1 flex flex-col lg:flex-row gap-6">
            {/* From Blueprint Option */}
            <Card className="flex-1 hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-blue-200">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">From Blueprint</CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Use a predefined test template with structured content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Pre-configured test structure</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Standardized format</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Quick setup</span>
                  </div>
                </div>
                <Button 
                  onClick={handleBlueprintSelect}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold transition-all duration-300 group-hover:shadow-lg"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Create from Blueprint
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* From Question Bank Option */}
            <Card className="flex-1 hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-purple-200">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Database className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">From Question Bank</CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Select specific questions from your question library
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Custom question selection</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Advanced filtering options</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Full control over content</span>
                  </div>
                </div>
                <Button 
                  onClick={handleQuestionBankSelect}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-xl font-semibold transition-all duration-300 group-hover:shadow-lg"
                >
                  <Database className="h-5 w-5 mr-2" />
                  Select from Question Bank
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Selected Questions Preview */}
          {showPreview && selectedQuestions.length > 0 && (
            <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-800">Selected Questions Preview</h3>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {selectedQuestions.length} questions
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSelection}
                  className="text-gray-600 hover:text-red-600"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>

              <div className="space-y-3 max-h-40 overflow-y-auto">
                {selectedQuestions.map((question) => (
                  <div key={question.id} className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-purple-100">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          #{question.id}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {question.book_source} - {question.chapter_name}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            question.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                            question.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}
                        >
                          {question.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-800 line-clamp-2">
                        {question.question_text?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => question.id && removeQuestion(question.id)}
                      className="text-gray-400 hover:text-red-600 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-200">
                <div className="text-sm text-gray-600">
                  Ready to create test with {selectedQuestions.length} selected questions
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowQuestionBank(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add More Questions
                  </Button>
                  <Button
                    onClick={handleConfirmQuestions}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create Test
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Question Bank Modal */}
      <UnifiedQuestionBankModal
        open={showQuestionBank}
        onClose={() => setShowQuestionBank(false)}
        onSelectMultiple={handleQuestionsSelected}
        multiSelect={true}
        title="Select Questions for Test"
      />
    </>
  )
}
