'use client'

import { useState, useEffect } from 'react'
import { getQuestions } from '@/lib/actions/questions'
import type { Question } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit } from 'lucide-react'
import { DeleteQuestionDialog } from './delete-question-dialog'
import { SmartLatexRenderer } from '../tests/smart-latex-renderer'
import { Checkbox } from '@/components/ui/checkbox'

export type QuestionActionType = 'edit' | 'select' | 'select-multiple'

interface ExpandableQuestionListProps {
  filteredData?: Question[]
  filteredTotal?: number
  loading?: boolean
  error?: string | null
  onQuestionDeleted?: () => void
  
  // Action configuration
  actionType?: QuestionActionType
  onQuestionAction?: (question: Question, action: string) => void
  
  // Multi-select configuration
  multiSelect?: boolean
  selectedQuestions?: Set<string | number>
  onSelectionChange?: (selected: Set<string | number>) => void
  onMultiSelect?: (questions: Question[]) => void
  onBulkDelete?: (questions: Question[]) => void
  
  // Staged mode (for import review)
  isStagedMode?: boolean
}

export function ExpandableQuestionList({ 
  filteredData, 
  filteredTotal, 
  loading = false, 
  error = null,
  onQuestionDeleted,
  actionType = 'edit',
  onQuestionAction,
  multiSelect = false,
  selectedQuestions = new Set(),
  onSelectionChange,
  onMultiSelect,
  onBulkDelete,
  isStagedMode = false
}: ExpandableQuestionListProps) {
  const [data, setData] = useState<Question[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<number>>(new Set())
  const [isUsingFilters, setIsUsingFilters] = useState(false)

  // Multi-select functionality
  const toggleQuestionSelection = (question: Question) => {
    if (!multiSelect || !onSelectionChange) return
    
    const key = question.id || question.question_id
    const newSelected = new Set(selectedQuestions)
    
    if (newSelected.has(key)) {
      newSelected.delete(key)
    } else {
      newSelected.add(key)
    }
    
    onSelectionChange(newSelected)
  }

  const isQuestionSelected = (question: Question) => {
    if (!multiSelect) return false
    const key = question.id || question.question_id
    return selectedQuestions.has(key)
  }

  const selectAllVisible = () => {
    if (!multiSelect || !onSelectionChange) return
    
    const newSelected = new Set(selectedQuestions)
    data.forEach(question => {
      const key = question.id || question.question_id
      newSelected.add(key)
    })
    onSelectionChange(newSelected)
  }

  const deselectAll = () => {
    if (!multiSelect || !onSelectionChange) return
    onSelectionChange(new Set())
  }

  const addSelectedQuestions = () => {
    if (!multiSelect || !onMultiSelect) return
    
    const selectedQuestionsList = data.filter(question => 
      isQuestionSelected(question)
    )
    onMultiSelect(selectedQuestionsList)
  }

  const handleBulkDelete = () => {
    if (!multiSelect || !onBulkDelete) return
    
    const selectedQuestionsList = data.filter(question => 
      isQuestionSelected(question)
    )
    onBulkDelete(selectedQuestionsList)
  }

  // Handle filtered data from parent component
  useEffect(() => {
    if (filteredData !== undefined) {
      setData(filteredData)
      setTotalCount(filteredTotal || 0)
      setIsUsingFilters(true)
    }
  }, [filteredData, filteredTotal])

  // Fetch default data when not using filters and not in staged mode
  useEffect(() => {
    if (!isUsingFilters && !isStagedMode) {
      const fetchData = async () => {
        try {
          const result = await getQuestions(currentPage, pageSize)
          
          if (result.error) {
            setData([])
            setTotalCount(0)
          } else {
            setData(result.data)
            setTotalCount(result.count)
          }
        } catch (err) {
          console.error('Error:', err)
          setData([])
          setTotalCount(0)
        }
      }

      fetchData()
    }
  }, [currentPage, pageSize, isUsingFilters, isStagedMode])

  const handleToggleQuestion = (questionId: number) => {
    setExpandedQuestionIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Results Summary - Fixed Height */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          {isUsingFilters ? (
            <>
              Showing {data.length} of {totalCount} question{totalCount !== 1 ? 's' : ''} (filtered)
            </>
          ) : (
            <>
              {totalCount} question{totalCount !== 1 ? 's' : ''} total
            </>
          )}
          {multiSelect && selectedQuestions.size > 0 && (
            <span className="ml-2 text-blue-600 font-medium">
              • {selectedQuestions.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {multiSelect && data.length > 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={selectedQuestions.size === data.length ? deselectAll : selectAllVisible}
              >
                {selectedQuestions.size === data.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedQuestions.size > 0 && (
                <>
                  <Button 
                    size="sm" 
                    onClick={addSelectedQuestions}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Selected ({selectedQuestions.size})
                  </Button>
                  {actionType === 'edit' && (
                    <Button 
                      size="sm" 
                      onClick={handleBulkDelete}
                      variant="destructive"
                    >
                      Delete Selected ({selectedQuestions.size})
                    </Button>
                  )}
                </>
              )}
            </>
          )}
          {isUsingFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsUsingFilters(false)}
            >
              Show All Questions
            </Button>
          )}
        </div>
      </div>

      {/* Expandable Question List - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No questions found</p>
            <p className="text-sm">Try adjusting your search terms or add new questions.</p>
          </div>
        ) : (
          data.map((question, index) => {
            const isExpanded = expandedQuestionIds.has(question.id!)
            const options = question.options || {}
            const optionKeys = Object.keys(options).sort()
            
            // Use a more robust key that works for both regular and staged questions
            const questionKey = question.id || question.question_id || `staged-${index}`
            
            return (
              <Card key={questionKey} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  {/* Compact Row (Default View) */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Multi-select Checkbox */}
                        {multiSelect && (
                          <Checkbox
                            checked={isQuestionSelected(question)}
                            onCheckedChange={() => toggleQuestionSelection(question)}
                            className="mt-1"
                          />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          {/* Question Text - Full LaTeX Rendering */}
                          <div className="prose prose-lg max-w-none mb-3">
                            <SmartLatexRenderer text={question.question_text} />
                          </div>
                          
                          {/* Quick Info Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {question.question_id}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {question.book_source}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {question.chapter_name}
                            </Badge>
                            {question.difficulty && (
                              <Badge variant="outline" className="text-xs">
                                {question.difficulty}
                              </Badge>
                            )}
                            {question.admin_tags && question.admin_tags.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {question.admin_tags.length} tag{question.admin_tags.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons and Expand/Collapse */}
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        {/* Action Button based on actionType */}
                        {actionType === 'select' && (
                          <Button
                            size="sm"
                            onClick={() => onQuestionAction?.(question, 'select')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Select
                          </Button>
                        )}
                        
                        {/* Expand/Collapse Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleQuestion(question.id!)}
                        >
                          <ChevronDown 
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`} 
                          />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="border-t bg-gray-50/50">
                      <div className="p-6 space-y-6">
                        {/* Options */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Options:</h4>
                          <div className="space-y-2">
                            {optionKeys.map((optionKey) => {
                              const optionText = options[optionKey]
                              const isCorrect = question.correct_option?.toUpperCase() === optionKey.toUpperCase()
                              
                              return (
                                <div
                                  key={optionKey}
                                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                                    isCorrect 
                                      ? 'bg-green-50 border-green-200' 
                                      : 'bg-white border-gray-200'
                                  }`}
                                >
                                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                    isCorrect
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {optionKey.toUpperCase()}
                                    {isCorrect && (
                                      <span className="ml-1 text-green-600">✓</span>
                                    )}
                                  </div>
                                  <div className="flex-1 prose prose-sm max-w-none">
                                    <SmartLatexRenderer text={String(optionText || '')} />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Solution */}
                        {question.solution_text && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Solution:</h4>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="prose prose-sm max-w-none text-blue-800">
                                <SmartLatexRenderer text={question.solution_text} />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Admin Metadata */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Metadata:</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Question ID:</span>
                                <div className="font-mono text-gray-900">{question.question_id}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Book Source:</span>
                                <div className="text-gray-900">{question.book_source}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Chapter:</span>
                                <div className="text-gray-900">{question.chapter_name}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Question Number:</span>
                                <div className="text-gray-900">{question.question_number_in_book || '—'}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Difficulty:</span>
                                <div className="text-gray-900">{question.difficulty || '—'}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Created:</span>
                                <div className="text-gray-900">
                                  {new Date(question.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </div>
                              </div>
                            </div>
                            
                            {/* Admin Tags */}
                            {question.admin_tags && question.admin_tags.length > 0 && (
                              <div className="mt-4">
                                <span className="font-medium text-gray-700">Admin Tags:</span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {question.admin_tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                          {actionType === 'edit' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onQuestionAction?.(question, 'edit')}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Question
                              </Button>
                              <DeleteQuestionDialog 
                                questionId={question.id!} 
                                questionText={question.question_text}
                                onDeleted={onQuestionDeleted}
                              />
                            </>
                          )}
                          
                          {actionType === 'select' && (
                            <Button
                              size="sm"
                              onClick={() => onQuestionAction?.(question, 'select')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Select This Question
                            </Button>
                          )}
                          
                          {actionType === 'select-multiple' && (
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={isQuestionSelected(question)}
                                onCheckedChange={() => toggleQuestionSelection(question)}
                              />
                              <span className="text-sm text-gray-600">
                                {isQuestionSelected(question) ? 'Selected' : 'Select'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Pagination - Only show when not using filters and not in staged mode */}
      {!isUsingFilters && !isStagedMode && totalPages > 1 && (
        <div className="flex-shrink-0 flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-gray-700">
            Showing {data.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} questions
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-700 px-3">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
