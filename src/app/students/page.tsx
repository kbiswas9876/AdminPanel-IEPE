import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { StudentManagement } from '@/components/students/student-management'

export default function StudentsPage() {
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
          
          <StudentManagement />
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}


