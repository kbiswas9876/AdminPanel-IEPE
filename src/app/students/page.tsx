import { ReorganizedStudentManagement } from '@/components/students/reorganized-student-management'
import { createAdminClient } from '@/lib/supabase/admin'
import { Users } from 'lucide-react'

export default async function StudentsPage() {
  const supabaseAdmin = createAdminClient()

  // 1. Primary Source of Truth: Fetch all registered users from Supabase Auth Admin API
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()

  // 2. Secondary Source: Fetch profiles from user_profiles table if populated
  let profileMap: { [key: string]: any } = {}
  try {
    const { data: allProfiles } = await supabaseAdmin
      .from('user_profiles')
      .select('*')

    if (allProfiles && Array.isArray(allProfiles)) {
      allProfiles.forEach((p) => {
        profileMap[p.id] = p
      })
    }
  } catch (err) {
    // Silent fallback to auth users metadata
  }

  // 3. Combine Auth metadata + DB Profiles safely without console errors
  const usersWithCombinedData = (authUsers?.users || []).map((u) => {
    const profile = profileMap[u.id] || {}
    const meta = u.user_metadata || {}

    return {
      id: u.id,
      email: u.email || profile.email || 'No email',
      full_name: profile.full_name || meta.full_name || meta.name || 'Student (Unspecified)',
      status: profile.status || meta.status || 'pending',
      role: profile.role || meta.role || 'student',
      rejection_reason: profile.rejection_reason || meta.rejection_reason || null,
      phone_number: profile.phone_number || meta.phone_number || meta.phone || 'Not provided',
      target_exam: profile.target_exam || meta.target_exam || 'Not specified',
      date_of_birth: profile.date_of_birth || meta.date_of_birth || 'Not provided',
      state: profile.state || meta.state || 'Not specified',
      city: profile.city || meta.city || 'Not specified',
      student_category: profile.student_category || meta.student_category || 'General',
      created_at: profile.created_at || u.created_at || new Date().toISOString(),
    }
  })

  return (
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
        <ReorganizedStudentManagement users={usersWithCombinedData} />
      </div>
    </div>
  )
}
