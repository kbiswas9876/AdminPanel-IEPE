'use client'

import { Card } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { ScoreDistribution } from '@/lib/actions/test-reports'

interface ScoreDistributionChartProps {
  data: ScoreDistribution[]
}

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  // Color function based on score range
  const getBarColor = (range: string) => {
    const value = parseInt(range.split('-')[0])
    if (value >= 71) return '#10b981' // green-500
    if (value >= 51) return '#3b82f6' // blue-500
    if (value >= 31) return '#f59e0b' // amber-500
    return '#ef4444' // red-500
  }

  return (
    <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
          <BarChart3 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Score Distribution</h3>
          <p className="text-sm text-slate-500">Performance across all students</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="range" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fill: '#64748b', fontSize: 12 }}
              label={{ value: 'Score Range', position: 'insideBottom', offset: -45 }}
            />
            <YAxis 
              label={{ value: 'Number of Students', angle: -90, position: 'insideLeft' }}
              tick={{ fill: '#64748b' }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ScoreDistribution
                  return (
                    <div className="bg-white border border-slate-200 shadow-lg rounded-lg p-3">
                      <p className="font-semibold text-slate-900 mb-1">{data.range}</p>
                      <p className="text-sm text-slate-600">
                        Students: <span className="font-medium">{data.count}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Percentage: <span className="font-medium">{data.percentage.toFixed(1)}%</span>
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.range)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-600">
          <strong>Insight:</strong> This histogram shows the distribution of scores. 
          A bell curve indicates well-balanced difficulty, while skewed distributions suggest 
          the test may be too easy (right-skewed) or too hard (left-skewed).
        </p>
      </div>
    </Card>
  )
}

