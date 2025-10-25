'use server'

import { createAdminClient, type ErrorReportWithDetails } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Interface for raw Supabase response with joins
interface RawErrorReport {
  id: number
  question_id: string
  reported_by_user_id: string
  report_description: string
  status: 'new' | 'reviewed' | 'resolved' | 'dismissed'
  admin_notes?: string
  created_at: string
  updated_at?: string
  questions: {
    question_text: string
    book_source: string
    chapter_name: string
  }[] | null
}

// Get all error reports with user and question details
export async function getErrorReports(): Promise<ErrorReportWithDetails[]> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('error_reports')
      .select(`
        id,
        question_id,
        reported_by_user_id,
        report_description,
        status,
        admin_notes,
        created_at,
        updated_at,
        questions (
          question_text,
          book_source,
          chapter_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching error reports:', error)
      return []
    }

    // Transform the data to match our interface
    return data.map((report: RawErrorReport) => ({
      id: report.id,
      question_id: report.question_id,
      user_id: report.reported_by_user_id,
      report_description: report.report_description,
      status: report.status,
      admin_notes: report.admin_notes,
      created_at: report.created_at,
      updated_at: report.updated_at,
      user_email: 'Unknown',
      user_full_name: undefined,
      question_text: report.questions?.[0]?.question_text,
      book_source: report.questions?.[0]?.book_source,
      chapter_name: report.questions?.[0]?.chapter_name
    }))
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

// Get error reports by status
export async function getErrorReportsByStatus(status: 'new' | 'reviewed' | 'resolved' | 'dismissed'): Promise<ErrorReportWithDetails[]> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('error_reports')
      .select(`
        id,
        question_id,
        reported_by_user_id,
        report_description,
        status,
        admin_notes,
        created_at,
        updated_at,
        questions (
          question_text,
          book_source,
          chapter_name
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching error reports by status:', error)
      return []
    }

    // Transform the data to match our interface
    return data.map((report: RawErrorReport) => ({
      id: report.id,
      question_id: report.question_id,
      user_id: report.reported_by_user_id,
      report_description: report.report_description,
      status: report.status,
      admin_notes: report.admin_notes,
      created_at: report.created_at,
      updated_at: report.updated_at,
      user_email: 'Unknown',
      user_full_name: undefined,
      question_text: report.questions?.[0]?.question_text,
      book_source: report.questions?.[0]?.book_source,
      chapter_name: report.questions?.[0]?.chapter_name
    }))
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

// Get count of new error reports for notification badge
export async function getNewErrorReportsCount(): Promise<number> {
  try {
    const supabase = createAdminClient()

    const { count, error } = await supabase
      .from('error_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new')

    if (error) {
      console.error('Error fetching new error reports count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Unexpected error:', error)
    return 0
  }
}

// Update error report status
export async function updateErrorReportStatus(
  reportId: number,
  newStatus: 'new' | 'reviewed' | 'resolved'
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()

    // CRITICAL FIX: Map 'in_review' to 'reviewed' to match database constraint
    let finalStatus = newStatus
    if (newStatus === 'in_review') {
      finalStatus = 'reviewed'
    }

    const { error } = await supabase
      .from('error_reports')
      .update({ 
        status: finalStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)

    if (error) {
      console.error('Error updating error report status:', error)
      return {
        success: false,
        message: `Failed to update report status: ${error.message}`
      }
    }

    revalidatePath('/reports')
    return {
      success: true,
      message: `Report status updated to ${newStatus}`
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while updating the report status'
    }
  }
}

// Delete error report
export async function deleteErrorReport(reportId: number): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('error_reports')
      .delete()
      .eq('id', reportId)

    if (error) {
      console.error('Error deleting error report:', error)
      return {
        success: false,
        message: `Failed to delete report: ${error.message}`
      }
    }

    revalidatePath('/reports')
    return {
      success: true,
      message: 'Report deleted successfully'
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while deleting the report'
    }
  }
}
