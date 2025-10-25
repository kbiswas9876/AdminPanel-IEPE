import { EnhancedStudentProfile } from '@/components/students/enhanced-student-profile'
import { createAdminClient } from '@/lib/supabase/admin'

interface StudentProfilePageProps {
  params: {
    userID: string
  }
}

export default async function StudentProfilePage({ params }: StudentProfilePageProps) {
  const { userID } = await params
  
  // Fetch user profile data
  const supabase = createAdminClient()
  const { data: user, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userID)
    .single()

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600">The requested student profile could not be found.</p>
        </div>
      </div>
    )
  }

  return <EnhancedStudentProfile userId={userID} user={user} />
}

