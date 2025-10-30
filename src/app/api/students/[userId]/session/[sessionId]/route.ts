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

    // Get test name and marking scheme if it's a mock test
    let testName: string | undefined
    let enrichedAnswerLog: any[] = answerLog || []
    
    if (testResult.session_type === 'mock_test' && testResult.mock_test_id) {
      const { data: testData } = await supabase
        .from('tests')
        .select('name, marks_per_correct, negative_marks_per_incorrect')
        .eq('id', testResult.mock_test_id)
        .single()
      
      testName = testData?.name
      
      // Fetch per-question marking
      const questionIds = (answerLog || []).map(a => a.question_id)
      if (questionIds.length > 0) {
        const { data: testQuestions } = await supabase
          .from('test_questions')
          .select('question_id, marks_per_correct, penalty_per_incorrect')
          .eq('test_id', testResult.mock_test_id)
          .in('question_id', questionIds)
        
        const globalMpc = Number(testData?.marks_per_correct) || 0
        const globalPpi = Math.abs(Number(testData?.negative_marks_per_incorrect) || 0)
        
        const markingMap = new Map(
          (testQuestions || []).map((tq: any) => [
            tq.question_id,
            {
              marksPerCorrect: tq.marks_per_correct !== null && tq.marks_per_correct !== undefined
                ? Number(tq.marks_per_correct)
                : globalMpc,
              penaltyPerIncorrect: tq.penalty_per_incorrect !== null && tq.penalty_per_incorrect !== undefined
                ? Math.abs(Number(tq.penalty_per_incorrect))
                : globalPpi
            }
          ])
        )
        
        // Enrich answer log with per-question marking
        enrichedAnswerLog = (answerLog || []).map((answer: any) => {
          const marking = markingMap.get(answer.question_id) || {
            marksPerCorrect: globalMpc,
            penaltyPerIncorrect: globalPpi
          }
          return {
            ...answer,
            marksPerCorrect: marking.marksPerCorrect,
            penaltyPerIncorrect: marking.penaltyPerIncorrect
          }
        })
      }
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
      answerLog: enrichedAnswerLog as AnswerLog[]
    }

    return NextResponse.json({ data: sessionDetail })

  } catch (error) {
    console.error('Error in session detail API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
