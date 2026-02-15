'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { BarChart, TrendingUp, ArrowUpDown, Clock } from 'lucide-react'
import type { QuestionAnalytics, ScoreDistribution } from '@/lib/actions/test-reports'
import { getScoreDistribution, getQuestionAnalytics } from '@/lib/actions/test-reports'

interface PopulatedOverallAnalyticsTabProps {
  testId: number
}

export function PopulatedOverallAnalyticsTab({ testId }: PopulatedOverallAnalyticsTabProps) {
  const [distribution, setDistribution] = useState<ScoreDistribution[]>([])
  const [questionAnalytics, setQuestionAnalytics] = useState<QuestionAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<'questionNumber' | 'correctnessPercentage' | 'averageTimeSeconds'>('questionNumber')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [dist, analytics] = await Promise.all([
        getScoreDistribution(testId),
        getQuestionAnalytics(testId)
      ])
      setDistribution(dist)
      setQuestionAnalytics(analytics)
      setLoading(false)
    }
    fetchData()
  }, [testId])

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedQuestions = [...questionAnalytics].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1
    return (a[sortField] - b[sortField]) * direction
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    )
  }

  const maxCount = Math.max(...distribution.map(d => d.count))

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

        <div className="space-y-3">
          {distribution.map((range) => (
            <div key={range.range} className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600 w-20">{range.range}</span>
              <div className="flex-1 h-10 bg-slate-100 rounded-lg overflow-hidden relative group">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 flex items-center justify-end pr-3"
                  style={{ width: `${maxCount > 0 ? (range.count / maxCount) * 100 : 0}%` }}
                >
                  {range.count > 0 && (
                    <span className="text-xs font-medium text-white">
                      {range.count} student{range.count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="text-sm text-slate-500 w-16 text-right">{range.count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Question-by-Question Analysis */}
      <Card className="border-slate-200 bg-white/60 backdrop-blur-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Question Analysis</h3>
              <p className="text-sm text-slate-500">Performance breakdown by question</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th 
                  onClick={() => handleSort('questionNumber')}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Q#
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Question
                </th>
                <th 
                  onClick={() => handleSort('correctnessPercentage')}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Correct %
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Incorrect
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Skipped
                </th>
                <th 
                  onClick={() => handleSort('averageTimeSeconds')}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Avg. Time
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedQuestions.map((q) => (
                <tr key={q.questionId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {q.questionNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 max-w-md truncate">{q.questionText}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            q.correctnessPercentage >= 70 ? 'bg-green-500' :
                            q.correctnessPercentage >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${q.correctnessPercentage}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${
                        q.correctnessPercentage >= 70 ? 'text-green-600' :
                        q.correctnessPercentage >= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {q.correctnessPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{q.incorrectCount}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{q.unattemptedCount}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      {Math.floor(q.averageTimeSeconds / 60)}m {q.averageTimeSeconds % 60}s
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

