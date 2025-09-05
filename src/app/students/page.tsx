import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { StudentManagementClientUI } from '@/components/students/student-management-client-ui'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function StudentsPage() {
  const supabaseAdmin = createAdminClient()

  // Fetch all users at once using admin client
  const { data: allUsers, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .order('id', { ascending: false })

  // Fetch emails separately from auth.users
  const userEmails: { [key: string]: string } = {}
  if (allUsers && allUsers.length > 0) {
    const userIds = allUsers.map(user => user.id)
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authUsers?.users) {
      authUsers.users.forEach(user => {
        if (userIds.includes(user.id)) {
          userEmails[user.id] = user.email || 'No email'
        }
      })
    }
  }

  // Combine the data
  const usersWithEmails = allUsers?.map(user => ({
    ...user,
    email: userEmails[user.id] || 'No email'
  })) || []

  if (error) {
    console.error("Error fetching users:", error)
    // We'll handle this in the UI
  }

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
          
          <StudentManagementClientUI users={usersWithEmails} />
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}


