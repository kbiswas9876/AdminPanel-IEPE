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
  icon: any
  href: string
  isUrgent?: boolean
  description?: string
}) {
  return (
    <Link href={href} className="block">
      <Card className={`transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${
        isUrgent ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-red-50' : 'border-gray-200 bg-white'
      }`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <Icon className={`h-4 w-4 ${isUrgent ? 'text-orange-600' : 'text-blue-600'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {value.toLocaleString()}
          </div>
          {description && (
            <p className="text-xs text-gray-500">
              {description}
            </p>
          )}
          {isUrgent && value > 0 && (
            <Badge variant="destructive" className="mt-2 text-xs">
              Action Required
            </Badge>
          )}
        </CardContent>
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
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0 mt-0.5">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {activity.title}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {activity.description}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatTimestamp(activity.timestamp)}
        </p>
      </div>
    </div>
  )
}

// Main Dashboard Stats Component
export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    <Card className="border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/reports" className="text-blue-600 hover:text-blue-700">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
