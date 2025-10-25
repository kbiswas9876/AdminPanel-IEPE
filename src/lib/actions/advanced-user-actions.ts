'use server'

import { createAdminClient, type UserProfile } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { exportToCSV, exportToExcel } from '@/lib/utils/export-helpers'

// ===== EXPORT USER DATA =====

export async function exportUserData(
  userId: string, 
  options: {
    format: 'csv' | 'excel' | 'json' | 'pdf'
    includeActivity: boolean
    includeGroups: boolean
    includeTags: boolean
    dateRange: string
  }
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const supabase = createAdminClient()
    
    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (userError || !user) {
      return { success: false, error: 'User not found' }
    }

    const exportData: any = {
      user: user,
      exported_at: new Date().toISOString(),
      export_options: options
    }

    // Add activity logs if requested
    if (options.includeActivity) {
      const { data: activityLogs } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      exportData.activity_logs = activityLogs || []
    }

    // Add group memberships if requested
    if (options.includeGroups) {
      const { data: groupMemberships } = await supabase
        .from('user_group_members')
        .select(`
          *,
          user_groups(*)
        `)
        .eq('user_id', userId)
      
      exportData.group_memberships = groupMemberships || []
    }

    // Add tags if requested
    if (options.includeTags) {
      const { data: userTags } = await supabase
        .from('user_tags')
        .select(`
          *,
          tags(*)
        `)
        .eq('user_id', userId)
      
      exportData.tags = userTags || []
    }

    // Generate file based on format
    switch (options.format) {
      case 'csv':
        const csvContent = generateCSVContent(exportData)
        return { success: true, data: csvContent }
      
      case 'excel':
        const excelContent = await generateExcelContent(exportData)
        return { success: true, data: excelContent }
      
      case 'json':
        return { success: true, data: JSON.stringify(exportData, null, 2) }
      
      case 'pdf':
        // PDF generation would require additional libraries
        return { success: false, error: 'PDF export not yet implemented' }
      
      default:
        return { success: false, error: 'Invalid export format' }
    }
  } catch (error) {
    console.error('Error exporting user data:', error)
    return { success: false, error: 'Failed to export user data' }
  }
}

// ===== SEND CUSTOM EMAIL =====

export async function sendCustomEmail(
  userId: string,
  emailData: {
    subject: string
    message: string
    template: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()
    
    // Get user email
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()
    
    if (userError || !user?.email) {
      return { success: false, error: 'User email not found' }
    }

    // Log the email action
    await supabase
      .from('user_activity_log')
      .insert([{
        user_id: userId,
        activity_type: 'admin_email_sent',
        description: `Admin sent custom email: ${emailData.subject}`,
        metadata: {
          subject: emailData.subject,
          template: emailData.template,
          sent_by: 'admin'
        }
      }])

    // In a real implementation, you would integrate with an email service
    // For now, we'll just log the action
    console.log('Email would be sent to:', user.email)
    console.log('Subject:', emailData.subject)
    console.log('Message:', emailData.message)
    console.log('Template:', emailData.template)

    revalidatePath('/students')
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// ===== GET USER LOGS =====

export async function getUserLogs(userId: string): Promise<{ success: boolean; error?: string; logs?: any[] }> {
  try {
    const supabase = createAdminClient()
    
    const { data: logs, error } = await supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (error) {
      console.error('Error fetching user logs:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, logs: logs || [] }
  } catch (error) {
    console.error('Error fetching user logs:', error)
    return { success: false, error: 'Failed to fetch user logs' }
  }
}

// ===== IMPERSONATE USER =====

export async function impersonateUser(userId: string): Promise<{ success: boolean; error?: string; token?: string }> {
  try {
    const supabase = createAdminClient()
    
    // Get user details
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (userError || !user) {
      return { success: false, error: 'User not found' }
    }

    // Generate impersonation token (in a real implementation, this would be a secure JWT)
    const impersonationToken = `impersonate_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Log the impersonation action
    await supabase
      .from('user_activity_log')
      .insert([{
        user_id: userId,
        activity_type: 'admin_impersonation_started',
        description: 'Admin started impersonating this user',
        metadata: {
          impersonation_token: impersonationToken,
          started_by: 'admin'
        }
      }])

    revalidatePath('/students')
    return { success: true, token: impersonationToken }
  } catch (error) {
    console.error('Error starting impersonation:', error)
    return { success: false, error: 'Failed to start impersonation' }
  }
}

// ===== HELPER FUNCTIONS =====

function generateCSVContent(data: any): string {
  const headers = [
    'Field',
    'Value',
    'Type',
    'Timestamp'
  ]
  
  const rows: string[][] = []
  
  // Add user data
  Object.entries(data.user).forEach(([key, value]) => {
    rows.push([key, String(value), 'user_data', data.exported_at])
  })
  
  // Add activity logs
  if (data.activity_logs) {
    data.activity_logs.forEach((log: any) => {
      rows.push(['activity_log', log.description, 'activity', log.created_at])
    })
  }
  
  // Add group memberships
  if (data.group_memberships) {
    data.group_memberships.forEach((membership: any) => {
      rows.push(['group_membership', membership.user_groups?.name || 'Unknown', 'group', membership.joined_at])
    })
  }
  
  // Add tags
  if (data.tags) {
    data.tags.forEach((tag: any) => {
      rows.push(['tag', tag.tags?.name || 'Unknown', 'tag', tag.added_at])
    })
  }
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  return csvContent
}

async function generateExcelContent(data: any): Promise<Buffer> {
  // This would require the xlsx library
  // For now, return a simple JSON representation
  const jsonData = JSON.stringify(data, null, 2)
  return Buffer.from(jsonData, 'utf-8')
}

