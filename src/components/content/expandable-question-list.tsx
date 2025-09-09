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
              <Card key={questionKey} className="group border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
                <CardContent className="p-0">
                  {/* Premium Mobile Question Card */}
                  <div className="p-4 sm:p-5">
                    {/* Dedicated Header Row for Controls */}
                    <div className="flex items-center justify-between mb-4">
                      {/* Left Side - Selection Checkbox */}
                      <div className="flex items-center gap-2">
                        {multiSelect && (
                          <Checkbox
                            checked={isQuestionSelected(question)}
                            onCheckedChange={() => toggleQuestionSelection(question)}
                            className="h-4 w-4 touch-target"
                          />
                        )}
                        {actionType === 'select' && (
                          <Button
                            size="sm"
                            onClick={() => onQuestionAction?.(question, 'select')}
                            className="bg-blue-600 hover:bg-blue-700 touch-target mobile-text-xs h-7 px-3"
                          >
                            Select
                          </Button>
                        )}
                      </div>
                      
                      {/* Right Side - Expand/Collapse Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleQuestion(question.id!)}
                        className="touch-target h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                      >
                        <ChevronDown 
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`} 
                        />
                      </Button>
                    </div>
                    
                    {/* Full-Width Content Area */}
                    <div className="space-y-3">
                      {/* Question Text - Full Width Premium Typography */}
                      <div className="prose prose-sm max-w-none leading-relaxed">
                        <SmartLatexRenderer text={question.question_text} />
                      </div>
                      
                      {/* Premium Metadata Row - Full Width */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="mobile-text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200 rounded-full">
                          ID: {question.question_id}
                        </Badge>
                        <Badge variant="outline" className="mobile-text-xs px-2 py-1 bg-green-50 text-green-700 border-green-200 rounded-full">
                          {question.book_source}
                        </Badge>
                        <Badge variant="outline" className="mobile-text-xs px-2 py-1 bg-purple-50 text-purple-700 border-purple-200 rounded-full">
                          {question.chapter_name}
                        </Badge>
                        {question.difficulty && (
                          <Badge 
                            variant="outline" 
                            className={`mobile-text-xs px-2 py-1 rounded-full ${
                              question.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-200' :
                              question.difficulty === 'Easy-Moderate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              question.difficulty === 'Moderate' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              question.difficulty === 'Moderate-Hard' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            {question.difficulty}
                          </Badge>
                        )}
                        {question.admin_tags && question.admin_tags.length > 0 && (
                          <Badge variant="outline" className="mobile-text-xs px-2 py-1 bg-indigo-50 text-indigo-700 border-indigo-200 rounded-full">
                            {question.admin_tags.length} tag{question.admin_tags.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Premium Expanded Panel */}
                  {isExpanded && (
                    <div className="border-t border-gray-200/60 bg-gray-50/30">
                      <div className="p-4 sm:p-5 space-y-4">
                        {/* Compact Options Section */}
                        <div className="mobile-space-y-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-6 bg-blue-500 rounded-full"></div>
                            <h4 className="mobile-heading-3 text-gray-900">Answer Options</h4>
                          </div>
                          <div className="mobile-space-y-sm">
                            {optionKeys.map((optionKey) => {
                              const optionText = options[optionKey]
                              const isCorrect = question.correct_option?.toUpperCase() === optionKey.toUpperCase()
                              
                              return (
                                <div
                                  key={optionKey}
                                  className={`group flex items-start gap-3 mobile-p-sm rounded-lg border transition-all duration-200 ${
                                    isCorrect 
                                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                                      : 'bg-white border-gray-200'
                                  }`}
                                >
                                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mobile-text-xs font-bold transition-all duration-200 ${
                                    isCorrect
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {optionKey.toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="prose prose-xs max-w-none">
                                      <SmartLatexRenderer text={String(optionText || '')} />
                                    </div>
                                    {isCorrect && (
                                      <div className="mt-1 flex items-center gap-1 text-green-600 mobile-text-xs font-medium">
                                        <div className="w-3 h-3 bg-green-100 rounded-full flex items-center justify-center">
                                          <span className="text-xs">✓</span>
                                        </div>
                                        <span>Correct</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Premium Solution Box */}
                        {question.solution_text && (
                          <div className="mobile-space-y-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-1 w-6 bg-emerald-500 rounded-full"></div>
                              <h4 className="mobile-heading-3 text-gray-900">Solution</h4>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg mobile-p shadow-sm">
                              <div className="flex items-start gap-2">
                                <div className="flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="prose prose-xs max-w-none text-emerald-800">
                                    <SmartLatexRenderer text={question.solution_text} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Compact Metadata Section */}
                        <div className="mobile-space-y-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-6 bg-gray-500 rounded-full"></div>
                            <h4 className="mobile-heading-3 text-gray-900">Details</h4>
                          </div>
                          <div className="bg-white border border-gray-200/60 rounded-lg mobile-p shadow-sm">
                            <div className="grid grid-cols-2 sm:grid-cols-3 mobile-gap">
                              <div className="space-y-1">
                                <div className="mobile-text-xs font-medium text-gray-500 uppercase tracking-wide">ID</div>
                                <div className="font-mono mobile-text-xs text-gray-900 bg-gray-50 mobile-px mobile-py rounded">{question.question_id}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="mobile-text-xs font-medium text-gray-500 uppercase tracking-wide">Book</div>
                                <div className="mobile-text-xs text-gray-900 font-medium">{question.book_source}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="mobile-text-xs font-medium text-gray-500 uppercase tracking-wide">Chapter</div>
                                <div className="mobile-text-xs text-gray-900 font-medium">{question.chapter_name}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="mobile-text-xs font-medium text-gray-500 uppercase tracking-wide">Number</div>
                                <div className="mobile-text-xs text-gray-900 font-medium">{question.question_number_in_book || '—'}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="mobile-text-xs font-medium text-gray-500 uppercase tracking-wide">Difficulty</div>
                                <div className="mobile-text-xs text-gray-900 font-medium">{question.difficulty || '—'}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="mobile-text-xs font-medium text-gray-500 uppercase tracking-wide">Created</div>
                                <div className="mobile-text-xs text-gray-900 font-medium">
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
                              <div className="mt-3 pt-3 border-t border-gray-200/60">
                                <div className="mobile-text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Tags</div>
                                <div className="flex flex-wrap mobile-gap-sm">
                                  {question.admin_tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="mobile-text-xs px-2 py-1 bg-indigo-50 text-indigo-700 border-indigo-200 rounded-full">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Full-Width Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200/60">
                          {actionType === 'edit' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onQuestionAction?.(question, 'edit')}
                                className="w-full sm:w-auto touch-target bg-white hover:bg-gray-50 border-gray-300 mobile-text-xs h-8"
                              >
                                <Edit className="h-3 w-3 mr-2" />
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
                              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 touch-target mobile-text-xs h-8"
                            >
                              Select This Question
                            </Button>
                          )}
                          
                          {actionType === 'select-multiple' && (
                            <div className="flex items-center gap-3 touch-target">
                              <Checkbox
                                checked={isQuestionSelected(question)}
                                onCheckedChange={() => toggleQuestionSelection(question)}
                                className="h-4 w-4 touch-target"
                              />
                              <span className="mobile-text-sm text-gray-600 font-medium">
                                {isQuestionSelected(question) ? 'Selected' : 'Select this question'}
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
