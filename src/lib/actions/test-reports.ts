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
  totalCorrect: number
  totalIncorrect: number
  totalSkipped: number
  answers: StudentAnswer[]
}

export type ScoreDistribution = {
  range: string
  min: number
  max: number
  count: number
  percentage: number
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

// Get score distribution for histogram
export async function getScoreDistribution(testId: number): Promise<ScoreDistribution[]> {
  try {
    const supabase = createAdminClient()
    
    // Get all attempts
    const { data: attempts, error } = await supabase
      .from('test_attempts')
      .select('score')
      .eq('test_id', testId)
    
    if (error || !attempts) {
      console.error('Error fetching attempts:', error)
      return []
    }
    
    // Get total marks
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
    
    // Calculate percentages for each attempt
    const percentages = attempts.map(a => totalMarks > 0 ? (a.score / totalMarks) * 100 : 0)
    
    // Define ranges
    const ranges = [
      { range: '0-10%', min: 0, max: 10 },
      { range: '11-20%', min: 11, max: 20 },
      { range: '21-30%', min: 21, max: 30 },
      { range: '31-40%', min: 31, max: 40 },
      { range: '41-50%', min: 41, max: 50 },
      { range: '51-60%', min: 51, max: 60 },
      { range: '61-70%', min: 61, max: 70 },
      { range: '71-80%', min: 71, max: 80 },
      { range: '81-90%', min: 81, max: 90 },
      { range: '91-100%', min: 91, max: 100 },
    ]
    
    // Count students in each range
    return ranges.map(range => {
      const count = percentages.filter(p => p >= range.min && p <= range.max).length
      const percentage = attempts.length > 0 ? (count / attempts.length) * 100 : 0
      
      return {
        ...range,
        count,
        percentage: Math.round(percentage * 100) / 100
      }
    })
  } catch (error) {
    console.error('Error getting score distribution:', error)
    return []
  }
}

// Get question-by-question analytics
export async function getQuestionAnalytics(testId: number): Promise<QuestionAnalytics[]> {
  try {
    const supabase = createAdminClient()
    
    // Get all test questions
    const { data: testQuestions, error: questionsError } = await supabase
      .from('test_questions')
      .select('question_id')
      .eq('test_id', testId)
      .order('id')
    
    if (questionsError || !testQuestions) {
      console.error('Error fetching test questions:', questionsError)
      return []
    }
    
    // Get all attempts for this test
    const { data: attempts } = await supabase
      .from('test_attempts')
      .select('id')
      .eq('test_id', testId)
    
    const totalParticipants = attempts?.length || 0
    
    if (totalParticipants === 0) {
      return []
    }
    
    // Get question details and analyze each
    const analytics: QuestionAnalytics[] = []
    
    for (let i = 0; i < testQuestions.length; i++) {
      const questionId = testQuestions[i].question_id
      
      // Get question text
      const { data: question } = await supabase
        .from('questions')
        .select('question_text')
        .eq('id', questionId)
        .single()
      
      // Get all answers for this question
      const { data: answers } = await supabase
        .from('test_attempt_answers')
        .select('is_correct, time_spent_seconds')
        .eq('question_id', questionId)
        .in('attempt_id', attempts.map(a => a.id))
      
      const correctCount = answers?.filter(a => a.is_correct).length || 0
      const incorrectCount = answers?.filter(a => !a.is_correct && a.is_correct !== null).length || 0
      const unattemptedCount = totalParticipants - (answers?.length || 0)
      const avgTime = answers && answers.length > 0
        ? Math.round(answers.reduce((sum, a) => sum + a.time_spent_seconds, 0) / answers.length)
        : 0
      
      analytics.push({
        questionId,
        questionNumber: i + 1,
        questionText: question?.question_text?.substring(0, 100) + '...' || `Question ${i + 1}`,
        correctCount,
        incorrectCount,
        unattemptedCount,
        correctnessPercentage: totalParticipants > 0 ? (correctCount / totalParticipants) * 100 : 0,
        averageTimeSeconds: avgTime
      })
    }
    
    return analytics
  } catch (error) {
    console.error('Error getting question analytics:', error)
    return []
  }
}

// Get individual student attempt details
export async function getStudentAttemptDetails(attemptId: number): Promise<StudentAttemptDetails | null> {
  try {
    const supabase = createAdminClient()
    
    // Get attempt with student info
    const { data: attempt, error: attemptError } = await supabase
      .from('test_attempts')
      .select(`
        *,
        user:user_profiles!test_attempts_user_id_fkey(full_name, email)
      `)
      .eq('id', attemptId)
      .single()
    
    if (attemptError || !attempt) {
      console.error('Error fetching attempt:', attemptError)
      return null
    }
    
    // Get all rankings to calculate rank and percentile
    const { data: allAttempts } = await supabase
      .from('test_attempts')
      .select('id, score')
      .eq('test_id', attempt.test_id)
      .order('score', { ascending: false })
    
    const rank = (allAttempts?.findIndex(a => a.id === attemptId) || 0) + 1
    const percentile = allAttempts && allAttempts.length > 1
      ? ((allAttempts.length - rank) / (allAttempts.length - 1)) * 100
      : 100
    
    // Get total marks
    const { data: test } = await supabase
      .from('tests')
      .select('marks_per_correct')
      .eq('id', attempt.test_id)
      .single()
    
    const { count: totalQuestions } = await supabase
      .from('test_questions')
      .select('*', { count: 'exact', head: true })
      .eq('test_id', attempt.test_id)
    
    const totalMarks = (totalQuestions || 0) * (test?.marks_per_correct || 1)
    const percentage = totalMarks > 0 ? (attempt.score / totalMarks) * 100 : 0
    const accuracy = attempt.total_correct + attempt.total_incorrect > 0
      ? (attempt.total_correct / (attempt.total_correct + attempt.total_incorrect)) * 100
      : 0
    
    // Get detailed answers
    const { data: detailedAnswers } = await supabase
      .from('test_attempt_answers')
      .select(`
        *,
        question:questions!test_attempt_answers_question_id_fkey(
          question_text,
          options,
          correct_option
        )
      `)
      .eq('attempt_id', attemptId)
      .order('question_number')
    
    const answers: StudentAnswer[] = detailedAnswers?.map(answer => ({
      questionId: answer.question_id,
      questionNumber: answer.question_number,
      questionText: answer.question?.question_text || '',
      options: answer.question?.options || {},
      userAnswer: answer.selected_option,
      correctAnswer: answer.correct_option,
      isCorrect: answer.is_correct,
      timeSpent: answer.time_spent_seconds,
      marks: answer.marks_awarded
    })) || []
    
    return {
      attemptId,
      studentName: attempt.user?.full_name || 'Unknown Student',
      studentEmail: attempt.user?.email || 'No email',
      score: Math.round(attempt.score * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      rank,
      percentile: Math.round(percentile * 100) / 100,
      totalTime: attempt.time_taken_seconds,
      accuracy: Math.round(accuracy * 100) / 100,
      totalCorrect: attempt.total_correct,
      totalIncorrect: attempt.total_incorrect,
      totalSkipped: attempt.total_skipped,
      answers
    }
  } catch (error) {
    console.error('Error getting student attempt details:', error)
    return null
  }
}

