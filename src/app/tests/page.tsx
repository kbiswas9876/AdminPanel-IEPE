import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { TestManagement } from '@/components/tests/test-management'

export default function TestsPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mock Tests
            </h1>
            <p className="mt-2 text-gray-600">
              Create, manage, and schedule competitive mock tests for your students.
            </p>
          </div>
          
          <TestManagement />
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
