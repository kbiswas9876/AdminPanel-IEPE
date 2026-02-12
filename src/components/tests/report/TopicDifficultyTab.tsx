'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { BookOpen, Target, TrendingDown, TrendingUp } from 'lucide-react'
import type { TopicPerformance, DifficultyPerformance } from '@/lib/actions/test-reports'
import { getTopicAnalysis, getDifficultyAnalysis } from '@/lib/actions/test-reports'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface TopicDifficultyTabProps {
  testId: number
}

export function TopicDifficultyTab({ testId }: TopicDifficultyTabProps) {
  const [topicData, setTopicData] = useState<TopicPerformance[]>([])
  const [difficultyData, setDifficultyData] = useState<DifficultyPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [topics, difficulties] = await Promise.all([
        getTopicAnalysis(testId),
        getDifficultyAnalysis(testId)
      ])
      setTopicData(topics)
      setDifficultyData(difficulties)
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

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return '#10b981' // green-500
    if (accuracy >= 50) return '#f59e0b' // amber-500
    return '#ef4444' // red-500
  }

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'Easy') return '#10b981'
    if (difficulty === 'Easy-Moderate') return '#84cc16'
    if (difficulty === 'Moderate') return '#f59e0b'
    if (difficulty === 'Moderate-Hard') return '#f97316'
    if (difficulty === 'Hard') return '#ef4444'
    return '#64748b'
  }

  return (
    <div className="space-y-6">
      {/* Topic Performance Analysis */}
      <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Topic/Chapter Performance</h3>
            <p className="text-sm text-slate-500">
              Average accuracy across different topics ({topicData.length} topics)
            </p>
          </div>
        </div>

        {topicData.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No topic data available
          </div>
        ) : (
          <>
            {/* Bar Chart Visualization */}
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topicData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]}
                    label={{ value: 'Average Accuracy (%)', position: 'insideBottom', offset: -5 }}
                    tick={{ fill: '#64748b' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="topicName" 
                    width={110}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as TopicPerformance
                        return (
                          <div className="bg-white border border-slate-200 shadow-lg rounded-lg p-3">
                            <p className="font-semibold text-slate-900 mb-1">{data.topicName}</p>
                            <p className="text-sm text-slate-600">
                              Questions: <span className="font-medium">{data.questionCount}</span>
                            </p>
                            <p className="text-sm text-slate-600">
                              Accuracy: <span className="font-medium">{data.averageAccuracy.toFixed(1)}%</span>
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="averageAccuracy" radius={[0, 8, 8, 0]}>
                    {topicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getAccuracyColor(entry.averageAccuracy)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Topic/Chapter
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Questions
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Avg. Accuracy
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {topicData.map((topic, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-slate-900">{topic.topicName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600">{topic.questionCount}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full transition-all duration-300"
                              style={{ 
                                width: `${topic.averageAccuracy}%`,
                                backgroundColor: getAccuracyColor(topic.averageAccuracy)
                              }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${
                            topic.averageAccuracy >= 70 ? 'text-green-600' :
                            topic.averageAccuracy >= 50 ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            {topic.averageAccuracy.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {topic.averageAccuracy >= 70 ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs font-medium">Strong</span>
                          </div>
                        ) : topic.averageAccuracy >= 50 ? (
                          <div className="flex items-center gap-1 text-amber-600">
                            <Target className="h-4 w-4" />
                            <span className="text-xs font-medium">Moderate</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <TrendingDown className="h-4 w-4" />
                            <span className="text-xs font-medium">Needs Focus</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600">
            <strong>Insight:</strong> Topics are sorted by accuracy (lowest first). 
            Focus review sessions on topics with low accuracy to improve overall performance.
          </p>
        </div>
      </Card>

      {/* Difficulty Level Analysis */}
      <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Difficulty Level Analysis</h3>
            <p className="text-sm text-slate-500">
              Performance validation by difficulty rating
            </p>
          </div>
        </div>

        {difficultyData.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No difficulty data available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {difficultyData.map((diff, index) => (
              <Card key={index} className="p-4 border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <span 
                    className="inline-flex px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: `${getDifficultyColor(diff.difficulty)}20`,
                      color: getDifficultyColor(diff.difficulty)
                    }}
                  >
                    {diff.difficulty}
                  </span>
                  <span className="text-xs text-slate-500">{diff.questionCount} Qs</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-slate-600">Avg. Accuracy</span>
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: getAccuracyColor(diff.averageAccuracy) }}
                    >
                      {diff.averageAccuracy.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ 
                        width: `${diff.averageAccuracy}%`,
                        backgroundColor: getAccuracyColor(diff.averageAccuracy)
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600">
            <strong>Insight:</strong> This validates if difficulty ratings match actual performance. 
            "Easy" questions should have high accuracy, while "Hard" questions should be more challenging. 
            Mismatches may indicate a need to recalibrate difficulty ratings.
          </p>
        </div>
      </Card>
    </div>
  )
}

