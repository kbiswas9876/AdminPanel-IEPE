import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { StudentProfile } from '@/components/students/student-profile'

interface StudentProfilePageProps {
  params: {
    userID: string
  }
}

export default function StudentProfilePage({ params }: StudentProfilePageProps) {
  return (
    <ProtectedRoute>
      <MainLayout>
        <StudentProfile userId={params.userID} />
      </MainLayout>
    </ProtectedRoute>
  )
}


