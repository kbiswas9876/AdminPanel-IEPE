'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getStudentProfile, getStudentTestAttempts, getStudentAnalytics } from './student-analytics'
import { getStudentNotesWithAdmin } from './studentAdminActions'
import type { StudentExportData } from '@/lib/types/studentAdmin'
import Papa from 'papaparse'

/**
 * Export student data in JSON or CSV format
 */
export async function exportStudentData(
  userId: string,
  format: 'json' | 'csv',
  adminId: string
): Promise<{ 
  success: boolean; 
  data?: string; 
  fileName?: string; 
  message?: string 
}> {
  try {
    const supabase = createAdminClient()
    
    // 1. Get Profile Data
    const profile = await getStudentProfile(userId)
    if (!profile) {
      return {
        success: false,
        message: 'Student profile not found'
      }
    }
    
    // 2. Get Test Attempts
    const testAttempts = await getStudentTestAttempts(userId)
    
    // 3. Get Analytics
    const analytics = await getStudentAnalytics(userId)
    
    // 4. Get Activity Timeline
    const { data: activities } = await supabase
      .from('student_activity_log')
      .select('activity_type, created_at, metadata')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100) // Last 100 activities
    
    // 5. Get Revision Hub Data
    const { data: bookmarks } = await supabase
      .from('bookmarked_questions')
      .select('question_id, chapter_name, srs_interval, srs_ease_factor, created_at')
      .eq('user_id', userId)
    
    // Calculate mastery distribution
    let learning = 0, maturing = 0, mastered = 0
    bookmarks?.forEach(bookmark => {
      const interval = bookmark.srs_interval || 0
      if (interval < 7) {
        learning++
      } else if (interval <= 30) {
        maturing++
      } else {
        mastered++
      }
    })
    
    const revisionHubData = {
      totalBookmarks: bookmarks?.length || 0,
      masteryDistribution: {
        learning,
        maturing,
        mastered
      },
      bookmarks: bookmarks?.slice(0, 50) || [] // Limit to 50 most recent
    }
    
    // 6. Get Admin Notes
    const notes = await getStudentNotesWithAdmin(userId)
    
    // Construct export data
    const exportData: StudentExportData = {
      profile: {
        id: profile.id,
        full_name: profile.full_name || 'No name',
        email: profile.email || 'No email',
        status: profile.status,
        role: profile.role,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      },
      analytics: {
        totalTests: analytics.totalTests,
        averageScore: analytics.averageScore,
        averageAccuracy: analytics.averageAccuracy,
        totalCorrect: analytics.totalCorrect,
        totalIncorrect: analytics.totalIncorrect,
        totalSkipped: analytics.totalSkipped,
        totalTimeSpent: analytics.totalTimeSpent,
        bestScore: analytics.bestScore,
        worstScore: analytics.worstScore
      },
      testAttempts: testAttempts.map(attempt => ({
        id: attempt.id,
        test_name: attempt.tests.name,
        score: attempt.score,
        total_correct: attempt.total_correct,
        total_incorrect: attempt.total_incorrect,
        total_skipped: attempt.total_skipped,
        time_taken_seconds: attempt.time_taken_seconds,
        completed_at: attempt.completed_at,
        test_type: attempt.tests.description
      })),
      revisionHub: revisionHubData,
      activityTimeline: activities?.map(a => ({
        activity_type: a.activity_type,
        created_at: a.created_at,
        metadata: a.metadata || {}
      })) || [],
      adminNotes: notes
    }
    
    // Format data based on export format
    let data: string
    let fileName: string
    let mimeType: string
    
    if (format === 'json') {
      data = JSON.stringify(exportData, null, 2)
      fileName = `student_${profile.full_name || profile.id}_export_${new Date().toISOString().split('T')[0]}.json`
      mimeType = 'application/json'
    } else {
      // CSV format - flatten the data
      const csvData = [
        // Profile
        ['Profile Information'],
        ['Field', 'Value'],
        ['ID', exportData.profile.id],
        ['Full Name', exportData.profile.full_name],
        ['Email', exportData.profile.email],
        ['Status', exportData.profile.status],
        ['Role', exportData.profile.role],
        ['Created At', exportData.profile.created_at],
        [''],
        
        // Analytics
        ['Analytics'],
        ['Metric', 'Value'],
        ['Total Tests', exportData.analytics.totalTests],
        ['Average Score', exportData.analytics.averageScore],
        ['Average Accuracy', exportData.analytics.averageAccuracy],
        ['Total Correct', exportData.analytics.totalCorrect],
        ['Total Incorrect', exportData.analytics.totalIncorrect],
        ['Total Skipped', exportData.analytics.totalSkipped],
        ['Best Score', exportData.analytics.bestScore],
        ['Worst Score', exportData.analytics.worstScore],
        [''],
        
        // Test Attempts
        ['Test Attempts'],
        ['Test Name', 'Score', 'Correct', 'Incorrect', 'Skipped', 'Time (sec)', 'Completed At'],
        ...exportData.testAttempts.map(attempt => [
          attempt.test_name,
          attempt.score,
          attempt.total_correct,
          attempt.total_incorrect,
          attempt.total_skipped,
          attempt.time_taken_seconds,
          attempt.completed_at
        ]),
        [''],
        
        // Revision Hub
        ['Revision Hub'],
        ['Metric', 'Value'],
        ['Total Bookmarks', exportData.revisionHub.totalBookmarks],
        ['Learning', exportData.revisionHub.masteryDistribution.learning],
        ['Maturing', exportData.revisionHub.masteryDistribution.maturing],
        ['Mastered', exportData.revisionHub.masteryDistribution.mastered],
        [''],
        
        // Admin Notes
        ['Admin Notes'],
        ['Note', 'Admin Name', 'Admin Email', 'Created At'],
        ...notes.map(note => [
          note.note,
          note.admin_name || 'Unknown',
          note.admin_email || 'Unknown',
          note.created_at
        ])
      ]
      
      data = Papa.unparse(csvData)
      fileName = `student_${profile.full_name || profile.id}_export_${new Date().toISOString().split('T')[0]}.csv`
      mimeType = 'text/csv'
    }
    
    // Log export to activity log
    const supabaseAdmin = createAdminClient()
    await supabaseAdmin
      .from('student_activity_log')
      .insert({
        user_id: userId,
        activity_type: 'ADMIN_DATA_EXPORTED',
        metadata: {
          format,
          exported_by: adminId,
          timestamp: new Date().toISOString()
        }
      })
    
    return {
      success: true,
      data,
      fileName
    }
  } catch (error) {
    console.error('Error exporting student data:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to export student data'
    }
  }
}

