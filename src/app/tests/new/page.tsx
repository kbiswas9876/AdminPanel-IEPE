import { ProtectedRoute } from '@/components/auth/protected-route'
import { TestCreationWizard } from '@/components/tests/test-creation-wizard'

export default function NewTestPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/30">
        <TestCreationWizard />
      </div>
    </ProtectedRoute>
  )
}


