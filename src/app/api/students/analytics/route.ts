import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables')
    }
    
    const supabase = createAdminClient()
    
    // Get total users count
    const { count: totalUsers, error: countError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Supabase count error:', countError)
      throw new Error(`Database count error: ${countError.message}`)
    }

    // Get users by status
    const { data: statusData, error: statusError } = await supabase
      .from('user_profiles')
      .select('status, updated_at')

    if (statusError) {
      console.error('Supabase error:', statusError)
      throw new Error(`Database error: ${statusError.message}`)
    }

    if (!statusData) {
      throw new Error('Failed to fetch user data')
    }

    // Calculate status distribution
    const statusCounts = statusData.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalUsersCount = totalUsers || 0
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: totalUsersCount > 0 ? (count / totalUsersCount) * 100 : 0
    }))

    // Get registration trends for last 30 days (using updated_at as proxy for created_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: trendData } = await supabase
      .from('user_profiles')
      .select('updated_at')
      .gte('updated_at', thirtyDaysAgo.toISOString())
      .order('updated_at', { ascending: true })

    // Group by date
    const dailyRegistrations = trendData?.reduce((acc, user) => {
      const date = new Date(user.updated_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Fill in missing dates with 0
    const registrationTrend = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]
      registrationTrend.push({
        date: dateString,
        count: dailyRegistrations[dateString] || 0
      })
    }

    // Calculate average approval time (for approved users)
    const approvedUsers = statusData.filter(user => user.status === 'active')
    let averageApprovalTime = 0
    
    if (approvedUsers.length > 0) {
      const totalApprovalTime = approvedUsers.reduce((sum, user) => {
        // Use updated_at as proxy for approval time since created_at doesn't exist
        const updated = new Date(user.updated_at)
        const now = new Date()
        const diffHours = (now.getTime() - updated.getTime()) / (1000 * 60 * 60)
        return sum + diffHours
      }, 0)
      averageApprovalTime = totalApprovalTime / approvedUsers.length
    }

    // Calculate weekly active users (users who logged in within last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: weeklyActiveUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', sevenDaysAgo.toISOString())
      .eq('status', 'active')

    const analyticsData = {
      totalUsers: totalUsersCount,
      pendingUsers: statusCounts.pending || 0,
      activeUsers: statusCounts.active || 0,
      suspendedUsers: statusCounts.suspended || 0,
      averageApprovalTime,
      weeklyActiveUsers: weeklyActiveUsers || 0,
      registrationTrend,
      statusDistribution
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
