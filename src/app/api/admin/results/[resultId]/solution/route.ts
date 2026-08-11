import { NextResponse, NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params
    if (!resultId) return NextResponse.json({ error: 'Result ID required' }, { status: 400 })

    const supabase = createAdminClient()

    // Fetch result
    const { data: testResult, error: trErr } = await supabase
      .from('test_results')
      .select('*')
      .eq('id', resultId)
      .single()
    if (trErr || !testResult) return NextResponse.json({ error: 'Result not found' }, { status: 404 })

    // Fetch answer log
    const { data: answerLog, error: alErr } = await supabase
      .from('answer_log')
      .select('*')
      .eq('result_id', resultId)
    if (alErr) return NextResponse.json({ error: 'Answer log not found' }, { status: 404 })

    const questionIds = (answerLog || []).map(a => a.question_id)
    const { data: questions, error: qErr } = await supabase
      .from('questions')
      .select('*')
      .in('id', questionIds)
    if (qErr) return NextResponse.json({ error: 'Questions not found' }, { status: 404 })

    // Attempt order
    let orderedQuestions = questions || []
    const { data: orderRow } = await supabase
      .from('test_attempt_order_log')
      .select('question_order_json, option_order_json')
      .eq('test_result_id', resultId)
      .single()
    if (orderRow && Array.isArray(orderRow.question_order_json)) {
      const byId: Record<number, any> = {}
      for (const q of questions as any[]) byId[q.id] = q
      orderedQuestions = orderRow.question_order_json
        .map((qid: number) => byId[qid])
        .filter((q: any) => q)
    }

    return NextResponse.json({
      data: {
        testResult,
        answerLog,
        questions: orderedQuestions,
        option_order: orderRow?.option_order_json || null
      }
    })
  } catch (e) {
    console.error('admin solution fetch error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


