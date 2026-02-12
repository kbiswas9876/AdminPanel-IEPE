'use client'

import { Card } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts'
import type { TimeVsScoreDataPoint } from '@/lib/actions/test-reports'

interface TimeVsScoreScatterProps {
  data: TimeVsScoreDataPoint[]
}

export function TimeVsScoreScatter({ data }: TimeVsScoreScatterProps) {
  // Transform data for Recharts (convert time to minutes)
  const chartData = data.map(point => ({
    timeMinutes: Math.round(point.timeSeconds / 60),
    percentage: point.percentage,
    name: point.studentName
  }))

  return (
    <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
          <Clock className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Time vs Score Analysis</h3>
          <p className="text-sm text-slate-500">Relationship between time management and performance</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              type="number" 
              dataKey="timeMinutes" 
              name="Time Taken"
              unit=" min"
              label={{ value: 'Time Taken (minutes)', position: 'insideBottom', offset: -10 }}
              stroke="#64748b"
            />
            <YAxis 
              type="number" 
              dataKey="percentage" 
              name="Score"
              unit="%"
              label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
              stroke="#64748b"
              domain={[0, 100]}
            />
            <ZAxis range={[60, 60]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white border border-slate-200 shadow-lg rounded-lg p-3">
                      <p className="font-semibold text-slate-900 mb-1">{data.name}</p>
                      <p className="text-sm text-slate-600">
                        Score: <span className="font-medium">{data.percentage}%</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Time: <span className="font-medium">{data.timeMinutes} min</span>
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Scatter 
              name="Students" 
              data={chartData} 
              fill="#8b5cf6"
              opacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      )}

      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-600">
          <strong>Insight:</strong> This plot reveals patterns between time management and performance. 
          Students who finish quickly with high scores demonstrate efficiency, while those who use more time 
          may be either thorough or struggling with the material.
        </p>
      </div>
    </Card>
  )
}

