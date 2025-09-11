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
        <div className="min-h-screen bg-gray-50/30">
          {/* Main Content */}
          <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              <TestCreationWizard 
                initialData={testData}
                isEditMode={true}
                testId={testID}
              />
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}

