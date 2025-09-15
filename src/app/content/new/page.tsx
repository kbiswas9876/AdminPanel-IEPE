import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { NewQuestionForm } from '@/components/content/NewQuestionForm'

export default function NewQuestionPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <NewQuestionForm />
      </MainLayout>
    </ProtectedRoute>
  )
}


