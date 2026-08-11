import { TestHistoryView } from '../components/TestHistoryView'
import { getStudentActivityFeed } from '@/lib/actions/studentAnalyticsActions'

interface PracticeHistoryPageProps {
  params: Promise<{ userID: string }>
}

export default async function PracticeHistoryPage({ params }: PracticeHistoryPageProps) {
  const { userID: userId } = await params
  
  // Fetch practice sessions only
  const sessions = await getStudentActivityFeed(
    userId,
    { activity_type: 'PRACTICE_SESSION_COMPLETED' },
    { page: 1, limit: 50 }
  )
  
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <TestHistoryView
          userId={userId}
          initialData={sessions}
          testType="practice"
        />
      </div>
    </div>
  )
}

