'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface QuestionStudentDetail {
  userId: string
  studentName: string
  studentEmail: string
  status: 'correct' | 'incorrect' | 'skipped'
  timeTaken: number | null
  userAnswer: string | null
  resultId: number
  submittedAt: string
}

/**
 * Fetches detailed student-level data for a specific question in a test
 * @param testId - The test ID
 * @param questionId - The question ID
 * @returns Array of student details with their answers, status, and time taken
 */
export async function getQuestionStudentDetails(
  testId: number,
  questionId: number
): Promise<QuestionStudentDetail[]> {
  try {
    const supabase = createAdminClient()

    // 1. Get all test results (attempts) for this test
    const { data: testResults, error: resultsError } = await supabase
      .from('test_results')
      .select('id, user_id, submitted_at')
      .eq('mock_test_id', testId)

    if (resultsError || !testResults) {
      console.error('getQuestionStudentDetails: error fetching test_results', resultsError)
      return []
    }

    const resultIds = testResults.map(r => r.id)

    if (resultIds.length === 0) {
      return []
    }

    // 2. Get all answer_log entries for this question from these test results
    const { data: answerLogs, error: logsError } = await supabase
      .from('answer_log')
      .select('result_id, user_id, status, time_taken, user_answer')
      .eq('question_id', questionId)
      .in('result_id', resultIds)

    if (logsError) {
      console.error('getQuestionStudentDetails: error fetching answer_log', logsError)
      return []
    }

    // 3. Get user IDs from answer logs and test results
    const userIds = new Set<string>()
    answerLogs?.forEach(log => {
      if (log.user_id) userIds.add(log.user_id)
    })
    testResults.forEach(result => {
      if (result.user_id) userIds.add(result.user_id)
    })

    // 4. Fetch user profiles for names
    const profileMap = new Map<string, string>()
    if (userIds.size > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('id', Array.from(userIds))

      if (profiles) {
        profiles.forEach(profile => {
          profileMap.set(profile.id, profile.full_name || 'Unknown Student')
        })
      }
    }

    // 5. Fetch emails from auth.users
    const emailMap = new Map<string, string>()
    if (userIds.size > 0) {
      const { data: authUsers } = await supabase.auth.admin.listUsers()
      if (authUsers?.users) {
        authUsers.users.forEach(user => {
          if (userIds.has(user.id)) {
            emailMap.set(user.id, user.email || 'No email')
          }
        })
      }
    }

    // 6. Build a map of result_id -> test result for quick lookup
    const resultMap = new Map<number, { user_id: string; submitted_at: string }>()
    testResults.forEach(result => {
      resultMap.set(result.id, {
        user_id: result.user_id,
        submitted_at: result.submitted_at
      })
    })

    // 7. Build the answer log map: result_id -> answer log entry
    const answerLogMap = new Map<number, typeof answerLogs[0]>()
    answerLogs?.forEach(log => {
      answerLogMap.set(log.result_id, log)
    })

    // 8. Combine data: For each test result, find the answer (if exists) or mark as skipped/not viewed
    const studentDetails: QuestionStudentDetail[] = []

    for (const result of testResults) {
      const answerLog = answerLogMap.get(result.id)
      const userProfile = result.user_id ? profileMap.get(result.user_id) : null
      const userEmail = result.user_id ? emailMap.get(result.user_id) : null

      // Determine status:
      // - If answer_log exists with status, use that status
      // - If answer_log doesn't exist but result exists, it's "not viewed" (different from skipped)
      // - If answer_log exists but status is null/empty, it's "skipped"
      let status: 'correct' | 'incorrect' | 'skipped' = 'skipped'
      let timeTaken: number | null = null
      let userAnswer: string | null = null

      if (answerLog) {
        const answerStatus = (answerLog.status || '').toString().toLowerCase()
        if (answerStatus === 'correct' || answerStatus === 'incorrect') {
          status = answerStatus as 'correct' | 'incorrect'
          timeTaken = answerLog.time_taken != null ? Number(answerLog.time_taken) : null
          userAnswer = answerLog.user_answer || null
        } else {
          // Status is 'skipped' or empty/null
          status = 'skipped'
          timeTaken = answerLog.time_taken != null ? Number(answerLog.time_taken) : null
          userAnswer = null
        }
      } else {
        // No answer log entry - student didn't view/attempt this question
        status = 'skipped'
        timeTaken = null
        userAnswer = null
      }

      studentDetails.push({
        userId: result.user_id,
        studentName: userProfile || 'Unknown Student',
        studentEmail: userEmail || 'No email',
        status,
        timeTaken,
        userAnswer,
        resultId: result.id,
        submittedAt: result.submitted_at
      })
    }

    return studentDetails
  } catch (error) {
    console.error('getQuestionStudentDetails: unexpected error', error)
    return []
  }
}





