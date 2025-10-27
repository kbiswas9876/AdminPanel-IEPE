'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'
import { calculatePerformanceTrajectory, type PerformanceTrajectory } from '@/lib/actions/studentTrajectory'

export function PerformanceTrajectoryCard({ userId }: { userId: string }) {
  const [trajectory, setTrajectory] = useState<PerformanceTrajectory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculatePerformanceTrajectory(userId).then(data => {
      setTrajectory(data)
      setLoading(false)
    })
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Trajectory</CardTitle>
        </CardHeader>
        <CardContent>
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!trajectory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Trajectory</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Not enough data to calculate trajectory (minimum 10 tests required)
          </p>
        </CardContent>
      </Card>
    )
  }

  const TrendIcon = 
    trajectory.trend === 'improving' ? TrendingUp :
    trajectory.trend === 'declining' ? TrendingDown : Minus

  const trendColor = 
    trajectory.trend === 'improving' ? 'text-green-600' :
    trajectory.trend === 'declining' ? 'text-red-600' : 'text-gray-600'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trajectory</CardTitle>
        <CardDescription>Predictive analysis based on recent performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendIcon className={`h-6 w-6 ${trendColor}`} />
          <span className={`text-xl font-semibold ${trendColor} capitalize`}>
            {trajectory.trend}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-600">Projected score in 30 days:</p>
          <p className="text-3xl font-bold">
            {trajectory.projected_score_30_days.toFixed(1)}%
          </p>
        </div>
        <p className="text-xs text-gray-500">
          Confidence: {trajectory.confidence} • Based on linear regression analysis
        </p>
      </CardContent>
    </Card>
  )
}

