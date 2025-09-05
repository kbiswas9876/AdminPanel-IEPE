import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { QuestionForm } from '@/components/content/question-form'
import { getQuestionById, updateQuestion } from '@/lib/actions/questions'
import { notFound } from 'next/navigation'

interface EditQuestionPageProps {
  params: {
    id: string
  }
}

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  const questionId = parseInt(params.id)
  
  if (isNaN(questionId)) {
    notFound()
  }

  const question = await getQuestionById(questionId)
  
  if (!question) {
    notFound()
  }

  const handleUpdate = async (formData: FormData) => {
    'use server'
    await updateQuestion(questionId, formData)
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <QuestionForm 
          question={question} 
          isEditing={true} 
          onSubmit={handleUpdate} 
        />
      </MainLayout>
    </ProtectedRoute>
  )
}



