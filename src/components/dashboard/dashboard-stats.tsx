'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  AlertTriangle, 
  UserCheck, 
  BookOpen, 
  ArrowRight,
  Clock,
  UserPlus,
  FileText,
  AlertCircle,
  LogIn,
  Edit,
  Settings,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { StatCardV2 } from './stat-card-v2'
import type { DashboardStats, RecentActivity } from '@/lib/actions/dashboard'

interface DashboardStatsProps {
  stats: DashboardStats
}

interface RecentActivityProps {
  activities: RecentActivity[]
}

// Premium Refined Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  href, 
  isUrgent = false,
  description 
}: {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  href: string
  isUrgent?: boolean
  description?: string
}) {
  return (
    <Link href={href} className="block group">
      <div className="group relative overflow-visible transition-all duration-300 hover:-translate-y-1">
        {/* Enhanced Card Background with Better Contrast */}
        <div className={`absolute inset-0 rounded-3xl backdrop-blur-xl border transition-all duration-300 ${
          isUrgent 
            ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/80 shadow-orange-rounded' 
            : 'bg-white border-slate-200/60 shadow-rounded-3xl'
        }`} />
        {/* Inner highlight for premium look */}
        <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-b from-white/40 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 ${
              isUrgent
                ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/25'
                : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25'
            }`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            
            {isUrgent && value > 0 && (
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold shadow-lg animate-pulse">
                Action Required
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className={`text-3xl font-bold tracking-tight transition-colors ${
              isUrgent ? 'text-orange-900' : 'text-slate-900'
            }`}>
              {value.toLocaleString()}
            </div>
            
            <div className="space-y-1">
              <div className={`font-medium transition-colors ${
                isUrgent ? 'text-orange-700' : 'text-slate-700'
              }`}>
                {title}
              </div>
              {description && (
                <div className="text-sm text-slate-600">
                  {description}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Hover Glow Effect */}
        <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          isUrgent 
            ? 'bg-gradient-to-br from-orange-400/10 to-red-400/10'
            : 'bg-gradient-to-br from-blue-400/5 to-indigo-400/5'
        }`} />
      </div>
    </Link>
  )
}

// Activity Item Component V2 - Enhanced with animations
function ActivityItem({ activity, index }: { activity: RecentActivity; index: number }) {
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="h-5 w-5 text-green-600" />
      case 'error_report':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'question_added':
        return <FileText className="h-5 w-5 text-blue-600" />
      case 'test_created':
        return <BookOpen className="h-5 w-5 text-purple-600" />
      case 'bulk_import':
        return <FileText className="h-5 w-5 text-indigo-600" />
      case 'admin_login':
        return <LogIn className="h-5 w-5 text-cyan-600" />
      case 'admin_profile_update':
        return <Edit className="h-5 w-5 text-orange-600" />
      case 'admin_settings_change':
        return <Settings className="h-5 w-5 text-teal-600" />
      case 'admin_action':
        return <Shield className="h-5 w-5 text-slate-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getActivityIconBg = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registration':
        return 'bg-gradient-to-br from-green-100 to-emerald-100'
      case 'error_report':
        return 'bg-gradient-to-br from-red-100 to-rose-100'
      case 'question_added':
        return 'bg-gradient-to-br from-blue-100 to-cyan-100'
      case 'test_created':
        return 'bg-gradient-to-br from-purple-100 to-fuchsia-100'
      case 'bulk_import':
        return 'bg-gradient-to-br from-indigo-100 to-blue-100'
      case 'admin_login':
        return 'bg-gradient-to-br from-cyan-100 to-sky-100'
      case 'admin_profile_update':
        return 'bg-gradient-to-br from-orange-100 to-amber-100'
      case 'admin_settings_change':
        return 'bg-gradient-to-br from-teal-100 to-cyan-100'
      case 'admin_action':
        return 'bg-gradient-to-br from-slate-100 to-gray-100'
      default:
        return 'bg-gradient-to-br from-gray-100 to-slate-100'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const isAdminActivity = activity.type.startsWith('admin_')

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group/item relative"
    >
      <div className="flex items-start space-x-4 p-4 hover:bg-slate-50/80 rounded-2xl transition-all duration-200 cursor-pointer">
        {/* Enhanced Icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition-all duration-300 ${getActivityIconBg(activity.type)}`}
        >
          {getActivityIcon(activity.type)}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-bold text-slate-900 group-hover/item:text-blue-600 transition-colors">
                  {activity.title}
                </p>
                {isAdminActivity && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs border-0 shadow-sm">
                    Admin
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-slate-600 leading-relaxed mb-2">
                {activity.description}
              </p>
              
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(activity.timestamp)}
                </span>
                
                {activity.adminEmail && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-blue-600 font-semibold">
                      {activity.adminEmail}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hover indicator */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity">
          <ArrowRight className="h-4 w-4 text-blue-600" />
        </div>
      </div>
    </motion.div>
  )
}

// Premium Dashboard Stats Component with Enhanced Layout V2
export function DashboardStats({ stats }: DashboardStatsProps) {
  // Mock trend data and sparklines (in production, fetch from backend)
  const mockTrends = {
    pendingUsers: stats.pendingUsers > 0 ? { direction: 'up' as const, percentage: 25, label: 'vs last week' } : undefined,
    newErrorReports: stats.newErrorReports > 0 ? { direction: 'up' as const, percentage: 15, label: 'vs last week' } : undefined,
    activeStudents: { direction: 'up' as const, percentage: 8, label: 'vs last week' },
    totalQuestions: { direction: 'up' as const, percentage: 12, label: 'vs last month' }
  }

  const mockSparklines = {
    pendingUsers: [0, 1, 0, 2, 1, 2, stats.pendingUsers],
    newErrorReports: [2, 1, 3, 2, 1, 1, stats.newErrorReports],
    activeStudents: [1, 1, 1, 2, 2, 2, stats.activeStudents],
    totalQuestions: [15, 16, 17, 18, 19, 19, stats.totalQuestions]
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
    >
      <motion.div variants={item}>
        <StatCardV2
          title="Pending Approvals"
          value={stats.pendingUsers}
          description="Users awaiting approval"
          trend={mockTrends.pendingUsers}
          sparklineData={mockSparklines.pendingUsers}
          icon={Users}
          iconBg="bg-gradient-to-br from-orange-500 to-red-500"
          href="/students?status=pending"
          isUrgent={stats.pendingUsers > 0}
          badge={stats.pendingUsers > 0 ? { text: 'Action Required', variant: 'error' } : undefined}
        />
      </motion.div>

      <motion.div variants={item}>
        <StatCardV2
          title="New Error Reports"
          value={stats.newErrorReports}
          description="Unresolved issues"
          trend={mockTrends.newErrorReports}
          sparklineData={mockSparklines.newErrorReports}
          icon={AlertTriangle}
          iconBg="bg-gradient-to-br from-red-500 to-rose-500"
          href="/reports?status=new"
          isUrgent={stats.newErrorReports > 0}
          badge={stats.newErrorReports > 0 ? { text: 'Needs Attention', variant: 'error' } : undefined}
        />
      </motion.div>

      <motion.div variants={item}>
        <StatCardV2
          title="Active Students"
          value={stats.activeStudents}
          description="Currently active users"
          trend={mockTrends.activeStudents}
          sparklineData={mockSparklines.activeStudents}
          icon={UserCheck}
          iconBg="bg-gradient-to-br from-green-500 to-teal-500"
          href="/students"
        />
      </motion.div>

      <motion.div variants={item}>
        <StatCardV2
          title="Total Questions"
          value={stats.totalQuestions}
          description="Questions in database"
          trend={mockTrends.totalQuestions}
          sparklineData={mockSparklines.totalQuestions}
          icon={BookOpen}
          iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
          href="/content"
        />
      </motion.div>
    </motion.div>
  )
}

// Premium Recent Activity Component with Refined iOS Aesthetic
export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="group relative overflow-visible h-fit">
      {/* Enhanced Solid Background for Better Visibility */}
      <div className="absolute inset-0 rounded-3xl bg-white backdrop-blur-xl border border-slate-200/60 shadow-rounded-3xl" />
      {/* Inner highlight */}
      <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-b from-white/50 to-transparent" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="p-6 border-b border-slate-200/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Recent Activity</h3>
              <p className="text-sm text-slate-600 mt-1">Latest system events</p>
            </div>
            <Link 
              href="/reports" 
              className="group/btn flex items-center space-x-2 px-4 py-2 bg-slate-50/80 hover:bg-white border border-slate-200/60 rounded-2xl transition-all duration-300 shadow-rounded-2xl hover:shadow-rounded-xl"
            >
              <span className="text-sm font-medium text-slate-700 group-hover/btn:text-blue-600">View All</span>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover/btn:text-blue-600 transition-colors" />
            </Link>
          </div>
        </div>
        
        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100/60 mb-4">
                <Clock className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-lg font-medium text-slate-600">No recent activity</p>
              <p className="text-sm text-slate-500 mt-1">Activity will appear here as it happens</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200/30">
              {activities.map((activity, index) => (
                <ActivityItem key={activity.id} activity={activity} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
