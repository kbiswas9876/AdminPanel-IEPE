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
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="mt-3 text-lg text-gray-600 font-medium">
            Welcome to your mission control center. Monitor system status and manage your platform.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDashboardData}
            disabled={loading}
            className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200"
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
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-gray-200/50">
            <CardHeader className="bg-gradient-to-r from-gray-50/50 to-white/50 border-b border-gray-100/50">
              <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              <Button asChild className="w-full justify-start group hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200" variant="outline">
                <Link href="/content/new" className="flex items-center space-x-3">
                  <div className="p-1 rounded-md bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <Plus className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">Add New Question</span>
                </Link>
              </Button>
              <Button asChild className="w-full justify-start group hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all duration-200" variant="outline">
                <Link href="/tests/new" className="flex items-center space-x-3">
                  <div className="p-1 rounded-md bg-purple-100 group-hover:bg-purple-200 transition-colors">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium">Create Mock Test</span>
                </Link>
              </Button>
              <Button asChild className="w-full justify-start group hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all duration-200" variant="outline">
                <Link href="/students" className="flex items-center space-x-3">
                  <div className="p-1 rounded-md bg-green-100 group-hover:bg-green-200 transition-colors">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium">Manage Students</span>
                </Link>
              </Button>
              <Button asChild className="w-full justify-start group hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all duration-200" variant="outline">
                <Link href="/reports" className="flex items-center space-x-3">
                  <div className="p-1 rounded-md bg-red-100 group-hover:bg-red-200 transition-colors">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="font-medium">View Error Reports</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-gray-200/50">
            <CardHeader className="bg-gradient-to-r from-gray-50/50 to-white/50 border-b border-gray-100/50">
              <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50/50 border border-green-200/50">
                <span className="text-sm font-medium text-gray-700">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50/50 border border-green-200/50">
                <span className="text-sm font-medium text-gray-700">API Services</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50/50 border border-green-200/50">
                <span className="text-sm font-medium text-gray-700">File Storage</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-600">Online</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
