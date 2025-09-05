import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { StudentManagement } from '@/components/students/student-management'
import { createAdminClient, type UserProfile } from '@/lib/supabase/admin'

export default async function StudentsPage() {
  const supabase = createAdminClient()

  // Fetch all user data on the server using admin client
  const [pendingResult, activeResult, allResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    supabase
      .from('user_profiles')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
    supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
  ])

  const pendingUsers = pendingResult.data as UserProfile[] || []
  const activeUsers = activeResult.data as UserProfile[] || []
  const allUsers = allResult.data as UserProfile[] || []

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Student Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage student registrations and control access to your platform.
            </p>
          </div>
          
          <StudentManagement 
            initialPendingUsers={pendingUsers}
            initialActiveUsers={activeUsers}
            initialAllUsers={allUsers}
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}


