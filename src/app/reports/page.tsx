import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ErrorReportsManagement } from '@/components/reports/error-reports-management'

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <ErrorReportsManagement />
      </MainLayout>
    </ProtectedRoute>
  )
}
