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
            <Card key={i} className="hover-lift">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 skeleton rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 skeleton rounded w-1/2 mb-2"></div>
                <div className="h-3 skeleton rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-ios-md">
      {/* iOS-Inspired Hero Header Section */}
      <div className="relative overflow-hidden rounded-ios-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 p-ios-xl shadow-ios-lg border border-slate-200/60">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        
        <div className="relative z-10">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-ios-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-ios-md hover:scale-105 transition-transform duration-300">
                  <LayoutDashboard className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-display text-slate-900">
                    Dashboard
                  </h1>
                  <p className="mt-2 text-subheading text-slate-600">
                    Welcome to your command center
                  </p>
                </div>
              </div>
              
              {/* iOS-style Refresh Button */}
              <div className="hidden sm:block">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 hover:text-slate-800 transition-all duration-300 hover:scale-105 shadow-ios-sm hover:shadow-ios-md px-6 py-3 rounded-ios-lg"
                >
                  <RefreshCw className={`h-5 w-5 mr-3 ${loading ? 'animate-spin' : ''}`} />
                  <span className="text-body font-medium">Refresh</span>
                </Button>
              </div>
            </div>
            <p className="text-body text-slate-600 leading-relaxed max-w-3xl">
              Monitor system status, manage your platform, and oversee all operations from this central hub.
            </p>
            
            {/* Mobile-optimized refresh button */}
            <div className="flex justify-start sm:hidden">
              <Button 
                variant="outline" 
                size="lg"
                onClick={fetchDashboardData}
                disabled={loading}
                className="bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 hover:text-slate-800 transition-all duration-300 hover:scale-105 shadow-ios-sm w-full py-4 rounded-ios-lg"
              >
                <RefreshCw className={`h-5 w-5 mr-3 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-body font-medium">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl" />
      </div>

      {/* Enhanced Stats Cards with Better Spacing */}
      <div className="space-y-6">
        <DashboardStats stats={stats} />
      </div>

      {/* Premium Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Recent Activity - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} />
        </div>

        {/* Enhanced Quick Actions & System Status */}
        <div className="space-y-6">
          {/* iOS-Inspired Quick Actions Card */}
          <Card className="border-0 bg-white shadow-ios-md border border-slate-200/60 rounded-ios-xl overflow-hidden hover:shadow-ios-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b border-slate-200/60 p-ios-lg">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-ios-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-ios-sm hover:scale-105 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-heading text-slate-900">
                    Quick Actions
                  </CardTitle>
                  <p className="text-caption text-slate-600">Common tasks</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-ios-lg">
              <Button asChild className="w-full justify-start group hover:scale-[1.02] transition-all duration-300 h-auto p-0" variant="outline">
                <Link href="/content/new" className="flex items-center space-x-4 p-ios-lg rounded-ios-lg border border-blue-200/60 hover:border-blue-400 hover:bg-blue-50/80 w-full shadow-ios-sm hover:shadow-ios-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-ios-md bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 shadow-ios-sm">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-body font-semibold text-slate-900">Add New Question</span>
                    <p className="text-caption text-slate-600">Create content</p>
                  </div>
                </Link>
              </Button>
              <Button asChild className="w-full justify-start group hover:scale-[1.02] transition-all duration-300 h-auto p-0" variant="outline">
                <Link href="/tests/new" className="flex items-center space-x-4 p-ios-lg rounded-ios-lg border border-purple-200/60 hover:border-purple-400 hover:bg-purple-50/80 w-full shadow-ios-sm hover:shadow-ios-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-ios-md bg-gradient-to-br from-purple-100 to-purple-200 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 shadow-ios-sm">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-body font-semibold text-slate-900">Create Mock Test</span>
                    <p className="text-caption text-slate-600">Build assessments</p>
                  </div>
                </Link>
              </Button>
              <Button asChild className="w-full justify-start group hover:scale-[1.02] transition-all duration-300 h-auto p-0" variant="outline">
                <Link href="/students" className="flex items-center space-x-4 p-ios-lg rounded-ios-lg border border-green-200/60 hover:border-green-400 hover:bg-green-50/80 w-full shadow-ios-sm hover:shadow-ios-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-ios-md bg-gradient-to-br from-green-100 to-green-200 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 shadow-ios-sm">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-body font-semibold text-slate-900">Manage Students</span>
                    <p className="text-caption text-slate-600">User management</p>
                  </div>
                </Link>
              </Button>
              <Button asChild className="w-full justify-start group hover:scale-[1.02] transition-all duration-300 h-auto p-0" variant="outline">
                <Link href="/reports" className="flex items-center space-x-4 p-ios-lg rounded-ios-lg border border-red-200/60 hover:border-red-400 hover:bg-red-50/80 w-full shadow-ios-sm hover:shadow-ios-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-ios-md bg-gradient-to-br from-red-100 to-red-200 group-hover:from-red-200 group-hover:to-red-300 transition-all duration-300 shadow-ios-sm">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-body font-semibold text-slate-900">View Error Reports</span>
                    <p className="text-caption text-slate-600">System monitoring</p>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* iOS-Inspired System Status Card */}
          <Card className="border-0 bg-white shadow-ios-md border border-slate-200/60 rounded-ios-xl overflow-hidden hover:shadow-ios-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-b border-slate-200/60 p-ios-lg">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-ios-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-ios-sm hover:scale-105 transition-transform duration-300">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-heading text-slate-900">
                    System Status
                  </CardTitle>
                  <p className="text-caption text-slate-600">All systems operational</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-ios-lg">
              <div className="flex items-center justify-between p-ios-lg rounded-ios-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-200/60 hover:shadow-ios-sm transition-all duration-300 hover:scale-[1.01]">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-ios-md bg-green-100 shadow-ios-sm">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-body font-semibold text-slate-800">Database</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-ios-sm"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-400/30 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-caption font-semibold text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-ios-lg rounded-ios-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-200/60 hover:shadow-ios-sm transition-all duration-300 hover:scale-[1.01]">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-ios-md bg-green-100 shadow-ios-sm">
                    <Globe className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-body font-semibold text-slate-800">API Services</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-ios-sm"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-400/30 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-caption font-semibold text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-ios-lg rounded-ios-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-200/60 hover:shadow-ios-sm transition-all duration-300 hover:scale-[1.01]">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-ios-md bg-green-100 shadow-ios-sm">
                    <HardDrive className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-body font-semibold text-slate-800">File Storage</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-ios-sm"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-400/30 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-caption font-semibold text-green-600">Online</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
