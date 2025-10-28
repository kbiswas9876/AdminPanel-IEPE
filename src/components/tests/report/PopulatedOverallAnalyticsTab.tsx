'use client'

import { useEffect, useState } from 'react'
import type { ScoreDistribution, TimeVsScoreDataPoint } from '@/lib/actions/test-reports'
import { getScoreDistribution, getTimeVsScoreData, getPerformanceFunnelMetrics } from '@/lib/actions/test-reports'
import { ScoreDistributionChart } from './ScoreDistributionChart'
import { TimeVsScoreScatter } from './TimeVsScoreScatter'
import { PerformanceFunnel } from './PerformanceFunnel'

interface PopulatedOverallAnalyticsTabProps {
  testId: number
}

export function PopulatedOverallAnalyticsTab({ testId }: PopulatedOverallAnalyticsTabProps) {
  const [distribution, setDistribution] = useState<ScoreDistribution[]>([])
  const [timeVsScoreData, setTimeVsScoreData] = useState<TimeVsScoreDataPoint[]>([])
  const [funnelMetrics, setFunnelMetrics] = useState({ totalQuestions: 0, averageAttempted: 0, averageAccuracy: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [dist, timeScore, funnel] = await Promise.all([
        getScoreDistribution(testId),
        getTimeVsScoreData(testId),
        getPerformanceFunnelMetrics(testId)
      ])
      setDistribution(dist)
      setTimeVsScoreData(timeScore)
      setFunnelMetrics(funnel)
      setLoading(false)
    }
    fetchData()
  }, [testId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Score Distribution Chart - Enhanced with Recharts */}
      <ScoreDistributionChart data={distribution} />

      {/* Performance Funnel */}
      <PerformanceFunnel 
        totalQuestions={funnelMetrics.totalQuestions}
        averageAttempted={funnelMetrics.averageAttempted}
        averageAccuracy={funnelMetrics.averageAccuracy}
      />

      {/* Time vs Score Scatter Plot */}
      <TimeVsScoreScatter data={timeVsScoreData} />
    </div>
  )
}

