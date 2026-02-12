'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  TrendingUp, 
  Target, 
  Calendar,
  RefreshCw,
  BarChart3
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { getTimeAnalytics } from '@/lib/actions/enhanced-student-analytics'

interface TimeAnalyticsChartProps {
  userId: string
  onRefresh: () => void
}

interface TimeAnalytics {
  totalTimeSpent: number
  averageTimePerQuestion: number
  timeByDate: { date: string; timeSpent: number }[]
  timeByType: { type: string; timeSpent: number }[]
}

export function TimeAnalyticsChart({ userId, onRefresh }: TimeAnalyticsChartProps) {
  const [analytics, setAnalytics] = useState<TimeAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnalytics = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)
      
      const data = await getTimeAnalytics(userId)
      setAnalytics(data)
      setError(null)
    } catch (err) {
      setError('Failed to load time analytics')
      console.error('Error fetching time analytics:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [userId])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics(true)
    await onRefresh()
    setRefreshing(false)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const formatScore = (score: number) => {
    return Math.round(score * 100) / 100
  }

  // Prepare chart data
  const timeByDateData = analytics?.timeByDate.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    timeSpent: Math.round(item.timeSpent / 60), // Convert to minutes
    fullDate: item.date
  })) || []

  const timeByTypeData = analytics?.timeByType.map(item => ({
    name: item.type === 'practice' ? 'Practice Tests' : 'Mock Tests',
    value: Math.round(item.timeSpent / 60), // Convert to minutes
    color: item.type === 'practice' ? '#3b82f6' : '#10b981'
  })) || []

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(analytics?.totalTimeSpent || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Across all test sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Time per Question</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics?.averageTimePerQuestion || 0)}s</div>
            <p className="text-xs text-muted-foreground">
              Per question attempt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.timeByDate.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Days with test activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Spent Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Time Spent Over Time</CardTitle>
            <CardDescription>Daily time investment in test preparation</CardDescription>
          </CardHeader>
          <CardContent>
            {timeByDateData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeByDateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${value} minutes`, 'Time Spent']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="timeSpent" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No time data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Distribution by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Time Distribution</CardTitle>
            <CardDescription>Practice vs Mock test time allocation</CardDescription>
          </CardHeader>
          <CardContent>
            {timeByTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={timeByTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {timeByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} minutes`, 'Time Spent']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No time distribution data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Time Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Time Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Time Breakdown</CardTitle>
            <CardDescription>Time spent on each active day</CardDescription>
          </CardHeader>
          <CardContent>
            {timeByDateData.length > 0 ? (
              <div className="space-y-3">
                {timeByDateData.slice(-10).reverse().map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{item.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatDuration(item.timeSpent * 60)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Data</h3>
                <p className="text-gray-500">No time tracking data available for this student.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Efficiency Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Time Efficiency Metrics</CardTitle>
            <CardDescription>Performance indicators based on time investment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Average Session Time</span>
                </div>
                <span className="text-sm font-bold text-blue-900">
                  {analytics?.timeByDate && analytics.timeByDate.length > 0 
                    ? formatDuration((analytics.totalTimeSpent / analytics.timeByDate.length))
                    : '0s'
                  }
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Most Active Day</span>
                </div>
                <span className="text-sm font-bold text-green-900">
                  {analytics?.timeByDate && analytics.timeByDate.length > 0 
                    ? formatDuration(Math.max(...analytics.timeByDate.map(d => d.timeSpent)))
                    : '0s'
                  }
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Time Consistency</span>
                </div>
                <span className="text-sm font-bold text-purple-900">
                  {analytics?.timeByDate && analytics.timeByDate.length > 1 
                    ? `${Math.round((analytics.timeByDate.length / 30) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>
    </div>
  )
}
