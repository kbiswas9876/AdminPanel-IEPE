import { ProtectedRoute } from '@/components/auth/protected-route'
import { MainLayout } from '@/components/layout/main-layout'
import { TestCreationWizard } from '@/components/tests/test-creation-wizard'

export default function NewTestPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="min-h-screen bg-gray-50/30">
          <TestCreationWizard />
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}


