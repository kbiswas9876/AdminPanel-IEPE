import { TestHistoryView } from '../components/TestHistoryView'
import { getStudentActivityFeed } from '@/lib/actions/studentAnalyticsActions'

interface MockTestsPageProps {
  params: Promise<{ userID: string }>
}

export default async function MockTestsPage({ params }: MockTestsPageProps) {
  const { userID: userId } = await params
  
  // Fetch mock test sessions only
  const sessions = await getStudentActivityFeed(
    userId,
    { activity_type: 'MOCK_TEST_COMPLETED' },
    { page: 1, limit: 50 }
  )
  
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <TestHistoryView
          userId={userId}
          initialData={sessions}
          testType="mock_test"
        />
      </div>
    </div>
  )
}

