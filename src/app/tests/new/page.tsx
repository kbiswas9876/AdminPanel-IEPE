import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { TestCreationWizard } from '@/components/tests/test-creation-wizard'

export default function NewTestPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Mock Test
            </h1>
            <p className="mt-2 text-gray-600">
              Design your competitive exam mock test with custom question distribution.
            </p>
          </div>
          
          <TestCreationWizard />
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}


