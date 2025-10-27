'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FileText, TrendingUp, Clock, Flame, TrendingDown } from 'lucide-react'
import { getStudentActivityFeed } from '@/lib/actions/studentAnalyticsActions'
import type { ActivityLogEntry } from '@/lib/types/analytics'
import { calculateTotalTime, calculateAverageAccuracy, calculateStreak } from '@/lib/utils/activity-utils'

interface ActivitySummaryStatsProps {
  userId: string
}

export function ActivitySummaryStats({ userId }: ActivitySummaryStatsProps) {
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageAccuracy: 0,
    totalTime: 0,
    streak: 0,
    accuracyChange: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all activities (we need comprehensive data)
        const data = await getStudentActivityFeed(userId, {}, { page: 1, limit: 1000 })
        
        // Calculate stats
        const sessions = data.entries.filter(
          entry => entry.activity_type === 'PRACTICE_SESSION_COMPLETED' ||
                  entry.activity_type === 'MOCK_TEST_COMPLETED'
        )
        
        const totalSessions = sessions.length
        const averageAccuracy = calculateAverageAccuracy(sessions)
        const totalTime = calculateTotalTime(sessions)
        const streak = calculateStreak(sessions)
        
        // Calculate trend (compare recent vs older)
        const recentSessions = sessions.slice(0, 5)
        const olderSessions = sessions.slice(5, 10)
        
        const recentAccuracy = calculateAverageAccuracy(recentSessions)
        const olderAccuracy = calculateAverageAccuracy(olderSessions)
        const accuracyChange = olderAccuracy > 0 ? ((recentAccuracy - olderAccuracy) / olderAccuracy) * 100 : 0
        
        setStats({
          totalSessions,
          averageAccuracy,
          totalTime: Math.floor(totalTime / 60), // Convert to minutes
          streak,
          accuracyChange
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statsConfig = [
    {
      label: 'Total Sessions',
      value: stats.totalSessions,
      icon: FileText,
      color: 'blue',
      bgColor: 'bg-blue-50/50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-600'
    },
    {
      label: 'Average Accuracy',
      value: `${stats.averageAccuracy}%`,
      trend: stats.accuracyChange,
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-50/50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600'
    },
    {
      label: 'Total Time',
      value: `${stats.totalTime}m`,
      icon: Clock,
      color: 'purple',
      bgColor: 'bg-purple-50/50',
      borderColor: 'border-purple-200',
      iconColor: 'text-purple-600',
      valueColor: 'text-purple-600'
    },
    {
      label: 'Streak',
      value: `${stats.streak} days`,
      icon: Flame,
      color: 'orange',
      bgColor: 'bg-orange-50/50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600',
      valueColor: 'text-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card
              className={`${stat.bgColor} ${stat.borderColor} border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-opacity-60 cursor-pointer group rounded-2xl`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                  <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className={`text-3xl font-bold ${stat.valueColor}`}>
                    {stat.value}
                  </div>
                  {stat.trend !== undefined && stat.trend !== 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/60">
                      {stat.trend > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-xs font-bold ${
                        stat.trend > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(Math.round(stat.trend))}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

