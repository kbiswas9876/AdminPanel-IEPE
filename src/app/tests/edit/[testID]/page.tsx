import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { TestCreationWizard } from '@/components/tests/test-creation-wizard'
import { getTestDetailsForEdit } from '@/lib/actions/tests'
import { notFound } from 'next/navigation'

interface EditTestPageProps {
  params: {
    testID: string
  }
}

export default async function EditTestPage({ params }: EditTestPageProps) {
  const testID = parseInt(params.testID)
  
  if (isNaN(testID)) {
    notFound()
  }

  const testData = await getTestDetailsForEdit(testID)
  
  if (!testData) {
    notFound()
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Mock Test
            </h1>
            <p className="mt-2 text-gray-600">
              Modify your test blueprint, refine questions, and update rules.
            </p>
          </div>
          
          <TestCreationWizard 
            initialData={testData}
            isEditMode={true}
            testId={testID}
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}

