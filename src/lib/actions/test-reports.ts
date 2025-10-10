'use server'

import { createAdminClient } from '@/lib/supabase/admin'

// Types for test reports
export type TestOverviewStats = {
  totalParticipants: number
  averageScore: number
  averagePercentage: number
  averageTimeSeconds: number
  highestScore: number
  lowestScore: number
  totalMarks: number
}

export type QuestionAnalytics = {
  questionId: number
  questionNumber: number
  questionText: string
  correctCount: number
  incorrectCount: number
  unattemptedCount: number
  correctnessPercentage: number
  averageTimeSeconds: number
}

export type StudentRanking = {
  rank: number
  userId: string
  studentName: string
  studentEmail: string
  score: number
  percentage: number
  timeSeconds: number
  attemptId: number
}

export type StudentAnswer = {
  questionId: number
  questionNumber: number
  questionText: string
  options: Record<string, string>
  userAnswer: string | null
  correctAnswer: string
  isCorrect: boolean
  timeSpent: number
  marks: number
}

export type StudentAttemptDetails = {
  attemptId: number
  studentName: string
  studentEmail: string
  score: number
  percentage: number
  rank: number
  percentile: number
  totalTime: number
  accuracy: number
  answers: StudentAnswer[]
}

// Get test overview statistics
export async function getTestOverviewStats(testId: number): Promise<TestOverviewStats | null> {
  try {
    const supabase = createAdminClient()
    
    // Get test details
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('marks_per_correct')
      .eq('id', testId)
      .single()
    
    if (testError || !test) {
      console.error('Error fetching test:', testError)
      return null
    }
    
    // Get all test attempts for this test
    const { data: attempts, error: attemptsError } = await supabase
      .from('test_attempts')
      .select('score, time_taken_seconds')
      .eq('test_id', testId)
    
    if (attemptsError) {
      console.error('Error fetching attempts:', attemptsError)
      return null
    }
    
    if (!attempts || attempts.length === 0) {
      return {
        totalParticipants: 0,
        averageScore: 0,
        averagePercentage: 0,
        averageTimeSeconds: 0,
        highestScore: 0,
        lowestScore: 0,
        totalMarks: 0
      }
    }
    
    const scores = attempts.map(a => a.score)
    const times = attempts.map(a => a.time_taken_seconds)
    
    const totalParticipants = attempts.length
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / totalParticipants
    const highestScore = Math.max(...scores)
    const lowestScore = Math.min(...scores)
    const averageTimeSeconds = times.reduce((sum, t) => sum + t, 0) / totalParticipants
    
    // Get total questions to calculate total marks
    const { count: totalQuestions } = await supabase
      .from('test_questions')
      .select('*', { count: 'exact', head: true })
      .eq('test_id', testId)
    
    const totalMarks = (totalQuestions || 0) * test.marks_per_correct
    const averagePercentage = totalMarks > 0 ? (averageScore / totalMarks) * 100 : 0
    
    return {
      totalParticipants,
      averageScore: Math.round(averageScore * 100) / 100,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      averageTimeSeconds: Math.round(averageTimeSeconds),
      highestScore: Math.round(highestScore * 100) / 100,
      lowestScore: Math.round(lowestScore * 100) / 100,
      totalMarks
    }
  } catch (error) {
    console.error('Error getting test overview stats:', error)
    return null
  }
}

// Get student rankings for a test
export async function getTestRankings(testId: number): Promise<StudentRanking[]> {
  try {
    const supabase = createAdminClient()
    
    // Get all attempts with user info
    const { data: attempts, error } = await supabase
      .from('test_attempts')
      .select(`
        id,
        user_id,
        score,
        time_taken_seconds
      `)
      .eq('test_id', testId)
      .order('score', { ascending: false })
      .order('time_taken_seconds', { ascending: true })
    
    if (error || !attempts) {
      console.error('Error fetching rankings:', error)
      return []
    }
    
    // Get total marks for percentage calculation
    const { data: test } = await supabase
      .from('tests')
      .select('marks_per_correct')
      .eq('id', testId)
      .single()
    
    const { count: totalQuestions } = await supabase
      .from('test_questions')
      .select('*', { count: 'exact', head: true })
      .eq('test_id', testId)
    
    const totalMarks = (totalQuestions || 0) * (test?.marks_per_correct || 1)
    
    // Get user details
    const userIds = attempts.map(a => a.user_id)
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .in('id', userIds)
    
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
    
    // Build rankings
    return attempts.map((attempt, index) => {
      const profile = profileMap.get(attempt.user_id)
      const percentage = totalMarks > 0 ? (attempt.score / totalMarks) * 100 : 0
      
      return {
        rank: index + 1,
        userId: attempt.user_id,
        studentName: profile?.full_name || 'Unknown Student',
        studentEmail: profile?.email || 'No email',
        score: Math.round(attempt.score * 100) / 100,
        percentage: Math.round(percentage * 100) / 100,
        timeSeconds: attempt.time_taken_seconds,
        attemptId: attempt.id
      }
    })
  } catch (error) {
    console.error('Error getting test rankings:', error)
    return []
  }
}

