'use client'

import { Card } from '@/components/ui/card'
import { TrendingUp, Target, CheckCircle2 } from 'lucide-react'

interface PerformanceFunnelProps {
  totalQuestions: number
  averageAttempted: number
  averageAccuracy: number
}

export function PerformanceFunnel({ totalQuestions, averageAttempted, averageAccuracy }: PerformanceFunnelProps) {
  const attemptRate = totalQuestions > 0 ? (averageAttempted / totalQuestions) * 100 : 0

  return (
    <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-green-50 border border-green-200">
          <TrendingUp className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Performance Funnel</h3>
          <p className="text-sm text-slate-500">Question engagement and accuracy metrics</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Total Questions */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Total Questions</span>
            </div>
            <span className="text-lg font-bold text-slate-900">{totalQuestions}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-slate-500 transition-all duration-500" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Average Attempted */}
        <div className="relative pl-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Avg. Attempted</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-slate-900">{averageAttempted.toFixed(1)}</span>
              <span className="text-xs text-slate-500 ml-2">({attemptRate.toFixed(1)}%)</span>
            </div>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500" 
              style={{ width: `${attemptRate}%` }}
            />
          </div>
        </div>

        {/* Average Accuracy */}
        <div className="relative pl-16">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-slate-700">Accuracy on Attempted</span>
            </div>
            <span className="text-lg font-bold text-slate-900">{averageAccuracy.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                averageAccuracy >= 70 ? 'bg-green-500' :
                averageAccuracy >= 50 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${averageAccuracy}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 p-3 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-600">
          <strong>Insight:</strong> This funnel shows student engagement and performance. 
          High attempt rates with good accuracy indicate confidence, while low attempt rates 
          may suggest time pressure or difficulty.
        </p>
      </div>
    </Card>
  )
}

