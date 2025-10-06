'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { DashboardStats, RecentActivity } from './dashboard-stats'
import { 
  getDashboardStats, 
  getRecentActivity, 
  getCurrentAdminProfile,
  getQuickActionBadges,
  type DashboardStats as DashboardStatsType, 
  type RecentActivity as RecentActivityType,
  type AdminProfile,
  type QuickActionBadges
} from '@/lib/actions/dashboard'
import { dataCache, CACHE_KEYS, CACHE_TTL, cacheUtils } from '@/lib/cache/data-cache'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  BookOpen, 
  Users, 
  AlertTriangle,
  RefreshCw,
  LayoutDashboard,
  Zap,
  FileText
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
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [quickActionBadges, setQuickActionBadges] = useState<QuickActionBadges>({
    pendingApprovals: 0,
    newErrors: 0,
    draftTests: 0,
    recentQuestions: 0
  })
  const [loading, setLoading] = useState(true)

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }, [])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Use cached data if available, otherwise fetch
      const [statsData, activitiesData, profileData, badgesData] = await Promise.all([
        cacheUtils.getOrFetch(
          CACHE_KEYS.DASHBOARD_STATS,
          () => getDashboardStats(),
          CACHE_TTL.SHORT
        ),
        cacheUtils.getOrFetch(
          CACHE_KEYS.RECENT_ACTIVITY,
          () => getRecentActivity(7),
          CACHE_TTL.SHORT
        ),
        getCurrentAdminProfile(),
        getQuickActionBadges()
      ])
      
      setStats(statsData)
      setActivities(activitiesData)
      setAdminProfile(profileData)
      setQuickActionBadges(badgesData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Preload other routes for instant navigation
  useEffect(() => {
    const preloadRoutes = async () => {
      await cacheUtils.preloadBatch([
        {
          key: CACHE_KEYS.STUDENT_USERS_WITH_EMAILS,
          fetchFn: async () => {
            const { getUsersByStatus } = await import('@/lib/actions/students')
            return await getUsersByStatus()
          },
          ttl: CACHE_TTL.MEDIUM
        }
      ])
    }
    
    preloadRoutes()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30">
        <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
          {/* Loading Hero Section */}
          <div className="group relative overflow-visible">
            <div className="absolute inset-0 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-rounded-3xl shadow-blue-rounded" />
            <div className="relative z-10 p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                <div className="flex items-start space-x-6">
                  <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
                    <LayoutDashboard className="h-9 w-9 text-white animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-12 w-64 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-2xl animate-pulse"></div>
                    <div className="h-6 w-48 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
                <div className="h-12 w-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Loading Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="group relative overflow-visible">
                <div className="absolute inset-0 rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/40 shadow-rounded-3xl" />
                <div className="relative z-10 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-8 w-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
                    <div className="h-4 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"></div>
                    <div className="h-3 w-3/4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8">
              <div className="group relative overflow-visible">
                <div className="absolute inset-0 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-rounded-3xl" />
                <div className="relative z-10 p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-8 w-48 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
                      <div className="h-4 w-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-10 w-24 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-2xl animate-pulse"></div>
                  </div>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start space-x-4 p-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"></div>
                          <div className="h-3 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"></div>
                          <div className="h-3 w-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="xl:col-span-4 space-y-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="group relative overflow-visible">
                  <div className="absolute inset-0 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-rounded-3xl" />
                  <div className="relative z-10 p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-6 w-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"></div>
                        <div className="h-3 w-24 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="flex items-center justify-between p-4 rounded-2xl bg-white/20">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse"></div>
                            <div className="h-4 w-24 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"></div>
                          </div>
                          <div className="h-4 w-16 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100/80 via-slate-50 to-blue-50/60">
      <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
        {/* Refined Hero Section with Premium iOS Aesthetic */}
        <div className="group relative overflow-visible">
          {/* Enhanced Frosted Glass Background */}
          <div className="absolute inset-0 rounded-3xl bg-white backdrop-blur-xl border border-slate-200/60 shadow-rounded-3xl shadow-blue-rounded" />
          {/* Inner shadow for depth */}
          <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-b from-white/50 to-transparent" />
          
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              {/* Personalized Header Content */}
              <div className="flex items-start space-x-6">
                <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-all duration-500">
                  <LayoutDashboard className="h-9 w-9 text-white" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
                    {greeting}{adminProfile?.full_name && `, ${adminProfile.full_name.split(' ')[0]}`}
                  </h1>
                  <p className="text-lg text-slate-600 font-medium">
                    Welcome to your admin dashboard
                  </p>
                  {adminProfile?.last_login && (
                    <p className="text-sm text-slate-500">
                      Last login: {new Date(adminProfile.last_login).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Refined Action Button */}
              <Button 
                variant="outline" 
                size="lg"
                onClick={fetchDashboardData}
                disabled={loading}
                className="group/btn relative overflow-hidden bg-white/80 border-0 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 rounded-2xl px-8 py-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                <RefreshCw className={`h-5 w-5 mr-3 relative z-10 transition-transform duration-300 ${loading ? 'animate-spin' : 'group-hover/btn:rotate-180'}`} />
                <span className="relative z-10 font-semibold text-slate-700 group-hover/btn:text-slate-900">Refresh Data</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Premium Stats Grid */}
        <DashboardStats stats={stats} />

        {/* Premium Content Grid with Enhanced Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Recent Activity - Enhanced Responsive Layout */}
          <div className="xl:col-span-8">
            <RecentActivity activities={activities} />
          </div>

          {/* Sidebar with Quick Actions & System Status */}
          <div className="xl:col-span-4 space-y-6">
            {/* Refined Quick Actions Card */}
            <div className="group relative overflow-visible">
              <div className="absolute inset-0 rounded-3xl bg-white backdrop-blur-xl border border-slate-200/60 shadow-rounded-3xl" />
              {/* Inner highlight */}
              <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-b from-white/50 to-transparent" />
              
              <div className="relative z-10 p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Quick Actions</h3>
                    <p className="text-sm text-slate-600">Essential tasks</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Link href="/content/new" className="group/action block">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-200/50 shadow-rounded-2xl hover:shadow-rounded-xl hover:bg-white transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                          <Plus className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover/action:text-blue-600 transition-colors">Add New Question</div>
                          <div className="text-sm text-slate-600">Create content</div>
                        </div>
                      </div>
                      {quickActionBadges.recentQuestions > 0 && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 shadow-sm">
                          {quickActionBadges.recentQuestions} added this week
                        </Badge>
                      )}
                    </div>
                  </Link>
                  
                  <Link href="/tests/new" className="group/action block">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-200/50 shadow-rounded-2xl hover:shadow-rounded-xl hover:bg-white transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
                          <BookOpen className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover/action:text-purple-600 transition-colors">Create Mock Test</div>
                          <div className="text-sm text-slate-600">Build assessments</div>
                        </div>
                      </div>
                      {quickActionBadges.draftTests > 0 && (
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 shadow-sm">
                          {quickActionBadges.draftTests} draft{quickActionBadges.draftTests > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </Link>
                  
                  <Link href="/students" className="group/action block">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-200/50 shadow-rounded-2xl hover:shadow-rounded-xl hover:bg-white transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover/action:text-green-600 transition-colors">Manage Students</div>
                          <div className="text-sm text-slate-600">User management</div>
                        </div>
                      </div>
                      {quickActionBadges.pendingApprovals > 0 && (
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0 shadow-sm animate-pulse">
                          {quickActionBadges.pendingApprovals} pending
                        </Badge>
                      )}
                    </div>
                  </Link>
                  
                  <Link href="/reports" className="group/action block">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-200/50 shadow-rounded-2xl hover:shadow-rounded-xl hover:bg-white transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover/action:text-red-600 transition-colors">View Error Reports</div>
                          <div className="text-sm text-slate-600">System monitoring</div>
                        </div>
                      </div>
                      {quickActionBadges.newErrors > 0 && (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0 shadow-sm animate-pulse">
                          {quickActionBadges.newErrors} new
                        </Badge>
                      )}
                    </div>
                  </Link>
                  
                  <Link href="/content" className="group/action block">
                    <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/50 shadow-rounded-2xl hover:shadow-rounded-xl hover:bg-white transition-all duration-300">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border border-indigo-500/20">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover/action:text-indigo-600 transition-colors">Browse Questions</div>
                        <div className="text-sm text-slate-600">View question bank</div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
