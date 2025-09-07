'use client'

import { useEffect, useState } from 'react'
import { DashboardStats, RecentActivity } from './dashboard-stats'
import { getDashboardStats, getRecentActivity, type DashboardStats as DashboardStatsType, type RecentActivity as RecentActivityType } from '@/lib/actions/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Settings, 
  Plus, 
  BookOpen, 
  Users, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsType>({
    pendingUsers: 0,
    newErrorReports: 0,
    activeStudents: 0,
    totalQuestions: 0
  })
  const [activities, setActivities] = useState<RecentActivityType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, activitiesData] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(7)
      ])
      setStats(statsData)
      setActivities(activitiesData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Loading your command center...
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Welcome to your mission control center. Monitor system status and manage your platform.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} />
        </div>

        {/* Quick Actions - Takes 1 column on large screens */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/content/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Question
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/tests/new">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create Mock Test
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/students">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Students
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/reports">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  View Error Reports
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Services</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">File Storage</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
