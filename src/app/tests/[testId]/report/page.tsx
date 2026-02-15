import { notFound } from 'next/navigation'
import { getTestOverviewStats, getTestRankings } from '@/lib/actions/test-reports'
import { getTestDetails } from '@/lib/actions/tests'
import { TestReportDashboard } from '@/components/tests/report/TestReportDashboard'

interface PageProps {
  params: {
    testId: string
  }
}

export default async function TestReportPage({ params }: PageProps) {
  const testId = parseInt(params.testId)
  
  if (isNaN(testId)) {
    notFound()
  }
  
  // Fetch all data in parallel
  const [{ test, questionCount }, stats, rankings] = await Promise.all([
    getTestDetails(testId),
    getTestOverviewStats(testId),
    getTestRankings(testId)
  ])
  
  if (!test) {
    notFound()
  }
  
  return (
    <TestReportDashboard
      test={test}
      stats={stats}
      rankings={rankings}
    />
  )
}

