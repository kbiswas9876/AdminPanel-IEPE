import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { QuestionForm } from '@/components/content/question-form'
import { createQuestion } from '@/lib/actions/questions'

export default function NewQuestionPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <QuestionForm onSubmit={createQuestion} />
      </MainLayout>
    </ProtectedRoute>
  )
}

