import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { EnhancedStudentAnalytics, PerformanceTrend } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch all test results for the user
    const { data: testResults, error: testError } = await supabase
      .from('test_results')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })

    if (testError) {
      console.error('Error fetching test results:', testError)
      return NextResponse.json({ error: 'Failed to fetch test results' }, { status: 500 })
    }

    if (!testResults || testResults.length === 0) {
      const emptyAnalytics: EnhancedStudentAnalytics = {
        totalTests: 0,
        practiceTests: 0,
        mockTests: 0,
        overallScore: 0,
        practiceScore: 0,
        mockScore: 0,
        overallAccuracy: 0,
        totalTimeSpent: 0,
        averageTimePerQuestion: 0,
        totalQuestionsAttempted: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalSkipped: 0,
        recentPerformance: []
      }
      return NextResponse.json({ data: emptyAnalytics })
    }

    // Separate practice and mock tests
    const practiceTests = testResults.filter(result => result.session_type === 'practice')
    const mockTests = testResults.filter(result => result.session_type === 'mock_test')

    // Calculate overall metrics
    const totalTests = testResults.length
    const totalQuestionsAttempted = testResults.reduce((sum, result) => sum + (result.total_questions || 0), 0)
    const totalCorrect = testResults.reduce((sum, result) => sum + (result.total_correct || 0), 0)
    const totalIncorrect = testResults.reduce((sum, result) => sum + (result.total_incorrect || 0), 0)
    const totalSkipped = testResults.reduce((sum, result) => sum + (result.total_skipped || 0), 0)
    const totalTimeSpent = testResults.reduce((sum, result) => sum + (result.total_time_taken || 0), 0)

    // Calculate scores
    const overallScore = testResults.reduce((sum, result) => sum + (result.score_percentage || 0), 0) / totalTests
    const practiceScore = practiceTests.length > 0 
      ? practiceTests.reduce((sum, result) => sum + (result.score_percentage || 0), 0) / practiceTests.length 
      : 0
    const mockScore = mockTests.length > 0 
      ? mockTests.reduce((sum, result) => sum + (result.score_percentage || 0), 0) / mockTests.length 
      : 0

    // Calculate accuracy
    const totalAnswered = totalCorrect + totalIncorrect
    const overallAccuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0

    // Calculate average time per question
    const averageTimePerQuestion = totalQuestionsAttempted > 0 ? totalTimeSpent / totalQuestionsAttempted : 0

    // Generate performance trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentTests = testResults.filter(result => 
      new Date(result.submitted_at) >= thirtyDaysAgo
    )

    const performanceTrends: PerformanceTrend[] = recentTests.map(result => ({
      date: result.submitted_at.split('T')[0], // Extract date part
      score: result.score_percentage || 0,
      testType: result.session_type === 'practice' ? 'practice' : 'mock_test'
    }))

    const analytics: EnhancedStudentAnalytics = {
      totalTests,
      practiceTests: practiceTests.length,
      mockTests: mockTests.length,
      overallScore: Math.round(overallScore * 100) / 100,
      practiceScore: Math.round(practiceScore * 100) / 100,
      mockScore: Math.round(mockScore * 100) / 100,
      overallAccuracy: Math.round(overallAccuracy * 100) / 100,
      totalTimeSpent,
      averageTimePerQuestion: Math.round(averageTimePerQuestion * 100) / 100,
      totalQuestionsAttempted,
      totalCorrect,
      totalIncorrect,
      totalSkipped,
      recentPerformance: performanceTrends
    }

    return NextResponse.json({ data: analytics })

  } catch (error) {
    console.error('Error in enhanced analytics API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
