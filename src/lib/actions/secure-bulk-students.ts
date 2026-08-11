'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { checkRateLimit, userActionLimiter, bulkActionLimiter } from '@/lib/security/rate-limiter'
import { logBulkAction, logSecurityViolation } from '@/lib/security/security-logger'
import { verifyConfirmationCode } from '@/lib/security/confirmation-codes'
import { z } from 'zod'

const bulkActionSchema = z.object({
  userIds: z.array(z.string().uuid()),
  action: z.enum(['approve', 'suspend', 'activate', 'promote', 'delete']),
  reason: z.string().min(1, 'Reason is required'),
  confirmationCode: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
})

export async function secureBulkApproveUsers(formData: FormData) {
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Rate limiting check
  const rateLimitResult = await checkRateLimit(
    bulkActionLimiter,
    user.id,
    'bulk_approve'
  )

  if (!rateLimitResult.success) {
    return { error: rateLimitResult.error }
  }

  const parsed = bulkActionSchema.safeParse({
    userIds: JSON.parse(formData.get('userIds') as string),
    action: 'approve',
    reason: formData.get('reason'),
    confirmationCode: formData.get('confirmationCode'),
    ipAddress: formData.get('ipAddress'),
    userAgent: formData.get('userAgent')
  })

  if (!parsed.success) {
    return { error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const { userIds, reason, confirmationCode, ipAddress, userAgent } = parsed.data

  // Verify confirmation code if provided
  if (confirmationCode) {
    const codeVerification = await verifyConfirmationCode(
      confirmationCode,
      'bulk_approve',
      user.id
    )

    if (!codeVerification.success) {
      return { error: codeVerification.error }
    }
  }

  try {
    // Update user statuses
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)

    if (error) {
      console.error('Error bulk approving users:', error)
      return { error: error.message }
    }

    // Log the bulk action
    await logBulkAction(
      user.id,
      'bulk_approve',
      'user',
      userIds,
      { reason, count: userIds.length },
      ipAddress,
      userAgent
    )

    revalidatePath('/students')
    return { success: true, message: `Successfully approved ${userIds.length} users` }
  } catch (error: any) {
    console.error('Bulk approve failed:', error)
    
    // Log the failure
    await logSecurityViolation(
      'BULK_ACTION_FAILED',
      { action: 'bulk_approve', error: error.message, userIds },
      'medium',
      user.id,
      ipAddress,
      userAgent
    )

    return { error: 'Failed to approve users' }
  }
}

export async function secureBulkSuspendUsers(formData: FormData) {
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Rate limiting check
  const rateLimitResult = await checkRateLimit(
    bulkActionLimiter,
    user.id,
    'bulk_suspend'
  )

  if (!rateLimitResult.success) {
    return { error: rateLimitResult.error }
  }

  const parsed = bulkActionSchema.safeParse({
    userIds: JSON.parse(formData.get('userIds') as string),
    action: 'suspend',
    reason: formData.get('reason'),
    confirmationCode: formData.get('confirmationCode'),
    ipAddress: formData.get('ipAddress'),
    userAgent: formData.get('userAgent')
  })

  if (!parsed.success) {
    return { error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const { userIds, reason, confirmationCode, ipAddress, userAgent } = parsed.data

  // Verify confirmation code if provided
  if (confirmationCode) {
    const codeVerification = await verifyConfirmationCode(
      confirmationCode,
      'bulk_suspend',
      user.id
    )

    if (!codeVerification.success) {
      return { error: codeVerification.error }
    }
  }

  try {
    // Update user statuses
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        status: 'suspended',
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)

    if (error) {
      console.error('Error bulk suspending users:', error)
      return { error: error.message }
    }

    // Log the bulk action
    await logBulkAction(
      user.id,
      'bulk_suspend',
      'user',
      userIds,
      { reason, count: userIds.length },
      ipAddress,
      userAgent
    )

    revalidatePath('/students')
    return { success: true, message: `Successfully suspended ${userIds.length} users` }
  } catch (error: any) {
    console.error('Bulk suspend failed:', error)
    
    // Log the failure
    await logSecurityViolation(
      'BULK_ACTION_FAILED',
      { action: 'bulk_suspend', error: error.message, userIds },
      'medium',
      user.id,
      ipAddress,
      userAgent
    )

    return { error: 'Failed to suspend users' }
  }
}

export async function secureBulkDeleteUsers(formData: FormData) {
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Rate limiting check
  const rateLimitResult = await checkRateLimit(
    bulkActionLimiter,
    user.id,
    'bulk_delete'
  )

  if (!rateLimitResult.success) {
    return { error: rateLimitResult.error }
  }

  const parsed = bulkActionSchema.safeParse({
    userIds: JSON.parse(formData.get('userIds') as string),
    action: 'delete',
    reason: formData.get('reason'),
    confirmationCode: formData.get('confirmationCode'),
    ipAddress: formData.get('ipAddress'),
    userAgent: formData.get('userAgent')
  })

  if (!parsed.success) {
    return { error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const { userIds, reason, confirmationCode, ipAddress, userAgent } = parsed.data

  // Require confirmation code for delete operations
  if (!confirmationCode) {
    return { error: 'Confirmation code is required for delete operations' }
  }

  const codeVerification = await verifyConfirmationCode(
    confirmationCode,
    'bulk_delete',
    user.id
  )

  if (!codeVerification.success) {
    return { error: codeVerification.error }
  }

  try {
    // Delete users (this will cascade to related tables)
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .in('id', userIds)

    if (error) {
      console.error('Error bulk deleting users:', error)
      return { error: error.message }
    }

    // Log the bulk action
    await logBulkAction(
      user.id,
      'bulk_delete',
      'user',
      userIds,
      { reason, count: userIds.length },
      ipAddress,
      userAgent
    )

    revalidatePath('/students')
    return { success: true, message: `Successfully deleted ${userIds.length} users` }
  } catch (error: any) {
    console.error('Bulk delete failed:', error)
    
    // Log the failure
    await logSecurityViolation(
      'BULK_ACTION_FAILED',
      { action: 'bulk_delete', error: error.message, userIds },
      'high',
      user.id,
      ipAddress,
      userAgent
    )

    return { error: 'Failed to delete users' }
  }
}
