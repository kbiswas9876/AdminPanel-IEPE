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

// Stat Card Component
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
      <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer border-0 ${
        isUrgent 
          ? 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 shadow-orange-200/50' 
          : 'bg-white/80 backdrop-blur-sm shadow-gray-200/50'
      }`}>
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
          <CardTitle className="text-sm font-semibold text-gray-700 tracking-wide">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg transition-all duration-200 ${
            isUrgent 
              ? 'bg-gradient-to-br from-orange-100 to-red-100 text-orange-600 group-hover:scale-110' 
              : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 group-hover:scale-110'
          }`}>
            <Icon className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            {value.toLocaleString()}
          </div>
          {description && (
            <p className="text-sm text-gray-600 font-medium">
              {description}
            </p>
          )}
          {isUrgent && value > 0 && (
            <div className="mt-3">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg animate-pulse">
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
    <div className="flex items-start space-x-4 p-4 hover:bg-gray-50/50 transition-all duration-200 group">
      <div className={`flex-shrink-0 mt-0.5 p-2 rounded-lg ${getActivityIconBg(activity.type)} group-hover:scale-110 transition-transform duration-200`}>
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
          {activity.title}
        </p>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
          {activity.description}
        </p>
        <p className="text-xs text-gray-500 mt-2 font-medium">
          {formatTimestamp(activity.timestamp)}
        </p>
      </div>
    </div>
  )
}

// Main Dashboard Stats Component
export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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

// Recent Activity Component
export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-gray-200/50 overflow-hidden">
      <CardHeader className="border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200">
            <Link href="/reports" className="flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No recent activity</p>
            <p className="text-sm text-gray-400 mt-1">Activity will appear here as it happens</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100/50">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
