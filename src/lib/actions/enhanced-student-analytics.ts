'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { 
  EnhancedStudentAnalytics, 
  SessionDetail, 
  QuestionPerformanceDetail, 
  QuestionFilters,
  PerformanceTrend 
} from '@/lib/supabase/admin'

export async function getEnhancedStudentAnalytics(userId: string): Promise<EnhancedStudentAnalytics> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/students/${userId}/enhanced-analytics`)
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch analytics')
    }
    
    return result.data
  } catch (error) {
    console.error('Error fetching enhanced analytics:', error)
    return {
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
  }
}

export async function getStudentSessions(
  userId: string, 
  type?: 'practice' | 'mock_test', 
  limit?: number
): Promise<any[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const params = new URLSearchParams()
    if (type) params.append('type', type)
    if (limit) params.append('limit', limit.toString())
    
    const response = await fetch(
      `${baseUrl}/api/students/${userId}/sessions?${params.toString()}`
    )
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch sessions')
    }
    
    return result.data
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return []
  }
}

export async function getSessionDetail(sessionId: string): Promise<SessionDetail | null> {
  try {
    // Extract userId from sessionId (we need to get it from the test_results table)
    const supabase = createAdminClient()
    const { data: testResult } = await supabase
      .from('test_results')
      .select('user_id')
      .eq('id', sessionId)
      .single()
    
    if (!testResult) {
      throw new Error('Session not found')
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(
      `${baseUrl}/api/students/${testResult.user_id}/session/${sessionId}`
    )
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch session detail')
    }
    
    return result.data
  } catch (error) {
    console.error('Error fetching session detail:', error)
    return null
  }
}

export async function getQuestionPerformance(
  userId: string, 
  filters?: QuestionFilters
): Promise<QuestionPerformanceDetail[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.subject) params.append('subject', filters.subject)
    if (filters?.chapter) params.append('chapter', filters.chapter)
    if (filters?.difficulty) params.append('difficulty', filters.difficulty)
    if (filters?.status) params.append('status', filters.status)
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(
      `${baseUrl}/api/students/${userId}/question-performance?${params.toString()}`
    )
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch question performance')
    }
    
    return result.data
  } catch (error) {
    console.error('Error fetching question performance:', error)
    return []
  }
}

export async function getTimeAnalytics(userId: string): Promise<{
  totalTimeSpent: number
  averageTimePerQuestion: number
  timeByDate: { date: string; timeSpent: number }[]
  timeByType: { type: string; timeSpent: number }[]
}> {
  try {
    const supabase = createAdminClient()
    
    // Get all test results for time analysis
    const { data: testResults, error } = await supabase
      .from('test_results')
      .select('total_time_taken, submitted_at, session_type, total_questions')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: true })
    
    if (error) {
      throw new Error('Failed to fetch time analytics')
    }
    
    const totalTimeSpent = testResults?.reduce((sum, result) => sum + (result.total_time_taken || 0), 0) || 0
    
    // Calculate average time per question
    const totalQuestions = testResults?.reduce((sum, result) => {
      // We need to get total_questions from test_results
      return sum + (result.total_questions || 0)
    }, 0) || 0
    
    const averageTimePerQuestion = totalQuestions > 0 ? totalTimeSpent / totalQuestions : 0
    
    // Group by date
    const timeByDate = testResults?.reduce((acc: { [key: string]: number }, result) => {
      const date = result.submitted_at.split('T')[0]
      acc[date] = (acc[date] || 0) + (result.total_time_taken || 0)
      return acc
    }, {}) || {}
    
    const timeByDateArray = Object.entries(timeByDate).map(([date, timeSpent]) => ({
      date,
      timeSpent
    }))
    
    // Group by session type
    const timeByType = testResults?.reduce((acc: { [key: string]: number }, result) => {
      acc[result.session_type] = (acc[result.session_type] || 0) + (result.total_time_taken || 0)
      return acc
    }, {}) || {}
    
    const timeByTypeArray = Object.entries(timeByType).map(([type, timeSpent]) => ({
      type,
      timeSpent
    }))
    
    return {
      totalTimeSpent,
      averageTimePerQuestion: Math.round(averageTimePerQuestion * 100) / 100,
      timeByDate: timeByDateArray,
      timeByType: timeByTypeArray
    }
  } catch (error) {
    console.error('Error fetching time analytics:', error)
    return {
      totalTimeSpent: 0,
      averageTimePerQuestion: 0,
      timeByDate: [],
      timeByType: []
    }
  }
}

export async function getSubjectAnalysis(userId: string): Promise<{
  subject: string
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  averageTime: number
  chapters: { chapter: string; questions: number; accuracy: number }[]
}[]> {
  try {
    const supabase = createAdminClient()
    
    // First get answer logs
    const { data: answerLogs, error: answerLogError } = await supabase
      .from('answer_log')
      .select('question_id, status, time_taken')
      .eq('user_id', userId)
    
    if (answerLogError) {
      throw new Error('Failed to fetch answer logs')
    }
    
    if (!answerLogs || answerLogs.length === 0) {
      return []
    }

    // Get unique question IDs
    const questionIds = [...new Set(answerLogs.map(log => log.question_id))]
    
    // Fetch questions data
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, book_source, chapter_name')
      .in('id', questionIds)

    if (questionsError) {
      throw new Error('Failed to fetch questions')
    }

    // Create a map for quick question lookup
    const questionsMap = new Map(questions?.map(q => [q.id, q]) || [])
    
    // Group by subject
    const subjectMap = new Map<string, {
      totalQuestions: number
      correctAnswers: number
      totalTime: number
      chapters: Map<string, { questions: number; correct: number }>
    }>()
    
    answerLogs.forEach(log => {
      const question = questionsMap.get(log.question_id)
      if (!question) return

      const subject = question.book_source
      const chapter = question.chapter_name
      
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, {
          totalQuestions: 0,
          correctAnswers: 0,
          totalTime: 0,
          chapters: new Map()
        })
      }
      
      const subjectData = subjectMap.get(subject)!
      subjectData.totalQuestions++
      subjectData.totalTime += log.time_taken
      
      if (log.status === 'correct') {
        subjectData.correctAnswers++
      }
      
      // Track by chapter
      if (!subjectData.chapters.has(chapter)) {
        subjectData.chapters.set(chapter, { questions: 0, correct: 0 })
      }
      
      const chapterData = subjectData.chapters.get(chapter)!
      chapterData.questions++
      if (log.status === 'correct') {
        chapterData.correct++
      }
    })
    
    // Convert to array format
    return Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      totalQuestions: data.totalQuestions,
      correctAnswers: data.correctAnswers,
      accuracy: data.totalQuestions > 0 ? (data.correctAnswers / data.totalQuestions) * 100 : 0,
      averageTime: data.totalQuestions > 0 ? data.totalTime / data.totalQuestions : 0,
      chapters: Array.from(data.chapters.entries()).map(([chapter, chapterData]) => ({
        chapter,
        questions: chapterData.questions,
        accuracy: chapterData.questions > 0 ? (chapterData.correct / chapterData.questions) * 100 : 0
      }))
    }))
  } catch (error) {
    console.error('Error fetching subject analysis:', error)
    return []
  }
}
