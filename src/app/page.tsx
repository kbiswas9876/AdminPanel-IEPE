import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardPage } from '@/components/dashboard/dashboard-page'

export default function Home() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <DashboardPage />
      </MainLayout>
    </ProtectedRoute>
  )
}