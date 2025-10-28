'use server'

import { createAdminClient } from '@/lib/supabase/admin'

// Types for test reports
export type TestOverviewStats = {
  totalParticipants: number
  averageScore: number
  averagePercentage: number
  averageTimeSeconds: number
  highestScore: number
  highestPercentage: number
  lowestScore: number
  lowestPercentage: number
  medianScore: number
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

// Enhanced analytics types
export type EnhancedQuestionAnalytics = {
  questionId: number
  questionNumber: number
  questionText: string
  topic: string
  difficulty: string | null
  correctCount: number
  incorrectCount: number
  unattemptedCount: number
  correctnessPercentage: number
  averageTimeSeconds: number
  averageTimeCorrect: number
  averageTimeIncorrect: number
  // Phase 2: Discrimination Index will be added here
}

export type TopicPerformance = {
  topicName: string
  questionCount: number
  averageAccuracy: number
}

export type DifficultyPerformance = {
  difficulty: string
  questionCount: number
  averageAccuracy: number
}

export type TimeVsScoreDataPoint = {
  studentName: string
  timeSeconds: number
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
    
    // Get all test attempts for this test (use test_results for mock tests)
    const { data: attempts, error: attemptsError } = await supabase
      .from('test_results')
      .select('score, score_percentage, total_time_taken')
      .eq('mock_test_id', testId)
    
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
        highestPercentage: 0,
        lowestScore: 0,
        lowestPercentage: 0,
        medianScore: 0,
        totalMarks: 0
      }
    }
    
    // score_percentage is already calculated in test_results
    const percentages = attempts.map((a: any) => a.score_percentage || 0)
    const scores = attempts.map((a: any) => a.score || 0)
    const times = attempts.map((a: any) => a.total_time_taken || 0)
    
    const totalParticipants = attempts.length
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / totalParticipants
    const averagePercentage = percentages.reduce((sum, p) => sum + p, 0) / totalParticipants
    const highestScore = Math.max(...scores)
    const lowestScore = Math.min(...scores)
    const averageTimeSeconds = times.reduce((sum, t) => sum + t, 0) / totalParticipants
    
    // Calculate median score
    const sortedScores = [...scores].sort((a, b) => a - b)
    const medianScore = totalParticipants % 2 === 0
      ? (sortedScores[totalParticipants / 2 - 1] + sortedScores[totalParticipants / 2]) / 2
      : sortedScores[Math.floor(totalParticipants / 2)]
    
    // Get total questions to calculate total marks
    const { count: totalQuestions } = await supabase
      .from('test_questions')
      .select('*', { count: 'exact', head: true })
      .eq('test_id', testId)
    
    const totalMarks = (totalQuestions || 0) * test.marks_per_correct
    
    // Calculate highest and lowest percentages
    const highestPercentage = Math.max(...percentages)
    const lowestPercentage = Math.min(...percentages)
    
    return {
      totalParticipants,
      averageScore: Math.round(averageScore * 100) / 100,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      averageTimeSeconds: Math.round(averageTimeSeconds),
      highestScore: Math.round(highestScore * 100) / 100,
      highestPercentage: Math.round(highestPercentage * 100) / 100,
      lowestScore: Math.round(lowestScore * 100) / 100,
      lowestPercentage: Math.round(lowestPercentage * 100) / 100,
      medianScore: Math.round(medianScore * 100) / 100,
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
    
    // Get all attempts with user info (use test_results for mock tests)
    const { data: attempts, error } = await supabase
      .from('test_results')
      .select('id, user_id, score, score_percentage, total_time_taken')
      .eq('mock_test_id', testId)
      .order('score', { ascending: false })
      .order('total_time_taken', { ascending: true })
    
    if (error || !attempts) {
      console.error('Error fetching rankings:', error)
      return []
    }
    
    // Get user details
    const userIds = attempts.map((a: any) => a.user_id)
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .in('id', userIds)
    
    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || [])
    
    // Build rankings (score_percentage is already calculated in the database)
    return attempts.map((attempt: any, index: number) => {
      const profile = profileMap.get(attempt.user_id)
      const percentage = attempt.score_percentage || 0
      
      return {
        rank: index + 1,
        userId: attempt.user_id,
        studentName: profile?.full_name || 'Unknown Student',
        studentEmail: profile?.email || 'No email',
        score: Math.round(attempt.score * 100) / 100,
        percentage: Math.round(percentage * 100) / 100,
        timeSeconds: attempt.total_time_taken || 0,
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
    
    // Get all attempts (use test_results for mock tests)
    const { data: attempts, error } = await supabase
      .from('test_results')
      .select('score_percentage')
      .eq('mock_test_id', testId)
    
    if (error || !attempts) {
      console.error('Error fetching attempts:', error)
      return []
    }
    
    // Use score_percentage which is already calculated in test_results
    const percentages = attempts.map((a: any) => a.score_percentage || 0)
    
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
        .in('attempt_id', (attempts ?? []).map(a => a.id))
      
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

// Get enhanced question analytics with topic and difficulty data
export async function getEnhancedQuestionAnalytics(testId: number): Promise<EnhancedQuestionAnalytics[]> {
  try {
    const supabase = createAdminClient()
    
    // Get all test questions with question details
    const { data: testQuestions, error: questionsError } = await supabase
      .from('test_questions')
      .select(`
        question_id,
        questions (
          id,
          question_text,
          chapter_name,
          book_source,
          difficulty
        )
      `)
      .eq('test_id', testId)
      .order('id')
    
    if (questionsError || !testQuestions) {
      console.error('Error fetching test questions:', questionsError)
      return []
    }
    
    // Get all attempts for this test (use test_results for mock tests)
    const { data: attempts } = await supabase
      .from('test_results')
      .select('id')
      .eq('mock_test_id', testId)
    
    if (!attempts || attempts.length === 0) {
      return []
    }
    
    const attemptIds = attempts.map(a => a.id)
    const totalParticipants = attempts.length
    
    // Get all answers from answer_log for these attempts
    const { data: allAnswers, error: answersError } = await supabase
      .from('answer_log')
      .select('question_id, status, time_taken')
      .in('user_id', attempts.map((a: any) => a.user_id))
      .eq('test_id', testId)
    
    if (answersError || !allAnswers) {
      console.error('Error fetching answers:', answersError)
      return []
    }
    
    // Group answers by question_id
    const answersByQuestion = new Map<number, typeof allAnswers>()
    for (const answer of allAnswers) {
      if (!answersByQuestion.has(answer.question_id)) {
        answersByQuestion.set(answer.question_id, [])
      }
      answersByQuestion.get(answer.question_id)!.push(answer)
    }
    
    // Calculate analytics for each question
    const analytics: EnhancedQuestionAnalytics[] = []
    
    for (let i = 0; i < testQuestions.length; i++) {
      const testQuestion = testQuestions[i]
      const question = Array.isArray(testQuestion.questions) 
        ? testQuestion.questions[0] 
        : testQuestion.questions
      
      if (!question) continue
      
      const questionId = question.id
      const answers = answersByQuestion.get(questionId) || []
      
      const correctAnswers = answers.filter((a: any) => a.status === 'correct')
      const incorrectAnswers = answers.filter((a: any) => a.status === 'incorrect')
      const unattempted = totalParticipants - answers.length
      
      const correctCount = correctAnswers.length
      const incorrectCount = incorrectAnswers.length
      
      const correctnessPercentage = totalParticipants > 0 
        ? (correctCount / totalParticipants) * 100 
        : 0
      
      const averageTimeSeconds = answers.length > 0
        ? Math.round(answers.reduce((sum: number, a: any) => sum + (a.time_taken || 0), 0) / answers.length)
        : 0
      
      const averageTimeCorrect = correctAnswers.length > 0
        ? Math.round(correctAnswers.reduce((sum: number, a: any) => sum + (a.time_taken || 0), 0) / correctAnswers.length)
        : 0
      
      const averageTimeIncorrect = incorrectAnswers.length > 0
        ? Math.round(incorrectAnswers.reduce((sum: number, a: any) => sum + (a.time_taken || 0), 0) / incorrectAnswers.length)
        : 0
      
      analytics.push({
        questionId,
        questionNumber: i + 1,
        questionText: question.question_text || '',
        topic: question.chapter_name || question.book_source || 'Unknown',
        difficulty: question.difficulty,
        correctCount,
        incorrectCount,
        unattemptedCount: unattempted,
        correctnessPercentage: Math.round(correctnessPercentage * 10) / 10,
        averageTimeSeconds,
        averageTimeCorrect,
        averageTimeIncorrect
      })
    }
    
    return analytics
  } catch (error) {
    console.error('Error getting enhanced question analytics:', error)
    return []
  }
}

// Get topic performance analysis
export async function getTopicAnalysis(testId: number): Promise<TopicPerformance[]> {
  try {
    const questionAnalytics = await getEnhancedQuestionAnalytics(testId)
    
    if (questionAnalytics.length === 0) {
      return []
    }
    
    // Group by topic
    const topicMap = new Map<string, { totalAccuracy: number; count: number }>()
    
    for (const question of questionAnalytics) {
      const topic = question.topic
      if (!topicMap.has(topic)) {
        topicMap.set(topic, { totalAccuracy: 0, count: 0 })
      }
      
      const topicData = topicMap.get(topic)!
      topicData.totalAccuracy += question.correctnessPercentage
      topicData.count += 1
    }
    
    // Calculate averages and create result array
    const topicPerformance: TopicPerformance[] = []
    
    for (const [topicName, data] of topicMap.entries()) {
      topicPerformance.push({
        topicName,
        questionCount: data.count,
        averageAccuracy: Math.round((data.totalAccuracy / data.count) * 10) / 10
      })
    }
    
    // Sort by average accuracy (ascending) to show weakest topics first
    topicPerformance.sort((a, b) => a.averageAccuracy - b.averageAccuracy)
    
    return topicPerformance
  } catch (error) {
    console.error('Error getting topic analysis:', error)
    return []
  }
}

// Get difficulty performance analysis
export async function getDifficultyAnalysis(testId: number): Promise<DifficultyPerformance[]> {
  try {
    const questionAnalytics = await getEnhancedQuestionAnalytics(testId)
    
    if (questionAnalytics.length === 0) {
      return []
    }
    
    // Group by difficulty
    const difficultyMap = new Map<string, { totalAccuracy: number; count: number }>()
    
    for (const question of questionAnalytics) {
      const difficulty = question.difficulty || 'Not Specified'
      if (!difficultyMap.has(difficulty)) {
        difficultyMap.set(difficulty, { totalAccuracy: 0, count: 0 })
      }
      
      const diffData = difficultyMap.get(difficulty)!
      diffData.totalAccuracy += question.correctnessPercentage
      diffData.count += 1
    }
    
    // Calculate averages and create result array
    const difficultyPerformance: DifficultyPerformance[] = []
    
    for (const [difficulty, data] of difficultyMap.entries()) {
      difficultyPerformance.push({
        difficulty,
        questionCount: data.count,
        averageAccuracy: Math.round((data.totalAccuracy / data.count) * 10) / 10
      })
    }
    
    // Sort by difficulty order
    const difficultyOrder = ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard', 'Not Specified']
    difficultyPerformance.sort((a, b) => {
      const aIndex = difficultyOrder.indexOf(a.difficulty)
      const bIndex = difficultyOrder.indexOf(b.difficulty)
      return aIndex - bIndex
    })
    
    return difficultyPerformance
  } catch (error) {
    console.error('Error getting difficulty analysis:', error)
    return []
  }
}

// Get time vs score data for scatter plot
export async function getTimeVsScoreData(testId: number): Promise<TimeVsScoreDataPoint[]> {
  try {
    const supabase = createAdminClient()
    
    // Get all attempts with user information (use test_results for mock tests)
    const { data: attempts, error } = await supabase
      .from('test_results')
      .select('score_percentage, total_time_taken, user_id')
      .eq('mock_test_id', testId)
    
    if (error || !attempts) {
      console.error('Error fetching attempts for scatter plot:', error)
      return []
    }
    
    // Get user names separately
    const userIds = attempts.map((a: any) => a.user_id)
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .in('id', userIds)
    
    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || [])
    
    // Use score_percentage which is already calculated in test_results
    return attempts.map((attempt: any) => {
      const profile = profileMap.get(attempt.user_id)
      return {
        studentName: profile?.full_name || 'Unknown',
        timeSeconds: attempt.total_time_taken || 0,
        percentage: attempt.score_percentage || 0
      }
    })
  } catch (error) {
    console.error('Error getting time vs score data:', error)
    return []
  }
}

// Get performance funnel metrics
export async function getPerformanceFunnelMetrics(testId: number): Promise<{
  totalQuestions: number
  averageAttempted: number
  averageAccuracy: number
}> {
  try {
    const supabase = createAdminClient()
    
    // Get total questions
    const { count: totalQuestions } = await supabase
      .from('test_questions')
      .select('*', { count: 'exact', head: true })
      .eq('test_id', testId)
    
    // Get all attempts (use test_results for mock tests)
    const { data: attempts } = await supabase
      .from('test_results')
      .select('total_correct, total_incorrect, total_skipped')
      .eq('mock_test_id', testId)
    
    if (!attempts || attempts.length === 0) {
      return {
        totalQuestions: totalQuestions || 0,
        averageAttempted: 0,
        averageAccuracy: 0
      }
    }
    
    // Calculate average attempted (total - skipped)
    const averageAttempted = attempts.reduce((sum, attempt) => {
      const attempted = (totalQuestions || 0) - attempt.total_skipped
      return sum + attempted
    }, 0) / attempts.length
    
    // Calculate average accuracy on attempted questions
    const averageAccuracy = attempts.reduce((sum, attempt) => {
      const attempted = attempt.total_correct + attempt.total_incorrect
      const accuracy = attempted > 0 ? (attempt.total_correct / attempted) * 100 : 0
      return sum + accuracy
    }, 0) / attempts.length
    
    return {
      totalQuestions: totalQuestions || 0,
      averageAttempted: Math.round(averageAttempted * 10) / 10,
      averageAccuracy: Math.round(averageAccuracy * 10) / 10
    }
  } catch (error) {
    console.error('Error getting performance funnel metrics:', error)
    return {
      totalQuestions: 0,
      averageAttempted: 0,
      averageAccuracy: 0
    }
  }
}

