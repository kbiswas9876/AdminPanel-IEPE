import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = createAdminClient()

    // Build query
    let query = supabase
      .from('user_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (type && type !== 'all') {
      query = query.eq('activity_type', type)
    }

    const { data: activities, error } = await query

    if (error) {
      console.error('Error fetching activities:', error)
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      )
    }

    // Check if there are more activities
    const { count } = await supabase
      .from('user_activity_log')
      .select('*', { count: 'exact', head: true })
      .gte('id', 0) // This is a placeholder - in a real implementation, you'd check if there are more records

    const hasMore = (activities?.length || 0) === limit

    // Transform activities to match the expected format
    const transformedActivities = activities?.map(activity => ({
      id: activity.id,
      type: activity.activity_type,
      description: getActivityDescription(activity),
      timestamp: activity.created_at,
      metadata: activity.metadata || {}
    })) || []

    return NextResponse.json({
      activities: transformedActivities,
      hasMore
    })
  } catch (error) {
    console.error('Error in activity API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getActivityDescription(activity: any): string {
  const { activity_type, metadata } = activity
  
  switch (activity_type) {
    case 'login':
      return 'User logged in'
    case 'test_attempt':
      const testName = metadata?.test_name || 'a test'
      return `Attempted ${testName}`
    case 'bookmark':
      const bookmarkTitle = metadata?.title || 'content'
      return `Bookmarked ${bookmarkTitle}`
    case 'comment':
      return 'Added a comment'
    case 'registration':
      return 'Registered for the platform'
    case 'approval':
      return 'Account was approved'
    case 'suspension':
      return 'Account was suspended'
    default:
      return 'Performed an action'
  }
}
