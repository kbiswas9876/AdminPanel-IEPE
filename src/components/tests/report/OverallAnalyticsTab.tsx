'use client'

import { Card } from '@/components/ui/card'
import { BarChart, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react'
import type { TestOverviewStats } from '@/lib/actions/test-reports'

interface OverallAnalyticsTabProps {
  testId: number
  stats: TestOverviewStats
}

export function OverallAnalyticsTab({ testId, stats }: OverallAnalyticsTabProps) {
  // Calculate score distribution ranges
  const scoreRanges = [
    { label: '0-10%', min: 0, max: 10 },
    { label: '11-20%', min: 11, max: 20 },
    { label: '21-30%', min: 21, max: 30 },
    { label: '31-40%', min: 31, max: 40 },
    { label: '41-50%', min: 41, max: 50 },
    { label: '51-60%', min: 51, max: 60 },
    { label: '61-70%', min: 61, max: 70 },
    { label: '71-80%', min: 71, max: 80 },
    { label: '81-90%', min: 81, max: 90 },
    { label: '91-100%', min: 91, max: 100 },
  ]

  return (
    <div className="space-y-6">
      {/* Score Distribution Chart */}
      <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
            <BarChart className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Score Distribution</h3>
            <p className="text-sm text-slate-500">Performance across all students</p>
          </div>
        </div>

        {/* Distribution visualization - placeholder for now */}
        <div className="space-y-3">
          {scoreRanges.map((range) => (
            <div key={range.label} className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600 w-20">{range.label}</span>
              <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                  style={{ width: '0%' }} // Will be calculated from actual data
                />
              </div>
              <span className="text-sm text-slate-500 w-12 text-right">0</span>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-600">
            <strong>Note:</strong> Full question-by-question analysis and detailed score distribution will be available once we implement the detailed test_attempt_answers tracking system.
          </p>
        </div>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-50 border border-green-200">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Performance Summary</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Class Average</span>
              <span className="text-lg font-semibold text-slate-900">
                {stats.averagePercentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Highest Score</span>
              <span className="text-lg font-semibold text-green-600">
                {stats.highestScore.toFixed(1)} / {stats.totalMarks}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Lowest Score</span>
              <span className="text-lg font-semibold text-orange-600">
                {stats.lowestScore.toFixed(1)} / {stats.totalMarks}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
              <AlertCircle className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Coming Soon</h3>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p>📊 Question-by-question analysis</p>
            <p>📈 Topic-wise performance breakdown</p>
            <p>🎯 Most difficult questions</p>
            <p>⏱️ Average time per question</p>
          </div>
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-900">
              These features require detailed answer tracking which will be implemented in the next phase.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

