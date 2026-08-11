import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'practice' | 'mock_test' | null
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Build query
    let query = supabase
      .from('test_results')
      .select(`
        id,
        session_type,
        test_type,
        mock_test_id,
        score,
        score_percentage,
        accuracy,
        total_questions,
        total_correct,
        total_incorrect,
        total_skipped,
        total_time_taken,
        submitted_at
      `)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(limit)

    // Apply type filter if specified
    if (type) {
      query = query.eq('session_type', type)
    }

    const { data: sessions, error } = await query

    if (error) {
      console.error('Error fetching sessions:', error)
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    // Transform data to include test names for mock tests
    const transformedSessions = await Promise.all(
      (sessions || []).map(async (session) => {
        let testName = 'Practice Session'
        
        if (session.session_type === 'mock_test' && session.mock_test_id) {
          // Fetch test name for mock tests
          const { data: testData } = await supabase
            .from('tests')
            .select('name')
            .eq('id', session.mock_test_id)
            .single()
          
          testName = testData?.name || 'Mock Test'
        }

        return {
          ...session,
          testName
        }
      })
    )

    return NextResponse.json({ data: transformedSessions })

  } catch (error) {
    console.error('Error in sessions API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
