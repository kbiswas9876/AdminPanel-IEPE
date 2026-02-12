'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logSecurityEvent } from './security-logger'

interface ConfirmationCode {
  id: string
  code: string
  action: string
  user_id: string
  resource_id?: string
  expires_at: string
  used: boolean
  created_at: string
}

export async function generateConfirmationCode(
  userId: string,
  action: string,
  resourceId?: string,
  expiresInMinutes: number = 10
): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    const supabase = createAdminClient()
    
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes)
    
    const { data, error } = await supabase
      .from('confirmation_codes')
      .insert({
        code,
        action,
        user_id: userId,
        resource_id: resourceId,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error generating confirmation code:', error)
      return { success: false, error: error.message }
    }
    
    // Log the code generation
    await logSecurityEvent({
      event_type: 'CONFIRMATION_CODE_GENERATED',
      user_id: userId,
      action,
      resource_id: resourceId,
      details: { code_id: data.id },
      severity: 'low'
    })
    
    return { success: true, code }
  } catch (error) {
    console.error('Failed to generate confirmation code:', error)
    return { success: false, error: 'Failed to generate confirmation code' }
  }
}

export async function verifyConfirmationCode(
  code: string,
  action: string,
  userId: string,
  resourceId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('confirmation_codes')
      .select('*')
      .eq('code', code)
      .eq('action', action)
      .eq('user_id', userId)
      .eq('used', false)
      .single()
    
    if (error || !data) {
      return { success: false, error: 'Invalid or expired confirmation code' }
    }
    
    // Check if code is expired
    if (new Date(data.expires_at) < new Date()) {
      return { success: false, error: 'Confirmation code has expired' }
    }
    
    // Mark code as used
    await supabase
      .from('confirmation_codes')
      .update({ used: true })
      .eq('id', data.id)
    
    // Log the code verification
    await logSecurityEvent({
      event_type: 'CONFIRMATION_CODE_VERIFIED',
      user_id: userId,
      action,
      resource_id: resourceId,
      details: { code_id: data.id },
      severity: 'low'
    })
    
    return { success: true }
  } catch (error) {
    console.error('Failed to verify confirmation code:', error)
    return { success: false, error: 'Failed to verify confirmation code' }
  }
}

export async function cleanupExpiredCodes(): Promise<void> {
  try {
    const supabase = createAdminClient()
    
    await supabase
      .from('confirmation_codes')
      .delete()
      .lt('expires_at', new Date().toISOString())
  } catch (error) {
    console.error('Failed to cleanup expired codes:', error)
  }
}
