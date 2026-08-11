'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp,
  Search,
  Eye,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { getStudentSessions, getSessionDetail } from '@/lib/actions/enhanced-student-analytics'
import { DetailedSessionView } from './detailed-session-view'

interface PracticeTestsAnalyticsProps {
  userId: string
  onRefresh: () => void
}

interface PracticeSession {
  id: number
  session_type: string
  test_type: string
  score: number
  score_percentage: number
  accuracy: number
  total_questions: number
  total_correct: number
  total_incorrect: number
  total_skipped: number
  total_time_taken: number
  submitted_at: string
  testName: string
}

export function PracticeTestsAnalytics({ userId, onRefresh }: PracticeTestsAnalyticsProps) {
  const [sessions, setSessions] = useState<PracticeSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSession, setSelectedSession] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchSessions = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)
      
      const data = await getStudentSessions(userId, 'practice', 100)
      setSessions(data)
      setError(null)
    } catch (err) {
      setError('Failed to load practice sessions')
      console.error('Error fetching sessions:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [userId])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSessions(true)
    await onRefresh()
    setRefreshing(false)
  }

  const handleViewDetails = async (sessionId: number) => {
    setSelectedSession(sessionId)
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const formatScore = (score: number) => {
    return Math.round(score * 100) / 100
  }

  // Filter sessions based on search term
  const filteredSessions = sessions.filter(session =>
    session.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.submitted_at.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate summary statistics
  const totalSessions = sessions.length
  const averageScore = sessions.length > 0 
    ? sessions.reduce((sum, session) => sum + session.score_percentage, 0) / sessions.length 
    : 0
  const totalTimeSpent = sessions.reduce((sum, session) => sum + session.total_time_taken, 0)
  const totalQuestions = sessions.reduce((sum, session) => sum + session.total_questions, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Practice test attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatScore(averageScore)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(totalTimeSpent / 3600)}h {Math.floor((totalTimeSpent % 3600) / 60)}m
            </div>
            <p className="text-xs text-muted-foreground">
              Total practice time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              Questions attempted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Test Sessions</CardTitle>
          <CardDescription>
            Complete history of practice test attempts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Practice Sessions</h3>
              <p className="text-gray-500">This student hasn't taken any practice tests yet.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => {
                    const accuracy = session.total_correct + session.total_incorrect > 0 
                      ? ((session.total_correct / (session.total_correct + session.total_incorrect)) * 100)
                      : 0
                    
                    return (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900">{session.testName}</p>
                            <p className="text-sm text-gray-500">Session #{session.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-gray-900">
                            {formatScore(session.score_percentage)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatScore(accuracy)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {session.total_questions}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDuration(session.total_time_taken)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDateTime(session.submitted_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(session.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Session View Modal */}
      {selectedSession && (
        <DetailedSessionView
          sessionId={selectedSession}
          isOpen={true}
          userId={userId}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  )
}
