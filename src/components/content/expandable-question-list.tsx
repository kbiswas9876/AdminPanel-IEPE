'use client'

import { useState, useEffect, useRef } from 'react'
import { getQuestions } from '@/lib/actions/questions'
import type { Question } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, Sparkles, Target, BookOpen, Hash, Tag } from 'lucide-react'
import { DeleteQuestionDialog } from './delete-question-dialog'
import { SmartLatexRenderer } from '../tests/smart-latex-renderer'
import { Checkbox } from '@/components/ui/checkbox'
import { SkeletonLoader } from '@/components/ui/skeleton-loader'

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
  
  // Editing state
  editingQuestionId?: number | null
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
  isStagedMode = false,
  editingQuestionId = null
}: ExpandableQuestionListProps) {
  const [data, setData] = useState<Question[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<number>>(new Set())
  const [isUsingFilters, setIsUsingFilters] = useState(false)
  const expandedQuestionIdsRef = useRef<Set<number>>(new Set())
  
  // Keep ref in sync with state
  useEffect(() => {
    expandedQuestionIdsRef.current = expandedQuestionIds
  }, [expandedQuestionIds])
  
  // Ensure the question being edited remains expanded
  useEffect(() => {
    if (editingQuestionId && !expandedQuestionIds.has(editingQuestionId)) {
      setExpandedQuestionIds(prev => new Set([...prev, editingQuestionId]))
    }
  }, [editingQuestionId])
  
  // Keep track of recently edited questions to preserve their expanded state
  const [recentlyEditedIds, setRecentlyEditedIds] = useState<Set<number>>(new Set())
  
  // When editingQuestionId changes from a value to null, preserve that question's expanded state
  useEffect(() => {
    if (editingQuestionId) {
      // Add to recently edited set
      setRecentlyEditedIds(prev => new Set([...prev, editingQuestionId]))
      // Ensure it's expanded
      setExpandedQuestionIds(prev => new Set([...prev, editingQuestionId]))
    }
  }, [editingQuestionId])
  
  // Clean up recently edited IDs after 5 seconds to prevent them from staying expanded forever
  useEffect(() => {
    if (recentlyEditedIds.size > 0) {
      const timer = setTimeout(() => {
        setRecentlyEditedIds(new Set())
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [recentlyEditedIds])

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
  
  // Preserve expanded state when data changes
  useEffect(() => {
    if (data.length > 0) {
      const preservedExpandedIds = new Set<number>()
      
      // Preserve existing expanded questions
      expandedQuestionIdsRef.current.forEach(id => {
        if (data.some(q => q.id === id)) {
          preservedExpandedIds.add(id)
        }
      })
      
      // Also preserve recently edited questions
      recentlyEditedIds.forEach(id => {
        if (data.some(q => q.id === id)) {
          preservedExpandedIds.add(id)
        }
      })
      
      // Only update if there are changes to avoid unnecessary re-renders
      if (preservedExpandedIds.size !== expandedQuestionIdsRef.current.size || 
          !Array.from(preservedExpandedIds).every(id => expandedQuestionIdsRef.current.has(id))) {
        setExpandedQuestionIds(preservedExpandedIds)
      }
    }
  }, [data, recentlyEditedIds])

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
      <div className="flex flex-col h-full">
        {/* Results Summary - Fixed Height */}
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            Loading questions...
          </div>
        </div>
        
        {/* Skeleton Loader */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <SkeletonLoader count={8} />
        </div>
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
              <div key={questionKey} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-indigo-400/5 rounded-xl sm:rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 pointer-events-none"></div>
                <Card className="relative rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-0">
                    {/* Premium Compact Row */}
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                          {/* Multi-select Checkbox */}
                          {multiSelect && (
                            <div className="relative mt-1 flex-shrink-0">
                              <Checkbox
                                checked={isQuestionSelected(question)}
                                onCheckedChange={() => toggleQuestionSelection(question)}
                                className="h-4 w-4 border-2 border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            {/* Question Text with Premium Styling */}
                            <div className="prose prose-lg max-w-none mb-3 sm:mb-4">
                              <div className="text-sm sm:text-base text-gray-800 leading-relaxed">
                                <SmartLatexRenderer text={question.question_text} />
                              </div>
                            </div>
                            
                            {/* Enhanced Info Badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors duration-200">
                                <Hash className="h-3 w-3 mr-1" />
                                {question.question_id}
                              </Badge>
                              <Badge variant="secondary" className="text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors duration-200">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {question.book_source}
                              </Badge>
                              <Badge variant="secondary" className="text-xs bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors duration-200">
                                <Target className="h-3 w-3 mr-1" />
                                {question.chapter_name}
                              </Badge>
                              {question.difficulty && (
                                <Badge variant="outline" className="text-xs bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors duration-200">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  {question.difficulty}
                                </Badge>
                              )}
                              {question.admin_tags && question.admin_tags.length > 0 && (
                                <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 transition-colors duration-200">
                                  <Tag className="h-3 w-3 mr-1" />
                                {question.admin_tags.length} tag{question.admin_tags.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Premium Action Buttons and Expand/Collapse */}
                      <div className="relative z-10 flex items-center gap-2 ml-4 flex-shrink-0">
                        {/* Action Button based on actionType */}
                        {actionType === 'select' && (
                          <Button
                            size="sm"
                            onClick={() => onQuestionAction?.(question, 'select')}
                            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                            <span className="relative z-10 font-semibold">Select</span>
                          </Button>
                        )}
                        
                        {/* Premium Expand/Collapse Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-expanded={isExpanded}
                          onClick={() => handleToggleQuestion(question.id!)}
                          className="relative z-10 p-2 min-w-[40px] min-h-[40px] rounded-md hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-200"
                        >
                          <ChevronDown
                            className={`h-5 w-5 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-blue-600' : 'text-gray-500'
                            }`}
                          />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Premium Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        {/* Premium Options Display */}
                        <div>
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg blur-sm opacity-60 pointer-events-none"></div>
                              <div className="relative p-2 rounded-lg bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 shadow-lg">
                                <Target className="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg">Answer Options</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {optionKeys.map((optionKey) => {
                              const optionText = options[optionKey]
                              const isCorrect = question.correct_option?.toUpperCase() === optionKey.toUpperCase()
                              
                              return (
                                <div
                                  key={optionKey}
                                  className={`group relative overflow-hidden flex items-start space-x-3 p-4 rounded-xl border transition-shadow duration-200 ${
                                    isCorrect
                                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-md hover:shadow-lg'
                                      : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                                  }`}
                                >
                                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                    isCorrect
                                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 shadow-lg'
                                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                                  }`}>
                                    {optionKey.toUpperCase()}
                                    {isCorrect && (
                                      <span className="ml-1 text-green-600 text-lg">✓</span>
                                    )}
                                  </div>
                                  <div className="flex-1 prose prose-sm max-w-none">
                                    <div className="text-sm text-gray-700 leading-relaxed">
                                      <SmartLatexRenderer text={String(optionText || '')} />
                                    </div>
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
            </div>
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
