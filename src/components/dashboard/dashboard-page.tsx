'use client'

import { useEffect, useState } from 'react'
import { DashboardStats, RecentActivity } from './dashboard-stats'
import { getDashboardStats, getRecentActivity, type DashboardStats as DashboardStatsType, type RecentActivity as RecentActivityType } from '@/lib/actions/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  BookOpen, 
  Users, 
  AlertTriangle,
  RefreshCw,
  LayoutDashboard,
  Zap,
  Activity,
  Database,
  Globe,
  HardDrive
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
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8 shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-xl ring-4 ring-white/10">
                <LayoutDashboard className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-white tracking-tight">
                  Mission Control
                </h1>
                <p className="mt-2 text-xl text-blue-100 font-medium">
                  Admin Dashboard
                </p>
              </div>
            </div>
            <p className="text-lg text-blue-200/80 font-medium max-w-2xl leading-relaxed">
              Welcome to your command center. Monitor system status, manage your platform, and oversee all operations from this central hub.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={fetchDashboardData}
              disabled={loading}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 hover:text-white transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              <RefreshCw className={`h-5 w-5 mr-3 ${loading ? 'animate-spin' : ''}`} />
              <span className="font-semibold">Refresh Data</span>
            </Button>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl" />
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Enhanced Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} />
        </div>

        {/* Enhanced Quick Actions & System Status */}
        <div className="space-y-6">
          {/* Enhanced Quick Actions Card */}
          <Card className="border-0 bg-white/90 backdrop-blur-md shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 border-b border-gray-100/50 p-6">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 tracking-tight">
                    Quick Actions
                  </CardTitle>
                  <p className="text-sm text-gray-600 font-medium">Common tasks</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Button asChild className="w-full justify-start group hover:scale-[1.02] transition-all duration-200 h-auto p-0" variant="outline">
                <Link href="/content/new" className="flex items-center space-x-4 p-4 rounded-xl border-2 border-blue-200/50 hover:border-blue-300 hover:bg-blue-50/50 w-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-gray-900">Add New Question</span>
                    <p className="text-sm text-gray-600">Create content</p>
                  </div>
                </Link>
              </Button>
              <Button asChild className="w-full justify-start group hover:scale-[1.02] transition-all duration-200 h-auto p-0" variant="outline">
                <Link href="/tests/new" className="flex items-center space-x-4 p-4 rounded-xl border-2 border-purple-200/50 hover:border-purple-300 hover:bg-purple-50/50 w-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-200">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-gray-900">Create Mock Test</span>
                    <p className="text-sm text-gray-600">Build assessments</p>
                  </div>
                </Link>
              </Button>
              <Button asChild className="w-full justify-start group hover:scale-[1.02] transition-all duration-200 h-auto p-0" variant="outline">
                <Link href="/students" className="flex items-center space-x-4 p-4 rounded-xl border-2 border-green-200/50 hover:border-green-300 hover:bg-green-50/50 w-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-200">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-gray-900">Manage Students</span>
                    <p className="text-sm text-gray-600">User management</p>
                  </div>
                </Link>
              </Button>
              <Button asChild className="w-full justify-start group hover:scale-[1.02] transition-all duration-200 h-auto p-0" variant="outline">
                <Link href="/reports" className="flex items-center space-x-4 p-4 rounded-xl border-2 border-red-200/50 hover:border-red-300 hover:bg-red-50/50 w-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-100 to-red-200 group-hover:from-red-200 group-hover:to-red-300 transition-all duration-200">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-gray-900">View Error Reports</span>
                    <p className="text-sm text-gray-600">System monitoring</p>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Enhanced System Status Card */}
          <Card className="border-0 bg-white/90 backdrop-blur-md shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50/80 via-emerald-50/60 to-teal-50/80 border-b border-gray-100/50 p-6">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 tracking-tight">
                    System Status
                  </CardTitle>
                  <p className="text-sm text-gray-600 font-medium">All systems operational</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50/80 to-emerald-50/60 border border-green-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <Database className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Database</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-400/30 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-sm font-bold text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50/80 to-emerald-50/60 border border-green-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <Globe className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">API Services</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-400/30 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-sm font-bold text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50/80 to-emerald-50/60 border border-green-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <HardDrive className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">File Storage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-400/30 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-sm font-bold text-green-600">Online</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
