'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Users } from 'lucide-react'

interface StatusDistributionChartProps {
  data: Array<{
    status: string
    count: number
    percentage: number
  }>
}

const COLORS = {
  active: '#10b981',
  pending: '#f59e0b',
  suspended: '#ef4444',
  rejected: '#6b7280'
}

const STATUS_LABELS = {
  active: 'Active',
  pending: 'Pending',
  suspended: 'Suspended',
  rejected: 'Rejected'
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const totalUsers = data.reduce((sum, item) => sum + item.count, 0)

  const formatTooltip = (value: number, name: string, props: any) => {
    const percentage = ((value / totalUsers) * 100).toFixed(1)
    return [`${value} users (${percentage}%)`, STATUS_LABELS[name as keyof typeof STATUS_LABELS] || name]
  }

  const renderLegend = (props: any) => {
    const { payload } = props
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">
              {STATUS_LABELS[entry.value as keyof typeof STATUS_LABELS] || entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          Status Distribution
        </CardTitle>
        <div className="text-sm text-gray-600">
          <span className="font-medium">{totalUsers}</span> total users
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const { status, percentage } = props
                  return `${STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}: ${percentage.toFixed(1)}%`
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="status"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.status as keyof typeof COLORS] || '#6b7280'} 
                  />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltip} />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Status breakdown */}
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[item.status as keyof typeof COLORS] || '#6b7280' }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {item.count} ({item.percentage.toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
