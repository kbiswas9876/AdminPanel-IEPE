import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Admin panel uses service role key for elevated permissions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface ViolationWithUser {
  id: number
  user_id: string
  test_result_id: number | null
  mock_test_id: number
  violation_type: string
  outcome: string
  device_type: string | null
  browser_name: string | null
  os_name: string | null
  user_agent_string: string | null
  created_at: string
  user?: {
    email: string
    raw_user_meta_data: {
      name?: string
      full_name?: string
    }
  }
  test?: {
    name: string
  }
}

// GET - Fetch security violations with user data (for admin panel)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const testId = searchParams.get('testId')
    const userId = searchParams.get('userId')
    const testResultId = searchParams.get('testResultId')

    if (!testId && !userId && !testResultId) {
      return NextResponse.json(
        { error: 'Must provide testId, userId, or testResultId parameter' },
        { status: 400 }
      )
    }

    console.log('Admin fetching security violations:', { testId, userId, testResultId })

    // Build query to fetch violations
    let query = supabaseAdmin
      .from('security_violations')
      .select('*')
      .order('created_at', { ascending: false })

    if (testId) {
      query = query.eq('mock_test_id', testId)
    }
    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (testResultId) {
      query = query.eq('test_result_id', testResultId)
    }

    const { data: violations, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching security violations:', fetchError)
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    if (!violations || violations.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Enrich violations with user data
    const enrichedViolations: ViolationWithUser[] = []

    for (const violation of violations) {
      // Fetch user data
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
        violation.user_id
      )

      // Fetch test data
      const { data: testData } = await supabaseAdmin
        .from('tests')
        .select('name')
        .eq('id', violation.mock_test_id)
        .single()

      enrichedViolations.push({
        ...violation,
        user: userData?.user ? {
          email: userData.user.email || 'Unknown',
          raw_user_meta_data: userData.user.user_metadata || {}
        } : undefined,
        test: testData || undefined
      })
    }

    return NextResponse.json({
      success: true,
      data: enrichedViolations
    })

  } catch (error) {
    console.error('Error in security violations GET API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET violation count summary for a test (useful for badges/indicators)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { testIds } = body

    if (!testIds || !Array.isArray(testIds)) {
      return NextResponse.json(
        { error: 'testIds array is required' },
        { status: 400 }
      )
    }

    // Fetch violation counts for multiple tests
    const { data, error } = await supabaseAdmin
      .from('security_violations')
      .select('mock_test_id')
      .in('mock_test_id', testIds)

    if (error) {
      console.error('Error fetching violation counts:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Count violations per test
    const counts: Record<number, number> = {}
    testIds.forEach(id => counts[id] = 0)
    
    data?.forEach(violation => {
      counts[violation.mock_test_id] = (counts[violation.mock_test_id] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      data: counts
    })

  } catch (error) {
    console.error('Error in violation counts POST API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

