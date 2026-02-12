'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface SecurityLogEntry {
  event_type: string
  user_id?: string
  ip_address?: string
  user_agent?: string
  resource_type?: string
  resource_id?: string
  action?: string
  details?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export async function logSecurityEvent(entry: SecurityLogEntry): Promise<void> {
  try {
    const supabase = createAdminClient()
    
    await supabase.from('security_logs').insert({
      event_type: entry.event_type,
      user_id: entry.user_id,
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      action: entry.action,
      details: entry.details,
      severity: entry.severity,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

export async function logUserAction(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details: Record<string, any> = {},
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logSecurityEvent({
    event_type: 'USER_ACTION',
    user_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
    resource_type: resourceType,
    resource_id: resourceId,
    action,
    details,
    severity: 'low'
  })
}

export async function logBulkAction(
  userId: string,
  action: string,
  resourceType: string,
  resourceIds: string[],
  details: Record<string, any> = {},
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logSecurityEvent({
    event_type: 'BULK_ACTION',
    user_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
    resource_type: resourceType,
    resource_id: resourceIds.join(','),
    action,
    details: {
      ...details,
      count: resourceIds.length,
      resource_ids: resourceIds
    },
    severity: 'medium'
  })
}

export async function logSecurityViolation(
  eventType: string,
  details: Record<string, any> = {},
  severity: 'medium' | 'high' | 'critical' = 'medium',
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logSecurityEvent({
    event_type: eventType,
    user_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
    details,
    severity
  })
}

export async function logAuthenticationEvent(
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'PASSWORD_RESET',
  userId?: string,
  ipAddress?: string,
  userAgent?: string,
  details: Record<string, any> = {}
): Promise<void> {
  await logSecurityEvent({
    event_type: eventType,
    user_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
    details,
    severity: eventType === 'LOGIN_FAILED' ? 'medium' : 'low'
  })
}
