'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, CheckCircle2, XCircle, Clock, Award, Target, BookOpen, Loader2 } from 'lucide-react'
import { getDetailedTestResult } from '@/lib/actions/studentAnalyticsActions'
import type { EnrichedTestResult } from '@/lib/types/analytics'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface DetailedSessionModalProps {
  resultId: number
  isOpen: boolean
  onClose: () => void
}

export function DetailedSessionModal({ resultId, isOpen, onClose }: DetailedSessionModalProps) {
  const [data, setData] = useState<EnrichedTestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && resultId) {
      loadData()
    }
    
    // Cleanup when modal closes
    return () => {
      if (!isOpen) {
        setData(null)
        setError(null)
      }
    }
  }, [isOpen, resultId])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    setData(null)
    
    try {
      console.log('🔍 DetailedSessionModal: Loading test result for ID:', resultId)
      console.log('🔍 DetailedSessionModal: Result ID type:', typeof resultId, 'Value:', resultId)
      
      if (!resultId || resultId === 0 || resultId < 0) {
        console.error('❌ DetailedSessionModal: Invalid resultId:', resultId)
        setError('Invalid test result ID. This session may not have detailed results available.')
        setLoading(false)
        return
      }
      
      const result = await getDetailedTestResult(resultId)
      console.log('✅ DetailedSessionModal: Received test result:', result)
      
      if (!result) {
        console.error('❌ DetailedSessionModal: No result returned from getDetailedTestResult')
        setError('No test result found. This session may have been deleted or the results are not yet available.')
      } else if (!result.testResult) {
        console.error('❌ DetailedSessionModal: Result missing testResult property')
        setError('Invalid test result data structure.')
      } else if (!result.enrichedAnswers || result.enrichedAnswers.length === 0) {
        console.warn('⚠️ DetailedSessionModal: No answer data available')
        setError('No detailed answer data available for this session.')
      } else {
        console.log('✅ DetailedSessionModal: Data loaded successfully with', result.enrichedAnswers.length, 'answers')
        setData(result)
      }
    } catch (err) {
      console.error('❌ DetailedSessionModal: Error loading test result:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load session details'
      setError(`Error: ${errorMessage}. Please try again or contact support if the issue persists.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[9999]">
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200 pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {loading && (
                <div className="flex items-center justify-center min-h-[400px] p-8">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
                    <p className="text-gray-600 font-medium">Loading session details...</p>
                    <p className="text-xs text-gray-500">Result ID: {resultId}</p>
                  </div>
                </div>
              )}

              {error && !loading && (
                <div className="p-12 text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4 max-w-md mx-auto"
                  >
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900">Unable to Load Details</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{error}</p>
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="font-mono">Debug Info:</p>
                      <p>Result ID: {resultId}</p>
                      <p>Type: {typeof resultId}</p>
                    </div>
                    <div className="flex gap-3 justify-center pt-2">
                      <Button onClick={loadData} variant="outline" size="lg">
                        Try Again
                      </Button>
                      <Button onClick={onClose} variant="default" size="lg">
                        Close
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}

              {!loading && !error && !data && (
                <div className="p-12 text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <XCircle className="h-8 w-8 text-gray-600" />
                    </div>
                    <p className="font-semibold text-lg text-gray-900">No Data Available</p>
                    <Button onClick={onClose} variant="outline" size="lg">
                      Close
                    </Button>
                  </motion.div>
                </div>
              )}

              {data && !loading && !error && (
                <SessionDetails data={data} onClose={onClose} />
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

function SessionDetails({ data, onClose }: { data: EnrichedTestResult; onClose: () => void }) {
  const { testResult, enrichedAnswers, chapterBreakdown } = data
  
  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-br from-blue-50 to-blue-100/50 border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Test Analysis</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="h-3.5 w-3.5 text-gray-500" />
                <p className="text-sm text-gray-600">
                  {new Date(testResult.submitted_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
        {/* Summary Stats */}
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Target}
              label="Score"
              value={`${testResult.score_percentage.toFixed(1)}%`}
              color="blue"
            />
            <StatCard
              icon={CheckCircle2}
              label="Correct"
              value={testResult.total_correct.toString()}
              color="green"
            />
            <StatCard
              icon={XCircle}
              label="Incorrect"
              value={testResult.total_incorrect.toString()}
              color="red"
            />
            <StatCard
              icon={Clock}
              label="Time"
              value={`${Math.floor(testResult.total_time_taken / 60)}m`}
              color="gray"
            />
          </div>
        </div>

        {/* Chapter Performance */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-5 w-5 text-gray-700" />
            <h4 className="text-base font-bold text-gray-900">Chapter Performance</h4>
          </div>
          <div className="space-y-3">
            {Object.entries(chapterBreakdown).map(([chapter, perf]) => (
              <div key={chapter} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-900">{chapter}</span>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {perf.correct}/{perf.total} ({perf.accuracy.toFixed(0)}%)
                  </Badge>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${perf.accuracy}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="px-6 py-5 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-gray-700" />
            <h4 className="text-base font-bold text-gray-900">Question Analysis</h4>
          </div>
          <div className="space-y-3">
            {enrichedAnswers.map(({ answer_log, question, timingCategory, isCorrect }, index) => (
              <motion.div
                key={answer_log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border-l-4 rounded-xl p-4 bg-white shadow-sm ${
                  isCorrect ? 'border-green-500' : 'border-red-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                    isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {answer_log.id}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        variant="secondary"
                        className={`text-xs ${
                          timingCategory.category === 'fast'
                            ? 'bg-blue-100 text-blue-700'
                            : timingCategory.category === 'optimal'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {timingCategory.label}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="h-3.5 w-3.5" />
                        {Math.floor(answer_log.time_taken / 60)}m {answer_log.time_taken % 60}s
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {question.question_text}
                    </p>
                    
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-gray-600">
                          Correct: <span className="font-semibold">{question.correct_option}</span>
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-xs font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          Student: {answer_log.user_answer || 'Skipped'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
        <Button onClick={onClose} size="lg" variant="default">
          Close
        </Button>
      </div>
    </>
  )
}

function StatCard({ icon: Icon, label, value, color }: { 
  icon: any
  label: string
  value: string
  color: string 
}) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-900'
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-5 w-5 ${colorClasses[color as keyof typeof colorClasses]}`} />
        <div className="text-xs font-medium text-gray-600">{label}</div>
      </div>
      <div className={`text-3xl font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>
        {value}
      </div>
    </div>
  )
}
