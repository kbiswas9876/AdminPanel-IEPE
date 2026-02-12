'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  BookOpen, 
  Award,
  Activity,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import type { EnhancedStudentAnalytics } from '@/lib/supabase/admin'

interface ProfileOverviewDashboardProps {
  analytics: EnhancedStudentAnalytics
  userId: string
  onRefresh: () => void
}

export function ProfileOverviewDashboard({ analytics, userId, onRefresh }: ProfileOverviewDashboardProps) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
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

  const formatScore = (score: number) => {
    return Math.round(score * 100) / 100
  }

  // Prepare chart data
  const performanceData = analytics.recentPerformance.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: item.score,
    type: item.testType === 'practice' ? 'Practice' : 'Mock Test'
  }))

  const testDistributionData = [
    { name: 'Practice Tests', value: analytics.practiceTests, color: '#3b82f6' },
    { name: 'Mock Tests', value: analytics.mockTests, color: '#10b981' }
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTests}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.practiceTests} practice, {analytics.mockTests} mock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatScore(analytics.overallScore)}%</div>
            <p className="text-xs text-muted-foreground">
              Practice: {formatScore(analytics.practiceScore)}%, Mock: {formatScore(analytics.mockScore)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatScore(analytics.overallAccuracy)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalCorrect} correct out of {analytics.totalCorrect + analytics.totalIncorrect} answered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(analytics.totalTimeSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {Math.round(analytics.averageTimePerQuestion)}s per question
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Score progression over time</CardDescription>
          </CardHeader>
          <CardContent>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, 'Score']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No performance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Test Distribution</CardTitle>
            <CardDescription>Practice vs Mock tests</CardDescription>
          </CardHeader>
          <CardContent>
            {testDistributionData.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={testDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [value, 'Tests']} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No test data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Attempted</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalQuestionsAttempted}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary" className="text-green-600 bg-green-100">
                {analytics.totalCorrect} correct
              </Badge>
              <Badge variant="secondary" className="text-red-600 bg-red-100">
                {analytics.totalIncorrect} incorrect
              </Badge>
              <Badge variant="secondary" className="text-gray-600 bg-gray-100">
                {analytics.totalSkipped} skipped
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Practice Tests:</span>
                <span className="font-medium">{formatScore(analytics.practiceScore)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Mock Tests:</span>
                <span className="font-medium">{formatScore(analytics.mockScore)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Time per Question:</span>
                <span className="font-medium">{Math.round(analytics.averageTimePerQuestion)}s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {analytics.recentPerformance.length} tests in last 30 days
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Latest score: {analytics.recentPerformance.length > 0 
                    ? `${analytics.recentPerformance[analytics.recentPerformance.length - 1]?.score}%`
                    : 'N/A'
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
