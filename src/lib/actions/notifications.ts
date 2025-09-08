'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface Notification {
  id: number
  type: 'user_registration' | 'error_report' | 'question_added' | 'test_published' | 'system_alert'
  title: string
  message: string
  timestamp: Date
  read: boolean
  metadata?: Record<string, unknown>
}

export async function getNotifications(limit: number = 10): Promise<Notification[]> {
  try {
    const supabase = createAdminClient()
    const notifications: Notification[] = []
    const currentUser = (await supabase.auth.getUser()).data.user

    if (!currentUser) {
      return []
    }

    // Get pending user registrations
    const { data: pendingUsers, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)

    if (!usersError && pendingUsers) {
      for (const [index, user] of pendingUsers.entries()) {
        const notificationId = 1000 + index
        
        // Check if this notification has been read
        const { data: readStatus } = await supabase
          .from('notification_read_status')
          .select('read_at')
          .eq('notification_id', notificationId)
          .eq('user_id', currentUser.id)
          .single()

        notifications.push({
          id: notificationId,
          type: 'user_registration',
          title: 'New User Registration',
          message: `${user.full_name} (${user.email}) has registered and is awaiting approval`,
          timestamp: new Date(user.created_at),
          read: !!readStatus,
          metadata: { userId: user.id }
        })
      }
    }

    // Get new error reports
    const { data: newReports, error: reportsError } = await supabase
      .from('error_reports')
      .select('id, title, description, created_at')
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(3)

    if (!reportsError && newReports) {
      for (const [index, report] of newReports.entries()) {
        const notificationId = 2000 + index
        
        // Check if this notification has been read
        const { data: readStatus } = await supabase
          .from('notification_read_status')
          .select('read_at')
          .eq('notification_id', notificationId)
          .eq('user_id', currentUser.id)
          .single()

        notifications.push({
          id: notificationId,
          type: 'error_report',
          title: 'Error Report Submitted',
          message: report.title || 'New error report submitted',
          timestamp: new Date(report.created_at),
          read: !!readStatus,
          metadata: { reportId: report.id }
        })
      }
    }

    // Get recently added questions (last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: recentQuestions, error: questionsError } = await supabase
      .from('questions')
      .select('id, question_text, created_at')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(3)

    if (!questionsError && recentQuestions && recentQuestions.length > 0) {
      const notificationId = 3000
      
      // Check if this notification has been read
      const { data: readStatus } = await supabase
        .from('notification_read_status')
        .select('read_at')
        .eq('notification_id', notificationId)
        .eq('user_id', currentUser.id)
        .single()

      notifications.push({
        id: notificationId,
        type: 'question_added',
        title: 'New Questions Added',
        message: `${recentQuestions.length} new question${recentQuestions.length > 1 ? 's' : ''} added to the question bank`,
        timestamp: new Date(recentQuestions[0].created_at),
        read: !!readStatus,
        metadata: { questionCount: recentQuestions.length }
      })
    }

    // Get recently published tests (last 24 hours)
    const { data: recentTests, error: testsError } = await supabase
      .from('tests')
      .select('id, title, created_at')
      .eq('status', 'published')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(2)

    if (!testsError && recentTests && recentTests.length > 0) {
      for (const [index, test] of recentTests.entries()) {
        const notificationId = 4000 + index
        
        // Check if this notification has been read
        const { data: readStatus } = await supabase
          .from('notification_read_status')
          .select('read_at')
          .eq('notification_id', notificationId)
          .eq('user_id', currentUser.id)
          .single()

        notifications.push({
          id: notificationId,
          type: 'test_published',
          title: 'Test Published',
          message: `"${test.title}" has been published and is now available`,
          timestamp: new Date(test.created_at),
          read: !!readStatus,
          metadata: { testId: test.id }
        })
      }
    }

    // Sort all notifications by timestamp (newest first) and limit
    return notifications
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const notifications = await getNotifications(50)
    return notifications.filter(n => !n.read).length
  } catch (error) {
    console.error('Error fetching unread notification count:', error)
    return 0
  }
}

export async function markNotificationAsRead(notificationId: number): Promise<{ success: boolean }> {
  try {
    const supabase = createAdminClient()
    
    // Create or update the read status in the database
    const { error } = await supabase
      .from('notification_read_status')
      .upsert({
        notification_id: notificationId,
        read_at: new Date().toISOString(),
        user_id: (await supabase.auth.getUser()).data.user?.id
      }, {
        onConflict: 'notification_id,user_id'
      })
    
    if (error) {
      console.error('Error marking notification as read:', error)
      return { success: false }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { success: false }
  }
}
