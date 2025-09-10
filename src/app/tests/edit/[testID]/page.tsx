import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { TestCreationWizard } from '@/components/tests/test-creation-wizard'
import { PremiumMobileHeader } from '@/components/ui/premium-mobile-header'
import { getTestDetailsForEdit } from '@/lib/actions/tests'
import { notFound } from 'next/navigation'
import { Edit } from 'lucide-react'

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
          {/* Premium Mobile Header */}
          <PremiumMobileHeader
            title="Edit Mock Test"
            subtitle="Modify your test blueprint, refine questions, and update rules"
            icon={<Edit className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />}
          />
          
          {/* Main Content */}
          <div className="p-4 sm:p-6">
            <div className="max-w-6xl mx-auto">
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

