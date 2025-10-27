'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, XCircle } from 'lucide-react'
import { getDetailedTestResult } from '@/lib/actions/studentAnalyticsActions'
import type { EnrichedTestResult } from '@/lib/types/analytics'
import { Button } from '@/components/ui/button'
import PerformanceAnalyticsStage from '@/components/student-analysis/PerformanceAnalyticsStage'
import SolutionReviewStage from '@/components/student-analysis/SolutionReviewStage'

type ModalStage = 'analytics' | 'solutions'

interface DetailedSessionModalProps {
  resultId: number
  isOpen: boolean
  onClose: () => void
}

export function DetailedSessionModal({ resultId, isOpen, onClose }: DetailedSessionModalProps) {
  const [data, setData] = useState<EnrichedTestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStage, setCurrentStage] = useState<ModalStage>('analytics')

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

  // Reset stage when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStage('analytics')
    }
  }, [isOpen])

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

  if (typeof window === 'undefined') return null

  return (
    createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
          <>
            {/* Fullscreen Modal - covers everything including header/sidebar */}
            <motion.div
              className="fixed inset-0 w-screen h-screen overflow-hidden bg-white flex flex-col"
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 99999
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
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
                <>
                  {/* Close Button - positioned absolutely in top-right */}
                  <div className="absolute top-4 right-4 z-50">
          <button
            onClick={onClose}
                      className="rounded-full p-2 hover:bg-gray-100 transition-colors bg-white shadow-lg"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
      </div>

                  {/* Stage Content */}
                  <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                      {currentStage === 'analytics' && (
                        <PerformanceAnalyticsStage
                          key="analytics"
                          data={data}
                          onNavigateToSolutions={() => setCurrentStage('solutions')}
                        />
                      )}
                      
                      {currentStage === 'solutions' && (
                        <SolutionReviewStage
                          key="solutions"
                          data={data}
                          onBackToAnalytics={() => setCurrentStage('analytics')}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
              </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    )
  )
}
