'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { 
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet'
import { 
  ArrowLeft, 
  RefreshCw, 
  BarChart3, 
  BookOpen, 
  Target, 
  Clock, 
  TrendingUp,
  Menu,
  Smartphone
} from 'lucide-react'
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

interface MobileStudentProfileProps {
  userId: string
  user: UserProfile
}

export function MobileStudentProfile({ userId, user }: MobileStudentProfileProps) {
  const [analytics, setAnalytics] = useState<EnhancedStudentAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [isSheetOpen, setIsSheetOpen] = useState(false)

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
    fetchAnalytics(true)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'practice', label: 'Practice', icon: BookOpen },
    { id: 'mock', label: 'Mock Tests', icon: Target },
    { id: 'questions', label: 'Questions', icon: BookOpen },
    { id: 'time', label: 'Time', icon: Clock },
    { id: 'subjects', label: 'Subjects', icon: TrendingUp },
  ]

  const renderTabContent = () => {
    if (!analytics) return null
    
    switch (activeTab) {
      case 'overview':
        return (
          <ProfileOverviewDashboard 
            analytics={analytics} 
            userId={userId}
            onRefresh={handleRefresh}
          />
        )
      case 'practice':
        return (
          <PracticeTestsAnalytics 
            userId={userId}
            onRefresh={handleRefresh}
          />
        )
      case 'mock':
        return (
          <MockTestsAnalytics 
            userId={userId}
            onRefresh={handleRefresh}
          />
        )
      case 'questions':
        return (
          <QuestionPerformanceGrid 
            userId={userId}
            onRefresh={handleRefresh}
          />
        )
      case 'time':
        return (
          <TimeAnalyticsChart 
            userId={userId}
            onRefresh={handleRefresh}
          />
        )
      case 'subjects':
        return (
          <SubjectAnalysisGrid 
            userId={userId}
            onRefresh={handleRefresh}
          />
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <Link href="/students">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <Link href="/students">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{error || 'Failed to load analytics'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {/* Mobile Header */}
      <div className="flex items-center justify-between">
        <Link href="/students">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsSheetOpen(!isSheetOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Student Profile Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">
                {user.full_name || 'No name provided'}
              </CardTitle>
              <CardDescription className="text-sm">
                Enhanced Performance Analytics
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Total Tests</div>
              <div className="text-lg font-bold">{analytics.totalTests}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mobile Tab Navigation */}
      <div className="flex space-x-1 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              size="sm"
              className="flex-shrink-0"
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{tab.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Mobile Navigation Menu */}
      {isSheetOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsSheetOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Navigation</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsSheetOpen(false)}>
                  ×
                </Button>
              </div>
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => {
                        setActiveTab(tab.id)
                        setIsSheetOpen(false)
                      }}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Mobile Admin Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Smartphone className="h-4 w-4" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <AdminControls 
            user={user} 
            onAction={handleAdminAction}
          />
        </CardContent>
      </Card>
    </div>
  )
}
