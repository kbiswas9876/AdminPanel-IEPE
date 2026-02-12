'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { linearRegression } from 'simple-statistics'

export interface PerformanceTrajectory {
  trend: 'improving' | 'declining' | 'stable'
  projected_score_30_days: number
  slope: number
  confidence: 'high' | 'medium' | 'low'
}

export async function calculatePerformanceTrajectory(
  userId: string
): Promise<PerformanceTrajectory | null> {
  try {
    const supabase = createAdminClient()
    
    const { data: tests, error } = await supabase
      .from('test_results')
      .select('score, submitted_at')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: true })
      .limit(30)

    if (error) {
      console.error('Error fetching test results for trajectory:', error)
      return null
    }

    if (!tests || tests.length < 10) {
      return null // Need at least 10 data points
    }

    // Prepare data for regression: [days_since_first, score]
    const firstDate = new Date(tests[0].submitted_at).getTime()
    const points: [number, number][] = tests.map(t => {
      const daysSinceFirst = 
        (new Date(t.submitted_at).getTime() - firstDate) / (1000 * 60 * 60 * 24)
      return [daysSinceFirst, t.score || 0]
    })

    // Calculate linear regression
    const regression = linearRegression(points)
    const slope = regression.m
    const intercept = regression.b

    // Project 30 days from last test
    const lastTestDays = points[points.length - 1][0]
    const projected30Days = slope * (lastTestDays + 30) + intercept

    // Determine trend
    let trend: 'improving' | 'declining' | 'stable'
    if (slope > 0.5) trend = 'improving'
    else if (slope < -0.5) trend = 'declining'
    else trend = 'stable'

    // Confidence based on data points
    const confidence = tests.length >= 20 ? 'high' : 
                      tests.length >= 15 ? 'medium' : 'low'

    return {
      trend,
      projected_score_30_days: Math.max(0, Math.min(100, projected30Days)),
      slope,
      confidence
    }
  } catch (error) {
    console.error('Error calculating trajectory:', error)
    return null
  }
}

