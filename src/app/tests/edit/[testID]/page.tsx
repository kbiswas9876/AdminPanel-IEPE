import { getTestDetailsForEdit } from '@/lib/actions/tests'
import { notFound } from 'next/navigation'
import EditTestRedirect from './edit-test-redirect'

interface EditTestPageProps {
  params: Promise<{
    testID: string
  }>
}

export default async function EditTestPage({ params }: EditTestPageProps) {
  const resolvedParams = await params
  const testID = parseInt(resolvedParams.testID)
  
  if (isNaN(testID)) {
    notFound()
  }

  const testData = await getTestDetailsForEdit(testID)
  
  if (!testData) {
    notFound()
  }

  return (
    <EditTestRedirect 
      testData={testData}
      testId={testID}
    />
  )
}

