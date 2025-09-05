'use server'

import { createAdminClient, type ErrorReportWithDetails } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Interface for raw Supabase response with joins
interface RawErrorReport {
  id: number
  question_id: string
  user_id: string
  report_description: string
  status: 'new' | 'in_review' | 'resolved'
  created_at: string
  updated_at?: string
  profiles: {
    email: string
    full_name?: string
  }[] | null
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
        user_id,
        report_description,
        status,
        created_at,
        updated_at,
        profiles (
          email,
          full_name
        ),
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
      user_id: report.user_id,
      report_description: report.report_description,
      status: report.status,
      created_at: report.created_at,
      updated_at: report.updated_at,
      user_email: report.profiles?.[0]?.email || 'Unknown',
      user_full_name: report.profiles?.[0]?.full_name,
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
export async function getErrorReportsByStatus(status: 'new' | 'in_review' | 'resolved'): Promise<ErrorReportWithDetails[]> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('error_reports')
      .select(`
        id,
        question_id,
        user_id,
        report_description,
        status,
        created_at,
        updated_at,
        profiles (
          email,
          full_name
        ),
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
      user_id: report.user_id,
      report_description: report.report_description,
      status: report.status,
      created_at: report.created_at,
      updated_at: report.updated_at,
      user_email: report.profiles?.[0]?.email || 'Unknown',
      user_full_name: report.profiles?.[0]?.full_name,
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
  newStatus: 'new' | 'in_review' | 'resolved'
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('error_reports')
      .update({ 
        status: newStatus,
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
