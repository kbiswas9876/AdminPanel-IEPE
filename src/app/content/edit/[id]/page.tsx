import { QuestionForm } from '@/components/content/question-form'
import { getQuestionById, updateQuestion } from '@/lib/actions/questions'
import { notFound } from 'next/navigation'

interface EditQuestionPageProps {
  params: Promise<{
    id: string
  }>
}

async function handleUpdate(questionId: number, formData: FormData) {
  'use server'
  await updateQuestion(questionId, formData)
}

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  const { id } = await params
  const questionId = parseInt(id)
  
  if (isNaN(questionId)) {
    notFound()
  }

  const question = await getQuestionById(questionId)
  
  if (!question) {
    notFound()
  }

  return (
    <QuestionForm 
      question={question as unknown as import('@/lib/supabase/admin').Question} 
      isEditing={true} 
      onSubmit={(formData) => handleUpdate(questionId, formData)} 
    />
  )
}



