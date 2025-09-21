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
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import type { DashboardStats, RecentActivity } from '@/lib/actions/dashboard'

interface DashboardStatsProps {
  stats: DashboardStats
}

interface RecentActivityProps {
  activities: RecentActivity[]
}

// Premium Stat Card Component
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
      <Card className={`relative overflow-hidden smooth-animation hover-lift cursor-pointer border-0 rounded-ios-xl ${
        isUrgent 
          ? 'bg-gradient-to-br from-orange-50 to-red-50 shadow-ios-md border border-orange-200/60' 
          : 'bg-white shadow-ios-sm border border-slate-200/60 hover:shadow-ios-md'
      }`}>
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10 p-ios-lg">
          <CardTitle className="text-label text-slate-600">
            {title}
          </CardTitle>
          <div className={`p-3 rounded-ios-md transition-all duration-300 shadow-ios-sm ${
            isUrgent 
              ? 'bg-gradient-to-br from-orange-100 to-red-100 text-orange-600 group-hover:scale-110' 
              : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 group-hover:scale-110'
          }`}>
            <Icon className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10 p-ios-lg pt-0">
          <div className="text-hero text-slate-900 mb-2">
            {value.toLocaleString()}
          </div>
          {description && (
            <p className="text-caption text-slate-500">
              {description}
            </p>
          )}
          {isUrgent && value > 0 && (
            <div className="mt-4">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg animate-pulse px-3 py-1 text-xs font-bold">
                Action Required
              </Badge>
            </div>
          )}
        </CardContent>
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </Link>
  )
}

// Activity Item Component
function ActivityItem({ activity }: { activity: RecentActivity }) {
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="h-4 w-4 text-green-600" />
      case 'error_report':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'question_added':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'test_created':
        return <BookOpen className="h-4 w-4 text-purple-600" />
      case 'bulk_import':
        return <FileText className="h-4 w-4 text-indigo-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityIconBg = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registration':
        return 'bg-green-100'
      case 'error_report':
        return 'bg-red-100'
      case 'question_added':
        return 'bg-blue-100'
      case 'test_created':
        return 'bg-purple-100'
      case 'bulk_import':
        return 'bg-indigo-100'
      default:
        return 'bg-gray-100'
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

  return (
    <div className="flex items-start space-x-4 p-ios-lg hover:bg-slate-50/80 transition-all duration-300 group border-l-4 border-transparent hover:border-blue-200">
      <div className={`flex-shrink-0 mt-1 p-3 rounded-ios-md shadow-ios-sm ${getActivityIconBg(activity.type)} group-hover:scale-110 transition-transform duration-300`}>
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
          {activity.title}
        </p>
        <p className="text-caption text-slate-600 mt-1 leading-relaxed">
          {activity.description}
        </p>
        <p className="text-caption text-slate-500 mt-3 font-medium">
          {formatTimestamp(activity.timestamp)}
        </p>
      </div>
    </div>
  )
}

// Premium Dashboard Stats Component
export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      <StatCard
        title="Pending Approvals"
        value={stats.pendingUsers}
        icon={Users}
        href="/students"
        isUrgent={stats.pendingUsers > 0}
        description="Users awaiting approval"
      />
      <StatCard
        title="New Error Reports"
        value={stats.newErrorReports}
        icon={AlertTriangle}
        href="/reports"
        isUrgent={stats.newErrorReports > 0}
        description="Unresolved error reports"
      />
      <StatCard
        title="Active Students"
        value={stats.activeStudents}
        icon={UserCheck}
        href="/students"
        description="Currently active users"
      />
      <StatCard
        title="Total Questions"
        value={stats.totalQuestions}
        icon={BookOpen}
        href="/content"
        description="Questions in database"
      />
    </div>
  )
}

// iOS-Inspired Recent Activity Component
export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="border-0 bg-white shadow-ios-md border border-slate-200/60 overflow-hidden rounded-ios-xl">
      <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-white/80 p-ios-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-heading text-slate-900">
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300 hover:scale-105 rounded-ios-md">
            <Link href="/reports" className="flex items-center space-x-2">
              <span className="text-body font-medium">View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-ios-2xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
              <Clock className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-subheading text-slate-600">No recent activity</p>
            <p className="text-caption text-slate-400 mt-2">Activity will appear here as it happens</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/60">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
