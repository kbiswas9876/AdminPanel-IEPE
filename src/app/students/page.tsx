import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { StudentManagementClientUI } from '@/components/students/student-management-client-ui'
import { createAdminClient } from '@/lib/supabase/admin'
import { Users } from 'lucide-react'

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
        <div className="space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                Student Management
              </h1>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg text-gray-600 font-medium">
                Manage student registrations and control access to your platform.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-gray-200/50 overflow-hidden">
            <StudentManagementClientUI users={usersWithEmails} />
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}


