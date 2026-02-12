'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type {
  StudentSummary,
  ActivityLogEntry,
  ActivityFeedFilters,
  ActivityFeedPagination,
  ActivityFeedResponse,
  EnrichedTestResult,
  EnrichedBookmark,
  ChapterPerformance,
  TestResult,
  AnswerLog,
  Question,
  EnrichedAnswer,
  BookmarkFilters,
  PerformanceHistory,
  SrsStatus,
  TimingCategory
} from '@/lib/types/analytics'
import { getTimingCategory } from '@/lib/types/analytics'
import { getNuancedPerformanceState, getTargetTime, type PerformanceState } from '@/lib/utils/speed-calculator'

/**
 * Server Actions for Student Analytics
 * Phase 2: Admin Panel Master View - Data Fetching Layer
 */

// ============================================================================
// 1. GET STUDENT SUMMARY
// ============================================================================

/**
 * Fetches high-level summary data for a student
 * Used in the Master View header
 */
export async function getStudentSummary(userId: string): Promise<StudentSummary | null> {
  try {
    const supabase = createAdminClient()
    
    // Calculate total sessions from activity log
    const { count: totalSessions } = await supabase
      .from('student_activity_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('activity_type', ['PRACTICE_SESSION_COMPLETED', 'MOCK_TEST_COMPLETED'])
    
    // Calculate overall accuracy from test results
    const { data: testResults } = await supabase
      .from('test_results')
      .select('score_percentage')
      .eq('user_id', userId)
    
    const overallAccuracy = testResults && testResults.length > 0
      ? testResults.reduce((sum, r) => sum + (r.score_percentage || 0), 0) / testResults.length
      : 0
    
    // Get last activity timestamp
    const { data: lastActivity } = await supabase
      .from('student_activity_log')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    // Fetch user profile if it exists
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    // Fetch user from auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching users:', authError)
    }
    
    const authUsers = authData?.users || []
    const authUser = authUsers.find(user => user.id === userId)
    
    // Build return object with fallbacks
    return {
      id: userId,
      name: profile?.full_name || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || 'Unknown Student',
      email: authUser?.email || profile?.email || 'No email',
      last_active_at: lastActivity?.created_at || null,
      total_sessions: totalSessions || 0,
      overall_accuracy: Math.round(overallAccuracy),
      joined_date: profile?.created_at || authUser?.created_at || new Date().toISOString(),
      profile_picture_url: profile?.profile_picture_url || null
    }
  } catch (error) {
    console.error('Error in getStudentSummary:', error)
    return null
  }
}

// ============================================================================
// 2. GET ACTIVITY FEED
// ============================================================================

/**
 * Fetches paginated activity feed for a student
 * Supports filtering by activity type and date range
 */
export async function getStudentActivityFeed(
  userId: string,
  filters: ActivityFeedFilters = {},
  pagination: ActivityFeedPagination = { page: 1, limit: 20 }
): Promise<ActivityFeedResponse> {
  try {
    if (!userId) {
      console.error('getStudentActivityFeed called with undefined userId')
      return {
        entries: [],
        total_count: 0,
        current_page: pagination.page,
        total_pages: 0
      }
    }
    
    const supabase = createAdminClient()
    
    let query = supabase
      .from('student_activity_log')
      .select('*')
      .eq('user_id', userId)
    
    // Apply activity type filter
    if (filters.activity_type) {
      query = query.eq('activity_type', filters.activity_type)
    }
    
    // Apply date range filter
    if (filters.date_range) {
      query = query
        .gte('created_at', filters.date_range.start)
        .lte('created_at', filters.date_range.end)
    }
    
    // Get total count for pagination
    let countQuery = supabase
      .from('student_activity_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    if (filters.activity_type) {
      countQuery = countQuery.eq('activity_type', filters.activity_type)
    }
    
    if (filters.date_range) {
      countQuery = countQuery
        .gte('created_at', filters.date_range.start)
        .lte('created_at', filters.date_range.end)
    }
    
    const { count: totalCount } = await countQuery
    
    // Apply pagination and sorting
    const { page, limit } = pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data: entries, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to)
    
    if (error) {
      console.error('Error fetching activity feed:', error)
      return {
        entries: [],
        total_count: 0,
        current_page: page,
        total_pages: 0
      }
    }
    
    const totalPages = Math.ceil((totalCount || 0) / limit)
    
    return {
      entries: entries || [],
      total_count: totalCount || 0,
      current_page: page,
      total_pages: totalPages
    }
  } catch (error) {
    console.error('Error in getStudentActivityFeed:', error)
    return {
      entries: [],
      total_count: 0,
      current_page: pagination.page,
      total_pages: 0
    }
  }
}

// ============================================================================
// 3. GET DETAILED TEST RESULT
// ============================================================================

/**
 * Fetches comprehensive test result analysis with enriched answer data
 * Includes per-question timing categories and chapter breakdown
 */
export async function getDetailedTestResult(resultId: number): Promise<EnrichedTestResult | null> {
  try {
    console.log('🔍 getDetailedTestResult: Starting fetch for resultId:', resultId)
    
    if (!resultId || resultId <= 0) {
      console.error('❌ getDetailedTestResult: Invalid resultId:', resultId)
      return null
    }
    
    const supabase = createAdminClient()
    
    // Fetch test result
    console.log('🔍 getDetailedTestResult: Fetching test_results for id:', resultId)
    const { data: testResult, error: testError } = await supabase
      .from('test_results')
      .select('*')
      .eq('id', resultId)
      .single()
    
    if (testError) {
      console.error('❌ getDetailedTestResult: Error fetching test result:', testError)
      console.error('❌ Error details:', {
        message: testError.message,
        code: testError.code,
        hint: testError.hint
      })
      return null
    }
    
    if (!testResult) {
      console.error('❌ getDetailedTestResult: No test result found for id:', resultId)
      return null
    }
    
    console.log('✅ getDetailedTestResult: Found test result:', {
      id: testResult.id,
      user_id: testResult.user_id,
      test_type: testResult.test_type,
      total_questions: testResult.total_questions
    })
    
    // Fetch all answer logs for this test
    console.log('🔍 getDetailedTestResult: Fetching answer_log for result_id:', resultId)
    const { data: answerLogs, error: answerError } = await supabase
      .from('answer_log')
      .select('*')
      .eq('result_id', resultId)
      .order('id', { ascending: true })
    
    if (answerError) {
      console.error('❌ getDetailedTestResult: Error fetching answer logs:', answerError)
      console.error('❌ Error details:', {
        message: answerError.message,
        code: answerError.code,
        hint: answerError.hint
      })
      return null
    }
    
    if (!answerLogs || answerLogs.length === 0) {
      console.warn('⚠️ getDetailedTestResult: No answer logs found for result_id:', resultId)
      console.warn('⚠️ Test result exists but has no answer data')
      return null
    }
    
    console.log('✅ getDetailedTestResult: Found', answerLogs.length, 'answer logs')
    
    // Get unique question IDs
    const questionIds = [...new Set(answerLogs.map(log => log.question_id))]
    console.log('🔍 getDetailedTestResult: Fetching', questionIds.length, 'unique questions')
    
    // Fetch all questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .in('id', questionIds)
    
    if (questionsError) {
      console.error('❌ getDetailedTestResult: Error fetching questions:', questionsError)
      return null
    }
    
    if (!questions || questions.length === 0) {
      console.error('❌ getDetailedTestResult: No questions found for ids:', questionIds)
      return null
    }
    
    console.log('✅ getDetailedTestResult: Found', questions.length, 'questions')
    
    // Create question lookup map
    const questionMap = new Map(questions.map(q => [q.id, q]))
    
    // Enrich answers with question data, timing categories, and performance feedback
    const enrichedAnswers: EnrichedAnswer[] = answerLogs.map(log => {
      const question = questionMap.get(log.question_id)
      if (!question) {
        throw new Error(`Question ${log.question_id} not found`)
      }
      
      // Calculate timing category
      const timingCategory = getTimingCategory(log.time_taken)
      
      // Calculate performance feedback (mirrors Student Portal)
      const difficulty = question.difficulty as 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard' | null | undefined
      const performanceState = getNuancedPerformanceState(
        log.time_taken,
        difficulty,
        log.status as 'correct' | 'incorrect' | 'skipped'
      )
      const targetTime = getTargetTime(difficulty)
      
      return {
        answer_log: log,
        question: question,
        timingCategory: timingCategory,
        isCorrect: log.status === 'correct',
        time_taken_seconds: log.time_taken,
        performanceFeedback: performanceState,
        targetTime: targetTime
      }
    })
    
    // Calculate chapter breakdown
    const chapterPerformance: ChapterPerformance = {}
    
    enrichedAnswers.forEach(({ answer_log, question }) => {
      const chapter = question.chapter_name
      
      if (!chapterPerformance[chapter]) {
        chapterPerformance[chapter] = {
          correct: 0,
          total: 0,
          accuracy: 0
        }
      }
      
      chapterPerformance[chapter].total++
      if (answer_log.status === 'correct') {
        chapterPerformance[chapter].correct++
      }
    })
    
    // Calculate accuracy for each chapter
    Object.keys(chapterPerformance).forEach(chapter => {
      const stats = chapterPerformance[chapter]
      stats.accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
    })
    
    console.log('✅ getDetailedTestResult: Successfully enriched data')
    console.log('✅ Chapter breakdown:', Object.keys(chapterPerformance).length, 'chapters')
    
    return {
      testResult: testResult as unknown as TestResult,
      enrichedAnswers,
      chapterBreakdown: chapterPerformance
    }
  } catch (error) {
    console.error('❌ getDetailedTestResult: Unexpected error:', error)
    if (error instanceof Error) {
      console.error('❌ Error stack:', error.stack)
    }
    return null
  }
}

// ============================================================================
// 4. GET MOCK TEST COMPETITIVE METRICS (MARKS, RANK, PERCENTILE)
// ============================================================================

/**
 * Enhanced function to calculate ALL mock test competitive metrics
 * Follows the exact on-demand calculation logic from Student Portal
 */
export async function getMockTestCompetitiveMetrics(
  testResultId: number,
  userId: string
): Promise<{
  marksObtained: number
  totalMarks: number
  rank: number | null
  percentile: number
  totalTestTakers: number
} | null> {
  try {
    const supabase = createAdminClient()
    
    // Step 1: Fetch test result to get basic data
    const { data: testResult, error: testError } = await supabase
      .from('test_results')
      .select('mock_test_id, score_percentage, total_correct, total_incorrect, total_questions, session_type')
      .eq('id', testResultId)
      .single()
    
    if (testError || !testResult || testResult.session_type !== 'mock_test' || !testResult.mock_test_id) {
      console.warn('⚠️ Not a valid mock test or test result not found')
      return null
    }
    
    const mockTestId = testResult.mock_test_id
    const userScore = testResult.score_percentage || 0
    
    // Step 2: Fetch marking scheme from tests table
    const { data: test, error: testMetadataError } = await supabase
      .from('tests')
      .select('marks_per_correct, negative_marks_per_incorrect')
      .eq('id', mockTestId)
      .single()
    
    if (testMetadataError || !test) {
      console.error('Error fetching test metadata:', testMetadataError)
      return null
    }
    
    // Step 3: Calculate marks using the exact formula from Student Portal
    const marksObtained = (testResult.total_correct * test.marks_per_correct) - 
                          (testResult.total_incorrect * Math.abs(test.negative_marks_per_incorrect))
    const totalMarks = testResult.total_questions * test.marks_per_correct
    
    console.log('📊 Calculated marks:', { marksObtained, totalMarks })
    
    // Step 4: Fetch all results for rank and percentile calculation
    const { data: allTestResults, error: rankError } = await supabase
      .from('test_results')
      .select('user_id, score_percentage')
      .eq('mock_test_id', mockTestId)
      .eq('session_type', 'mock_test')
      .order('score_percentage', { ascending: false })
    
    if (rankError) {
      console.error('Error fetching rank data:', rankError)
      return null
    }
    
    if (!allTestResults || allTestResults.length === 0) {
      console.warn('No test results found for mock test:', mockTestId)
      return null
    }
    
    const totalTestTakers = allTestResults.length
    
    // Step 5: Calculate rank (findIndex + 1)
    const userRank = allTestResults.findIndex((result: any) => result.user_id === userId) + 1
    
    // Step 6: Calculate percentile using exact Student Portal formula
    const usersWithLowerScore = allTestResults.filter((result: any) => 
      result.score_percentage < userScore
    ).length
    
    const percentile = totalTestTakers > 1 
      ? Math.round((usersWithLowerScore / totalTestTakers) * 100)
      : 100
    
    console.log(`📈 User ${userId} metrics:`, {
      marksObtained,
      totalMarks,
      rank: userRank > 0 ? userRank : null,
      percentile,
      totalTestTakers
    })
    
    return {
      marksObtained,
      totalMarks,
      rank: userRank > 0 ? userRank : null,
      percentile,
      totalTestTakers
    }
  } catch (error) {
    console.error('Error in getMockTestCompetitiveMetrics:', error)
    return null
  }
}

/**
 * Fetches marking scheme for a mock test
 * Server action for use in client components
 */
export async function fetchMockTestMarkingScheme(mockTestId: number): Promise<{
  marksPerCorrect: number
  negativeMarksPerIncorrect: number
  testName?: string
} | null> {
  try {
    const supabase = createAdminClient()
    
    const { data: testData, error } = await supabase
      .from('tests')
      .select('marks_per_correct, negative_marks_per_incorrect, name')
      .eq('id', mockTestId)
      .single()
    
    if (error || !testData) {
      console.error('Error fetching marking scheme:', error)
      return null
    }
    
    return {
      marksPerCorrect: testData.marks_per_correct,
      negativeMarksPerIncorrect: testData.negative_marks_per_incorrect,
      testName: testData.name
    }
  } catch (error) {
    console.error('Error in fetchMockTestMarkingScheme:', error)
    return null
  }
}

// Legacy function - kept for backward compatibility but now uses new function
// ============================================================================
// 4. GET MOCK TEST LEADERBOARD DATA (RANK & PERCENTILE)
// ============================================================================

/**
 * Fetches rank and percentile for a student's mock test result
 * Calculated by comparing against all participants for that specific test
 */
export async function getMockTestLeaderboardData(
  testResultId: number,
  userId: string
): Promise<{ rank: number | null; percentile: number | null; totalParticipants: number } | null> {
  try {
    const supabase = createAdminClient()
    
    // Fetch the test result to get mock_test_id and score_percentage
    const { data: testResult, error: testError } = await supabase
      .from('test_results')
      .select('mock_test_id, score_percentage, session_type')
      .eq('id', testResultId)
      .single()
    
    if (testError || !testResult || testResult.session_type !== 'mock_test' || !testResult.mock_test_id) {
      console.warn('⚠️ Not a valid mock test or test result not found')
      return null
    }
    
    const mockTestId = testResult.mock_test_id
    const userScore = testResult.score_percentage || 0
    
    // Fetch all test results for this mock test, ordered by score
    const { data: allTestResults, error: rankError } = await supabase
      .from('test_results')
      .select('user_id, score_percentage')
      .eq('mock_test_id', mockTestId)
      .eq('session_type', 'mock_test')
      .order('score_percentage', { ascending: false })
    
    if (rankError) {
      console.error('Error fetching rank data:', rankError)
      return null
    }
    
    if (!allTestResults || allTestResults.length === 0) {
      console.warn('No test results found for mock test:', mockTestId)
      return null
    }
    
    const totalParticipants = allTestResults.length
    
    // Calculate rank: find index of current user + 1
    const userRank = allTestResults.findIndex((result: any) => result.user_id === userId) + 1
    
    // Calculate percentile: (users with lower score / total participants) * 100
    const usersWithLowerScore = allTestResults.filter((result: any) => 
      result.score_percentage < userScore
    ).length
    
    const percentile = totalParticipants > 1 
      ? Math.round((usersWithLowerScore / totalParticipants) * 100) 
      : 100
    
    return {
      rank: userRank > 0 ? userRank : null,
      percentile,
      totalParticipants
    }
  } catch (error) {
    console.error('Error in getMockTestLeaderboardData:', error)
    return null
  }
}

// ============================================================================
// 5. GET REVISION HUB MIRROR DATA
// ============================================================================

/**
 * Fetches enriched bookmark data for the Revision Hub Mirror
 * Includes performance history and SRS status for each bookmark
 */
export async function getStudentRevisionHubMirrorData(
  userId: string,
  filters: BookmarkFilters = {}
): Promise<EnrichedBookmark[]> {
  try {
    if (!userId) {
      console.error('getStudentRevisionHubMirrorData called with undefined userId')
      return []
    }
    
    const supabase = createAdminClient()
    
    // Build query for bookmarks
    let bookmarkQuery = supabase
      .from('bookmarked_questions')
      .select('*')
      .eq('user_id', userId)
    
    // Apply chapter filter
    if (filters.chapter) {
      // Need to join with questions table for chapter filtering
      bookmarkQuery = bookmarkQuery.eq('question_id', filters.chapter)
    }
    
    // Fetch bookmarks
    const { data: bookmarks, error: bookmarkError } = await bookmarkQuery
    
    if (bookmarkError) {
      console.error('Error fetching bookmarks:', bookmarkError)
      return []
    }
    
    if (!bookmarks || bookmarks.length === 0) {
      // No bookmarks found - this is not an error, just empty state
      return []
    }
    
    // Get question IDs
    const questionIds = bookmarks.map(b => b.question_id)
    
    // Fetch questions for these bookmarks
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .in('question_id', questionIds)
    
    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      return []
    }
    
    if (!questions || questions.length === 0) {
      // No questions found - not an error
      return []
    }
    
    // Create question lookup map
    const questionMap = new Map(questions.map(q => [q.question_id, q]))
    
    // Fetch answer logs for these question IDs
    // Note: answer_log uses the numeric id column, not question_id
    const questionNumericIds = questions.map(q => q.id)
    
    const { data: answerLogs } = await supabase
      .from('answer_log')
      .select('*')
      .in('question_id', questionNumericIds)
      .eq('user_id', userId)
    
    // Create answer log map by question_id (text)
    const answerLogMap = new Map<string, AnswerLog[]>()
    
    answerLogs?.forEach(log => {
      const question = questions.find(q => q.id === log.question_id)
      if (question) {
        const logs = answerLogMap.get(question.question_id) || []
        logs.push(log)
        answerLogMap.set(question.question_id, logs)
      }
    })
    
    // Enrich each bookmark
    const enrichedBookmarks: EnrichedBookmark[] = bookmarks
      .map(bookmark => {
        const question = questionMap.get(bookmark.question_id)
        if (!question) return null
        
        const attempts = answerLogMap.get(bookmark.question_id) || []
        
        // Calculate performance history
        const correctAttempts = attempts.filter(a => a.status === 'correct').length
        const successRate = attempts.length > 0 ? (correctAttempts / attempts.length) * 100 : 0
        
        // Determine recent trend
        const recentAttempts = attempts.slice(-3)
        const recentSuccessRate = recentAttempts.length > 0
          ? recentAttempts.filter(a => a.status === 'correct').length / recentAttempts.length * 100
          : 0
        
        let recentTrend: 'improving' | 'declining' | 'stable' = 'stable'
        if (recentAttempts.length >= 2) {
          const lastThree = attempts.slice(-3)
          if (lastThree.length >= 2) {
            const lastTwo = lastThree.slice(-2)
            const lastTwoSuccess = lastTwo.filter(a => a.status === 'correct').length / lastTwo.length
            const overallSuccess = correctAttempts / attempts.length
            
            if (lastTwoSuccess > overallSuccess * 1.1) recentTrend = 'improving'
            else if (lastTwoSuccess < overallSuccess * 0.9) recentTrend = 'declining'
          }
        }
        
        // Calculate average time
        const avgTime = attempts.length > 0
          ? attempts.reduce((sum, a) => sum + a.time_taken, 0) / attempts.length
          : 0
        
        const performanceHistory: PerformanceHistory = {
          total_attempts: attempts.length,
          correct_attempts: correctAttempts,
          success_rate: Math.round(successRate * 100) / 100,
          recent_trend: recentTrend,
          attempts: attempts
            .filter(a => a.status !== 'skipped')
            .map(a => ({
              date: a.created_at,
              result: a.status as 'correct' | 'incorrect',
              time_taken: a.time_taken
            })),
          average_time: Math.round(avgTime)
        }
        
        // Extract SRS status
        const srsStatus: SrsStatus = {
          srs_repetitions: bookmark.srs_repetitions || 0,
          srs_ease_factor: bookmark.srs_ease_factor || 2.5,
          srs_interval: bookmark.srs_interval || 0,
          next_review_date: bookmark.next_review_date,
          is_custom_reminder_active: bookmark.is_custom_reminder_active || false,
          custom_next_review_date: bookmark.custom_next_review_date
        }
        
        // Apply filters
        if (filters.difficulty && question.difficulty !== filters.difficulty) {
          return null
        }
        
        if (filters.tags && filters.tags.length > 0) {
          const bookmarkTags = bookmark.custom_tags || []
          if (!filters.tags.some(tag => bookmarkTags.includes(tag))) {
            return null
          }
        }
        
        if (filters.srs_status && filters.srs_status !== 'all') {
          const now = new Date()
          const nextReview = srsStatus.next_review_date 
            ? new Date(srsStatus.next_review_date) 
            : null
          const isDue = nextReview ? nextReview <= now : false
          
          if (filters.srs_status === 'due' && !isDue) return null
          if (filters.srs_status === 'not_due' && isDue) return null
        }
        
        return {
          bookmark: bookmark as unknown as any,
          question: question as unknown as Question,
          performanceHistory,
          srsStatus
        }
      })
      .filter((bookmark): bookmark is EnrichedBookmark => bookmark !== null)
    
    return enrichedBookmarks
  } catch (error) {
    console.error('Error in getStudentRevisionHubMirrorData:', error)
    return []
  }
}

