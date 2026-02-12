import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { QuestionPerformanceDetail, QuestionFilters } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { searchParams } = new URL(request.url)
    
    // Extract filters from query params
    const filters: QuestionFilters = {
      subject: searchParams.get('subject') || undefined,
      chapter: searchParams.get('chapter') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      status: searchParams.get('status') as 'correct' | 'incorrect' | 'skipped' || undefined
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // First get answer logs
    const { data: answerLogs, error: answerLogError } = await supabase
      .from('answer_log')
      .select('question_id, user_answer, status, time_taken')
      .eq('user_id', userId)

    if (answerLogError) {
      console.error('Error fetching answer logs:', answerLogError)
      return NextResponse.json({ error: 'Failed to fetch answer logs' }, { status: 500 })
    }

    if (!answerLogs || answerLogs.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Get unique question IDs
    const questionIds = [...new Set(answerLogs.map(log => log.question_id))]
    
    // Fetch questions data
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, question_text, book_source, chapter_name, difficulty, correct_option, solution_text')
      .in('id', questionIds)

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    // Create a map for quick question lookup
    const questionsMap = new Map(questions?.map(q => [q.id, q]) || [])

    // Group by question and calculate metrics
    const questionMap = new Map<number, {
      questionId: number
      questionText: string
      book_source: string
      chapter_name: string
      difficulty: string
      attempts: number
      correctAttempts: number
      totalTime: number
      lastAttempted: string
      recentStatus: 'correct' | 'incorrect' | 'skipped'
    }>()

    answerLogs.forEach(log => {
      const questionId = log.question_id
      const question = questionsMap.get(questionId)

      if (!question) {
        return // Skip if question not found
      }

      // Apply filters
      if (filters.subject && question.book_source !== filters.subject) {
        return
      }
      if (filters.chapter && question.chapter_name !== filters.chapter) {
        return
      }
      if (filters.difficulty && question.difficulty !== filters.difficulty) {
        return
      }
      if (filters.status && log.status !== filters.status) {
        return
      }

      if (!questionMap.has(questionId)) {
        questionMap.set(questionId, {
          questionId,
          questionText: question.question_text,
          book_source: question.book_source,
          chapter_name: question.chapter_name,
          difficulty: question.difficulty || 'Unknown',
          attempts: 0,
          correctAttempts: 0,
          totalTime: 0,
          lastAttempted: new Date().toISOString(),
          recentStatus: log.status
        })
      }

      const questionData = questionMap.get(questionId)!
      questionData.attempts++
      if (log.status === 'correct') {
        questionData.correctAttempts++
      }
      questionData.totalTime += log.time_taken
      
      // Update recent status (since we don't have created_at, just use the latest status)
      questionData.recentStatus = log.status
    })

    // Convert to array and calculate final metrics
    const questionPerformance: QuestionPerformanceDetail[] = Array.from(questionMap.values()).map(data => ({
      questionId: data.questionId,
      questionText: data.questionText,
      book_source: data.book_source,
      chapter_name: data.chapter_name,
      difficulty: data.difficulty,
      attempts: data.attempts,
      correctAttempts: data.correctAttempts,
      averageTime: Math.round((data.totalTime / data.attempts) * 100) / 100,
      lastAttempted: data.lastAttempted,
      recentStatus: data.recentStatus
    }))

    // Sort by last attempted (most recent first)
    questionPerformance.sort((a, b) => 
      new Date(b.lastAttempted).getTime() - new Date(a.lastAttempted).getTime()
    )

    return NextResponse.json({ data: questionPerformance })

  } catch (error) {
    console.error('Error in question performance API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
