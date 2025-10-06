'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
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
  FileText,
  ArrowRight
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/40">
        <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
          {/* Loading Hero Section - Compact */}
          <div className="group relative overflow-visible">
            <div className="absolute inset-0 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-lg" />
            <div className="relative z-10 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <LayoutDashboard className="h-6 w-6 text-white animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 w-48 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
                    <div className="h-4 w-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-9 w-24 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-xl animate-pulse"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/40">
      <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
        {/* Compact Premium Hero Bar - 50% Height Reduction */}
        <div className="group relative overflow-visible">
          {/* Enhanced Frosted Glass Background */}
          <div className="absolute inset-0 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-lg" />
          {/* Inner highlight */}
          <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/50 to-transparent" />
          
          <div className="relative z-10 px-6 py-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Compact Header Content */}
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-all duration-300">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                    {greeting}{adminProfile?.full_name && `, ${adminProfile.full_name.split(' ')[0]}`}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <span>Admin Dashboard</span>
                    {adminProfile?.last_login && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">
                          Last login {new Date(adminProfile.last_login).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Inline Quick Stats + Action Button */}
              <div className="flex items-center gap-4">
                {/* Quick Stats Pills */}
                <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50/80 border border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-orange-100">
                      <Users className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-900">{stats.pendingUsers}</span>
                      <span className="text-slate-500 ml-1">pending</span>
                    </div>
                  </div>
                  <div className="w-px h-4 bg-slate-300" />
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-red-100">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-900">{stats.newErrorReports}</span>
                      <span className="text-slate-500 ml-1">errors</span>
                    </div>
                  </div>
                </div>

                {/* Compact Refresh Button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="group/btn relative overflow-hidden bg-white border-slate-200/60 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 transition-transform duration-300 ${loading ? 'animate-spin' : 'group-hover/btn:rotate-180'}`} />
                  <span className="font-semibold text-slate-700 group-hover/btn:text-blue-600">Refresh</span>
                </Button>
              </div>
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
            {/* Enhanced Quick Actions Card V2 - More Compact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="group relative overflow-visible"
            >
              <div className="absolute inset-0 rounded-3xl bg-white backdrop-blur-xl border border-slate-200/60 shadow-lg" />
              <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-b from-white/50 to-transparent" />
              
              <div className="relative z-10 p-6">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
                    <p className="text-xs text-slate-500">Essential tasks</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Link href="/content/new" className="group/action block">
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/50 hover:border-blue-300 hover:bg-white transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                          <Plus className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 group-hover/action:text-blue-600 transition-colors">Add Question</div>
                          {quickActionBadges.recentQuestions > 0 && (
                            <div className="text-xs text-slate-500">{quickActionBadges.recentQuestions} added this week</div>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover/action:text-blue-600 opacity-0 group-hover/action:opacity-100 transition-all" />
                    </motion.div>
                  </Link>
                  
                  <Link href="/tests/new" className="group/action block">
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/50 hover:border-purple-300 hover:bg-white transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10">
                          <BookOpen className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 group-hover/action:text-purple-600 transition-colors">Create Test</div>
                          {quickActionBadges.draftTests > 0 && (
                            <div className="text-xs text-slate-500">{quickActionBadges.draftTests} draft{quickActionBadges.draftTests > 1 ? 's' : ''}</div>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover/action:text-purple-600 opacity-0 group-hover/action:opacity-100 transition-all" />
                    </motion.div>
                  </Link>
                  
                  <Link href="/students" className="group/action block">
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/50 hover:border-green-300 hover:bg-white transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-slate-900 group-hover/action:text-green-600 transition-colors">Manage Students</div>
                          {quickActionBadges.pendingApprovals > 0 && (
                            <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0 animate-pulse">
                              {quickActionBadges.pendingApprovals}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover/action:text-green-600 opacity-0 group-hover/action:opacity-100 transition-all" />
                    </motion.div>
                  </Link>
                  
                  <Link href="/reports" className="group/action block">
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/50 hover:border-red-300 hover:bg-white transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-slate-900 group-hover/action:text-red-600 transition-colors">Error Reports</div>
                          {quickActionBadges.newErrors > 0 && (
                            <Badge className="bg-red-500 text-white text-xs px-1.5 py-0 animate-pulse">
                              {quickActionBadges.newErrors}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover/action:text-red-600 opacity-0 group-hover/action:opacity-100 transition-all" />
                    </motion.div>
                  </Link>
                  
                  <Link href="/content" className="group/action block">
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/50 hover:border-indigo-300 hover:bg-white transition-all duration-200"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-indigo-600/10">
                        <FileText className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="text-sm font-bold text-slate-900 group-hover/action:text-indigo-600 transition-colors">Browse Questions</div>
                      <ArrowRight className="ml-auto h-4 w-4 text-slate-400 group-hover/action:text-indigo-600 opacity-0 group-hover/action:opacity-100 transition-all" />
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}
