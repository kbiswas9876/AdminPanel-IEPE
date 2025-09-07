import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ImportReviewInterface } from '@/components/content/import-review-interface'

export default function ImportReviewPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <ImportReviewInterface />
      </MainLayout>
    </ProtectedRoute>
  )
}
