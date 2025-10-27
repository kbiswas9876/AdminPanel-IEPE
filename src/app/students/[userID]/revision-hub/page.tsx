import { RevisionHubMirror } from '../components/RevisionHubMirror'
import { getStudentRevisionHubMirrorData } from '@/lib/actions/studentAnalyticsActions'

interface RevisionHubPageProps {
  params: Promise<{ userID: string }>
}

export default async function RevisionHubPage({ params }: RevisionHubPageProps) {
  const { userID: userId } = await params
  
  // Fetch revision hub data
  const bookmarks = await getStudentRevisionHubMirrorData(userId, {})
  
  return (
    <div className="h-full overflow-hidden bg-gray-50">
      <RevisionHubMirror
        userId={userId}
        initialBookmarks={bookmarks}
      />
    </div>
  )
}

