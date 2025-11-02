import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/tests/progress
 * 
 * Returns progress statistics for multiple tests
 * 
 * Query params:
 * - testIds: comma-separated list of test IDs (e.g., "1,2,3")
 * 
 * Response:
 * {
 *   "1": {
 *     "total_taken": 20,
 *     "submitted": 15,
 *     "in_progress": 5
 *   },
 *   ...
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testIdsParam = searchParams.get('testIds')
    
    if (!testIdsParam) {
      return NextResponse.json(
        { error: 'testIds parameter is required' },
        { status: 400 }
      )
    }

    // Parse test IDs from comma-separated string
    const testIds = testIdsParam
      .split(',')
      .map(id => parseInt(id.trim(), 10))
      .filter(id => !isNaN(id) && id > 0)

    if (testIds.length === 0) {
      return NextResponse.json({}, { status: 200 })
    }

    const supabase = createAdminClient()

    // Query test_results to get progress stats
    // - total_taken: count of all test_results for this test
    // - submitted: count of test_results (all are submitted since record is only created on submission)
    // - in_progress: will be 0 until we implement test session tracking
    
    const { data: testResults, error } = await supabase
      .from('test_results')
      .select('mock_test_id, submitted_at')
      .in('mock_test_id', testIds)
      .eq('session_type', 'mock_test')

    if (error) {
      console.error('Error fetching test progress:', error)
      return NextResponse.json(
        { error: 'Failed to fetch test progress' },
        { status: 500 }
      )
    }

    // Process the results
    const progressData: Record<string, {
      total_taken: number
      submitted: number
      in_progress: number
    }> = {}

    // Initialize all test IDs with zero counts
    testIds.forEach(testId => {
      progressData[testId.toString()] = {
        total_taken: 0,
        submitted: 0,
        in_progress: 0
      }
    })

    // Count progress for each test
    if (testResults && Array.isArray(testResults)) {
      testResults.forEach((result: any) => {
        const testId = result?.mock_test_id?.toString()
        if (!testId || !progressData[testId]) return

        progressData[testId].total_taken++
        
        // All test_results are submitted (record is only created on submission)
        if (result.submitted_at) {
          progressData[testId].submitted++
        } else {
          // Edge case: consider it submitted if record exists
          progressData[testId].submitted++
        }
      })
    }

    return NextResponse.json(progressData, { status: 200 })
  } catch (error: any) {
    console.error('Unexpected error in /api/tests/progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

