'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RefreshCw, BarChart3, BookOpen, Target, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { getEnhancedStudentAnalytics } from '@/lib/actions/enhanced-student-analytics'
import type { EnhancedStudentAnalytics, UserProfile } from '@/lib/supabase/admin'
import { ProfileOverviewDashboard } from './profile-overview-dashboard'
import { PracticeTestsAnalytics } from './practice-tests-analytics'
import { MockTestsAnalytics } from './mock-tests-analytics'
import { QuestionPerformanceGrid } from './question-performance-grid'
import { TimeAnalyticsChart } from './time-analytics-chart'
import { SubjectAnalysisGrid } from './subject-analysis-grid'
import { AdminControls } from './admin-controls'

interface EnhancedStudentProfileProps {
  userId: string
  user: UserProfile
}

export function EnhancedStudentProfile({ userId, user }: EnhancedStudentProfileProps) {
  const [analytics, setAnalytics] = useState<EnhancedStudentAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnalytics = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)
      
      const data = await getEnhancedStudentAnalytics(userId)
      setAnalytics(data)
      setError(null)
    } catch (err) {
      setError('Failed to load analytics data')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [userId])

  const handleRefresh = () => {
    fetchAnalytics(true)
  }

  const handleAdminAction = () => {
    // Refresh data after admin action
    fetchAnalytics(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/students">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Students
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/students">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Students
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error || 'Failed to load analytics'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/students">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </Link>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Student Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {user.full_name || 'No name provided'}
              </CardTitle>
              <CardDescription className="text-lg">
                Enhanced Performance Analytics
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Tests</div>
              <div className="text-2xl font-bold">{analytics.totalTests}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="practice" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Practice</span>
          </TabsTrigger>
          <TabsTrigger value="mock" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Mock Tests</span>
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Questions</span>
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Time</span>
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Subjects</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProfileOverviewDashboard 
            analytics={analytics} 
            userId={userId}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          <PracticeTestsAnalytics 
            userId={userId}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="mock" className="space-y-6">
          <MockTestsAnalytics 
            userId={userId}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <QuestionPerformanceGrid 
            userId={userId}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <TimeAnalyticsChart 
            userId={userId}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <SubjectAnalysisGrid 
            userId={userId}
            onRefresh={handleRefresh}
          />
        </TabsContent>
      </Tabs>

      {/* Admin Controls */}
      <AdminControls 
        user={user} 
        onAction={handleAdminAction}
      />
    </div>
  )
}
