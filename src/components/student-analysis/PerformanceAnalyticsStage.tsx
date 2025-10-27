'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import PerformanceAnalysisDashboard from './PerformanceAnalysisDashboard'
import { enrichedTestResultToSessionResult } from '@/lib/adapters/studentPortalDataAdapter'
import type { EnrichedTestResult } from '@/lib/types/analytics'

interface PerformanceAnalyticsStageProps {
  data: EnrichedTestResult
  onNavigateToSolutions: () => void
}

/**
 * Stage 1: Performance Analytics View
 * 
 * This component wraps the PerformanceAnalysisDashboard from Student Portal
 * and adapts the data from EnrichedTestResult to the expected format.
 */
export default function PerformanceAnalyticsStage({
  data,
  onNavigateToSolutions
}: PerformanceAnalyticsStageProps) {
  // Transform data to SessionResult format
  const sessionResult = useMemo(() => {
    return enrichedTestResultToSessionResult(data)
  }, [data])

  return (
    <motion.div
      key="analytics-stage"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="px-6 py-6 pb-24"
    >
      <PerformanceAnalysisDashboard
        sessionResult={sessionResult}
        onNavigateToSolutions={onNavigateToSolutions}
      />
    </motion.div>
  )
}

