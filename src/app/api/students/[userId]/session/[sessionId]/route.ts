import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SessionDetail, AnswerLog } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; sessionId: string }> }
) {
  try {
    const { userId, sessionId } = await params

    if (!userId || !sessionId) {
      return NextResponse.json({ error: 'User ID and Session ID are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch test result details
    const { data: testResult, error: testError } = await supabase
      .from('test_results')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()

    if (testError) {
      console.error('Error fetching test result:', testError)
      return NextResponse.json({ error: 'Test result not found' }, { status: 404 })
    }

    // Fetch answer log for this session
    const { data: answerLog, error: answerError } = await supabase
      .from('answer_log')
      .select('*')
      .eq('result_id', sessionId)
      .order('question_id', { ascending: true })

    if (answerError) {
      console.error('Error fetching answer log:', answerError)
      return NextResponse.json({ error: 'Answer log not found' }, { status: 404 })
    }

    // Get test name if it's a mock test
    let testName: string | undefined
    if (testResult.session_type === 'mock_test' && testResult.mock_test_id) {
      const { data: testData } = await supabase
        .from('tests')
        .select('name')
        .eq('id', testResult.mock_test_id)
        .single()
      
      testName = testData?.name
    }

    // Calculate accuracy
    const totalAnswered = (testResult.total_correct || 0) + (testResult.total_incorrect || 0)
    const accuracy = totalAnswered > 0 ? ((testResult.total_correct || 0) / totalAnswered) * 100 : 0

    const sessionDetail: SessionDetail = {
      id: testResult.id,
      sessionType: testResult.session_type === 'practice' ? 'practice' : 'mock_test',
      testName,
      score: testResult.score || 0,
      accuracy: Math.round(accuracy * 100) / 100,
      totalQuestions: testResult.total_questions || 0,
      correct: testResult.total_correct || 0,
      incorrect: testResult.total_incorrect || 0,
      skipped: testResult.total_skipped || 0,
      timeSpent: testResult.total_time_taken || 0,
      submittedAt: testResult.submitted_at,
      answerLog: (answerLog || []) as AnswerLog[]
    }

    return NextResponse.json({ data: sessionDetail })

  } catch (error) {
    console.error('Error in session detail API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
