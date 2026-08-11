'use server'

import { createAdminClient, type AuditLog, type AuditLogFilter, type AuditLogStats, type AuditLogSearchParams } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// ===== AUDIT LOG QUERIES =====

export async function getAuditLogs(params: AuditLogSearchParams = {}): Promise<{ logs: AuditLog[]; total: number }> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase.rpc('search_audit_logs', {
      p_search_term: params.search_term || null,
      p_action_types: params.action_types || null,
      p_resource_types: params.resource_types || null,
      p_admin_ids: params.admin_ids || null,
      p_start_date: params.start_date || null,
      p_end_date: params.end_date || null,
      p_limit: params.limit || 100,
      p_offset: params.offset || 0
    })
    
    if (error) {
      console.error('Error fetching audit logs:', error)
      return { logs: [], total: 0 }
    }
    
    // Get total count for pagination
    const { count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
    
    return { 
      logs: data as AuditLog[], 
      total: count || 0 
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { logs: [], total: 0 }
  }
}

export async function getAuditLogStats(startDate?: string, endDate?: string): Promise<AuditLogStats | null> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase.rpc('get_audit_log_stats', {
      p_start_date: startDate || null,
      p_end_date: endDate || null
    })
    
    if (error) {
      console.error('Error fetching audit log stats:', error)
      return null
    }
    
    return data?.[0] as AuditLogStats || null
  } catch (error) {
    console.error('Unexpected error:', error)
    return null
  }
}

// ===== AUDIT LOG FILTERS =====

export async function getAuditLogFilters(): Promise<AuditLogFilter[]> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('audit_log_filters')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching audit log filters:', error)
      return []
    }
    
    return data as AuditLogFilter[]
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

export async function createAuditLogFilter(filterData: {
  name: string
  description?: string
  filters: Record<string, any>
}): Promise<{ success: boolean; error?: string; filter?: AuditLogFilter }> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('audit_log_filters')
      .insert([filterData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating audit log filter:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/students')
    return { success: true, filter: data as AuditLogFilter }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to create audit log filter' }
  }
}

export async function updateAuditLogFilter(filterId: string, updates: {
  name?: string
  description?: string
  filters?: Record<string, any>
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('audit_log_filters')
      .update(updates)
      .eq('id', filterId)
    
    if (error) {
      console.error('Error updating audit log filter:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/students')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to update audit log filter' }
  }
}

export async function deleteAuditLogFilter(filterId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('audit_log_filters')
      .delete()
      .eq('id', filterId)
    
    if (error) {
      console.error('Error deleting audit log filter:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/students')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to delete audit log filter' }
  }
}

// ===== AUDIT LOG EXPORT =====

export async function exportAuditLogs(params: AuditLogSearchParams, format: 'csv' | 'excel' | 'json' = 'csv'): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const { logs } = await getAuditLogs({ ...params, limit: 10000 }) // Get up to 10k records
    
    if (format === 'json') {
      return { success: true, data: JSON.stringify(logs, null, 2) }
    }
    
    if (format === 'csv') {
      const csvContent = generateAuditLogCSV(logs)
      return { success: true, data: csvContent }
    }
    
    if (format === 'excel') {
      const excelContent = await generateAuditLogExcel(logs)
      return { success: true, data: excelContent }
    }
    
    return { success: false, error: 'Unsupported export format' }
  } catch (error) {
    console.error('Error exporting audit logs:', error)
    return { success: false, error: 'Failed to export audit logs' }
  }
}

// ===== HELPER FUNCTIONS =====

function generateAuditLogCSV(logs: AuditLog[]): string {
  const headers = [
    'ID',
    'Admin ID',
    'Action Type',
    'Resource Type',
    'Resource ID',
    'Description',
    'IP Address',
    'User Agent',
    'Session ID',
    'Created At',
    'Old Values',
    'New Values',
    'Metadata'
  ]
  
  const rows = logs.map(log => [
    log.id,
    log.admin_id,
    log.action_type,
    log.resource_type,
    log.resource_id || '',
    log.description,
    log.ip_address || '',
    log.user_agent || '',
    log.session_id || '',
    log.created_at,
    log.old_values ? JSON.stringify(log.old_values) : '',
    log.new_values ? JSON.stringify(log.new_values) : '',
    log.metadata ? JSON.stringify(log.metadata) : ''
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  return csvContent
}

async function generateAuditLogExcel(logs: AuditLog[]): Promise<Buffer> {
  // This would require the xlsx library
  // For now, return a simple JSON representation
  const jsonData = JSON.stringify(logs, null, 2)
  return Buffer.from(jsonData, 'utf-8')
}

// ===== AUDIT LOG UTILITIES =====

export async function logAdminAction(
  adminId: string,
  actionType: string,
  resourceType: string,
  description: string,
  options: {
    resourceId?: string
    oldValues?: Record<string, any>
    newValues?: Record<string, any>
    metadata?: Record<string, any>
    ipAddress?: string
    userAgent?: string
    sessionId?: string
  } = {}
): Promise<{ success: boolean; error?: string; logId?: string }> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase.rpc('log_admin_action', {
      p_admin_id: adminId,
      p_action_type: actionType,
      p_resource_type: resourceType,
      p_resource_id: options.resourceId || null,
      p_description: description,
      p_old_values: options.oldValues || null,
      p_new_values: options.newValues || null,
      p_metadata: options.metadata || null,
      p_ip_address: options.ipAddress || null,
      p_user_agent: options.userAgent || null,
      p_session_id: options.sessionId || null
    })
    
    if (error) {
      console.error('Error logging admin action:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, logId: data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to log admin action' }
  }
}

